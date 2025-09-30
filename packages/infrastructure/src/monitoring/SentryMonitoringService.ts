/**
 * Sentry Monitoring Service Implementation
 * Implements IMonitoringService using Sentry
 */

import {
  IMonitoringService,
  Metric,
  Span,
  ErrorReport,
} from './IMonitoringService';

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
}

export class SentryMonitoringService implements IMonitoringService {
  private currentUser?: { id: string; email?: string; username?: string };
  private activeSpans: Map<string, Span> = new Map();

  constructor(private readonly config: SentryConfig) {
    // In production, initialize Sentry
    // Sentry.init({
    //   dsn: config.dsn,
    //   environment: config.environment,
    //   release: config.release,
    //   tracesSampleRate: config.tracesSampleRate || 0.1,
    // });
  }

  recordMetric(metric: Metric): void {
    // In production, send to Sentry metrics
    // Sentry.metrics.distribution(metric.name, metric.value, {
    //   tags: metric.tags,
    // });
    console.log(`[Monitoring] Metric: ${metric.name} = ${metric.value}`);
  }

  incrementCounter(name: string, value = 1, tags?: Record<string, string>): void {
    // In production, use Sentry metrics
    // Sentry.metrics.increment(name, value, { tags });
    console.log(`[Monitoring] Counter: ${name} +${value}`);
  }

  setGauge(name: string, value: number, tags?: Record<string, string>): void {
    // In production, use Sentry metrics
    // Sentry.metrics.gauge(name, value, { tags });
    console.log(`[Monitoring] Gauge: ${name} = ${value}`);
  }

  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    // In production, use Sentry metrics
    // Sentry.metrics.distribution(name, value, { tags });
    console.log(`[Monitoring] Histogram: ${name} = ${value}`);
  }

  startSpan(name: string, tags?: Record<string, string>): Span {
    const span: Span = {
      name,
      startTime: new Date(),
      tags,
    };

    this.activeSpans.set(name, span);

    // In production, use Sentry transactions
    // const transaction = Sentry.startTransaction({ name, tags });
    // this.activeTransactions.set(name, transaction);

    return span;
  }

  endSpan(span: Span, status: 'ok' | 'error' | 'cancelled' = 'ok'): void {
    span.endTime = new Date();
    span.status = status;

    this.activeSpans.delete(span.name);

    // In production, finish Sentry transaction
    // const transaction = this.activeTransactions.get(span.name);
    // if (transaction) {
    //   transaction.setStatus(status);
    //   transaction.finish();
    //   this.activeTransactions.delete(span.name);
    // }

    const duration = span.endTime.getTime() - span.startTime.getTime();
    console.log(`[Monitoring] Span: ${span.name} completed in ${duration}ms (${status})`);
  }

  captureError(report: ErrorReport): string {
    // In production, send to Sentry
    // const eventId = Sentry.captureException(report.error, {
    //   level: report.level,
    //   contexts: { custom: report.context },
    //   tags: report.tags,
    //   user: report.user,
    // });

    const eventId = `evt_${Date.now()}`;
    console.error(`[Monitoring] Error captured: ${eventId}`, report.error);
    return eventId;
  }

  captureException(error: Error, context?: Record<string, unknown>): string {
    return this.captureError({
      error,
      level: 'error',
      context,
      user: this.currentUser,
    });
  }

  recordHealthCheck(name: string, status: 'healthy' | 'degraded' | 'unhealthy'): void {
    // In production, send custom event to Sentry
    // Sentry.captureMessage(`Health check: ${name} - ${status}`, {
    //   level: status === 'healthy' ? 'info' : status === 'degraded' ? 'warning' : 'error',
    //   tags: { health_check: name, status },
    // });

    console.log(`[Monitoring] Health check: ${name} = ${status}`);
  }

  setUser(userId: string, email?: string, username?: string): void {
    this.currentUser = { id: userId, email, username };

    // In production, set Sentry user context
    // Sentry.setUser({ id: userId, email, username });
  }

  clearUser(): void {
    this.currentUser = undefined;

    // In production, clear Sentry user context
    // Sentry.setUser(null);
  }
}
