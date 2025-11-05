import winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigurationService } from '../services/configuration';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
}

export class Logger {
  private winston: winston.Logger;
  private configService: ConfigurationService;

  constructor() {
    this.configService = new ConfigurationService();
    this.winston = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const config = this.configService.getLoggingConfig();
    
    // Create logs directory if it doesn't exist
    if (config.enableFileLogging && !fs.existsSync(config.logDirectory)) {
      fs.mkdirSync(config.logDirectory, { recursive: true });
    }

    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: config.level,
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
          }),
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            let log = `${timestamp} [${level}]: ${message}`;
            
            if (stack) {
              log += `\n${stack}`;
            }
            
            if (Object.keys(meta).length > 0) {
              log += `\n${JSON.stringify(meta, null, 2)}`;
            }
            
            return log;
          })
        )
      })
    ];

    // Add file transports for production
    if (config.enableFileLogging) {
      // Error log file
      transports.push(
        new winston.transports.File({
          filename: path.join(config.logDirectory, 'error.log'),
          level: 'error',
          maxsize: config.maxFileSize,
          maxFiles: config.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        })
      );

      // Combined log file
      transports.push(
        new winston.transports.File({
          filename: path.join(config.logDirectory, 'combined.log'),
          maxsize: config.maxFileSize,
          maxFiles: config.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );

      // Request log file (for HTTP requests)
      transports.push(
        new winston.transports.File({
          filename: path.join(config.logDirectory, 'requests.log'),
          level: 'info',
          maxsize: config.maxFileSize,
          maxFiles: config.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }

    return winston.createLogger({
      level: config.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
      // Don't exit on handled exceptions
      exitOnError: false,
    });
  }

  public debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  public error(message: string, error?: Error | any, meta?: any): void {
    if (error instanceof Error) {
      this.winston.error(message, { 
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        ...meta
      });
    } else {
      this.winston.error(message, { error, ...meta });
    }
  }

  public http(message: string, meta?: any): void {
    this.winston.info(message, { level: 'http', ...meta });
  }

  public verbose(message: string, meta?: any): void {
    this.winston.verbose(message, meta);
  }

  public silly(message: string, meta?: any): void {
    this.winston.silly(message, meta);
  }

  // Structured logging methods
  public logRequest(method: string, url: string, statusCode: number, responseTime: number, context?: LogContext): void {
    this.http('HTTP Request', {
      method,
      url,
      statusCode,
      responseTime,
      ...context
    });
  }

  public logSecurity(event: string, context?: LogContext, details?: any): void {
    this.warn(`Security Event: ${event}`, {
      event,
      ...context,
      ...details
    });
  }

  public logAuth(event: string, userId?: string, context?: LogContext, details?: any): void {
    this.info(`Auth Event: ${event}`, {
      event,
      userId,
      ...context,
      ...details
    });
  }

  public logPerformance(operation: string, duration: number, context?: LogContext): void {
    if (duration > 1000) {
      this.warn(`Slow Operation: ${operation}`, {
        operation,
        duration,
        ...context
      });
    } else {
      this.debug(`Performance: ${operation}`, {
        operation,
        duration,
        ...context
      });
    }
  }

  public logBusinessEvent(event: string, context?: LogContext, data?: any): void {
    this.info(`Business Event: ${event}`, {
      event,
      ...context,
      data
    });
  }

  public logError(operation: string, error: Error | any, context?: LogContext): void {
    this.error(`Error in ${operation}`, error, context);
  }

  public logServiceCall(service: string, operation: string, success: boolean, duration?: number, context?: LogContext): void {
    const level = success ? 'info' : 'error';
    const message = success ? `Service call succeeded` : `Service call failed`;
    
    this.winston.log(level, `Service Call: ${service}.${operation}`, {
      service,
      operation,
      success,
      duration,
      ...context
    });
  }

  // Context-aware logging
  public withContext(context: LogContext): Logger {
    return new ContextualLogger(this.winston, context);
  }

  // Log level management
  public setLevel(level: string): void {
    this.winston.level = level;
  }

  public getLevel(): string {
    return this.winston.level;
  }

  // Get all transports info
  public getTransports(): winston.transport[] {
    return this.winston.transports;
  }

  // Flush logs (useful before process exit)
  public async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.winston.on('finish', () => resolve());
      this.winston.end();
    });
  }
}

// Contextual logger that automatically includes context in all logs
class ContextualLogger extends Logger {
  private context: LogContext;

  constructor(winston: winston.Logger, context: LogContext) {
    super();
    this.winston = winston;
    this.context = context;
  }

  public debug(message: string, meta?: any): void {
    this.winston.debug(message, { ...this.context, ...meta });
  }

  public info(message: string, meta?: any): void {
    this.winston.info(message, { ...this.context, ...meta });
  }

  public warn(message: string, meta?: any): void {
    this.winston.warn(message, { ...this.context, ...meta });
  }

  public error(message: string, error?: Error | any, meta?: any): void {
    if (error instanceof Error) {
      this.winston.error(message, { 
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        ...this.context,
        ...meta
      });
    } else {
      this.winston.error(message, { error, ...this.context, ...meta });
    }
  }

  public http(message: string, meta?: any): void {
    this.winston.info(message, { level: 'http', ...this.context, ...meta });
  }

  public withAdditionalContext(additionalContext: LogContext): Logger {
    return new ContextualLogger(this.winston, { ...this.context, ...additionalContext });
  }
}

// Request logger middleware for Express
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    const logContext: LogContext = {
      correlationId: req.correlationId,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      url: req.url
    };

    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      
      const logger = new Logger();
      logger.logRequest(req.method, req.url, statusCode, duration, logContext);
    });

    next();
  };
}

// Export default logger instance
export const defaultLogger = new Logger();