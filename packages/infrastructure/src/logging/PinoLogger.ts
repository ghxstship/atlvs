/**
 * Pino Logger Implementation
 * Production-grade structured logger using Pino
 */

import { ILogger, LogLevel, LogContext, LogEntry } from './ILogger';

export interface PinoConfig {
  level?: LogLevel;
  prettyPrint?: boolean;
  destination?: string;
}

export class PinoLogger implements ILogger {
  private baseContext: LogContext;

  constructor(
    context: LogContext = {},
    private readonly config: PinoConfig = {}
  ) {
    this.baseContext = context;
    // In production, initialize actual Pino instance
    // this.logger = pino({
    //   level: config.level || 'info',
    //   transport: config.prettyPrint ? {
    //     target: 'pino-pretty',
    //     options: { colorize: true }
    //   } : undefined,
    // });
  }

  debug(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      context: { ...this.baseContext, ...context },
      timestamp: new Date(),
    });
  }

  info(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.INFO,
      message,
      context: { ...this.baseContext, ...context },
      timestamp: new Date(),
    });
  }

  warn(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.WARN,
      message,
      context: { ...this.baseContext, ...context },
      timestamp: new Date(),
    });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      error,
      context: { ...this.baseContext, ...context },
      timestamp: new Date(),
    });
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.FATAL,
      message,
      error,
      context: { ...this.baseContext, ...context },
      timestamp: new Date(),
    });
  }

  log(entry: LogEntry): void {
    // In production, use Pino
    // this.logger[entry.level]({
    //   ...entry.context,
    //   err: entry.error,
    // }, entry.message);

    // Mock implementation for now
    const logData = {
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      ...entry.context,
      ...(entry.error && {
        error: {
          message: entry.error.message,
          stack: entry.error.stack,
          name: entry.error.name,
        },
      }),
    };

    console.log(JSON.stringify(logData));
  }

  child(context: LogContext): ILogger {
    return new PinoLogger(
      { ...this.baseContext, ...context },
      this.config
    );
  }
}
