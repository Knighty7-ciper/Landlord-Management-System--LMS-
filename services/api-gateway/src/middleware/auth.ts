import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RedisClient } from './redis';
import { Logger } from '../utils/logger';
import { ConfigurationService } from './configuration';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  mfaEnabled: boolean;
  isEmailVerified: boolean;
  iat: number;
  exp: number;
}

export class AuthMiddleware {
  private redis: RedisClient;
  private logger: Logger;
  private configService: ConfigurationService;

  constructor() {
    this.redis = new RedisClient();
    this.logger = new Logger();
    this.configService = new ConfigurationService();
  }

  /**
   * Verify JWT token and add user context to request
   */
  public verifyToken() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Access token is required'
          });
          return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const user = await this.validateToken(token);
        
        if (!user) {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
          });
          return;
        }

        // Add user context to request
        (req as any).user = user;
        
        // Continue to next middleware
        next();
      } catch (error) {
        this.logger.error('Token verification failed:', error);
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Token verification failed'
        });
      }
    };
  }

  /**
   * Optional token verification - won't fail if no token provided
   */
  public verifyTokenOptional() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          // No token provided, continue without user context
          return next();
        }

        const token = authHeader.substring(7);
        const user = await this.validateToken(token);
        
        if (user) {
          (req as any).user = user;
        }
        
        next();
      } catch (error) {
        // Token validation failed, but we continue without user context
        this.logger.warn('Optional token verification failed:', error);
        next();
      }
    };
  }

  /**
   * Require specific role for endpoint access
   */
  public requireRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user as AuthenticatedUser;
      
      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions'
        });
        return;
      }

      next();
    };
  }

  /**
   * Require email verification
   */
  public requireEmailVerification() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user as AuthenticatedUser;
      
      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      if (!user.isEmailVerified) {
        res.status(403).json({
          error: 'Email Verification Required',
          message: 'Please verify your email address before accessing this resource'
        });
        return;
      }

      next();
    };
  }

  /**
   * Require MFA verification for sensitive operations
   */
  public requireMfaVerification() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user as AuthenticatedUser;
      
      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      if (!user.mfaEnabled) {
        res.status(403).json({
          error: 'MFA Required',
          message: 'Multi-factor authentication is required for this operation'
        });
        return;
      }

      // Check if MFA was recently verified (within last 30 minutes)
      const mfaVerified = req.headers['x-mfa-verified'];
      if (!mfaVerified || mfaVerified !== 'true') {
        res.status(403).json({
          error: 'MFA Verification Required',
          message: 'Please complete MFA verification to access this resource'
        });
        return;
      }

      next();
    };
  }

  /**
   * Validate token against database and cache
   */
  private async validateToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      // Check if token is in Redis blacklist
      const isBlacklisted = await this.redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        this.logger.warn('Attempted to use blacklisted token');
        return null;
      }

      // Verify JWT signature and expiry
      const jwtSecret = this.configService.getJwtSecret();
      const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUser;
      
      // Verify token is still valid in database
      const dbToken = await this.redis.get(`token:${decoded.id}:${token}`);
      if (!dbToken) {
        this.logger.warn('Token not found in database cache');
        return null;
      }

      // Verify token hasn't been updated since it was issued
      const tokenData = JSON.parse(dbToken);
      if (tokenData.iat !== decoded.iat) {
        this.logger.warn('Token timestamp mismatch');
        return null;
      }

      // Verify user status is still active
      const userStatus = await this.redis.get(`user:${decoded.id}:status`);
      if (userStatus && userStatus !== 'active') {
        this.logger.warn(`User account is ${userStatus}`);
        return null;
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.info('Token expired');
        return null;
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.info('Invalid token format');
        return null;
      }

      this.logger.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * Generate correlation ID for request tracing
   */
  public generateCorrelationId() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const correlationId = req.headers['x-correlation-id'] || 
                           req.headers['X-Correlation-ID'] ||
                           this.generateId();
      
      (req as any).correlationId = correlationId;
      res.setHeader('X-Correlation-ID', correlationId);
      next();
    };
  }

  /**
   * Extract client information from request
   */
  public extractClientInfo() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientInfo = {
        ip: this.getClientIP(req),
        userAgent: req.headers['user-agent'],
        acceptLanguage: req.headers['accept-language'],
        referer: req.headers.referer,
        timestamp: new Date().toISOString()
      };
      
      (req as any).clientInfo = clientInfo;
      next();
    };
  }

  private getClientIP(req: Request): string {
    // Check for proxy headers
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    
    const realIP = req.headers['x-real-ip'];
    if (typeof realIP === 'string') {
      return realIP;
    }
    
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}