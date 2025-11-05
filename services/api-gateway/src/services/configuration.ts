import * as dotenv from 'dotenv';

dotenv.config();

export interface ServiceConfig {
  name: string;
  url: string;
  healthCheckPath: string;
  weight: number;
  instances: Array<{
    id: string;
    url: string;
    isHealthy: boolean;
    lastHealthCheck: Date;
  }>;
}

export class ConfigurationService {
  private readonly port: number;
  private readonly environment: string;
  private readonly jwtSecret: string;
  private readonly jwtExpiry: string;
  private readonly redisUrl: string;
  private readonly services: Map<string, ServiceConfig>;

  constructor() {
    this.port = parseInt(process.env.API_GATEWAY_PORT || '8080', 10);
    this.environment = process.env.NODE_ENV || 'development';
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.initializeServices();
  }

  private initializeServices(): void {
    this.services = new Map();

    // Auth Service Configuration
    this.services.set('auth-service', {
      name: 'auth-service',
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      healthCheckPath: '/health',
      weight: 1,
      instances: this.getServiceInstances('AUTH_SERVICE_URLS')
    });

    // Property Service Configuration
    this.services.set('property-service', {
      name: 'property-service',
      url: process.env.PROPERTY_SERVICE_URL || 'http://localhost:8081',
      healthCheckPath: '/actuator/health',
      weight: 1,
      instances: this.getServiceInstances('PROPERTY_SERVICE_URLS')
    });

    // User Service Configuration (same as auth service for now)
    this.services.set('user-service', {
      name: 'user-service',
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      healthCheckPath: '/health',
      weight: 1,
      instances: this.getServiceInstances('USER_SERVICE_URLS')
    });
  }

  private getServiceInstances(envVar: string): Array<{
    id: string;
    url: string;
    isHealthy: boolean;
    lastHealthCheck: Date;
  }> {
    const urls = process.env[envVar];
    if (!urls) {
      return [{
        id: 'default-1',
        url: this.getServiceUrl(envVar.includes('AUTH') ? 'auth-service' : 'property-service'),
        isHealthy: true,
        lastHealthCheck: new Date()
      }];
    }

    return urls.split(',').map((url, index) => ({
      id: `${envVar.toLowerCase()}-${index + 1}`,
      url: url.trim(),
      isHealthy: true,
      lastHealthCheck: new Date()
    }));
  }

  public getPort(): number {
    return this.port;
  }

  public getEnvironment(): string {
    return this.environment;
  }

  public getJwtSecret(): string {
    return this.jwtSecret;
  }

  public getJwtExpiry(): string {
    return this.jwtExpiry;
  }

  public getRedisUrl(): string {
    return this.redisUrl;
  }

  public getServiceUrl(serviceName: string): string {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found in configuration`);
    }
    return service.url;
  }

  public getServiceConfig(serviceName: string): ServiceConfig | undefined {
    return this.services.get(serviceName);
  }

  public getAllServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  public updateServiceHealth(serviceName: string, instanceId: string, isHealthy: boolean): void {
    const service = this.services.get(serviceName);
    if (service) {
      const instance = service.instances.find(inst => inst.id === instanceId);
      if (instance) {
        instance.isHealthy = isHealthy;
        instance.lastHealthCheck = new Date();
      }
    }
  }

  public getHealthyServices(serviceName: string): Array<{
    id: string;
    url: string;
  }> {
    const service = this.services.get(serviceName);
    if (!service) {
      return [];
    }

    return service.instances
      .filter(inst => inst.isHealthy)
      .map(inst => ({
        id: inst.id,
        url: inst.url
      }));
  }

  // CORS Configuration
  public getCorsOrigins(): string[] {
    const origins = process.env.CORS_ORIGINS;
    if (origins) {
      return origins.split(',').map(origin => origin.trim());
    }
    
    // Default origins based on environment
    switch (this.environment) {
      case 'production':
        return ['https://your-domain.com'];
      case 'staging':
        return ['https://staging.your-domain.com'];
      default: // development
        return [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173'
        ];
    }
  }

  public getCorsOptions() {
    return {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = this.getCorsOrigins();
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS policy'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Correlation-ID',
        'X-User-ID',
        'X-User-Role'
      ],
      exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Rate-Limit-Remaining',
        'X-Rate-Limit-Reset'
      ],
      maxAge: 86400 // 24 hours
    };
  }

  // Rate Limiting Configuration
  public getRateLimitConfig() {
    return {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
      message: {
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: any) => {
        return req.user ? `user:${req.user.id}` : req.ip;
      }
    };
  }

  // Cache Configuration
  public getCacheConfig() {
    return {
      ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes default
      maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
      redisUrl: this.redisUrl
    };
  }

  // Logging Configuration
  public getLoggingConfig() {
    return {
      level: process.env.LOG_LEVEL || (this.environment === 'production' ? 'info' : 'debug'),
      enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
      logDirectory: process.env.LOG_DIRECTORY || './logs',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '10', 10),
      maxFileSize: process.env.LOG_MAX_FILE_SIZE || '10MB'
    };
  }

  // Security Configuration
  public getSecurityConfig() {
    return {
      enableCors: process.env.ENABLE_CORS !== 'false',
      enableHSTS: process.env.ENABLE_HSTS !== 'false',
      enableCSP: process.env.ENABLE_CSP !== 'false',
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb'
    };
  }

  // Metrics Configuration
  public getMetricsConfig() {
    return {
      enableMetrics: process.env.ENABLE_METRICS !== 'false',
      metricsPath: process.env.METRICS_PATH || '/metrics',
      collectDefaultMetrics: true,
      collectProcessMetrics: true,
      collectGcMetrics: true
    };
  }
}