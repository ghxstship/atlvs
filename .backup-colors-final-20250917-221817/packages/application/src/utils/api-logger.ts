import { NextRequest } from 'next/server';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

// Log context interface
export interface LogContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

// Structured log entry
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  service: string;
  environment: string;
}

class ApiLogger {
  private static instance: ApiLogger;
  private environment: string;
  private logLevel: LogLevel;

  private constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL || 'INFO');
  }

  public static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toUpperCase()) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      case 'FATAL': return LogLevel.FATAL;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    service: string = 'api'
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...context,
        requestId: context.requestId || this.generateRequestId()
      },
      service,
      environment: this.environment
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatLogEntry(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = Object.keys(entry.context).length > 0 
      ? ` | ${JSON.stringify(entry.context)}`
      : '';
    
    return `[${entry.timestamp}] ${levelName} [${entry.service}] ${entry.message}${contextStr}`;
  }

  private writeLog(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);
    
    // In development, use console with colors
    if (this.environment === 'development') {
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug('\x1b[36m%s\x1b[0m', formatted); // Cyan
          break;
        case LogLevel.INFO:
          console.info('\x1b[32m%s\x1b[0m', formatted); // Green
          break;
        case LogLevel.WARN:
          console.warn('\x1b[33m%s\x1b[0m', formatted); // Yellow
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error('\x1b[31m%s\x1b[0m', formatted); // Red
          break;
      }
    } else {
      // In production, write structured JSON logs
      console.log(JSON.stringify(entry));
    }

    // In production, you might want to send logs to external services
    // like CloudWatch, DataDog, or Sentry
    if (this.environment === 'production' && entry.level >= LogLevel.ERROR) {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // Example: Send to external logging service
    // This would be implemented based on your chosen service
    try {
      // await fetch('https://your-logging-service.com/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      // Fallback to console if external service fails
      console.error('Failed to send log to external service:', error);
    }
  }

  public debug(message: string, context?: LogContext, service?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context, service);
      this.writeLog(entry);
    }
  }

  public info(message: string, context?: LogContext, service?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, context, service);
      this.writeLog(entry);
    }
  }

  public warn(message: string, context?: LogContext, service?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, context, service);
      this.writeLog(entry);
    }
  }

  public error(message: string, context?: LogContext, service?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, context, service);
      this.writeLog(entry);
    }
  }

  public fatal(message: string, context?: LogContext, service?: string): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      const entry = this.createLogEntry(LogLevel.FATAL, message, context, service);
      this.writeLog(entry);
    }
  }

  // Request logging helpers
  public logRequest(request: NextRequest, context?: LogContext): string {
    const requestId = this.generateRequestId();
    const logContext: LogContext = {
      ...context,
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          undefined
    };

    this.info(`Incoming ${request.method} request`, logContext);
    return requestId;
  }

  public logResponse(
    requestId: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const logContext: LogContext = {
      ...context,
      requestId,
      statusCode,
      duration
    };

    const level = statusCode >= 500 ? LogLevel.ERROR : 
                  statusCode >= 400 ? LogLevel.WARN : 
                  LogLevel.INFO;

    const message = `Response ${statusCode} (${duration}ms)`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, logContext);
    } else if (level === LogLevel.WARN) {
      this.warn(message, logContext);
    } else {
      this.info(message, logContext);
    }
  }

  public logError(
    error: Error,
    requestId?: string,
    context?: LogContext
  ): void {
    const logContext: LogContext = {
      ...context,
      requestId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };

    this.error(`Unhandled error: ${error.message}`, logContext);
  }

  // Business logic logging
  public logServiceCall(
    service: string,
    method: string,
    params?: any,
    context?: LogContext
  ): void {
    this.debug(`Service call: ${service}.${method}`, {
      ...context,
      service,
      method,
      params: this.sanitizeParams(params)
    });
  }

  public logServiceResult(
    service: string,
    method: string,
    success: boolean,
    duration: number,
    context?: LogContext
  ): void {
    const message = `Service ${service}.${method} ${success ? 'succeeded' : 'failed'} (${duration}ms)`;
    const level = success ? LogLevel.DEBUG : LogLevel.WARN;
    
    if (level === LogLevel.WARN) {
      this.warn(message, { ...context, service, method, duration });
    } else {
      this.debug(message, { ...context, service, method, duration });
    }
  }

  // Database logging
  public logDatabaseQuery(
    table: string,
    operation: string,
    filters?: any,
    context?: LogContext
  ): void {
    this.debug(`Database ${operation} on ${table}`, {
      ...context,
      table,
      operation,
      filters: this.sanitizeParams(filters)
    });
  }

  public logDatabaseResult(
    table: string,
    operation: string,
    success: boolean,
    rowCount?: number,
    duration?: number,
    context?: LogContext
  ): void {
    const message = `Database ${operation} on ${table} ${success ? 'succeeded' : 'failed'}`;
    const logContext = {
      ...context,
      table,
      operation,
      rowCount,
      duration
    };

    if (success) {
      this.debug(message, logContext);
    } else {
      this.error(message, logContext);
    }
  }

  // Security logging
  public logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: LogContext
  ): void {
    const level = severity === 'critical' ? LogLevel.FATAL :
                  severity === 'high' ? LogLevel.ERROR :
                  severity === 'medium' ? LogLevel.WARN :
                  LogLevel.INFO;

    const message = `Security event: ${event}`;
    
    if (level === LogLevel.FATAL) {
      this.fatal(message, { ...context, severity, event });
    } else if (level === LogLevel.ERROR) {
      this.error(message, { ...context, severity, event });
    } else if (level === LogLevel.WARN) {
      this.warn(message, { ...context, severity, event });
    } else {
      this.info(message, { ...context, severity, event });
    }
  }

  // Performance logging
  public logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    context?: LogContext
  ): void {
    this.info(`Performance metric: ${metric} = ${value}${unit}`, {
      ...context,
      metric,
      value,
      unit
    });
  }

  // Audit logging
  public logAuditEvent(
    action: string,
    resourceType: string,
    resourceId: string,
    userId: string,
    organizationId: string,
    details?: any,
    context?: LogContext
  ): void {
    this.info(`Audit: ${action} on ${resourceType}:${resourceId}`, {
      ...context,
      action,
      resourceType,
      resourceId,
      userId,
      organizationId,
      details: this.sanitizeParams(details)
    });
  }

  private sanitizeParams(params: any): any {
    if (!params) return params;
    
    // Remove sensitive information
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'authorization',
      'cookie', 'session', 'csrf', 'api_key', 'access_token'
    ];

    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveKeys.some(sensitive => 
          key.toLowerCase().includes(sensitive.toLowerCase())
        )) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    return sanitize(params);
  }
}

// Export singleton instance
export const logger = ApiLogger.getInstance();

// Request timing utility
export class RequestTimer {
  private startTime: number;
  private requestId: string;

  constructor(requestId: string) {
    this.startTime = Date.now();
    this.requestId = requestId;
  }

  public end(statusCode: number, context?: LogContext): number {
    const duration = Date.now() - this.startTime;
    logger.logResponse(this.requestId, statusCode, duration, context);
    return duration;
  }

  public checkpoint(label: string, context?: LogContext): void {
    const elapsed = Date.now() - this.startTime;
    logger.debug(`Checkpoint ${label}: ${elapsed}ms`, {
      ...context,
      requestId: this.requestId,
      checkpoint: label,
      elapsed
    });
  }
}

// Service timing utility
export class ServiceTimer {
  private startTime: number;
  private service: string;
  private method: string;

  constructor(service: string, method: string) {
    this.startTime = Date.now();
    this.service = service;
    this.method = method;
  }

  public end(success: boolean, context?: LogContext): number {
    const duration = Date.now() - this.startTime;
    logger.logServiceResult(this.service, this.method, success, duration, context);
    return duration;
  }
}

// Database timing utility
export class DatabaseTimer {
  private startTime: number;
  private table: string;
  private operation: string;

  constructor(table: string, operation: string) {
    this.startTime = Date.now();
    this.table = table;
    this.operation = operation;
  }

  public end(success: boolean, rowCount?: number, context?: LogContext): number {
    const duration = Date.now() - this.startTime;
    logger.logDatabaseResult(this.table, this.operation, success, rowCount, duration, context);
    return duration;
  }
}
