import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export interface RequestTransformation {
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
  url?: string;
  method?: string;
}

export class RequestTransformer {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public transformRequest() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Add correlation ID if not present
        this.ensureCorrelationId(req);
        
        // Transform request
        const transformedRequest = this.applyTransformations(req);
        
        // Log request transformation
        this.logRequestTransformation(req, transformedRequest);
        
        // Apply transformations to request object
        this.applyToRequestObject(req, transformedRequest);
        
        next();
      } catch (error) {
        this.logger.error('Request transformation failed:', error);
        next(error);
      }
    };
  }

  private ensureCorrelationId(req: Request): void {
    if (!(req as any).correlationId) {
      (req as any).correlationId = this.generateCorrelationId();
      res.setHeader('X-Correlation-ID', (req as any).correlationId);
    }
  }

  private applyTransformations(req: Request): RequestTransformation {
    const transformation: RequestTransformation = {};

    // Add security headers
    transformation.headers = {
      ...transformation.headers,
      'X-Request-ID': this.generateRequestId(),
      'X-Received-At': new Date().toISOString(),
      'X-Gateway-Version': '1.0.0'
    };

    // Add user context headers
    const user = (req as any).user;
    if (user) {
      transformation.headers = {
        ...transformation.headers,
        'X-User-ID': user.id,
        'X-User-Email': user.email,
        'X-User-Role': user.role
      };
    }

    // Add client context headers
    const clientInfo = (req as any).clientInfo;
    if (clientInfo) {
      transformation.headers = {
        ...transformation.headers,
        'X-Client-IP': clientInfo.ip,
        'X-Client-User-Agent': clientInfo.userAgent,
        'X-Client-Accept-Language': clientInfo.acceptLanguage
      };
    }

    // Transform query parameters
    transformation.query = this.transformQueryParameters(req);

    // Transform body based on content type
    if (req.body && typeof req.body === 'object') {
      transformation.body = this.transformRequestBody(req);
    }

    // Add tracing headers for distributed tracing
    transformation.headers = {
      ...transformation.headers,
      'X-Trace-ID': this.generateTraceId()
    };

    return transformation;
  }

  private transformQueryParameters(req: Request): Record<string, any> {
    const transformed: Record<string, any> = { ...req.query };

    // Add pagination defaults
    if (req.path.includes('/search') || req.path.includes('/list')) {
      if (!transformed.page) transformed.page = '1';
      if (!transformed.limit) transformed.limit = '20';
      if (!transformed.limit || parseInt(transformed.limit as string) > 100) {
        transformed.limit = '100'; // Max limit
      }
    }

    // Normalize sort parameters
    if (transformed.sort) {
      const sortParam = transformed.sort as string;
      // Ensure sort format is consistent (field:direction)
      if (!sortParam.includes(':')) {
        transformed.sort = `${sortParam}:desc`;
      }
    }

    // Add timezone to date filters
    if (transformed.fromDate || transformed.toDate) {
      transformed.timezone = transformed.timezone || 'UTC';
    }

    // Normalize search queries
    if (transformed.search || transformed.q) {
      const searchTerm = (transformed.search || transformed.q) as string;
      transformed.search = searchTerm.trim();
      transformed.q = searchTerm.trim();
    }

    return transformed;
  }

  private transformRequestBody(req: Request): any {
    let body = { ...req.body };

    // Add metadata to requests
    if (body.metadata === undefined) {
      body.metadata = {};
    }

    body.metadata = {
      ...body.metadata,
      receivedAt: new Date().toISOString(),
      correlationId: (req as any).correlationId,
      source: 'api-gateway'
    };

    // Sanitize sensitive data
    body = this.sanitizeSensitiveData(body);

    // Add user context if available
    const user = (req as any).user;
    if (user && !body.userContext) {
      body.userContext = {
        userId: user.id,
        userRole: user.role,
        timestamp: new Date().toISOString()
      };
    }

    // Transform nested objects
    body = this.transformNestedObjects(body);

    return body;
  }

  private sanitizeSensitiveData(body: any): any {
    const sensitiveFields = [
      'password',
      'confirmPassword',
      'currentPassword',
      'newPassword',
      'token',
      'secret',
      'apiKey',
      'privateKey',
      'ssn',
      'socialSecurityNumber'
    ];

    const sanitized = { ...body };

    // Remove sensitive fields from metadata only
    if (sanitized.metadata) {
      sensitiveFields.forEach(field => {
        if (sanitized.metadata[field]) {
          delete sanitized.metadata[field];
        }
      });
    }

    // Log sanitization for security audit
    this.logger.debug('Data sanitization applied', {
      removedFields: sensitiveFields.filter(field => body[field] !== undefined),
      correlationId: (body.metadata && body.metadata.correlationId) || 'unknown'
    });

    return sanitized;
  }

  private transformNestedObjects(body: any): any {
    // Transform date strings to ISO format
    const dateFields = ['createdAt', 'updatedAt', 'date', 'timestamp', 'expiresAt'];
    
    const transformed = { ...body };
    
    dateFields.forEach(field => {
      if (transformed[field]) {
        const date = new Date(transformed[field]);
        if (!isNaN(date.getTime())) {
          transformed[field] = date.toISOString();
        }
      }
    });

    // Normalize enum values
    const enumFields = ['status', 'type', 'role', 'priority'];
    enumFields.forEach(field => {
      if (transformed[field]) {
        transformed[field] = transformed[field].toString().toLowerCase().replace(/\s+/g, '_');
      }
    });

    return transformed;
  }

  private applyToRequestObject(req: Request, transformation: RequestTransformation): void {
    // Apply header transformations
    if (transformation.headers) {
      Object.entries(transformation.headers).forEach(([key, value]) => {
        req.headers[key.toLowerCase()] = value;
      });
    }

    // Apply query transformations
    if (transformation.query) {
      Object.assign(req.query, transformation.query);
    }

    // Apply body transformations
    if (transformation.body) {
      req.body = transformation.body;
    }

    // Set request metadata
    (req as any).metadata = transformation;
  }

  private logRequestTransformation(originalReq: Request, transformedReq: RequestTransformation): void {
    this.logger.debug('Request transformed', {
      originalUrl: originalReq.url,
      transformedUrl: originalReq.url, // URL transformation not applied in this example
      method: originalReq.method,
      correlationId: (originalReq as any).correlationId,
      transformations: {
        headers: Object.keys(transformation.headers || {}),
        query: Object.keys(transformation.query || {}),
        body: transformation.body ? 'body_transformed' : 'body_unchanged'
      }
    });
  }

  // URL transformation methods
  public transformUrl(url: string): string {
    // Add version prefix if missing
    if (!url.startsWith('/api/v1/')) {
      url = `/api/v1${url}`;
    }
    
    return url;
  }

  // Request ID generation
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  }

  // Health check request transformer
  public transformHealthCheckRequest(req: Request): RequestTransformation {
    return {
      headers: {
        'X-Request-Type': 'health-check',
        'X-Service-Name': 'api-gateway',
        'X-Check-Timestamp': new Date().toISOString()
      }
    };
  }

  // Metrics request transformer
  public transformMetricsRequest(req: Request): RequestTransformation {
    return {
      headers: {
        'X-Request-Type': 'metrics',
        'X-Service-Name': 'api-gateway',
        'X-Metrics-Format': 'prometheus'
      }
    };
  }

  // Batch request transformer
  public transformBatchRequest(req: Request): RequestTransformation {
    const transformation = this.applyTransformations(req);
    
    // Add batch-specific headers
    transformation.headers = {
      ...transformation.headers,
      'X-Request-Type': 'batch',
      'X-Batch-Id': this.generateBatchId(),
      'X-Max-Items': '50', // Max items per batch
      'X-Timeout': '30000' // 30 second timeout
    };

    return transformation;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }

  // File upload request transformer
  public transformFileUploadRequest(req: Request): RequestTransformation {
    const transformation = this.applyTransformations(req);
    
    // Add file upload specific headers
    transformation.headers = {
      ...transformation.headers,
      'X-Request-Type': 'file-upload',
      'X-Max-File-Size': '10485760', // 10MB
      'X-Allowed-File-Types': 'image/jpeg,image/png,image/gif,application/pdf',
      'X-Content-Disposition': 'attachment'
    };

    return transformation;
  }

  // API versioning transformer
  public transformVersionedRequest(req: Request, version: string): RequestTransformation {
    const transformation = this.applyTransformations(req);
    
    transformation.headers = {
      ...transformation.headers,
      'X-API-Version': version,
      'X-Version-Date': new Date().toISOString(),
      'X-Backward-Compatibility': version < '1.0' ? 'true' : 'false'
    };

    return transformation;
  }
}