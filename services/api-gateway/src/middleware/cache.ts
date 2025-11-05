import { Request, Response, NextFunction } from 'express';
import { RedisClient } from '../services/redis';
import { Logger } from '../utils/logger';

export interface CacheOptions {
  ttl: number; // Time to live in seconds
  key?: string | ((req: Request) => string);
  condition?: (req: Request) => boolean;
  varyBy?: string[]; // Headers/params to vary cache by
  forceRefresh?: boolean;
}

export class CacheMiddleware {
  private redis: RedisClient;
  private logger: Logger;

  constructor() {
    this.redis = new RedisClient();
    this.logger = new Logger();
  }

  public cacheMiddleware(options: Partial<CacheOptions> = {}) {
    const defaultOptions: CacheOptions = {
      ttl: 300, // 5 minutes default
      ...options
    };

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Check if caching should be applied
        if (!this.shouldCache(req, defaultOptions)) {
          return next();
        }

        // Generate cache key
        const cacheKey = this.generateCacheKey(req, defaultOptions);

        // Try to get cached response
        const cachedResponse = await this.redis.get(cacheKey);
        
        if (cachedResponse && !defaultOptions.forceRefresh) {
          this.logger.debug('Cache hit', {
            correlationId: (req as any).correlationId,
            cacheKey,
            method: req.method,
            url: req.url
          });

          // Send cached response
          this.sendCachedResponse(res, cachedResponse);
          return;
        }

        // Cache miss - proceed with request and cache the response
        this.logger.debug('Cache miss', {
          correlationId: (req as any).correlationId,
          cacheKey,
          method: req.method,
          url: req.url
        });

        // Store original send/json methods
        const originalSend = res.send.bind(res);
        const originalJson = res.json.bind(res);

        // Override response methods to capture response
        res.send = (body?: any) => {
          this.cacheResponse(cacheKey, body, defaultOptions, req);
          return originalSend(body);
        };

        res.json = (body?: any) => {
          this.cacheResponse(cacheKey, body, defaultOptions, req);
          return originalJson(body);
        };

        next();
      } catch (error) {
        this.logger.error('Cache middleware error:', error);
        next(error); // Continue without caching on error
      }
    };
  }

  private shouldCache(req: Request, options: CacheOptions): boolean {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return false;
    }

    // Skip caching for certain paths
      const skipPaths = ['/health', '/metrics', '/api/v1/info'];
      if (skipPaths.some(path => req.url.startsWith(path))) {
        return false;
      }

    // Apply custom condition if provided
    if (options.condition && !options.condition(req)) {
      return false;
    }

    // Skip if not healthy
    if (!this.redis.isHealthy()) {
      return false;
    }

    return true;
  }

  private generateCacheKey(req: Request, options: CacheOptions): string {
    const baseKey = options.key 
      ? (typeof options.key === 'function' ? options.key(req) : options.key)
      : this.generateDefaultKey(req);

    // Add cache versioning
    const version = 'v1';
    return `cache:${version}:${baseKey}`;
  }

  private generateDefaultKey(req: Request): string {
    const path = req.path.replace(/\//g, '_');
    const method = req.method;
    
    // Include query parameters in cache key
    const queryParams = req.query ? 
      Object.keys(req.query)
        .sort()
        .map(key => `${key}:${req.query[key]}`)
        .join('|') : '';
    
    // Include user ID if authenticated (for user-specific cache)
    const user = (req as any).user;
    const userId = user ? `user:${user.id}` : 'anonymous';
    
    // Include varying headers if specified
    let varyingHeaders = '';
    if (req.headers['accept-language']) {
      varyingHeaders += `accept-lang:${req.headers['accept-language']}|`;
    }
    
    return `${method}:${path}:${userId}:${queryParams}:${varyingHeaders}`;
  }

  private sendCachedResponse(res: Response, cachedData: string): void {
    try {
      const parsed = JSON.parse(cachedData);
      
      // Set cached headers
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Age', this.calculateCacheAge(parsed.timestamp));
      
      // Send cached response with appropriate status code
      if (parsed.statusCode) {
        res.status(parsed.statusCode);
      }
      
      if (parsed.headers) {
        Object.entries(parsed.headers).forEach(([key, value]) => {
          res.setHeader(key, value as string);
        });
      }
      
      res.send(parsed.body);
    } catch (error) {
      this.logger.error('Failed to parse cached response:', error);
      res.status(500).json({
        error: 'Cache Error',
        message: 'Failed to retrieve cached response'
      });
    }
  }

  private cacheResponse(cacheKey: string, body: any, options: CacheOptions, req: Request): void {
    try {
      // Only cache successful responses
      const statusCode = (req as any).statusCode || 200;
      if (statusCode >= 400) {
        return;
      }

      // Serialize response for caching
      const cacheData = {
        body,
        statusCode,
        headers: this.extractCacheableHeaders(req.res),
        timestamp: Date.now(),
        ttl: options.ttl,
        method: req.method,
        url: req.url
      };

      // Store in Redis
      const stored = this.redis.set(cacheKey, JSON.stringify(cacheData), options.ttl);
      
      if (stored) {
        this.logger.debug('Response cached', {
          correlationId: (req as any).correlationId,
          cacheKey,
          ttl: options.ttl,
          method: req.method,
          url: req.url
        });
      } else {
        this.logger.warn('Failed to cache response', {
          correlationId: (req as any).correlationId,
          cacheKey,
          method: req.method,
          url: req.url
        });
      }
    } catch (error) {
      this.logger.error('Failed to cache response:', error);
    }
  }

  private extractCacheableHeaders(res: Response): Record<string, string> {
    const cacheableHeaders: Record<string, string> = {};
    
    // Headers that are safe to cache
    const headersToCache = ['content-type', 'content-length', 'etag', 'last-modified'];
    
    headersToCache.forEach(header => {
      const value = res.getHeader(header);
      if (value) {
        cacheableHeaders[header] = value.toString();
      }
    });
    
    return cacheableHeaders;
  }

  private calculateCacheAge(timestamp: number): string {
    const age = Math.floor((Date.now() - timestamp) / 1000);
    return `${age}s`;
  }

  // Cache invalidation methods
  public async invalidatePattern(pattern: string): Promise<number> {
    try {
      const deleted = await this.redis.flushPattern(pattern);
      this.logger.info('Cache invalidation', { pattern, deleted });
      return deleted;
    } catch (error) {
      this.logger.error('Cache invalidation failed:', error);
      return 0;
    }
  }

  public async invalidatePath(path: string): Promise<number> {
    const pattern = `cache:v1:${path.replace(/\//g, '_')}*`;
    return await this.invalidatePattern(pattern);
  }

  public async invalidateUserCache(userId: string): Promise<number> {
    const pattern = `cache:v1:*user:${userId}*`;
    return await this.invalidatePattern(pattern);
  }

  public async invalidateServiceCache(serviceName: string): Promise<number> {
    const pattern = `cache:v1:*${serviceName}*`;
    return await this.invalidatePattern(pattern);
  }

  // Cache warming methods
  public async warmCache(key: string, fetchFn: () => Promise<any>, ttl: number = 300): Promise<void> {
    try {
      // Check if already cached
      const existing = await this.redis.get(key);
      if (existing) {
        return;
      }

      // Fetch data
      const data = await fetchFn();
      
      // Cache the data
      await this.redis.set(key, JSON.stringify(data), ttl);
      
      this.logger.debug('Cache warmed', { key, ttl });
    } catch (error) {
      this.logger.error('Cache warming failed:', error);
    }
  }

  // Specialized cache middleware
  public userDataCache(ttl: number = 600) { // 10 minutes
    return this.cacheMiddleware({
      ttl,
      condition: (req) => !!req.user,
      key: (req) => `user:${(req as any).user.id}:${req.path}`
    });
  }

  public propertyCache(ttl: number = 300) { // 5 minutes
    return this.cacheMiddleware({
      ttl,
      key: (req) => `property:${req.query.id || req.params.id || 'list'}:${JSON.stringify(req.query)}`
    });
  }

  public searchCache(ttl: number = 180) { // 3 minutes
    return this.cacheMiddleware({
      ttl,
      key: (req) => `search:${JSON.stringify(req.query)}`,
      varyBy: ['accept-language', 'authorization']
    });
  }

  public analyticsCache(ttl: number = 900) { // 15 minutes
    return this.cacheMiddleware({
      ttl,
      condition: (req) => req.user?.role === 'admin',
      key: (req) => `analytics:${(req as any).user.id}:${req.path}`
    });
  }

  // Health check cache
  public healthCheckCache(ttl: number = 30) { // 30 seconds
    return this.cacheMiddleware({
      ttl,
      key: 'health:check',
      condition: (req) => req.path === '/health'
    });
  }

  // Conditional cache middleware
  public conditionalCache(options: Partial<CacheOptions> & { condition: (req: Request) => boolean }) {
    return this.cacheMiddleware(options);
  }

  // Force refresh cache middleware
  public forceRefresh(ttl: number = 300) {
    return this.cacheMiddleware({
      ttl,
      forceRefresh: true,
      condition: (req) => {
        const forceRefresh = req.headers['x-cache-refresh'] === 'true';
        return forceRefresh;
      }
    });
  }

  // Cache statistics
  public async getCacheStats(): Promise<any> {
    try {
      const info = await this.redis.getInfo();
      return this.parseRedisInfo(info);
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return null;
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const stats: any = {};
    
    lines.forEach(line => {
      if (line.startsWith('# ')) return;
      
      const [key, value] = line.split(':');
      if (key && value) {
        stats[key] = value;
      }
    });
    
    return stats;
  }

  // Clear all cache
  public async clearAllCache(): Promise<number> {
    try {
      const deleted = await this.redis.flushPattern('cache:v1:*');
      this.logger.info('All cache cleared', { deleted });
      return deleted;
    } catch (error) {
      this.logger.error('Failed to clear cache:', error);
      return 0;
    }
  }
}