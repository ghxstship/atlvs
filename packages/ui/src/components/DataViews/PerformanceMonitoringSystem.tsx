'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { SupabaseClient } from '@supabase/supabase-js';
type SupabaseClient = any; // Placeholder type
import { Button } from '../atomic/Button';
import { Badge } from '../Badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  TrendingUp,
  TrendingDown,
  Zap,
  Server,
  Eye,
  RefreshCw,
  Settings,
  BarChart3,
  Gauge
} from 'lucide-react';

interface PerformanceMonitoringSystemProps {
  supabase: SupabaseClient;
  tableName?: string;
  onAlert?: (alert: PerformanceAlert) => void;
  onMetricUpdate?: (metrics: PerformanceMetrics) => void;
  className?: string;
}

interface PerformanceMetrics {
  queryTime: number;
  connectionTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
  activeConnections: number;
  schemaValidationTime: number;
  realtimeLatency: number;
  timestamp: Date;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
  resolved?: boolean;
}

interface QueryPerformance {
  query: string;
  executionTime: number;
  rowsAffected: number;
  cacheHit: boolean;
  timestamp: Date;
}

interface SchemaHealth {
  tablesCount: number;
  indexesCount: number;
  constraintsCount: number;
  triggersCount: number;
  lastSchemaChange: Date | null;
  schemaValidationErrors: number;
}

export function PerformanceMonitoringSystem({
  supabase,
  tableName,
  onAlert,
  onMetricUpdate,
  className = ''
}: PerformanceMonitoringSystemProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryPerformance[]>([]);
  const [schemaHealth, setSchemaHealth] = useState<SchemaHealth | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState(5000); // 5 seconds
  const intervalRef = useRef<NodeJS.Timeout>();
  const metricsHistoryRef = useRef<PerformanceMetrics[]>([]);

  // Performance thresholds
  const thresholds = {
    queryTime: 1000, // 1 second
    connectionTime: 500, // 500ms
    memoryUsage: 80, // 80%
    cacheHitRate: 70, // 70%
    errorRate: 5, // 5%
    throughput: 100, // queries per second
    activeConnections: 50,
    schemaValidationTime: 200, // 200ms
    realtimeLatency: 100 // 100ms
  };

  // Collect performance metrics
  const collectMetrics = useCallback(async (): Promise<PerformanceMetrics> => {
    const startTime = performance.now();
    
    try {
      // Test query performance
      const queryStart = performance.now();
      const { data, error } = await supabase
        .from(tableName || 'organizations')
        .select('count(*)', { count: 'exact', head: true });
      const queryTime = performance.now() - queryStart;

      // Connection time (simulated)
      const connectionTime = Math.random() * 100 + 50;

      // Memory usage (simulated - in real app would use actual metrics)
      const memoryUsage = Math.random() * 100;

      // Cache hit rate (simulated)
      const cacheHitRate = Math.random() * 100;

      // Error rate (based on recent queries)
      const recentErrors = queryHistory.slice(-100).filter(q => q.executionTime > thresholds.queryTime).length;
      const errorRate = (recentErrors / Math.min(queryHistory.length, 100)) * 100;

      // Throughput (queries per second)
      const recentQueries = queryHistory.filter(q => 
        Date.now() - q.timestamp.getTime() < 60000 // Last minute
      );
      const throughput = recentQueries.length / 60;

      // Active connections (simulated)
      const activeConnections = Math.floor(Math.random() * 20) + 5;

      // Schema validation time
      const schemaStart = performance.now();
      // Simulate schema validation
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
      const schemaValidationTime = performance.now() - schemaStart;

      // Realtime latency (simulated)
      const realtimeLatency = Math.random() * 200 + 50;

      const newMetrics: PerformanceMetrics = {
        queryTime,
        connectionTime,
        memoryUsage,
        cacheHitRate,
        errorRate,
        throughput,
        activeConnections,
        schemaValidationTime,
        realtimeLatency,
        timestamp: new Date()
      };

      // Store in history
      metricsHistoryRef.current.push(newMetrics);
      if (metricsHistoryRef.current.length > 1000) {
        metricsHistoryRef.current = metricsHistoryRef.current.slice(-1000);
      }

      return newMetrics;

    } catch (error) {
      console.error('Failed to collect metrics:', error);
      throw error;
    }
  }, [supabase, tableName, queryHistory]);

  // Check for alerts
  const checkAlerts = useCallback((metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const value = metrics[metric as keyof PerformanceMetrics] as number;
      let alertType: PerformanceAlert['type'] = 'warning';
      let shouldAlert = false;

      switch (metric) {
        case 'queryTime':
        case 'connectionTime':
        case 'schemaValidationTime':
        case 'realtimeLatency':
          shouldAlert = value > threshold;
          alertType = value > threshold * 2 ? 'critical' : 'warning';
          break;
        case 'memoryUsage':
        case 'errorRate':
          shouldAlert = value > threshold;
          alertType = value > threshold * 1.5 ? 'critical' : 'warning';
          break;
        case 'cacheHitRate':
          shouldAlert = value < threshold;
          alertType = value < threshold * 0.5 ? 'critical' : 'warning';
          break;
        case 'activeConnections':
          shouldAlert = value > threshold;
          alertType = value > threshold * 1.2 ? 'critical' : 'warning';
          break;
      }

      if (shouldAlert) {
        const alert: PerformanceAlert = {
          id: `alert_${Date.now()}_${metric}`,
          type: alertType,
          metric: metric as keyof PerformanceMetrics,
          value,
          threshold,
          message: generateAlertMessage(metric, value, threshold),
          timestamp: new Date()
        };

        newAlerts.push(alert);
        onAlert?.(alert);
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-50)); // Keep last 50 alerts
    }
  }, [onAlert]);

  // Generate alert message
  const generateAlertMessage = (metric: string, value: number, threshold: number): string => {
    const metricLabels: Record<string, string> = {
      queryTime: 'Query execution time',
      connectionTime: 'Database connection time',
      memoryUsage: 'Memory usage',
      cacheHitRate: 'Cache hit rate',
      errorRate: 'Error rate',
      throughput: 'Query throughput',
      activeConnections: 'Active connections',
      schemaValidationTime: 'Schema validation time',
      realtimeLatency: 'Realtime latency'
    };

    const label = metricLabels[metric] || metric;
    
    if (metric === 'cacheHitRate') {
      return `${label} is below threshold: ${value.toFixed(1)}% < ${threshold}%`;
    }
    
    return `${label} exceeds threshold: ${value.toFixed(1)} > ${threshold}`;
  };

  // Collect schema health metrics
  const collectSchemaHealth = useCallback(async () => {
    try {
      // Get schema information using RPC functions
      const [tablesResult, indexesResult, constraintsResult, triggersResult] = await Promise.all([
        supabase.rpc('get_schema_tables'),
        supabase.rpc('get_schema_indexes'),
        supabase.rpc('get_schema_constraints'),
        supabase.rpc('get_schema_triggers')
      ]);

      const health: SchemaHealth = {
        tablesCount: tablesResult.data?.length || 0,
        indexesCount: indexesResult.data?.length || 0,
        constraintsCount: constraintsResult.data?.length || 0,
        triggersCount: triggersResult.data?.length || 0,
        lastSchemaChange: null, // Would need to track this separately
        schemaValidationErrors: 0 // Would be populated by validation results
      };

      setSchemaHealth(health);
    } catch (error) {
      console.error('Failed to collect schema health:', error);
    }
  }, [supabase]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    
    const monitor = async () => {
      try {
        const newMetrics = await collectMetrics();
        setMetrics(newMetrics);
        checkAlerts(newMetrics);
        onMetricUpdate?.(newMetrics);
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    };

    // Initial collection
    monitor();
    collectSchemaHealth();

    // Set up interval
    intervalRef.current = setInterval(monitor, monitoringInterval);
  }, [isMonitoring, collectMetrics, checkAlerts, onMetricUpdate, collectSchemaHealth, monitoringInterval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Get metric trend
  const getMetricTrend = useCallback((metric: keyof PerformanceMetrics): 'up' | 'down' | 'stable' => {
    const history = metricsHistoryRef.current.slice(-10);
    if (history.length < 2) return 'stable';

    const recent = history.slice(-3).reduce((sum, m) => sum + (m[metric] as number), 0) / 3;
    const older = history.slice(-6, -3).reduce((sum, m) => sum + (m[metric] as number), 0) / 3;

    const threshold = 0.1; // 10% change threshold
    if (recent > older * (1 + threshold)) return 'up';
    if (recent < older * (1 - threshold)) return 'down';
    return 'stable';
  }, []);

  // Format metric value
  const formatMetricValue = (metric: keyof PerformanceMetrics, value: number): string => {
    switch (metric) {
      case 'queryTime':
      case 'connectionTime':
      case 'schemaValidationTime':
      case 'realtimeLatency':
        return `${value.toFixed(1)}ms`;
      case 'memoryUsage':
      case 'cacheHitRate':
      case 'errorRate':
        return `${value.toFixed(1)}%`;
      case 'throughput':
        return `${value.toFixed(1)}/s`;
      case 'activeConnections':
        return value.toString();
      default:
        return value.toFixed(1);
    }
  };

  // Get status color
  const getStatusColor = (metric: keyof PerformanceMetrics, value: number): string => {
    const threshold = thresholds[metric as keyof typeof thresholds];
    
    switch (metric) {
      case 'cacheHitRate':
        if (value >= threshold) return 'text-success';
        if (value >= threshold * 0.7) return 'text-warning';
        return 'text-destructive';
      default:
        if (value <= threshold) return 'text-success';
        if (value <= threshold * 1.5) return 'text-warning';
        return 'text-destructive';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`bg-background border border-border rounded-lg p-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-xl font-semibold flex items-center gap-sm">
          <Activity className="h-5 w-5" />
          Performance Monitoring
        </h2>
        
        <div className="flex items-center gap-sm">
          <Button
            variant="outline"
            
            onClick={() => setMonitoringInterval(prev => prev === 5000 ? 1000 : 5000)}
          >
            <Settings className="h-4 w-4 mr-xs" />
            {monitoringInterval === 1000 ? 'Real-time' : 'Standard'}
          </Button>
          
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            variant={isMonitoring ? 'destructive' : 'primary'}
          >
            {isMonitoring ? (
              <>
                <Eye className="h-4 w-4 mr-xs" />
                Stop Monitoring
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-xs" />
                Start Monitoring
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        <div className="bg-muted rounded-lg p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">
                {isMonitoring ? (
                  <span className="text-success">Active</span>
                ) : (
                  <span className="text-muted-foreground">Inactive</span>
                )}
              </p>
            </div>
            <Gauge className={`h-8 w-8 ${isMonitoring ? 'text-success' : 'text-muted-foreground'}`} />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-lg font-semibold">
                {alerts.filter(a => !a.resolved).length}
              </p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${alerts.some(a => !a.resolved) ? 'text-destructive' : 'text-muted-foreground'}`} />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Query Time</p>
              <p className="text-lg font-semibold">
                {metrics ? formatMetricValue('queryTime', metrics.queryTime) : '--'}
              </p>
            </div>
            <Database className="h-8 w-8 text-accent" />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              <p className="text-lg font-semibold">
                {metrics ? formatMetricValue('cacheHitRate', metrics.cacheHitRate) : '--'}
              </p>
            </div>
            <Zap className="h-8 w-8 text-warning" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <div className="mb-lg">
          <h3 className="text-lg font-medium mb-md">Current Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {Object.entries(metrics).filter(([key]) => key !== 'timestamp').map(([key, value]) => {
              const metricKey = key as keyof PerformanceMetrics;
              const trend = getMetricTrend(metricKey);
              const statusColor = getStatusColor(metricKey, value as number);
              
              return (
                <div key={key} className="bg-background border border-border rounded-lg p-sm">
                  <div className="flex items-center justify-between mb-sm">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {trend === 'up' && <TrendingUp className="h-4 w-4 text-destructive" />}
                    {trend === 'down' && <TrendingDown className="h-4 w-4 text-success" />}
                  </div>
                  <div className={`text-lg font-semibold ${statusColor}`}>
                    {formatMetricValue(metricKey, value as number)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Threshold: {formatMetricValue(metricKey, thresholds[metricKey as keyof typeof thresholds])}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schema Health */}
      {schemaHealth && (
        <div className="mb-lg">
          <h3 className="text-lg font-medium mb-md">Schema Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{schemaHealth.tablesCount}</div>
              <div className="text-sm text-muted-foreground">Tables</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{schemaHealth.indexesCount}</div>
              <div className="text-sm text-muted-foreground">Indexes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{schemaHealth.constraintsCount}</div>
              <div className="text-sm text-muted-foreground">Constraints</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{schemaHealth.triggersCount}</div>
              <div className="text-sm text-muted-foreground">Triggers</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-lg font-medium">Recent Alerts</h3>
            <Button variant="ghost"  onClick={clearAlerts}>
              Clear All
            </Button>
          </div>
          
          <div className="space-y-sm max-h-60 overflow-y-auto">
            {alerts.slice(-10).reverse().map(alert => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-sm rounded-lg border ${
                  alert.resolved 
                    ? 'bg-muted border-border' 
                    : alert.type === 'critical'
                    ? 'bg-destructive/10 border-destructive/20'
                    : alert.type === 'error'
                    ? 'bg-warning/10 border-warning/20'
                    : 'bg-warning/10 border-warning/20'
                }`}
              >
                <div className="flex items-center gap-sm">
                  {alert.resolved ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : alert.type === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-sm">
                  <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.type}
                  </Badge>
                  
                  {!alert.resolved && (
                    <Button
                      
                      variant="ghost"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isMonitoring && (
        <div className="text-center py-xl text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-md opacity-50" />
          <p>Performance monitoring is not active</p>
          <Button className="mt-sm" onClick={startMonitoring}>
            Start Monitoring
          </Button>
        </div>
      )}
    </div>
  );
}
