import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Database } from '../config/database';
import { RedisClient } from '../config/redis';
import { Logger } from '../config/logger';
import { User, UserRole } from '../types/auth';

export class AuthMiddleware {
  private database: Database;
  private redis: RedisClient;
  private logger: Logger;

  constructor() {
    this.database = new Database();
    this.redis = new RedisClient();
    this.logger = new Logger();
  }

  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Authorization Required',
          message: 'Authorization header with Bearer token is required'
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify JWT token
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as any;

      // Check if token is in blacklist (optional)
      const isBlacklisted = await this.redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        res.status(401).json({
          error: 'Token Blacklisted',
          message: 'This token has been revoked'
        });
        return;
      }

      // Get user from database
      const result = await this.database.query(`
        SELECT id, email, first_name, last_name, phone, role, status,
               email_verified, phone_verified, mfa_enabled, avatar_url,
               preferences, last_login_at, created_at, updated_at
        FROM users 
        WHERE id = $1 AND deleted_at IS NULL
      `, [decoded.userId]);

      if (result.rows.length === 0) {
        res.status(401).json({
          error: 'User Not Found',
          message: 'User associated with this token was not found'
        });
        return;
      }

      const user: User = result.rows[0];

      // Check if user is active
      if (user.status !== 'active') {
        res.status(401).json({
          error: 'Account Not Active',
          message: 'Your account is not active'
        });
        return;
      }

      // Attach user to request
      (req as any).user = user;
      (req as any).token = token;

      next();

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          error: 'Invalid Token',
          message: 'The provided token is invalid'
        });
        return;
      }

      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          error: 'Token Expired',
          message: 'The provided token has expired'
        });
        return;
      }

      this.logger.error('Authentication error:', error);
      res.status(500).json({
        error: 'Authentication Failed',
        message: 'An error occurred during authentication'
      });
    }
  }

  async authorize(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user as User;

      if (!user) {
        res.status(401).json({
          error: 'Authentication Required',
          message: 'You must be authenticated to access this resource'
        });
        return;
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        res.status(403).json({
          error: 'Insufficient Permissions',
          message: 'You do not have permission to access this resource'
        });
        return;
      }

      next();
    };
  }

  async validateRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        res.status(400).json({
          error: 'Refresh Token Required',
          message: 'Refresh token is required'
        });
        return;
      }

      (req as any).refreshToken = refresh_token;
      next();

    } catch (error) {
      this.logger.error('Refresh token validation error:', error);
      res.status(400).json({
        error: 'Invalid Request',
        message: 'Invalid refresh token request'
      });
    }
  }

  async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.substring(7);
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as any;

      // Get user from database
      const result = await this.database.query(`
        SELECT id, email, first_name, last_name, phone, role, status,
               email_verified, phone_verified, mfa_enabled, avatar_url,
               preferences, last_login_at, created_at, updated_at
        FROM users 
        WHERE id = $1 AND deleted_at IS NULL
      `, [decoded.userId]);

      if (result.rows.length > 0) {
        const user: User = result.rows[0];
        (req as any).user = user;
        (req as any).token = token;
      }

      next();

    } catch (error) {
      // For optional auth, we don't fail if token is invalid
      // Just continue without setting user
      next();
    }
  }
}