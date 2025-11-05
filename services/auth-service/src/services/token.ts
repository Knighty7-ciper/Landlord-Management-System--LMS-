import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RedisClient } from '../config/redis';
import { Logger } from '../config/logger';
import { UserRole } from '../types/auth';

export class TokenService {
  private redis: RedisClient;
  private logger: Logger;

  constructor() {
    this.redis = new RedisClient();
    this.logger = new Logger();
  }

  async generateTokens(userId: string, role: UserRole): Promise<{ access_token: string; refresh_token: string }> {
    const accessToken = this.generateAccessToken(userId, role);
    const refreshToken = this.generateRefreshToken(userId);

    return {
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  private generateAccessToken(userId: string, role: UserRole): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiry = process.env.JWT_EXPIRY || '24h';

    return jwt.sign(
      {
        userId,
        role,
        type: 'access'
      },
      secret,
      { 
        expiresIn: expiry,
        issuer: 'landlord-auth-service',
        audience: 'landlord-management-system'
      }
    );
  }

  private generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

    return jwt.sign(
      {
        userId,
        type: 'refresh',
        tokenId: uuidv4()
      },
      secret,
      { 
        expiresIn: refreshExpiry,
        issuer: 'landlord-auth-service',
        audience: 'landlord-management-system'
      }
    );
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiry = 24 * 60 * 60; // 24 hours

    // Store in Redis with expiry
    await this.redis.set(`email_verify:${token}`, userId, expiry);

    return token;
  }

  async verifyEmailVerificationToken(token: string): Promise<string | null> {
    try {
      const userId = await this.redis.get(`email_verify:${token}`);
      
      if (userId) {
        // Remove the token after successful verification
        await this.redis.del(`email_verify:${token}`);
        return userId;
      }

      return null;
    } catch (error) {
      this.logger.error('Error verifying email verification token:', error);
      return null;
    }
  }

  async markEmailVerificationTokenAsUsed(token: string): Promise<void> {
    try {
      // Store in used tokens set for additional security
      await this.redis.set(`email_verify_used:${token}`, '1', 7 * 24 * 60 * 60); // 7 days
    } catch (error) {
      this.logger.error('Error marking email verification token as used:', error);
    }
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiry = 60 * 60; // 1 hour

    // Store in Redis with expiry
    await this.redis.set(`password_reset:${token}`, userId, expiry);

    return token;
  }

  async verifyPasswordResetToken(token: string): Promise<string | null> {
    try {
      const userId = await this.redis.get(`password_reset:${token}`);
      
      if (userId) {
        // Remove the token after successful verification
        await this.redis.del(`password_reset:${token}`);
        return userId;
      }

      return null;
    } catch (error) {
      this.logger.error('Error verifying password reset token:', error);
      return null;
    }
  }

  async generateMfaToken(userId: string): Promise<string> {
    // Generate 6-digit TOTP-like token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = 5 * 60; // 5 minutes

    // Store in Redis with expiry
    await this.redis.set(`mfa_token:${userId}`, token, expiry);

    return token;
  }

  async verifyMfaToken(userId: string, token: string): Promise<boolean> {
    try {
      const storedToken = await this.redis.get(`mfa_token:${userId}`);
      
      if (storedToken === token) {
        // Remove the token after successful verification
        await this.redis.del(`mfa_token:${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error verifying MFA token:', error);
      return false;
    }
  }

  async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        const expiryTime = decoded.exp * 1000 - Date.now(); // milliseconds
        if (expiryTime > 0) {
          await this.redis.set(`blacklist:${token}`, '1', Math.floor(expiryTime / 1000));
        }
      }
    } catch (error) {
      this.logger.error('Error blacklisting token:', error);
    }
  }

  async rotateRefreshToken(oldToken: string, newToken: string): Promise<void> {
    try {
      const userId = await this.redis.get(`refresh_token:${oldToken}`);
      
      if (userId) {
        // Remove old token and set new one
        await this.redis.del(`refresh_token:${oldToken}`);
        await this.redis.set(`refresh_token:${newToken}`, userId, 7 * 24 * 60 * 60);
      }
    } catch (error) {
      this.logger.error('Error rotating refresh token:', error);
    }
  }

  getTokenExpiry(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return decoded.exp * 1000; // Return in milliseconds
      }
      return null;
    } catch (error) {
      this.logger.error('Error getting token expiry:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) {
      return true;
    }
    return Date.now() >= expiry;
  }
}