import { Request, Response } from 'express';
import { Database } from '../config/database';
import { RedisClient } from '../config/redis';
import { Logger } from '../config/logger';
import { TokenService } from '../services/token';
import { EmailService } from '../services/email';
import { AuditLogger } from '../services/audit';

export class MfaController {
  private database: Database;
  private redis: RedisClient;
  private logger: Logger;
  private tokenService: TokenService;
  private emailService: EmailService;
  private auditLogger: AuditLogger;

  constructor() {
    this.database = new Database();
    this.redis = new RedisClient();
    this.logger = new Logger();
    this.tokenService = new TokenService();
    this.emailService = new EmailService();
    this.auditLogger = new AuditLogger();
  }

  async enableMfa(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      if (user.mfa_enabled) {
        res.status(400).json({
          error: 'MFA Already Enabled',
          message: 'Multi-factor authentication is already enabled for your account'
        });
        return;
      }

      // Generate MFA token
      const mfaToken = await this.tokenService.generateMfaToken(user.id);

      // Send MFA token via email
      await this.emailService.sendMfaCode(user.email, user.first_name, mfaToken);

      // Log MFA enable attempt
      await this.auditLogger.logUserAction(
        user.id,
        'mfa_enable_initiated',
        {},
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );

      res.json({
        message: 'MFA verification code sent to your email. Please verify to enable MFA.',
        verification_sent: true
      });

    } catch (error) {
      this.logger.error('Enable MFA error:', error);
      res.status(500).json({
        error: 'MFA Enable Failed',
        message: 'An error occurred while enabling MFA'
      });
    }
  }

  async verifyMfaSetup(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { token } = req.body;

      // Verify MFA token
      const isValid = await this.tokenService.verifyMfaToken(user.id, token);

      if (!isValid) {
        await this.auditLogger.logUserAction(
          user.id,
          'mfa_setup_failed',
          { reason: 'invalid_token' },
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown'
        );

        res.status(400).json({
          error: 'Invalid Token',
          message: 'The provided MFA token is invalid or has expired'
        });
        return;
      }

      // Enable MFA for user
      await this.database.query(
        'UPDATE users SET mfa_enabled = true, updated_at = NOW() WHERE id = $1',
        [user.id]
      );

      // Log successful MFA enable
      await this.auditLogger.logUserAction(
        user.id,
        'mfa_enabled',
        {},
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );

      res.json({
        message: 'Multi-factor authentication has been successfully enabled for your account.',
        mfa_enabled: true
      });

    } catch (error) {
      this.logger.error('Verify MFA setup error:', error);
      res.status(500).json({
        error: 'MFA Verification Failed',
        message: 'An error occurred during MFA verification'
      });
    }
  }

  async disableMfa(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { token } = req.body;

      if (!user.mfa_enabled) {
        res.status(400).json({
          error: 'MFA Not Enabled',
          message: 'Multi-factor authentication is not enabled for your account'
        });
        return;
      }

      // Verify MFA token first
      const isValid = await this.tokenService.verifyMfaToken(user.id, token);

      if (!isValid) {
        await this.auditLogger.logUserAction(
          user.id,
          'mfa_disable_failed',
          { reason: 'invalid_token' },
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown'
        );

        res.status(400).json({
          error: 'Invalid Token',
          message: 'The provided MFA token is invalid or has expired'
        });
        return;
      }

      // Disable MFA for user
      await this.database.query(
        'UPDATE users SET mfa_enabled = false, updated_at = NOW() WHERE id = $1',
        [user.id]
      );

      // Log successful MFA disable
      await this.auditLogger.logUserAction(
        user.id,
        'mfa_disabled',
        {},
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );

      res.json({
        message: 'Multi-factor authentication has been successfully disabled for your account.',
        mfa_enabled: false
      });

    } catch (error) {
      this.logger.error('Disable MFA error:', error);
      res.status(500).json({
        error: 'MFA Disable Failed',
        message: 'An error occurred while disabling MFA'
      });
    }
  }

  async generateMfaCode(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user.mfa_enabled) {
        res.status(400).json({
          error: 'MFA Not Enabled',
          message: 'Multi-factor authentication is not enabled for your account'
        });
        return;
      }

      // Generate new MFA token
      const mfaToken = await this.tokenService.generateMfaToken(user.id);

      // Send MFA token via email
      await this.emailService.sendMfaCode(user.email, user.first_name, mfaToken);

      // Log MFA code generation
      await this.auditLogger.logUserAction(
        user.id,
        'mfa_code_generated',
        {},
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );

      res.json({
        message: 'A new MFA verification code has been sent to your email.',
        verification_sent: true
      });

    } catch (error) {
      this.logger.error('Generate MFA code error:', error);
      res.status(500).json({
        error: 'MFA Code Generation Failed',
        message: 'An error occurred while generating MFA code'
      });
    }
  }
}