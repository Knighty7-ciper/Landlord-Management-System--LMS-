import { Request, Response } from 'express';
import { Database } from '../config/database';
import { RedisClient } from '../config/redis';
import { Logger } from '../config/logger';
import { 
  User, 
  CreateUserRequest, 
  LoginRequest, 
  TokenResponse,
  UserRole,
  UserStatus,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest
} from '../types/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../services/email';
import { TokenService } from '../services/token';
import { AuditLogger } from '../services/audit';

export class AuthController {
  private database: Database;
  private redis: RedisClient;
  private logger: Logger;
  private emailService: EmailService;
  private tokenService: TokenService;
  private auditLogger: AuditLogger;

  constructor() {
    this.database = new Database();
    this.redis = new RedisClient();
    this.logger = new Logger();
    this.emailService = new EmailService();
    this.tokenService = new TokenService();
    this.auditLogger = new AuditLogger();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

      // Check if user already exists
      const existingUser = await this.database.query(
        'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
        [userData.email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        res.status(409).json({
          error: 'User Already Exists',
          message: 'A user with this email already exists'
        });
        return;
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const userId = uuidv4();
      const result = await this.database.query(`
        INSERT INTO users (
          id, email, first_name, last_name, phone, role, password_hash,
          status, email_verified, phone_verified, mfa_enabled, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        ) RETURNING id, email, first_name, last_name, role, status, email_verified, 
                   phone_verified, mfa_enabled, created_at, updated_at
      `, [
        userId,
        userData.email.toLowerCase(),
        userData.first_name,
        userData.last_name,
        userData.phone || null,
        userData.role,
        hashedPassword,
        UserStatus.PENDING_VERIFICATION,
        false,
        false,
        false
      ]);

      const user: User = result.rows[0];

      // Generate email verification token
      const verificationToken = await this.tokenService.generateEmailVerificationToken(user.id);

      // Send verification email
      await this.emailService.sendEmailVerification(user.email, user.first_name, verificationToken);

      // Log registration
      await this.auditLogger.log(user.id, 'user_registered', { 
        email: user.email, 
        role: user.role 
      }, clientIp);

      res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status,
          email_verified: user.email_verified
        }
      });

    } catch (error) {
      this.logger.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration Failed',
        message: 'An error occurred during registration'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const clientIp = req.ip || 'unknown';

      // Find user
      const result = await this.database.query(`
        SELECT id, email, first_name, last_name, phone, role, status, password_hash,
               email_verified, phone_verified, mfa_enabled, last_login_at, created_at
        FROM users 
        WHERE email = $1 AND deleted_at IS NULL
      `, [loginData.email.toLowerCase()]);

      if (result.rows.length === 0) {
        // Log failed login attempt
        await this.auditLogger.log('unknown', 'login_failed', { 
          reason: 'user_not_found', 
          email: loginData.email 
        }, clientIp);
        
        res.status(401).json({
          error: 'Invalid Credentials',
          message: 'Invalid email or password'
        });
        return;
      }

      const user: User = result.rows[0];

      // Check user status
      if (user.status !== UserStatus.ACTIVE) {
        await this.auditLogger.log(user.id, 'login_failed', { 
          reason: 'account_status', 
          status: user.status 
        }, clientIp);
        
        res.status(401).json({
          error: 'Account Not Active',
          message: 'Your account is not active. Please contact support.'
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(loginData.password, user.password_hash);
      if (!isValidPassword) {
        await this.auditLogger.log(user.id, 'login_failed', { 
          reason: 'invalid_password' 
        }, clientIp);
        
        res.status(401).json({
          error: 'Invalid Credentials',
          message: 'Invalid email or password'
        });
        return;
      }

      // Check MFA if enabled
      if (user.mfa_enabled && !loginData.mfa_token) {
        await this.auditLogger.log(user.id, 'mfa_required', {}, clientIp);
        
        res.status(200).json({
          requires_mfa: true,
          message: 'Multi-factor authentication required'
        });
        return;
      }

      // Verify MFA token if provided
      if (user.mfa_enabled && loginData.mfa_token) {
        const isValidMfa = await this.verifyMfaToken(user.id, loginData.mfa_token);
        if (!isValidMfa) {
          await this.auditLogger.log(user.id, 'login_failed', { 
            reason: 'invalid_mfa_token' 
          }, clientIp);
          
          res.status(401).json({
            error: 'Invalid MFA Token',
            message: 'The provided MFA token is invalid'
          });
          return;
        }
      }

      // Update last login
      await this.database.query(
        'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
        [user.id]
      );

      // Generate tokens
      const tokens = await this.tokenService.generateTokens(user.id, user.role);

      // Store refresh token in Redis
      await this.redis.set(
        `refresh_token:${tokens.refresh_token}`,
        user.id,
        7 * 24 * 60 * 60 // 7 days
      );

      // Log successful login
      await this.auditLogger.log(user.id, 'login_success', {}, clientIp);

      // Return user data without sensitive fields
      const { password_hash, ...userResponse } = user;

      res.json({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: 'Bearer',
        expires_in: 3600, // 1 hour
        user: userResponse
      });

    } catch (error) {
      this.logger.error('Login error:', error);
      res.status(500).json({
        error: 'Login Failed',
        message: 'An error occurred during login'
      });
    }
  }

  private async verifyMfaToken(userId: string, token: string): Promise<boolean> {
    // Implement MFA token verification logic
    // This would typically verify TOTP, SMS codes, etc.
    const storedToken = await this.redis.get(`mfa_token:${userId}`);
    return storedToken === token;
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const refreshToken = (req as any).refreshToken;

      // Remove refresh token from Redis
      if (refreshToken) {
        await this.redis.del(`refresh_token:${refreshToken}`);
      }

      // Log logout
      await this.auditLogger.log(userId, 'logout', {}, req.ip || 'unknown');

      res.json({
        message: 'Logged out successfully'
      });

    } catch (error) {
      this.logger.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout Failed',
        message: 'An error occurred during logout'
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.body.refresh_token;
      const clientIp = req.ip || 'unknown';

      if (!refreshToken) {
        res.status(400).json({
          error: 'Refresh Token Required',
          message: 'Refresh token is required'
        });
        return;
      }

      // Get user ID from Redis
      const userId = await this.redis.get(`refresh_token:${refreshToken}`);
      if (!userId) {
        await this.auditLogger.log('unknown', 'refresh_token_failed', { 
          reason: 'invalid_refresh_token' 
        }, clientIp);
        
        res.status(401).json({
          error: 'Invalid Refresh Token',
          message: 'The refresh token is invalid or has expired'
        });
        return;
      }

      // Get user data
      const result = await this.database.query(`
        SELECT id, email, first_name, last_name, role, status
        FROM users 
        WHERE id = $1 AND deleted_at IS NULL
      `, [userId]);

      if (result.rows.length === 0) {
        await this.auditLogger.log(userId, 'refresh_token_failed', { 
          reason: 'user_not_found' 
        }, clientIp);
        
        res.status(401).json({
          error: 'User Not Found',
          message: 'User associated with this token was not found'
        });
        return;
      }

      const user = result.rows[0];

      if (user.status !== UserStatus.ACTIVE) {
        await this.auditLogger.log(userId, 'refresh_token_failed', { 
          reason: 'account_inactive' 
        }, clientIp);
        
        res.status(401).json({
          error: 'Account Not Active',
          message: 'Your account is not active'
        });
        return;
      }

      // Generate new tokens
      const tokens = await this.tokenService.generateTokens(user.id, user.role);

      // Update refresh token in Redis
      await this.redis.del(`refresh_token:${refreshToken}`);
      await this.redis.set(
        `refresh_token:${tokens.refresh_token}`,
        user.id,
        7 * 24 * 60 * 60 // 7 days
      );

      // Log successful token refresh
      await this.auditLogger.log(userId, 'token_refreshed', {}, clientIp);

      res.json({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: 'Bearer',
        expires_in: 3600
      });

    } catch (error) {
      this.logger.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Token Refresh Failed',
        message: 'An error occurred while refreshing the token'
      });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const result = await this.database.query(`
        SELECT id, email, first_name, last_name, phone, role, status,
               email_verified, phone_verified, mfa_enabled, avatar_url,
               preferences, last_login_at, created_at, updated_at
        FROM users 
        WHERE id = $1 AND deleted_at IS NULL
      `, [userId]);

      if (result.rows.length === 0) {
        res.status(404).json({
          error: 'User Not Found',
          message: 'User not found'
        });
        return;
      }

      const user: User = result.rows[0];

      res.json({ user });

    } catch (error) {
      this.logger.error('Get current user error:', error);
      res.status(500).json({
        error: 'Failed to Get User',
        message: 'An error occurred while fetching user data'
      });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      // Verify email token
      const userId = await this.tokenService.verifyEmailVerificationToken(token);
      
      if (!userId) {
        res.status(400).json({
          error: 'Invalid Token',
          message: 'The verification token is invalid or has expired'
        });
        return;
      }

      // Update user email verification status
      await this.database.query(
        'UPDATE users SET email_verified = true, status = $1, updated_at = NOW() WHERE id = $2',
        [UserStatus.ACTIVE, userId]
      );

      // Mark token as used
      await this.tokenService.markEmailVerificationTokenAsUsed(token);

      // Log email verification
      await this.auditLogger.log(userId, 'email_verified', {}, req.ip || 'unknown');

      res.json({
        message: 'Email verified successfully. Your account is now active.'
      });

    } catch (error) {
      this.logger.error('Email verification error:', error);
      res.status(500).json({
        error: 'Verification Failed',
        message: 'An error occurred during email verification'
      });
    }
  }

  // Add more authentication methods...
}