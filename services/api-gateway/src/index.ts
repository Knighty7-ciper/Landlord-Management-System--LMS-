import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { ConfigurationService } from './services/configuration';
import { AuthMiddleware } from './middleware/auth';
import { LoggingMiddleware } from './middleware/logging';
import { RequestTransformer } from './middleware/request-transformer';
import { ResponseTransformer } from './middleware/response-transformer';
import { HealthCheckService } from './services/health-check';
import { MetricsService } from './services/metrics';
import { LoadBalancer } from './services/load-balancer';
import { CORSConfiguration } from './config/cors';
import { Logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { RequestValidator } from './middleware/request-validator';
import { CacheMiddleware } from './middleware/cache';

export class APIServer {
  private app: express.Application;
  private configService: ConfigurationService;
  private authMiddleware: AuthMiddleware;
  private loggingMiddleware: LoggingMiddleware;
  private healthCheckService: HealthCheckService;
  private metricsService: MetricsService;
  private loadBalancer: LoadBalancer;
  private logger: Logger;
  private corsConfig: CORSConfiguration;

  constructor() {
    this.app = express();
    this.configService = new ConfigurationService();
    this.authMiddleware = new AuthMiddleware();
    this.loggingMiddleware = new LoggingMiddleware();
    this.healthCheckService = new HealthCheckService();
    this.metricsService = new MetricsService();
    this.loadBalancer = new LoadBalancer();
    this.logger = new Logger();
    this.corsConfig = new CORSConfiguration();

    this.initializeMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors(this.corsConfig.getCorsOptions()));

    // Compression
    this.app.use(compression());

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => this.logger.info(message.trim())
      }
    }));

    // Custom logging middleware
    this.app.use(this.loggingMiddleware.logRequest());

    // Metrics collection
    this.app.use(this.metricsService.metrics());

    // Rate limiting
    this.setupRateLimiting();
  }

  private setupRateLimiting(): void {
    // Global rate limit
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: {
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise IP
        const user = (req as any).user;
        return user ? `user:${user.id}` : req.ip;
      }
    });
    this.app.use(globalLimiter);

    // Auth endpoints rate limit (stricter)
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Limit each IP to 10 auth requests per windowMs
      message: {
        error: 'Too Many Auth Requests',
        message: 'Too many authentication requests, please try again later.'
      },
      skipSuccessfulRequests: true,
      keyGenerator: (req: Request) => req.ip
    });

    // Property management rate limit
    const propertyLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 property requests per minute
      keyGenerator: (req: Request) => {
        const user = (req as any).user;
        return user ? `user:${user.id}` : req.ip;
      }
    });

    // File upload rate limit
    const uploadLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 uploads per hour
      keyGenerator: (req: Request) => {
        const user = (req as any).user;
        return user ? `user:${user.id}` : req.ip;
      }
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const healthStatus = await this.healthCheckService.checkAllServices();
        const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(healthStatus);
      } catch (error) {
        this.logger.error('Health check failed:', error);
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check service unavailable'
        });
      }
    });

    // API info endpoint
    this.app.get('/api/v1/info', (req: Request, res: Response) => {
      res.json({
        service: 'API Gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        status: 'running',
        endpoints: {
          auth: '/api/v1/auth/*',
          properties: '/api/v1/properties/*',
          users: '/api/v1/users/*',
          health: '/health'
        }
      });
    });

    // Metrics endpoint (prometheus format)
    this.app.get('/metrics', (req: Request, res: Response) => {
      res.set('Content-Type', this.metricsService.contentType);
      res.send(this.metricsService.metrics());
    });

    // Auth service routes
    this.setupAuthRoutes();

    // Property service routes
    this.setupPropertyRoutes();

    // User management routes
    this.setupUserRoutes();

    // Catch-all route for undefined paths
    this.app.use(notFoundHandler);
  }

  private setupAuthRoutes(): void {
    const authRoutes = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/refresh',
      '/api/v1/auth/logout',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/reset-password',
      '/api/v1/auth/verify-email',
      '/api/v1/auth/resend-verification'
    ];

    // Stricter rate limiting for auth endpoints
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      skipSuccessfulRequests: true
    });

    authRoutes.forEach(route => {
      this.app.use(route, authLimiter);
    });

    // Auth service proxy
    this.app.use('/api/v1/auth/*', 
      this.authMiddleware.verifyToken(),
      new RequestTransformer().transformRequest(),
      new ResponseTransformer().transformResponse(),
      createProxyMiddleware({
        target: this.configService.getServiceUrl('auth-service'),
        changeOrigin: true,
        pathRewrite: {
          '^/api/v1/auth': '', // Remove /api/v1/auth prefix when forwarding
        },
        onProxyReq: (proxyReq, req: Request) => {
          // Add correlation ID and user context
          const correlationId = (req as any).correlationId;
          proxyReq.setHeader('X-Correlation-ID', correlationId);
          
          const user = (req as any).user;
          if (user) {
            proxyReq.setHeader('X-User-ID', user.id);
            proxyReq.setHeader('X-User-Role', user.role);
          }
        },
        onError: (err, req: Request, res: Response) => {
          this.logger.error('Auth service proxy error:', err);
          res.status(502).json({
            error: 'Bad Gateway',
            message: 'Auth service unavailable'
          });
        },
        onProxyRes: (proxyRes, req: Request) => {
          // Add security headers to auth responses
          proxyRes.headers['X-Content-Type-Options'] = 'nosniff';
          proxyRes.headers['X-Frame-Options'] = 'DENY';
        }
      })
    );
  }

  private setupPropertyRoutes(): void {
    // Property management rate limiting
    const propertyLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      keyGenerator: (req: Request) => {
        const user = (req as any).user;
        return user ? `user:${user.id}` : req.ip;
      }
    });

    this.app.use('/api/v1/properties', 
      this.authMiddleware.verifyToken(),
      propertyLimiter,
      new RequestValidator().validatePropertyRequests(),
      new CacheMiddleware().cacheMiddleware({ ttl: 300 }), // 5 minute cache for GET requests
      new RequestTransformer().transformRequest(),
      new ResponseTransformer().transformResponse(),
      createProxyMiddleware({
        target: this.configService.getServiceUrl('property-service'),
        changeOrigin: true,
        pathRewrite: {
          '^/api/v1/properties': '', // Remove /api/v1/properties prefix when forwarding
        },
        loadBalancer: this.loadBalancer.getLoadBalancer(),
        onProxyReq: (proxyReq, req: Request) => {
          const correlationId = (req as any).correlationId;
          proxyReq.setHeader('X-Correlation-ID', correlationId);
          
          const user = (req as any).user;
          if (user) {
            proxyReq.setHeader('X-User-ID', user.id);
            proxyReq.setHeader('X-User-Role', user.role);
          }

          // Handle file uploads for property images
          if (req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
            proxyReq.setHeader('Transfer-Encoding', 'chunked');
          }
        },
        onError: (err, req: Request, res: Response) => {
          this.logger.error('Property service proxy error:', err);
          res.status(502).json({
            error: 'Bad Gateway',
            message: 'Property service unavailable'
          });
        },
        onProxyRes: (proxyRes, req: Request) => {
          // Add cache headers for GET requests
          if (req.method === 'GET') {
            proxyRes.headers['Cache-Control'] = 'public, max-age=300'; // 5 minutes
            proxyRes.headers['Vary'] = 'Accept, Authorization';
          }
        }
      })
    );
  }

  private setupUserRoutes(): void {
    // User management requires authentication
    this.app.use('/api/v1/users/*',
      this.authMiddleware.verifyToken(),
      createProxyMiddleware({
        target: this.configService.getServiceUrl('auth-service'),
        changeOrigin: true,
        pathRewrite: {
          '^/api/v1/users': '/users', // Remove /api/v1 prefix when forwarding to auth service
        },
        onProxyReq: (proxyReq, req: Request) => {
          const correlationId = (req as any).correlationId;
          proxyReq.setHeader('X-Correlation-ID', correlationId);
          
          const user = (req as any).user;
          if (user) {
            proxyReq.setHeader('X-User-ID', user.id);
            proxyReq.setHeader('X-User-Role', user.role);
          }
        },
        onError: (err, req: Request, res: Response) => {
          this.logger.error('User service proxy error:', err);
          res.status(502).json({
            error: 'Bad Gateway',
            message: 'User service unavailable'
          });
        }
      })
    );
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);

    // Graceful shutdown handlers
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  private async gracefulShutdown(): Promise<void> {
    this.logger.info('Starting graceful shutdown...');
    
    // Stop accepting new requests
    this.app.disable('trust proxy');
    
    // Close health check service
    await this.healthCheckService.close();
    
    // Close metrics service
    await this.metricsService.close();
    
    // Close load balancer
    await this.loadBalancer.close();
    
    this.logger.info('Graceful shutdown completed');
    process.exit(0);
  }

  public getApp(): express.Application {
    return this.app;
  }

  public async start(): Promise<void> {
    const port = this.configService.getPort();
    
    try {
      // Initialize services
      await this.healthCheckService.initialize();
      await this.metricsService.initialize();
      await this.loadBalancer.initialize();
      
      this.app.listen(port, () => {
        this.logger.info(`API Gateway started on port ${port}`);
        this.logger.info(`Environment: ${this.configService.getEnvironment()}`);
        this.logger.info(`Health check available at: http://localhost:${port}/health`);
        this.logger.info(`Metrics available at: http://localhost:${port}/metrics`);
      });
    } catch (error) {
      this.logger.error('Failed to start API Gateway:', error);
      process.exit(1);
    }
  }
}