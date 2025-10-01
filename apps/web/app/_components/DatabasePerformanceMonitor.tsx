'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Database, Clock, Zap, AlertTriangle } from 'lucide-react';

interface DatabaseMetrics {
  queryCount: number;
  slowQueries: number;
  connectionCount: number;
  cacheHitRate: number;
  avgResponseTime: number;
  activeConnections: number;
  totalConnections: number;
  memoryUsage: number;
}

export function DatabasePerformanceMonitor() {
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
  const [queryLog, setQueryLog] = useState<string[]>([]);

  useEffect(() => {
    // Simulate database metrics collection
    // In production, this would connect to your monitoring service
    const fetchDatabaseMetrics = async () => {
      try {
        // This would be replaced with actual database monitoring API calls
        const mockMetrics: DatabaseMetrics = {
          queryCount: Math.floor(Math.random() * 1000) + 500,
          slowQueries: Math.floor(Math.random() * 10),
          connectionCount: Math.floor(Math.random() * 50) + 10,
          cacheHitRate: Math.random() * 30 + 70, // 70-100%
          avgResponseTime: Math.random() * 200 + 50, // 50-250ms
          activeConnections: Math.floor(Math.random() * 20) + 5,
          totalConnections: 100,
          memoryUsage: Math.random() * 30 + 40, // 40-70%
        };

        setMetrics(mockMetrics);

        // Simulate query log updates
        if (Math.random() > 0.7) {
          const queries = [
            'SELECT * FROM projects WHERE organization_id = $1',
            'INSERT INTO users (email, name) VALUES ($1, $2)',
            'UPDATE performance_reviews SET status = $1 WHERE id = $2',
            'SELECT COUNT(*) FROM files WHERE project_id = $1',
          ];
          const randomQuery = queries[Math.floor(Math.random() * queries.length)];
          setQueryLog(prev => [randomQuery, ...prev.slice(0, 9)]);
        }
      } catch (error) {
        console.error('Failed to fetch database metrics:', error);
      }
    };

    fetchDatabaseMetrics();
    const interval = setInterval(fetchDatabaseMetrics, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getMetricColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Database className="h-icon-sm w-icon-sm" />
            Database Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading database metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Query Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-xs">
              <Zap className="h-icon-xs w-icon-xs" />
              Query Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.queryCount, { good: 800, poor: 1200 })}`}>
              {metrics.queryCount.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Last 5 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-xs">
              <Clock className="h-icon-xs w-icon-xs" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.avgResponseTime, { good: 150, poor: 300 })}`}>
              {metrics.avgResponseTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-gray-600">Target: &lt; 150ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-xs">
              <Database className="h-icon-xs w-icon-xs" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(100 - metrics.cacheHitRate, { good: 20, poor: 40 })}`}>
              {metrics.cacheHitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">Target: &gt; 80%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-xs">
              <AlertTriangle className="h-icon-xs w-icon-xs" />
              Slow Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.slowQueries, { good: 2, poor: 5 })}`}>
              {metrics.slowQueries}
            </div>
            <p className="text-xs text-gray-600">Queries &gt; 1s</p>
          </CardContent>
        </Card>
      </div>

      {/* Connection Pool Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Pool Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Connections</span>
              <span className={`font-semibold ${getMetricColor(metrics.activeConnections, { good: 15, poor: 25 })}`}>
                {metrics.activeConnections} / {metrics.totalConnections}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(metrics.activeConnections / metrics.totalConnections) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Memory Usage</span>
              <span className={`font-semibold ${getMetricColor(metrics.memoryUsage, { good: 60, poor: 80 })}`}>
                {metrics.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.memoryUsage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Query Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-xs max-h-40 overflow-y-auto">
            {queryLog.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent queries</p>
            ) : (
              queryLog.map((query, index) => (
                <div key={index} className="text-xs font-mono bg-gray-50 p-xs rounded">
                  {query}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-xs">
            {metrics.avgResponseTime > 150 && (
              <div className="flex items-center gap-xs text-yellow-700">
                <AlertTriangle className="h-icon-xs w-icon-xs" />
                <span className="text-sm">Consider adding database indexes for frequently queried columns</span>
              </div>
            )}
            {metrics.cacheHitRate < 80 && (
              <div className="flex items-center gap-xs text-yellow-700">
                <AlertTriangle className="h-icon-xs w-icon-xs" />
                <span className="text-sm">Cache hit rate is below optimal. Consider increasing cache size</span>
              </div>
            )}
            {metrics.slowQueries > 2 && (
              <div className="flex items-center gap-xs text-red-700">
                <AlertTriangle className="h-icon-xs w-icon-xs" />
                <span className="text-sm">Multiple slow queries detected. Review query optimization</span>
              </div>
            )}
            {metrics.activeConnections > 25 && (
              <div className="flex items-center gap-xs text-red-700">
                <AlertTriangle className="h-icon-xs w-icon-xs" />
                <span className="text-sm">High connection count. Consider connection pooling optimization</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
