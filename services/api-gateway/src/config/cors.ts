import { Request, Response, NextFunction } from 'express';
import { ConfigurationService } from '../services/configuration';

export class CORSConfiguration {
  private configService: ConfigurationService;

  constructor() {
    this.configService = new ConfigurationService();
  }

  public getCorsOptions() {
    return this.configService.getCorsOptions();
  }

  public getAllowedOrigins(): string[] {
    return this.configService.getCorsOrigins();
  }

  public isOriginAllowed(origin: string): boolean {
    const allowedOrigins = this.getAllowedOrigins();
    return allowedOrigins.includes(origin);
  }

  public handleCors(req: Request, res: Response, next: NextFunction): void {
    const corsOptions = this.getCorsOptions();
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      // Set CORS headers for preflight request
      this.setCorsHeaders(res, req);
      
      // Respond with 200 OK
      res.status(200).end();
      return;
    }

    // For regular requests, set CORS headers
    this.setCorsHeaders(res, req);
    
    next();
  }

  private setCorsHeaders(res: Response, req: Request): void {
    const origin = req.headers.origin as string;
    
    // Set Access-Control-Allow-Origin
    if (origin && this.isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      // Allow requests with no origin (like mobile apps)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    // Set other CORS headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Correlation-ID',
      'X-User-ID',
      'X-User-Role',
      'X-MFA-Verified',
      'X-Request-ID'
    ].join(', '));
    
    res.setHeader('Access-Control-Expose-Headers', [
      'X-Total-Count',
      'X-Page-Count',
      'X-Current-Page',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
      'X-Correlation-ID'
    ].join(', '));
    
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.setHeader('Vary', 'Origin');
  }

  public validateCorsRequest(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin as string;
    
    // Check if origin is allowed
    if (origin && !this.isOriginAllowed(origin)) {
      res.status(403).json({
        error: 'CORS Error',
        message: 'Origin not allowed by CORS policy',
        allowedOrigins: this.getAllowedOrigins()
      });
      return;
    }

    // Additional security checks
    if (this.shouldBlockRequest(req)) {
      res.status(403).json({
        error: 'CORS Security Error',
        message: 'Request blocked by CORS security policy'
      });
      return;
    }

    next();
  }

  private shouldBlockRequest(req: Request): boolean {
    // Additional security checks
    const userAgent = req.headers['user-agent'] as string;
    
    // Block requests with suspicious user agents
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /scraper/i,
      /spider/i,
      /curl/i,
      /wget/i
    ];

    if (userAgent && suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      // Allow legitimate requests based on path
      const allowedPaths = ['/health', '/metrics', '/api/v1/info'];
      return !allowedPaths.some(path => req.path.startsWith(path));
    }

    return false;
  }

  // Dynamic CORS configuration based on request context
  public getDynamicCorsOptions(req: Request) {
    const baseOptions = this.getCorsOptions();
    
    // Add dynamic origins based on request context
    if (req.headers['x-forwarded-proto'] === 'https') {
      // Allow HTTPS requests from any origin in production
      baseOptions.origin = true;
    }

    // Adjust CORS based on authentication status
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
      // More restrictive CORS for authenticated requests
      baseOptions.credentials = true;
    }

    return baseOptions;
  }

  // CORS preflight handler
  public handlePreflight(req: Request, res: Response): void {
    const allowedOrigins = this.getAllowedOrigins();
    const origin = req.headers.origin as string;

    res.setHeader('Access-Control-Allow-Origin', 
      origin && this.isOriginAllowed(origin) ? origin : '');
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Correlation-ID, X-User-ID');
    
    res.setHeader('Access-Control-Max-Age', '86400');
    
    res.status(204).end();
  }

  // Custom CORS error handler
  public handleCorsError(error: Error, req: Request, res: Response, next: NextFunction): void {
    if (error.message.includes('CORS')) {
      res.status(403).json({
        error: 'CORS Error',
        message: error.message,
        origin: req.headers.origin,
        allowedOrigins: this.getAllowedOrigins()
      });
    } else {
      next(error);
    }
  }
}