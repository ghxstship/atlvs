/**
 * Console Logger Implementation
 * Simple console-based logger for development
 */

import { ILogger, LogLevel, LogContext, LogEntry } from './ILogger';

export class ConsoleLogger implements ILogger {
  constructor(
    private readonly context: LogContext = {},
    private readonly minLevel: LogLevel = LogLevel.DEBUG
  ) {}

  debug(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      context: { ...this.context, ...context },
      timestamp: new Date(),
    });
  }

  info(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.INFO,
      message,
      context: { ...this.context, ...context },
      timestamp: new Date(),
    });
  }

  warn(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.WARN,
      message,
      context: { ...this.context, ...context },
      timestamp: new Date(),
    });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      error,
      context: { ...this.context, ...context },
      timestamp: new Date(),
    });
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.FATAL,
      message,
      error,
      context: { ...this.context, ...context },
      timestamp: new Date(),
    });
  }

  log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? `\n${entry.error.stack}` : '';

    const logMessage = `[${timestamp}] ${level} ${entry.message}${contextStr}${errorStr}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage);
        break;
    }
  }

  child(context: LogContext): ILogger {
    return new ConsoleLogger(
      { ...this.context, ...context },
      this.minLevel
    );
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL,
    ];

    const currentLevelIndex = levels.indexOf(this.minLevel);
    const logLevelIndex = levels.indexOf(level);

    return logLevelIndex >= currentLevelIndex;
  }
}
