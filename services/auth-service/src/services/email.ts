import nodemailer from 'nodemailer';
import { Logger } from '../config/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private logger: Logger;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.logger = new Logger();
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@landlord-system.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Landlord Management System';

    // Create transporter based on configuration
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    });
  }

  async sendEmailVerification(email: string, firstName: string, verificationToken: string): Promise<void> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Verify Your Email - Landlord Management System',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background: #f9f9f9; }
              .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Landlord Management System</h1>
              </div>
              <div class="content">
                <h2>Hello ${firstName},</h2>
                <p>Thank you for registering with our Landlord Management System. To complete your account setup, please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </p>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
                <p>This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>This email was sent from Landlord Management System<br>
                © 2025 Landlord Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hello ${firstName},
          
          Thank you for registering with our Landlord Management System. To complete your account setup, please verify your email address by visiting this link:
          
          ${verificationUrl}
          
          This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
          
          Best regards,
          Landlord Management System Team
        `
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.info('Email verification sent', { email, firstName });

    } catch (error) {
      this.logger.error('Failed to send email verification:', { error, email });
      throw error;
    }
  }

  async sendPasswordReset(email: string, firstName: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Password Reset Request - Landlord Management System',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Request</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background: #f9f9f9; }
              .button { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Hello ${firstName},</h2>
                <p>We received a request to reset your password for your Landlord Management System account.</p>
                <p style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Your Password</a>
                </p>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
                <p>This password reset link will expire in 1 hour for security reasons.</p>
                <p><strong>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</strong></p>
              </div>
              <div class="footer">
                <p>This email was sent from Landlord Management System<br>
                © 2025 Landlord Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hello ${firstName},
          
          We received a request to reset your password for your Landlord Management System account.
          
          Click this link to reset your password:
          ${resetUrl}
          
          This password reset link will expire in 1 hour for security reasons.
          
          If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          
          Best regards,
          Landlord Management System Team
        `
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.info('Password reset email sent', { email, firstName });

    } catch (error) {
      this.logger.error('Failed to send password reset email:', { error, email });
      throw error;
    }
  }

  async sendMfaCode(email: string, firstName: string, mfaCode: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Your Multi-Factor Authentication Code - Landlord Management System',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MFA Code</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background: #f9f9f9; text-align: center; }
              .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #059669; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Multi-Factor Authentication</h1>
              </div>
              <div class="content">
                <h2>Hello ${firstName},</h2>
                <p>Your authentication code is:</p>
                <div class="code">${mfaCode}</div>
                <p>This code will expire in 5 minutes.</p>
                <p>If you didn't attempt to log in, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>This email was sent from Landlord Management System<br>
                © 2025 Landlord Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hello ${firstName},
          
          Your multi-factor authentication code is: ${mfaCode}
          
          This code will expire in 5 minutes.
          
          If you didn't attempt to log in, please ignore this email.
          
          Best regards,
          Landlord Management System Team
        `
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.info('MFA code sent', { email, firstName });

    } catch (error) {
      this.logger.error('Failed to send MFA code:', { error, email });
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Welcome to Landlord Management System',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background: #f9f9f9; }
              .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Landlord Management System!</h1>
              </div>
              <div class="content">
                <h2>Hello ${firstName},</h2>
                <p>Welcome to the Landlord Management System! Your account has been successfully created and verified.</p>
                <p>You can now start managing your properties, tenants, and rentals with our comprehensive platform.</p>
                <p style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL}" class="button">Access Your Dashboard</a>
                </p>
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              </div>
              <div class="footer">
                <p>This email was sent from Landlord Management System<br>
                © 2025 Landlord Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hello ${firstName},
          
          Welcome to the Landlord Management System! Your account has been successfully created and verified.
          
          You can now start managing your properties, tenants, and rentals with our comprehensive platform.
          
          Access your dashboard: ${process.env.FRONTEND_URL}
          
          If you have any questions or need assistance, please don't hesitate to contact our support team.
          
          Best regards,
          Landlord Management System Team
        `
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.info('Welcome email sent', { email, firstName });

    } catch (error) {
      this.logger.error('Failed to send welcome email:', { error, email });
      throw error;
    }
  }
}