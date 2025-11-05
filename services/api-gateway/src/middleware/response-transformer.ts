import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export interface ResponseTransformation {
  statusCode?: number;
  headers?: Record<string, string>;
  body?: any;
  metadata?: Record<string, any>;
}

export class ResponseTransformer {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public transformResponse() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const originalSend = res.send.bind(res);
        const originalJson = res.json.bind(res);

        // Override response methods to intercept responses
        res.send = (body?: any) => {
          try {
            const transformed = this.transformResponseBody(body, req, res);
            return originalSend(transformed.body);
          } catch (error) {
            this.logger.error('Response transformation failed:', error);
            return originalSend(body);
          }
        };

        res.json = (body?: any) => {
          try {
            const transformed = this.transformResponseBody(body, req, res);
            return originalJson(transformed.body);
          } catch (error) {
            this.logger.error('Response transformation failed:', error);
            return originalJson(body);
          }
        };

        // Add response interceptors for non-body responses
        this.addResponseInterceptors(req, res, originalSend, originalJson);

        next();
      } catch (error) {
        this.logger.error('Failed to setup response transformer:', error);
        next(error);
      }
    };
  }

  private addResponseInterceptors(req: Request, res: Response, originalSend: any, originalJson: any): void {
    // Intercept status code changes
    const originalStatus = res.status.bind(res);
    res.status = (code: number) => {
      this.logResponseStatusChange(code, req);
      return originalStatus(code);
    };

    // Intercept header changes
    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = (name: string, value: any) => {
      this.logHeaderChange(name, value, req);
      return originalSetHeader(name, value);
    };

    // Add custom response headers
    this.addStandardHeaders(req, res);
  }

  private transformResponseBody(body: any, req: Request, res: Response): ResponseTransformation {
    const transformation: ResponseTransformation = {};

    // Handle different response types
    if (body === null || body === undefined) {
      transformation.body = body;
      return transformation;
    }

    // If body is a string, try to parse as JSON
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        body = parsed;
      } catch (error) {
        // Keep as string if not valid JSON
        transformation.body = body;
        return transformation;
      }
    }

    // Transform based on response structure
    if (this.isApiResponse(body)) {
      transformation.body = this.transformApiResponse(body, req, res);
    } else if (Array.isArray(body)) {
      transformation.body = this.transformArrayResponse(body, req, res);
    } else if (typeof body === 'object') {
      transformation.body = this.transformObjectResponse(body, req, res);
    } else {
      transformation.body = body;
    }

    // Add metadata and headers
    this.addResponseMetadata(transformation, req, res);

    return transformation;
  }

  private isApiResponse(body: any): boolean {
    return body &&
           (typeof body === 'object') &&
           ('data' in body || 'error' in body || 'success' in body || 'message' in body);
  }

  private transformApiResponse(body: any, req: Request, res: Response): any {
    const transformed = { ...body };

    // Add standard response metadata
    transformed.timestamp = new Date().toISOString();
    transformed.path = req.path;
    transformed.method = req.method;

    // Add correlation ID if present
    const correlationId = (req as any).correlationId;
    if (correlationId) {
      transformed.correlationId = correlationId;
    }

    // Add user context if available
    const user = (req as any).user;
    if (user && !transformed.userContext) {
      transformed.userContext = {
        userId: user.id,
        userRole: user.role,
        timestamp: new Date().toISOString()
      };
    }

    // Transform pagination data
    if (transformed.pagination) {
      transformed.pagination = this.transformPagination(transformed.pagination);
    }

    // Transform error responses
    if (transformed.error) {
      transformed.error = this.transformErrorResponse(transformed.error, req);
    }

    // Add caching headers for GET requests
    if (req.method === 'GET' && res.statusCode < 400) {
      this.addCachingHeaders(res);
    }

    return transformed;
  }

  private transformArrayResponse(array: any[], req: Request, res: Response): any {
    return {
      data: array,
      count: array.length,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      correlationId: (req as any).correlationId
    };
  }

  private transformObjectResponse(obj: any, req: Request, res: Response): any {
    const transformed = { ...obj };

    // Add metadata if not present
    if (!transformed.metadata) {
      transformed.metadata = {};
    }

    transformed.metadata = {
      ...transformed.metadata,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      correlationId: (req as any).correlationId,
      responseSize: JSON.stringify(transformed).length
    };

    return transformed;
  }

  private transformPagination(pagination: any): any {
    const transformed = { ...pagination };

    // Ensure pagination has all required fields
    transformed.page = parseInt(transformed.page || '1', 10);
    transformed.limit = parseInt(transformed.limit || '20', 10);
    transformed.totalPages = parseInt(transformed.totalPages || '0', 10);
    transformed.total = parseInt(transformed.total || '0', 10);

    // Add calculated fields
    transformed.hasNext = transformed.page < transformed.totalPages;
    transformed.hasPrev = transformed.page > 1;
    transformed.startIndex = (transformed.page - 1) * transformed.limit + 1;
    transformed.endIndex = Math.min(transformed.page * transformed.limit, transformed.total);

    return transformed;
  }

  private transformErrorResponse(error: any, req: Request): any {
    const transformed = { ...error };

    // Ensure error has required fields
    transformed.code = error.code || 'UNKNOWN_ERROR';
    transformed.timestamp = new Date().toISOString();
    transformed.path = req.path;
    transformed.method = req.method;

    // Add correlation ID
    const correlationId = (req as any).correlationId;
    if (correlationId) {
      transformed.correlationId = correlationId;
    }

    // Sanitize error details in production
    if (process.env.NODE_ENV === 'production') {
      if (transformed.stack) {
        delete transformed.stack;
      }
      if (transformed.details && typeof transformed.details === 'object') {
        // Remove sensitive fields from error details
        delete transformed.details.password;
        delete transformed.details.secret;
        delete transformed.details.token;
      }
    }

    return transformed;
  }

  private addStandardHeaders(req: Request, res: Response): void {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Add API version header
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Gateway-Version', '1.0.0');

    // Add correlation ID if present
    const correlationId = (req as any).correlationId;
    if (correlationId) {
      res.setHeader('X-Correlation-ID', correlationId);
    }

    // Add rate limit headers for authenticated requests
    const user = (req as any).user;
    if (user) {
      res.setHeader('X-Rate-Limit-Remaining', '1000');
      res.setHeader('X-Rate-Limit-Reset', new Date(Date.now() + 900000).toISOString()); // 15 minutes
    }

    // Add request ID for tracking
    const requestId = this.generateRequestId();
    res.setHeader('X-Request-ID', requestId);
  }

  private addCachingHeaders(res: Response): void {
    // Add caching headers for GET requests
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    res.setHeader('Vary', 'Accept, Authorization');
    
    // Add ETag for conditional requests
    const etag = this.generateETag(res);
    res.setHeader('ETag', etag);
  }

  private addResponseMetadata(transformation: ResponseTransformation, req: Request, res: Response): void {
    transformation.metadata = {
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - (req as any).startTime || 0,
      correlationId: (req as any).correlationId,
      requestId: this.generateRequestId(),
      gatewayVersion: '1.0.0'
    };

    // Add user context if available
    const user = (req as any).user;
    if (user) {
      transformation.metadata.userId = user.id;
      transformation.metadata.userRole = user.role;
    }
  }

  private logResponseStatusChange(statusCode: number, req: Request): void {
    this.logger.debug('Response status changed', {
      statusCode,
      method: req.method,
      url: req.url,
      correlationId: (req as any).correlationId
    });
  }

  private logHeaderChange(name: string, value: any, req: Request): void {
    // Log header changes for debugging (excluding sensitive headers)
    const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie'];
    
    if (!sensitiveHeaders.includes(name.toLowerCase())) {
      this.logger.debug('Response header changed', {
        header: name,
        value: typeof value === 'string' ? value : '[object]',
        method: req.method,
        url: req.url,
        correlationId: (req as any).correlationId
      });
    }
  }

  private generateRequestId(): string {
    return `rsp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateETag(res: Response): string {
    // Simple ETag generation (in production, use a proper hash)
    return `"${Date.now()}-${Math.random().toString(36).substring(2)}"`;
  }

  // Specific response transformers for different content types
  public transformJsonResponse(body: any, req: Request): any {
    return this.transformResponseBody(body, req, res);
  }

  public transformFileResponse(res: Response, req: Request): any {
    // Add file-specific headers
    res.setHeader('X-Content-Disposition', 'attachment');
    res.setHeader('Cache-Control', 'private, max-age=3600'); // 1 hour
  }

  public transformHealthResponse(body: any, req: Request): any {
    return {
      ...body,
      timestamp: new Date().toISOString(),
      gateway: {
        status: 'healthy',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    };
  }

  public transformErrorResponseBody(body: any, req: Request): any {
    return this.transformErrorResponse(body, req);
  }

  // Response compression and optimization
  public optimizeResponse(res: Response): void {
    // Add compression hints
    res.setHeader('X-Compression-Enabled', 'true');
    
    // Add content encoding hints
    res.setHeader('Vary', 'Accept-Encoding, Authorization');
  }
}