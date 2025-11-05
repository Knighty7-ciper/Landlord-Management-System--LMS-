import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
  correlationId?: string;
}

export class ErrorHandler {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public handleError = (error: ApiError, req: Request, res: Response, next: NextFunction): void => {
    const correlationId = (req as any).correlationId;
    const userId = (req as any).user?.id;
    const clientInfo = (req as any).clientInfo;

    // Log the error with context
    this.logError(error, req, correlationId, userId, clientInfo);

    // Determine error response
    const errorResponse = this.createErrorResponse(error, req, correlationId);

    // Send error response
    res.status(errorResponse.statusCode).json(errorResponse.body);
  };

  private logError(error: ApiError, req: Request, correlationId?: string, userId?: string, clientInfo?: any): void {
    const errorContext = {
      correlationId,
      userId,
      ip: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      method: req.method,
      url: req.url,
      statusCode: error.statusCode || 500,
      stack: error.stack
    };

    // Categorize error for different logging levels
    if (error.statusCode && error.statusCode >= 500) {
      this.logger.error(`Server Error: ${error.message}`, error, errorContext);
    } else if (error.statusCode && error.statusCode >= 400) {
      this.logger.warn(`Client Error: ${error.message}`, errorContext);
    } else {
      this.logger.error(`Unknown Error: ${error.message}`, error, errorContext);
    }
  }

  private createErrorResponse(error: ApiError, req: Request, correlationId?: string) {
    const timestamp = new Date().toISOString();
    const baseResponse = {
      timestamp,
      path: req.path,
      method: req.method,
      correlationId
    };

    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: {
          ...baseResponse,
          error: 'Validation Error',
          message: error.message,
          code: 'VALIDATION_ERROR',
          details: error.details
        }
      };
    }

    if (error.name === 'UnauthorizedError') {
      return {
        statusCode: 401,
        body: {
          ...baseResponse,
          error: 'Unauthorized',
          message: error.message || 'Authentication required',
          code: 'UNAUTHORIZED'
        }
      };
    }

    if (error.name === 'ForbiddenError') {
      return {
        statusCode: 403,
        body: {
          ...baseResponse,
          error: 'Forbidden',
          message: error.message || 'Insufficient permissions',
          code: 'FORBIDDEN'
        }
      };
    }

    if (error.name === 'NotFoundError') {
      return {
        statusCode: 404,
        body: {
          ...baseResponse,
          error: 'Not Found',
          message: error.message || 'Resource not found',
          code: 'NOT_FOUND'
        }
      };
    }

    if (error.name === 'RateLimitError') {
      return {
        statusCode: 429,
        body: {
          ...baseResponse,
          error: 'Too Many Requests',
          message: error.message || 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            retryAfter: error.details?.retryAfter
          }
        }
      };
    }

    // Service unavailable error
    if (error.name === 'ServiceUnavailableError') {
      return {
        statusCode: 503,
        body: {
          ...baseResponse,
          error: 'Service Unavailable',
          message: error.message || 'Service temporarily unavailable',
          code: 'SERVICE_UNAVAILABLE'
        }
      };
    }

    // Generic server error
    return {
      statusCode: error.statusCode || 500,
      body: {
        ...baseResponse,
        error: 'Internal Server Error',
        message: this.getSafeErrorMessage(error),
        code: error.code || 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      }
    };
  }

  private getSafeErrorMessage(error: ApiError): string {
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production') {
      // Generic error messages for production
      const genericMessages: Record<number, string> = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
        422: 'Unprocessable Entity',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
      };

      return genericMessages[error.statusCode || 500] || 'An unexpected error occurred';
    }

    // Return original error message in development
    return error.message || 'An unexpected error occurred';
  }

  // Create custom error classes
  public static createValidationError(message: string, details?: any): ApiError {
    const error = new Error(message) as ApiError;
    error.name = 'ValidationError';
    error.statusCode = 400;
    error.details = details;
    error.isOperational = true;
    return error;
  }

  public static createUnauthorizedError(message: string = 'Authentication required'): ApiError {
    const error = new Error(message) as ApiError;
    error.name = 'UnauthorizedError';
    error.statusCode = 401;
    error.isOperational = true;
    return error;
  }

  public static createForbiddenError(message: string = 'Insufficient permissions'): ApiError {
    const error = new Error(message) as ApiError;
    error.name = 'ForbiddenError';
    error.statusCode = 403;
    error.isOperational = true;
    return error;
  }

  public static createNotFoundError(message: string = 'Resource not found'): ApiError {
    const error = new Error(message) as ApiError;
    error.name = 'NotFoundError';
    error.statusCode = 404;
    error.isOperational = true;
    return error;
  }

  public static createRateLimitError(message: string = 'Rate limit exceeded', retryAfter?: number): ApiError {
    const error = new Error(message) as ApiError;
    error.name = 'RateLimitError';
    error.statusCode = 429;
    error.details = { retryAfter };
    error.isOperational = true;
    return error;
  }

  public static createServiceUnavailableError(message: string = 'Service temporarily unavailable'): ApiError {
    const error = new Error(message) as ApiError;
    error.name = 'ServiceUnavailableError';
    error.statusCode = 503;
    error.isOperational = true;
    return error;
  }

  public static createDatabaseError(message: string, details?: any): ApiError {
    const error = new Error(message) as ApiError;
    error.name = 'DatabaseError';
    error.statusCode = 500;
    error.code = 'DATABASE_ERROR';
    error.details = details;
    error.isOperational = true;
    return error;
  }

  public static createExternalServiceError(serviceName: string, originalError: Error): ApiError {
    const error = new Error(`External service error (${serviceName}): ${originalError.message}`) as ApiError;
    error.name = 'ExternalServiceError';
    error.statusCode = 502; // Bad Gateway
    error.code = 'EXTERNAL_SERVICE_ERROR';
    error.details = {
      service: serviceName,
      originalError: originalError.message
    };
    error.isOperational = true;
    return error;
  }
}

// Express error handlers
export const errorHandler = new ErrorHandler().handleError;

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = ErrorHandler.createNotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Unhandled promise rejection handler
export const handleUnhandledRejections = () => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const error = reason instanceof Error ? reason : new Error(reason);
    const logger = new Logger();
    
    logger.error('Unhandled Promise Rejection:', error, {
      promise: promise.toString(),
      reason: reason
    });

    // Graceful shutdown
    process.exit(1);
  });
};

// Uncaught exception handler
export const handleUncaughtExceptions = () => {
  process.on('uncaughtException', (error: Error) => {
    const logger = new Logger();
    
    logger.error('Uncaught Exception:', error, {
      stack: error.stack
    });

    // Graceful shutdown
    process.exit(1);
  });
};