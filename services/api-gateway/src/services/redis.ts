import Redis from 'ioredis';
import { ConfigurationService } from '../services/configuration';
import { Logger } from '../utils/logger';

export class RedisClient {
  private redis: Redis;
  private logger: Logger;
  private configService: ConfigurationService;
  private isConnected: boolean = false;

  constructor() {
    this.logger = new Logger();
    this.configService = new ConfigurationService();
    this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      const redisUrl = this.configService.getRedisUrl();
      
      this.redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        commandTimeout: 5000,
        lazyConnect: true
      });

      this.redis.on('connect', () => {
        this.logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        this.logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        this.logger.error('Redis client error:', error);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        this.logger.warn('Redis client connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        this.logger.info('Redis client reconnecting');
      });

      // Health check
      this.startHealthCheck();
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', error);
    }
  }

  private startHealthCheck(): void {
    setInterval(async () => {
      try {
        const start = Date.now();
        await this.redis.ping();
        const latency = Date.now() - start;
        
        if (latency > 1000) {
          this.logger.warn(`Redis ping latency high: ${latency}ms`);
        }
      } catch (error) {
        this.logger.error('Redis health check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  public isHealthy(): boolean {
    return this.isConnected && this.redis.status === 'ready';
  }

  public async get(key: string): Promise<string | null> {
    try {
      if (!this.isHealthy()) {
        this.logger.warn('Redis not healthy, cache miss');
        return null;
      }
      
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  public async set(key: string, value: string, expireInSeconds?: number): Promise<boolean> {
    try {
      if (!this.isHealthy()) {
        this.logger.warn('Redis not healthy, cache write failed');
        return false;
      }

      if (expireInSeconds) {
        await this.redis.setex(key, expireInSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      if (!this.isHealthy()) {
        this.logger.warn('Redis not healthy, cache delete failed');
        return false;
      }

      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      if (!this.isHealthy()) {
        return false;
      }

      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  public async increment(key: string, expireInSeconds?: number): Promise<number | null> {
    try {
      if (!this.isHealthy()) {
        this.logger.warn('Redis not healthy, increment failed');
        return null;
      }

      const result = await this.redis.incr(key);
      
      if (expireInSeconds && result === 1) {
        await this.redis.expire(key, expireInSeconds);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Redis INCR error for key ${key}:`, error);
      return null;
    }
  }

  public async expire(key: string, seconds: number): Promise<boolean> {
    try {
      if (!this.isHealthy()) {
        return false;
      }

      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  public async setHash(field: string, key: string, value: string): Promise<boolean> {
    try {
      if (!this.isHealthy()) {
        return false;
      }

      await this.redis.hset(field, key, value);
      return true;
    } catch (error) {
      this.logger.error(`Redis HSET error for field ${field}, key ${key}:`, error);
      return false;
    }
  }

  public async getHash(field: string, key: string): Promise<string | null> {
    try {
      if (!this.isHealthy()) {
        return null;
      }

      return await this.redis.hget(field, key);
    } catch (error) {
      this.logger.error(`Redis HGET error for field ${field}, key ${key}:`, error);
      return null;
    }
  }

  public async getAllHash(field: string): Promise<Record<string, string>> {
    try {
      if (!this.isHealthy()) {
        return {};
      }

      return await this.redis.hgetall(field);
    } catch (error) {
      this.logger.error(`Redis HGETALL error for field ${field}:`, error);
      return {};
    }
  }

  public async addToSet(setName: string, member: string, expireInSeconds?: number): Promise<boolean> {
    try {
      if (!this.isHealthy()) {
        return false;
      }

      await this.redis.sadd(setName, member);
      
      if (expireInSeconds) {
        await this.redis.expire(setName, expireInSeconds);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Redis SADD error for set ${setName}, member ${member}:`, error);
      return false;
    }
  }

  public async isInSet(setName: string, member: string): Promise<boolean> {
    try {
      if (!this.isHealthy()) {
        return false;
      }

      const result = await this.redis.sismember(setName, member);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis SISMEMBER error for set ${setName}, member ${member}:`, error);
      return false;
    }
  }

  public async removeFromSet(setName: string, member: string): Promise<boolean> {
    try {
      if (!this.isHealthy()) {
        return false;
      }

      await this.redis.srem(setName, member);
      return true;
    } catch (error) {
      this.logger.error(`Redis SREM error for set ${setName}, member ${member}:`, error);
      return false;
    }
  }

  public async getSetMembers(setName: string): Promise<string[]> {
    try {
      if (!this.isHealthy()) {
        return [];
      }

      return await this.redis.smembers(setName);
    } catch (error) {
      this.logger.error(`Redis SMEMBERS error for set ${setName}:`, error);
      return [];
    }
  }

  // Cache key patterns and utilities
  public static getCacheKeys() {
    return {
      user: (id: string) => `user:${id}`,
      userStatus: (id: string) => `user:${id}:status`,
      token: (userId: string, token: string) => `token:${userId}:${token}`,
      blacklist: (token: string) => `blacklist:${token}`,
      rateLimit: (key: string) => `ratelimit:${key}`,
      session: (sessionId: string) => `session:${sessionId}`,
      mfaCode: (userId: string) => `mfa:${userId}:code`,
      emailVerification: (token: string) => `email:verify:${token}`,
      passwordReset: (token: string) => `password:reset:${token}`,
      propertyCache: (id: string) => `property:${id}`,
      propertyList: (criteria: string) => `properties:${criteria}`,
      healthCheck: (service: string) => `health:${service}`,
      serviceMetrics: (service: string) => `metrics:${service}`,
    };
  }

  public async flushPattern(pattern: string): Promise<number> {
    try {
      if (!this.isHealthy()) {
        return 0;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      return await this.redis.del(...keys);
    } catch (error) {
      this.logger.error(`Redis FLUSH pattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  public async close(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
        this.logger.info('Redis client connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }

  public async getInfo(): Promise<string> {
    try {
      if (!this.isHealthy()) {
        return 'Redis not connected';
      }
      
      return await this.redis.info();
    } catch (error) {
      this.logger.error('Redis INFO error:', error);
      return 'Redis error';
    }
  }
}