/**
 * Monitoring Service Interface - Adapter Pattern
 * Abstracts monitoring/observability provider (Sentry, DataDog, etc.)
 */

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

export interface Span {
  name: string;
  startTime: Date;
  endTime?: Date;
  tags?: Record<string, string>;
  status?: 'ok' | 'error' | 'cancelled';
  error?: Error;
}

export interface ErrorReport {
  error: Error;
  level: 'fatal' | 'error' | 'warning' | 'info';
  context?: Record<string, unknown>;
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
  tags?: Record<string, string>;
}

export interface IMonitoringService {
  // Metrics
  recordMetric(metric: Metric): void;
  incrementCounter(name: string, value?: number, tags?: Record<string, string>): void;
  setGauge(name: string, value: number, tags?: Record<string, string>): void;
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void;
  
  // Tracing
  startSpan(name: string, tags?: Record<string, string>): Span;
  endSpan(span: Span, status?: 'ok' | 'error' | 'cancelled'): void;
  
  // Error Tracking
  captureError(report: ErrorReport): string;
  captureException(error: Error, context?: Record<string, unknown>): string;
  
  // Health Checks
  recordHealthCheck(name: string, status: 'healthy' | 'degraded' | 'unhealthy'): void;
  
  // User Context
  setUser(userId: string, email?: string, username?: string): void;
  clearUser(): void;
}
