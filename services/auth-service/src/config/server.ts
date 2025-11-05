import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Database } from './database';
import { RedisClient } from './redis';
import { Logger } from './logger';

import authRoutes from '../routes/auth';
import userRoutes from '../routes/users';
import mfaRoutes from '../routes/mfa';

export class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.APP_PORT || '8080');
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      message: {
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/auth/', limiter);

    // Request processing
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          // Custom logging can be added here
          console.log(message.trim());
        }
      }
    }));

    // Health check endpoint (before auth)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'auth-service',
        version: process.env.APP_VERSION || '1.0.0'
      });
    });

    this.app.get('/health/ready', (req, res) => {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/auth', authRoutes);
    this.app.use('/users', userRoutes);
    this.app.use('/mfa', mfaRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Global error handler:', error);

      // JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid Token',
          message: 'The provided token is invalid'
        });
      }

      // Token expired
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token Expired',
          message: 'The provided token has expired'
        });
      }

      // Validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.message,
          details: error.details
        });
      }

      // Database errors
      if (error.code && error.code.startsWith('23')) {
        return res.status(409).json({
          error: 'Database Error',
          message: 'A database constraint was violated'
        });
      }

      // Default error
      res.status(error.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong' 
          : error.message
      });
    });
  }

  async initialize(database: Database, redis: RedisClient, logger: Logger): Promise<void> {
    try {
      // Test database connectivity
      const dbHealth = await database.healthCheck();
      if (!dbHealth) {
        throw new Error('Database health check failed');
      }

      // Test Redis connectivity
      const redisHealth = await redis.healthCheck();
      if (!redisHealth) {
        throw new Error('Redis health check failed');
      }

      // Start server
      this.app.listen(this.port, () => {
        logger.info(`Authentication service listening on port ${this.port}`);
      });
    } catch (error) {
      logger.error('Failed to initialize server:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    // Graceful shutdown logic would go here
    return new Promise((resolve) => {
      // Close any connections, stop accepting new requests, etc.
      resolve();
    });
  }
}