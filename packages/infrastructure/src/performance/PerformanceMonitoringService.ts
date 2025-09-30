/**
 * Performance Monitoring Service
 * Instruments queries with logging and metrics for latency validation
 */

interface QueryMetrics {
  queryId: string;
  operation: string;
  table: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  recordCount?: number;
  cacheHit?: boolean;
  connectionPoolUsed?: boolean;
}

interface PerformanceThresholds {
  queryTimeoutMs: number;
  slowQueryThresholdMs: number;
  maxConcurrentQueries: number;
}

interface PerformanceReport {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slowQueries: QueryMetrics[];
  errorRate: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Query Performance Monitor
 */
export class QueryPerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private activeQueries = new Map<string, QueryMetrics>();
  private thresholds: PerformanceThresholds = {
    queryTimeoutMs: 5000, // 5 seconds
    slowQueryThresholdMs: 100, // 100ms
    maxConcurrentQueries: 50,
  };

  /**
   * Start monitoring a query
   */
  startQuery(
    queryId: string,
    operation: string,
    table: string,
    additionalData?: Partial<QueryMetrics>
  ): string {
    const metric: QueryMetrics = {
      queryId,
      operation,
      table,
      startTime: Date.now(),
      success: false,
      ...additionalData,
    };

    // Check concurrent query limit
    if (this.activeQueries.size >= this.thresholds.maxConcurrentQueries) {
      console.warn(`Concurrent query limit (${this.thresholds.maxConcurrentQueries}) exceeded`);
    }

    this.activeQueries.set(queryId, metric);

    // Set timeout warning
    setTimeout(() => {
      const activeMetric = this.activeQueries.get(queryId);
      if (activeMetric && !activeMetric.endTime) {
        console.warn(`Query ${queryId} is taking longer than ${this.thresholds.queryTimeoutMs}ms`);
      }
    }, this.thresholds.queryTimeoutMs);

    return queryId;
  }

  /**
   * End monitoring a query
   */
  endQuery(
    queryId: string,
    success: boolean,
    error?: string,
    recordCount?: number,
    cacheHit?: boolean
  ): void {
    const metric = this.activeQueries.get(queryId);
    if (!metric) {
      console.warn(`Query ${queryId} not found in active queries`);
      return;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    metric.error = error;
    metric.recordCount = recordCount;
    metric.cacheHit = cacheHit;

    // Move to completed metrics
    this.metrics.push(metric);
    this.activeQueries.delete(queryId);

    // Log slow queries
    if (metric.duration && metric.duration > this.thresholds.slowQueryThresholdMs) {
      console.warn(`Slow query detected: ${metric.operation} on ${metric.table} took ${metric.duration}ms`);
    }

    // Log errors
    if (!success && error) {
      console.error(`Query failed: ${metric.operation} on ${metric.table} - ${error}`);
    }
  }

  /**
   * Get current performance report
   */
  getPerformanceReport(hoursBack = 24): PerformanceReport {
    const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    const relevantMetrics = this.metrics.filter(m => m.startTime >= cutoffTime);

    const successfulQueries = relevantMetrics.filter(m => m.success);
    const failedQueries = relevantMetrics.filter(m => !m.success);

    const responseTimes = successfulQueries
      .map(m => m.duration!)
      .filter(d => d !== undefined)
      .sort((a, b) => a - b);

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    const slowQueries = successfulQueries.filter(
      m => m.duration && m.duration > this.thresholds.slowQueryThresholdMs
    );

    return {
      totalQueries: relevantMetrics.length,
      successfulQueries: successfulQueries.length,
      failedQueries: failedQueries.length,
      averageResponseTime,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      slowQueries,
      errorRate: relevantMetrics.length > 0 ? (failedQueries.length / relevantMetrics.length) * 100 : 0,
      timeRange: {
        start: new Date(cutoffTime),
        end: new Date(),
      },
    };
  }

  /**
   * Get active queries
   */
  getActiveQueries(): QueryMetrics[] {
    return Array.from(this.activeQueries.values());
  }

  /**
   * Update thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(hoursBack = 168): void { // 7 days default
    const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.startTime >= cutoffTime);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): QueryMetrics[] {
    return [...this.metrics];
  }
}

/**
 * Database Connection Pool Monitor
 */
export class ConnectionPoolMonitor {
  private poolStats = {
    activeConnections: 0,
    idleConnections: 0,
    waitingClients: 0,
    totalConnections: 0,
    maxConnections: 0,
  };

  /**
   * Update pool statistics
   */
  updateStats(stats: Partial<typeof this.poolStats>): void {
    this.poolStats = { ...this.poolStats, ...stats };
  }

  /**
   * Get current pool status
   */
  getPoolStatus() {
    return {
      ...this.poolStats,
      utilizationRate: this.poolStats.maxConnections > 0
        ? (this.poolStats.activeConnections / this.poolStats.maxConnections) * 100
        : 0,
      hasWaitingClients: this.poolStats.waitingClients > 0,
    };
  }

  /**
   * Check if pool is healthy
   */
  isHealthy(): boolean {
    const status = this.getPoolStatus();
    return status.utilizationRate < 90 && !status.hasWaitingClients;
  }
}

/**
 * Cache Performance Monitor
 */
export class CachePerformanceMonitor {
  private hits = 0;
  private misses = 0;
  private hitTimes: number[] = [];
  private missTimes: number[] = [];

  /**
   * Record cache hit
   */
  recordHit(responseTime: number): void {
    this.hits++;
    this.hitTimes.push(responseTime);
    this.keepRecentTimes(this.hitTimes);
  }

  /**
   * Record cache miss
   */
  recordMiss(responseTime: number): void {
    this.misses++;
    this.missTimes.push(responseTime);
    this.keepRecentTimes(this.missTimes);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    const avgHitTime = this.hitTimes.length > 0
      ? this.hitTimes.reduce((sum, time) => sum + time, 0) / this.hitTimes.length
      : 0;

    const avgMissTime = this.missTimes.length > 0
      ? this.missTimes.reduce((sum, time) => sum + time, 0) / this.missTimes.length
      : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      totalRequests,
      hitRate,
      averageHitTime: avgHitTime,
      averageMissTime: avgMissTime,
      cacheEfficiency: avgMissTime > 0 ? avgHitTime / avgMissTime : 0,
    };
  }

  private keepRecentTimes(times: number[], maxSize = 1000): void {
    if (times.length > maxSize) {
      times.splice(0, times.length - maxSize);
    }
  }
}

/**
 * Main Performance Monitoring Service
 */
export class PerformanceMonitoringService {
  private queryMonitor = new QueryPerformanceMonitor();
  private poolMonitor = new ConnectionPoolMonitor();
  private cacheMonitor = new CachePerformanceMonitor();

  /**
   * Monitor a database query
   */
  async monitorQuery<T>(
    operation: string,
    table: string,
    queryFn: () => Promise<T>,
    additionalData?: Partial<QueryMetrics>
  ): Promise<T> {
    const queryId = this.queryMonitor.startQuery(
      `${operation}_${table}_${Date.now()}_${Math.random()}`,
      operation,
      table,
      additionalData
    );

    try {
      const result = await queryFn();

      // Try to extract record count if it's an array
      let recordCount: number | undefined;
      if (Array.isArray(result)) {
        recordCount = result.length;
      }

      this.queryMonitor.endQuery(queryId, true, undefined, recordCount);
      return result;
    } catch (error) {
      this.queryMonitor.endQuery(queryId, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Monitor cache operation
   */
  monitorCache(hit: boolean, responseTime: number): void {
    if (hit) {
      this.cacheMonitor.recordHit(responseTime);
    } else {
      this.cacheMonitor.recordMiss(responseTime);
    }
  }

  /**
   * Update connection pool stats
   */
  updatePoolStats(stats: Parameters<ConnectionPoolMonitor['updateStats']>[0]): void {
    this.poolMonitor.updateStats(stats);
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport(): {
    queries: PerformanceReport;
    cache: ReturnType<CachePerformanceMonitor['getCacheStats']>;
    pool: ReturnType<ConnectionPoolMonitor['getPoolStatus']>;
    overallHealth: 'healthy' | 'warning' | 'critical';
  } {
    const queryReport = this.queryMonitor.getPerformanceReport();
    const cacheStats = this.cacheMonitor.getCacheStats();
    const poolStatus = this.poolMonitor.getPoolStatus();

    // Determine overall health
    let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (queryReport.errorRate > 5 || queryReport.p95ResponseTime > 1000) {
      overallHealth = 'critical';
    } else if (queryReport.errorRate > 1 || queryReport.p95ResponseTime > 500 || !this.poolMonitor.isHealthy()) {
      overallHealth = 'warning';
    }

    return {
      queries: queryReport,
      cache: cacheStats,
      pool: poolStatus,
      overallHealth,
    };
  }

  /**
   * Get individual monitors for direct access
   */
  getMonitors() {
    return {
      queries: this.queryMonitor,
      cache: this.cacheMonitor,
      pool: this.poolMonitor,
    };
  }

  /**
   * Export all metrics for external analysis
   */
  exportMetrics() {
    return {
      queries: this.queryMonitor.exportMetrics(),
      cache: this.cacheMonitor.getCacheStats(),
      pool: this.poolMonitor.getPoolStatus(),
    };
  }
}

// Singleton instance
let performanceMonitoringService: PerformanceMonitoringService | null = null;

export function getPerformanceMonitoringService(): PerformanceMonitoringService {
  if (!performanceMonitoringService) {
    performanceMonitoringService = new PerformanceMonitoringService();
  }
  return performanceMonitoringService;
}
