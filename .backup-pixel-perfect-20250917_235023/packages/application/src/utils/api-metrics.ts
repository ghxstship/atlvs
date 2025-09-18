import { logger } from './api-logger';

// Metric types
export interface Metric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp: number;
}

export interface Counter extends Metric {
  type: 'counter';
}

export interface Gauge extends Metric {
  type: 'gauge';
}

export interface Histogram extends Metric {
  type: 'histogram';
  buckets?: number[];
}

export interface Timer extends Metric {
  type: 'timer';
  duration: number;
}

// Metrics collector
class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, Metric[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  private constructor() {
    // Start periodic metrics flush
    setInterval(() => this.flushMetrics(), 60000); // Flush every minute
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  // Counter operations
  public incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.createKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    this.recordMetric({
      type: 'counter',
      name,
      value: current + value,
      unit: 'count',
      tags,
      timestamp: Date.now()
    });
  }

  public decrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.incrementCounter(name, -value, tags);
  }

  // Gauge operations
  public setGauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.createKey(name, tags);
    this.gauges.set(key, value);
    
    this.recordMetric({
      type: 'gauge',
      name,
      value,
      unit: 'value',
      tags,
      timestamp: Date.now()
    });
  }

  public incrementGauge(name: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.createKey(name, tags);
    const current = this.gauges.get(key) || 0;
    this.setGauge(name, current + value, tags);
  }

  public decrementGauge(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.incrementGauge(name, -value, tags);
  }

  // Histogram operations
  public recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.createKey(name, tags);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
    
    this.recordMetric({
      type: 'histogram',
      name,
      value,
      unit: 'value',
      tags,
      timestamp: Date.now()
    });
  }

  // Timer operations
  public recordTimer(name: string, duration: number, tags?: Record<string, string>): void {
    this.recordMetric({
      type: 'timer',
      name,
      value: duration,
      duration,
      unit: 'ms',
      tags,
      timestamp: Date.now()
    });
  }

  private createKey(name: string, tags?: Record<string, string>): string {
    if (!tags) return name;
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return `${name}|${tagString}`;
  }

  private recordMetric(metric: Metric & { type: string }): void {
    const key = metric.name;
    const existing = this.metrics.get(key) || [];
    existing.push(metric);
    this.metrics.set(key, existing);

    // Log high-level metrics
    if (metric.name.includes('error') || metric.name.includes('failure')) {
      logger.warn(`Metric recorded: ${metric.name} = ${metric.value}`, {
        metric: metric.name,
        value: metric.value,
        tags: metric.tags
      });
    }
  }

  private flushMetrics(): void {
    if (this.metrics.size === 0) return;

    logger.info('Flushing metrics', {
      metricsCount: this.metrics.size,
      timestamp: Date.now()
    });

    // In production, send to external metrics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService();
    }

    // Clear old metrics (keep last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [key, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp > oneHourAgo);
      if (filtered.length > 0) {
        this.metrics.set(key, filtered);
      } else {
        this.metrics.delete(key);
      }
    }
  }

  private async sendToExternalService(): void {
    // Example: Send to external metrics service
    try {
      const allMetrics = Array.from(this.metrics.values()).flat();
      // await fetch('https://your-metrics-service.com/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(allMetrics)
      // });
    } catch (error) {
      logger.error('Failed to send metrics to external service', { error });
    }
  }

  // Get current metrics for health checks
  public getMetrics(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    // Counters
    for (const [key, value] of this.counters.entries()) {
      summary[key] = { type: 'counter', value };
    }
    
    // Gauges
    for (const [key, value] of this.gauges.entries()) {
      summary[key] = { type: 'gauge', value };
    }
    
    // Histograms (with percentiles)
    for (const [key, values] of this.histograms.entries()) {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        summary[key] = {
          type: 'histogram',
          count: values.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          p50: this.percentile(sorted, 0.5),
          p95: this.percentile(sorted, 0.95),
          p99: this.percentile(sorted, 0.99)
        };
      }
    }
    
    return summary;
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }
}

// Export singleton instance
export const metrics = MetricsCollector.getInstance();

// API-specific metrics helpers
export class ApiMetrics {
  // Request metrics
  static recordRequest(method: string, endpoint: string, statusCode: number, duration: number): void {
    const tags = { method, endpoint, status: statusCode.toString() };
    
    metrics.incrementCounter('api.requests.total', 1, tags);
    metrics.recordTimer('api.request.duration', duration, tags);
    
    if (statusCode >= 400) {
      metrics.incrementCounter('api.requests.errors', 1, tags);
    }
    
    if (statusCode >= 500) {
      metrics.incrementCounter('api.requests.server_errors', 1, tags);
    }
  }

  // Authentication metrics
  static recordAuthEvent(event: 'login' | 'logout' | 'refresh' | 'failed', userId?: string): void {
    const tags = { event, userId: userId ? 'authenticated' : 'anonymous' };
    metrics.incrementCounter('api.auth.events', 1, tags);
  }

  // Database metrics
  static recordDatabaseQuery(table: string, operation: string, duration: number, success: boolean): void {
    const tags = { table, operation, success: success.toString() };
    
    metrics.incrementCounter('api.database.queries', 1, tags);
    metrics.recordTimer('api.database.duration', duration, tags);
    
    if (!success) {
      metrics.incrementCounter('api.database.errors', 1, tags);
    }
  }

  // Service metrics
  static recordServiceCall(service: string, method: string, duration: number, success: boolean): void {
    const tags = { service, method, success: success.toString() };
    
    metrics.incrementCounter('api.service.calls', 1, tags);
    metrics.recordTimer('api.service.duration', duration, tags);
    
    if (!success) {
      metrics.incrementCounter('api.service.errors', 1, tags);
    }
  }

  // Rate limiting metrics
  static recordRateLimit(endpoint: string, userId: string, blocked: boolean): void {
    const tags = { endpoint, blocked: blocked.toString() };
    
    metrics.incrementCounter('api.rate_limit.checks', 1, tags);
    
    if (blocked) {
      metrics.incrementCounter('api.rate_limit.blocked', 1, tags);
    }
  }

  // File upload metrics
  static recordFileUpload(size: number, mimeType: string, success: boolean): void {
    const tags = { mimeType, success: success.toString() };
    
    metrics.incrementCounter('api.files.uploads', 1, tags);
    metrics.recordHistogram('api.files.size', size, tags);
    
    if (!success) {
      metrics.incrementCounter('api.files.upload_errors', 1, tags);
    }
  }

  // Cache metrics
  static recordCacheEvent(event: 'hit' | 'miss' | 'set' | 'delete', key?: string): void {
    const tags = { event };
    metrics.incrementCounter('api.cache.events', 1, tags);
  }

  // Business metrics
  static recordBusinessEvent(event: string, organizationId: string, value?: number): void {
    const tags = { event, organizationId };
    
    metrics.incrementCounter('api.business.events', 1, tags);
    
    if (value !== undefined) {
      metrics.recordHistogram('api.business.value', value, tags);
    }
  }
}

// Health check metrics
export class HealthMetrics {
  static recordHealthCheck(service: string, status: 'healthy' | 'unhealthy', responseTime: number): void {
    const tags = { service, status };
    
    metrics.incrementCounter('health.checks', 1, tags);
    metrics.recordTimer('health.response_time', responseTime, tags);
    metrics.setGauge(`health.${service}.status`, status === 'healthy' ? 1 : 0);
  }

  static recordSystemMetric(metric: string, value: number): void {
    metrics.setGauge(`system.${metric}`, value);
  }

  static getHealthSummary(): Record<string, any> {
    const allMetrics = metrics.getMetrics();
    const healthMetrics = Object.entries(allMetrics)
      .filter(([key]) => key.startsWith('health.') || key.startsWith('system.'))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);

    return {
      timestamp: Date.now(),
      metrics: healthMetrics,
      summary: {
        totalRequests: allMetrics['api.requests.total']?.value || 0,
        errorRate: this.calculateErrorRate(allMetrics),
        averageResponseTime: this.calculateAverageResponseTime(allMetrics)
      }
    };
  }

  private static calculateErrorRate(allMetrics: Record<string, any>): number {
    const totalRequests = allMetrics['api.requests.total']?.value || 0;
    const totalErrors = allMetrics['api.requests.errors']?.value || 0;
    
    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  }

  private static calculateAverageResponseTime(allMetrics: Record<string, any>): number {
    const responseTimeMetric = allMetrics['api.request.duration'];
    return responseTimeMetric?.p50 || 0;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static thresholds = {
    responseTime: 1000, // 1 second
    errorRate: 5, // 5%
    memoryUsage: 80 // 80%
  };

  static checkPerformance(): { status: 'healthy' | 'degraded' | 'unhealthy'; issues: string[] } {
    const issues: string[] = [];
    const allMetrics = metrics.getMetrics();

    // Check response time
    const avgResponseTime = allMetrics['api.request.duration']?.p95 || 0;
    if (avgResponseTime > this.thresholds.responseTime) {
      issues.push(`High response time: ${avgResponseTime}ms (threshold: ${this.thresholds.responseTime}ms)`);
    }

    // Check error rate
    const errorRate = HealthMetrics.getHealthSummary().summary.errorRate;
    if (errorRate > this.thresholds.errorRate) {
      issues.push(`High error rate: ${errorRate}% (threshold: ${this.thresholds.errorRate}%)`);
    }

    // Check memory usage (if available)
    const memoryUsage = allMetrics['system.memory_usage']?.value || 0;
    if (memoryUsage > this.thresholds.memoryUsage) {
      issues.push(`High memory usage: ${memoryUsage}% (threshold: ${this.thresholds.memoryUsage}%)`);
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (issues.length > 0) {
      status = issues.length > 2 ? 'unhealthy' : 'degraded';
    }

    return { status, issues };
  }

  static recordAlert(severity: 'info' | 'warning' | 'critical', message: string, details?: any): void {
    const tags = { severity };
    metrics.incrementCounter('alerts.triggered', 1, tags);
    
    logger.error(`Performance alert: ${message}`, {
      severity,
      details,
      timestamp: Date.now()
    });
  }
}
