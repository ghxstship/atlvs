import { getEnterpriseClient } from './enterprise-client';

// Performance monitoring and observability utilities
export class SupabaseMonitoring {
  private client = getEnterpriseClient();
  private performanceObserver?: PerformanceObserver;
  private queryMetrics: Map<string, QueryMetric> = new Map();

  constructor() {
    this.initializePerformanceObserver();
  }

  // Query performance tracking
  async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    organizationId?: string
  ): Promise<T> {
    const startTime = performance.now();
    const queryId = this.generateQueryId(queryName);

    try {
      const result = await queryFn();
      const endTime = performance.now();
      const duration = endTime - startTime;

      await this.recordQueryMetric({
        queryId,
        queryName,
        duration,
        success: true,
        organizationId,
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      await this.recordQueryMetric({
        queryId,
        queryName,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        organizationId,
        timestamp: new Date()
      });

      throw error;
    }
  }

  // Connection pool monitoring
  async monitorConnectionPool(organizationId: string): Promise<ConnectionPoolStats> {
    try {
      const supabaseClient = await this.client.getSupabaseClient();
      const { data, error } = await supabaseClient
        .from('connection_pool_config')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (error) {
        throw new Error(`Connection pool monitoring failed: ${error.message}`);
      }

      // Get current connection statistics (this would need to be implemented server-side)
      const poolStats: ConnectionPoolStats = {
        totalPools: 1,
        activeConnections: 0, // Would be fetched from actual pool
        idleConnections: 0,
        maxConnections: (data as any)?.[0]?.max_connections || 20,
        connectionUtilization: 0,
        averageWaitTime: 0,
        timestamp: new Date()
      };

      return poolStats;
    } catch (error) {
      console.error('Connection pool monitoring failed:', error);
      throw error;
    }
  }

  // Real-time subscription monitoring
  monitorRealtimeSubscriptions(): RealtimeMonitor {
    const subscriptions = new Map<string, SubscriptionMetric>();
    
    return {
      trackSubscription: (channel: string, table: string) => {
        const subscriptionId = `${channel}_${table}`;
        subscriptions.set(subscriptionId, {
          subscriptionId,
          channel,
          table,
          messageCount: 0,
          lastMessageAt: new Date(),
          connectionStatus: 'connected',
          errors: []
        });
      },
      
      recordMessage: (channel: string, table: string) => {
        const subscriptionId = `${channel}_${table}`;
        const metric = subscriptions.get(subscriptionId);
        if (metric) {
          metric.messageCount++;
          metric.lastMessageAt = new Date();
        }
      },
      
      recordError: (channel: string, table: string, error: string) => {
        const subscriptionId = `${channel}_${table}`;
        const metric = subscriptions.get(subscriptionId);
        if (metric) {
          metric.errors.push({
            error,
            timestamp: new Date()
          });
          metric.connectionStatus = 'error';
        }
      },
      
      getMetrics: () => Array.from(subscriptions.values()),
      
      cleanup: () => {
        subscriptions.clear();
      }
    };
  }

  // Database health monitoring
  async checkDatabaseHealth(organizationId: string): Promise<DatabaseHealthCheck> {
    try {
      const [
        tableStats,
        queryStats,
        connectionStats
      ] = await Promise.all([
        this.client.getTableStatistics(),
        this.client.getQueryPerformanceStats(organizationId),
        this.monitorConnectionPool(organizationId)
      ]);

      const health: DatabaseHealthCheck = {
        status: 'healthy',
        checks: {
          tableSize: this.checkTableSizes(tableStats),
          queryPerformance: this.checkQueryPerformance(queryStats),
          connectionPool: this.checkConnectionPool(connectionStats),
          indexUsage: await this.checkIndexUsage()
        },
        timestamp: new Date(),
        organizationId
      };

      // Determine overall health status
      const failedChecks = Object.values(health.checks).filter(check => !check.passed);
      if (failedChecks.length > 0) {
        health.status = failedChecks.some(check => check.severity === 'critical') ? 'critical' : 'warning';
      }

      return health;
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'critical',
        checks: {},
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        organizationId
      };
    }
  }

  // API usage analytics
  async trackAPIUsage(
    organizationId: string,
    userId: string | null,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTimeMs: number,
    requestSizeBytes?: number,
    responseSizeBytes?: number,
    ipAddress?: string,
    userAgent?: string,
    apiKeyId?: string,
    rateLimited = false
  ): Promise<void> {
    try {
      const supabaseClient = await this.client.getSupabaseClient();
      await (supabaseClient as any)
        .from('api_usage_tracking')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          endpoint,
          method,
          status_code: statusCode,
          response_time_ms: responseTimeMs,
          request_size_bytes: requestSizeBytes,
          response_size_bytes: responseSizeBytes,
          ip_address: ipAddress,
          user_agent: userAgent,
          api_key_id: apiKeyId,
          rate_limited: rateLimited,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('API usage tracking failed:', error);
    }
  }

  // Security monitoring
  async detectAnomalousActivity(organizationId: string, timeWindow = '24 hours'): Promise<SecurityAlert[]> {
    try {
      const supabaseClient = await this.client.getSupabaseClient();
      const { data: securityEvents, error } = await (supabaseClient as any)
        .from('security_events')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', new Date(Date.now() - this.parseTimeWindow(timeWindow)).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Security monitoring failed: ${error.message}`);
      }

      const alerts: SecurityAlert[] = [];

      // Analyze patterns for anomalies
      const eventsByType = this.groupBy(securityEvents || [], 'event_type');
      const eventsByUser = this.groupBy(securityEvents || [], 'user_id');
      const eventsByIP = this.groupBy(securityEvents || [], 'ip_address');

      // Check for suspicious patterns
      for (const [eventType, events] of Object.entries(eventsByType)) {
        if (eventType === 'login_failure' && events.length > 10) {
          alerts.push({
            type: 'brute_force_attempt',
            severity: 'high',
            description: `Multiple login failures detected: ${events.length} attempts`,
            affectedResource: eventType,
            timestamp: new Date(),
            metadata: { eventCount: events.length }
          });
        }
      }

      for (const [userId, events] of Object.entries(eventsByUser)) {
        if (events.length > 100) {
          alerts.push({
            type: 'unusual_user_activity',
            severity: 'medium',
            description: `Unusual activity volume for user: ${events.length} events`,
            affectedResource: userId,
            timestamp: new Date(),
            metadata: { eventCount: events.length }
          });
        }
      }

      return alerts;
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      return [];
    }
  }

  // Private helper methods
  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.startsWith('supabase-query-')) {
            this.recordPerformanceEntry(entry);
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['measure'] });
    }
  }

  private async recordQueryMetric(metric: QueryMetric): Promise<void> {
    this.queryMetrics.set(metric.queryId, metric);

    // Log slow queries
    if (metric.duration > 1000) { // 1 second threshold
      await this.client.logSecurityEvent(
        metric.organizationId || 'system',
        'system',
        'slow_query_detected',
        'medium',
        {
          queryName: metric.queryName,
          duration: metric.duration,
          success: metric.success,
          error: metric.error
        }
      );
    }
  }

  private recordPerformanceEntry(entry: PerformanceEntry): void {
    console.log(`Query ${entry.name} took ${entry.duration}ms`);
  }

  private generateQueryId(queryName: string): string {
    return `${queryName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private checkTableSizes(tableStats: any[]): HealthCheck {
    const largeTables = tableStats.filter(table => 
      this.parseSize(table.total_size) > 1024 * 1024 * 1024 // 1GB
    );

    return {
      name: 'Table Sizes',
      passed: largeTables.length === 0,
      severity: largeTables.length > 0 ? 'warning' : 'info',
      message: largeTables.length > 0 
        ? `${largeTables.length} tables exceed 1GB size limit`
        : 'All tables within acceptable size limits',
      details: { largeTables: largeTables.map(t => t.table_name) }
    };
  }

  private checkQueryPerformance(queryStats: any[]): HealthCheck {
    const slowQueries = queryStats.filter(query => query.mean_time > 1000);

    return {
      name: 'Query Performance',
      passed: slowQueries.length === 0,
      severity: slowQueries.length > 0 ? 'warning' : 'info',
      message: slowQueries.length > 0
        ? `${slowQueries.length} queries have mean execution time > 1s`
        : 'All queries performing within acceptable limits',
      details: { slowQueries: slowQueries.length }
    };
  }

  private checkConnectionPool(connectionStats: ConnectionPoolStats): HealthCheck {
    const utilizationThreshold = 0.8; // 80%
    const highUtilization = connectionStats.connectionUtilization > utilizationThreshold;

    return {
      name: 'Connection Pool',
      passed: !highUtilization,
      severity: highUtilization ? 'warning' : 'info',
      message: highUtilization
        ? `Connection pool utilization is ${(connectionStats.connectionUtilization * 100).toFixed(1)}%`
        : 'Connection pool utilization is healthy',
      details: connectionStats
    };
  }

  private async checkIndexUsage(): Promise<HealthCheck> {
    try {
      const missingIndexes = await this.client.suggestMissingIndexes();
      
      return {
        name: 'Index Usage',
        passed: missingIndexes.length === 0,
        severity: missingIndexes.length > 0 ? 'warning' : 'info',
        message: missingIndexes.length > 0
          ? `${missingIndexes.length} missing indexes detected`
          : 'All critical indexes are present',
        details: { missingIndexes }
      };
    } catch (error) {
      return {
        name: 'Index Usage',
        passed: false,
        severity: 'error',
        message: 'Failed to check index usage',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private parseSize(sizeString: string): number {
    const units: Record<string, number> = {
      'bytes': 1,
      'kB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };

    const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*(\w+)$/);
    if (!match) return 0;

    const [, value, unit] = match;
    return parseFloat(value) * (units[unit] || 1);
  }

  private parseTimeWindow(timeWindow: string): number {
    const units: Record<string, number> = {
      'minutes': 60 * 1000,
      'hours': 60 * 60 * 1000,
      'days': 24 * 60 * 60 * 1000
    };

    const match = timeWindow.match(/^(\d+)\s*(\w+)$/);
    if (!match) return 24 * 60 * 60 * 1000; // Default to 24 hours

    const [, value, unit] = match;
    return parseInt(value) * (units[unit] || 60 * 60 * 1000);
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
}

// Type definitions
interface QueryMetric {
  queryId: string;
  queryName: string;
  duration: number;
  success: boolean;
  error?: string;
  organizationId?: string;
  timestamp: Date;
}

interface ConnectionPoolStats {
  totalPools: number;
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
  connectionUtilization: number;
  averageWaitTime: number;
  timestamp: Date;
}

interface SubscriptionMetric {
  subscriptionId: string;
  channel: string;
  table: string;
  messageCount: number;
  lastMessageAt: Date;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  errors: Array<{ error: string; timestamp: Date }>;
}

interface RealtimeMonitor {
  trackSubscription: (channel: string, table: string) => void;
  recordMessage: (channel: string, table: string) => void;
  recordError: (channel: string, table: string, error: string) => void;
  getMetrics: () => SubscriptionMetric[];
  cleanup: () => void;
}

interface HealthCheck {
  name: string;
  passed: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: any;
}

interface DatabaseHealthCheck {
  status: 'healthy' | 'warning' | 'critical';
  checks: Record<string, HealthCheck>;
  error?: string;
  timestamp: Date;
  organizationId: string;
}

interface SecurityAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResource: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Export singleton instance
export const supabaseMonitoring = new SupabaseMonitoring();
