import { Request, Response, NextFunction } from 'express';
import { Logger, LogContext } from '../utils/logger';

export interface LoggedRequest extends Request {
  startTime?: number;
  correlationId?: string;
  userId?: string;
  clientInfo?: any;
}

export interface LoggingOptions {
  includeHeaders?: boolean;
  includeBody?: boolean;
  includeQuery?: boolean;
  sensitiveFields?: string[];
  logLevel?: 'info' | 'debug' | 'warn' | 'error';
  excludePaths?: string[];
}

export class LoggingMiddleware {
  private logger: Logger;
  private defaultOptions: LoggingOptions;

  constructor() {
    this.logger = new Logger();
    this.defaultOptions = {
      includeHeaders: false, // Don't log headers by default for security
      includeBody: true,
      includeQuery: true,
      sensitiveFields: ['password', 'token', 'secret', 'apiKey', 'authorization'],
      logLevel: 'info',
      excludePaths: ['/health', '/metrics', '/favicon.ico']
    };
  }

  public logRequest(options?: LoggingOptions) {
    const config = { ...this.defaultOptions, ...options };

    return (req: LoggedRequest, res: Response, next: NextFunction): void => {
      try {
        // Record start time
        req.startTime = Date.now();

        // Generate or extract correlation ID
        req.correlationId = this.extractCorrelationId(req);

        // Extract user ID if authenticated
        req.userId = req.user?.id;

        // Extract client information
        req.clientInfo = this.extractClientInfo(req);

        // Log incoming request
        this.logIncomingRequest(req, config);

        // Log response when finished
        this.logResponse(req, res, config);

        next();
      } catch (error) {
        this.logger.error('Logging middleware error:', error);
        next(error);
      }
    };
  }

  private extractCorrelationId(req: LoggedRequest): string {
    // Check various sources for correlation ID
    const sources = [
      req.headers['x-correlation-id'],
      req.headers['X-Correlation-ID'],
      req.headers['x-request-id'],
      req.headers['X-Request-ID'],
      req.headers['x-trace-id'],
      req.headers['X-Trace-ID']
    ];

    for (const source of sources) {
      if (source && typeof source === 'string') {
        return source;
      }
    }

    // Generate new correlation ID if none found
    return this.generateCorrelationId();
  }

  private extractClientInfo(req: LoggedRequest): any {
    return {
      ip: this.getClientIP(req),
      userAgent: req.headers['user-agent'],
      acceptLanguage: req.headers['accept-language'],
      referer: req.headers.referer,
      origin: req.headers.origin,
      xForwardedFor: req.headers['x-forwarded-for'],
      xRealIp: req.headers['x-real-ip'],
      timestamp: new Date().toISOString()
    };
  }

  private getClientIP(req: LoggedRequest): string {
    // Check for proxy headers
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIP = req.headers['x-real-ip'] as string;
    if (realIP) {
      return realIP;
    }

    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  private logIncomingRequest(req: LoggedRequest, config: LoggingOptions): void {
    // Skip excluded paths
    if (config.excludePaths?.some(path => req.path.startsWith(path))) {
      return;
    }

    const logContext = this.createLogContext(req);
    const logData = this.buildRequestLogData(req, config);

    // Log at appropriate level
    switch (config.logLevel) {
      case 'debug':
        this.logger.debug('Incoming request', logContext, logData);
        break;
      case 'warn':
        this.logger.warn('Incoming request', logContext, logData);
        break;
      case 'error':
        this.logger.error('Incoming request', undefined as any, logContext, logData);
        break;
      default:
        this.logger.info('Incoming request', logContext, logData);
    }
  }

  private logResponse(req: LoggedRequest, res: Response, config: LoggingOptions): void {
    const startTime = req.startTime || Date.now();
    const responseTime = Date.now() - startTime;

    // Log when response is finished
    res.on('finish', () => {
      const logContext = this.createLogContext(req);
      const logData = this.buildResponseLogData(req, res, responseTime, config);

      // Determine log level based on status code
      let logLevel: 'info' | 'debug' | 'warn' | 'error' = config.logLevel || 'info';
      
      if (res.statusCode >= 500) {
        logLevel = 'error';
      } else if (res.statusCode >= 400) {
        logLevel = 'warn';
      } else if (responseTime > 5000) { // Log slow responses as warnings
        logLevel = 'warn';
      }

      // Log response
      switch (logLevel) {
        case 'debug':
          this.logger.debug('Response sent', logContext, logData);
          break;
        case 'warn':
          this.logger.warn('Response sent', logContext, logData);
          break;
        case 'error':
          this.logger.error('Response sent', undefined as any, logContext, logData);
          break;
        default:
          this.logger.info('Response sent', logContext, logData);
      }

      // Log performance metrics
      this.logPerformanceMetrics(req, res, responseTime);
    });
  }

  private createLogContext(req: LoggedRequest): LogContext {
    return {
      correlationId: req.correlationId,
      userId: req.userId,
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      method: req.method,
      url: req.url
    };
  }

  private buildRequestLogData(req: LoggedRequest, config: LoggingOptions): any {
    const logData: any = {
      timestamp: new Date().toISOString(),
      type: 'request'
    };

    if (config.includeHeaders && req.headers) {
      // Include headers but exclude sensitive ones
      logData.headers = this.sanitizeHeaders(req.headers, config.sensitiveFields);
    }

    if (config.includeQuery && req.query) {
      logData.query = this.sanitizeQuery(req.query, config.sensitiveFields);
    }

    if (config.includeBody && req.body) {
      logData.body = this.sanitizeBody(req.body, config.sensitiveFields);
    }

    // Add request metadata
    logData.contentType = req.headers['content-type'];
    logData.contentLength = req.headers['content-length'];
    logData.accept = req.headers.accept;

    return logData;
  }

  private buildResponseLogData(req: LoggedRequest, res: Response, responseTime: number, config: LoggingOptions): any {
    const logData: any = {
      timestamp: new Date().toISOString(),
      type: 'response',
      statusCode: res.statusCode,
      responseTime,
      responseTimeMs: responseTime,
      contentType: res.getHeader('content-type'),
      contentLength: res.getHeader('content-length')
    };

    // Add response body for error responses or small successful responses
    if (res.statusCode >= 400 || (config.includeBody && responseTime < 1000)) {
      // This is a simplified approach - in a real implementation,
      // you might want to capture the response body differently
      logData.responseCaptured = 'summary';
    }

    // Add performance metrics
    logData.performance = {
      responseTime,
      slowResponse: responseTime > 5000,
      verySlowResponse: responseTime > 10000
    };

    return logData;
  }

  private sanitizeHeaders(headers: any, sensitiveFields?: string[]): any {
    const sanitized = { ...headers };
    const sensitive = sensitiveFields || this.defaultOptions.sensitiveFields;

    // Remove sensitive headers
    sensitive.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
      // Also check for case-insensitive matches
      Object.keys(sanitized).forEach(key => {
        if (key.toLowerCase() === field.toLowerCase()) {
          sanitized[key] = '[REDACTED]';
        }
      });
    });

    return sanitized;
  }

  private sanitizeQuery(query: any, sensitiveFields?: string[]): any {
    const sanitized = { ...query };
    const sensitive = sensitiveFields || this.defaultOptions.sensitiveFields;

    sensitive.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: any, sensitiveFields?: string[]): any {
    const sensitive = sensitiveFields || this.defaultOptions.sensitiveFields;
    
    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const sanitized = JSON.parse(JSON.stringify(body)); // Deep clone

    // Remove sensitive fields
    sensitive.forEach(field => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    // Recursively sanitize nested objects
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const result: any = {};
      Object.keys(obj).forEach(key => {
        if (sensitive.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = sanitizeObject(obj[key]);
        }
      });

      return result;
    };

    return sanitizeObject(sanitized);
  }

  private logPerformanceMetrics(req: LoggedRequest, res: Response, responseTime: number): void {
    const context = this.createLogContext(req);

    // Log slow responses
    if (responseTime > 5000) {
      this.logger.warn('Slow response detected', context, {
        responseTime,
        threshold: 5000,
        statusCode: res.statusCode
      });
    }

    // Log very slow responses
    if (responseTime > 10000) {
      this.logger.error('Very slow response detected', undefined as any, context, {
        responseTime,
        threshold: 10000,
        statusCode: res.statusCode
      });
    }

    // Log high error rates (4xx/5xx responses)
    if (res.statusCode >= 400) {
      this.logger.warn('Error response', context, {
        statusCode: res.statusCode,
        responseTime
      });
    }
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Specialized logging methods
  public logSecurityEvent(req: LoggedRequest, event: string, details?: any): void {
    const context = this.createLogContext(req);
    this.logger.logSecurity(event, context, details);
  }

  public logAuthEvent(req: LoggedRequest, event: string, userId?: string, details?: any): void {
    const context = this.createLogContext(req);
    this.logger.logAuth(event, userId, context, details);
  }

  public logBusinessEvent(req: LoggedRequest, event: string, data?: any): void {
    const context = this.createLogContext(req);
    this.logger.logBusinessEvent(event, context, data);
  }

  public logServiceCall(req: LoggedRequest, service: string, operation: string, success: boolean, duration?: number): void {
    const context = this.createLogContext(req);
    this.logger.logServiceCall(service, operation, success, duration, context);
  }

  // Batch request logging
  public logBatchRequest(req: LoggedRequest, batchId: string, itemCount: number): void {
    const context = this.createLogContext(req);
    this.logger.info('Batch request received', context, {
      batchId,
      itemCount,
      timestamp: new Date().toISOString()
    });
  }

  // File upload logging
  public logFileUpload(req: LoggedRequest, fileName: string, fileSize: number, fileType: string): void {
    const context = this.createLogContext(req);
    this.logger.info('File upload', context, {
      fileName,
      fileSize,
      fileType,
      timestamp: new Date().toISOString()
    });
  }

  // API versioning logging
  public logVersionRequest(req: LoggedRequest, version: string): void {
    const context = this.createLogContext(req);
    this.logger.debug('API version request', context, {
      version,
      timestamp: new Date().toISOString()
    });
  }

  // Request/response size logging
  public logRequestSize(req: LoggedRequest): number | undefined {
    const contentLength = req.headers['content-length'];
    if (contentLength) {
      const size = parseInt(contentLength as string, 10);
      const context = this.createLogContext(req);
      
      if (size > 1000000) { // 1MB
        this.logger.warn('Large request detected', context, {
          size,
          sizeMB: Math.round(size / 1000000 * 100) / 100
        });
      }
      
      return size;
    }
    
    return undefined;
  }
}