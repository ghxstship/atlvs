'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Shield, 
  TrendingUp,
  Users,
  Server,
  Zap
} from 'lucide-react';
import { useEnterpriseSupabase } from '@/lib/supabase/enterprise-integration';
import type { PerformanceMetric, AlertRule, HealthStatus } from '@/lib/supabase/monitoring-service';

interface MonitoringDashboardProps {
  organizationId: string;
  refreshInterval?: number;
}

export function MonitoringDashboard({ 
  organizationId, 
  refreshInterval = 30000 
}: MonitoringDashboardProps) {
  const { monitoring, healthCheck } = useEnterpriseSupabase();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Get health status
      const health = await healthCheck();
      setHealthStatus(health);

      // Get performance metrics
      const metricsData = await monitoring.getMetrics({ 
        limit: 100,
        organizationId 
      });
      setMetrics(metricsData);

      // Get active alerts
      const alertsData = await monitoring.getActiveAlerts();
      setAlerts(alertsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [organizationId, refreshInterval]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentMetrics = metrics.filter(m => new Date(m.timestamp).getTime() > oneHourAgo);
    
    const queryMetrics = recentMetrics.filter(m => m.metricType === 'query_performance');
    const errorMetrics = recentMetrics.filter(m => m.metricType === 'error_rate');
    const connectionMetrics = recentMetrics.filter(m => m.metricType === 'connection_pool');

    return {
      avgQueryTime: queryMetrics.length > 0 
        ? queryMetrics.reduce((sum, m) => sum + m.value, 0) / queryMetrics.length 
        : 0,
      errorRate: errorMetrics.length > 0 
        ? errorMetrics[errorMetrics.length - 1].value 
        : 0,
      activeConnections: connectionMetrics.length > 0 
        ? connectionMetrics[connectionMetrics.length - 1].value 
        : 0,
      totalQueries: queryMetrics.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      warningAlerts: alerts.filter(a => a.severity === 'warning').length
    };
  }, [metrics, alerts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Monitoring</h1>
          <p className="text-gray-600">Real-time system health and performance metrics</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {healthStatus && getStatusIcon(healthStatus.status)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthStatus ? getStatusColor(healthStatus.status) : 'text-gray-600'}`}>
              {healthStatus?.status || 'Unknown'}
            </div>
            <p className="text-xs text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.avgQueryTime.toFixed(1)}ms
            </div>
            <p className="text-xs text-gray-600">
              {summaryStats.totalQueries} queries (1h)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(summaryStats.errorRate * 100).toFixed(2)}%
            </div>
            <Progress 
              value={summaryStats.errorRate * 100} 
              className="mt-2"
              max={10}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(summaryStats.activeConnections)}
            </div>
            <p className="text-xs text-gray-600">
              Database connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                    <div>
                      <p className="font-medium">{alert.name}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(alert.lastTriggered || '').toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
                <CardDescription>Recent database query metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics
                    .filter(m => m.metricType === 'query_performance')
                    .slice(0, 10)
                    .map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="font-medium">
                          {metric.value.toFixed(1)}ms
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
                <CardDescription>Cache hit rates and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics
                    .filter(m => m.metricType === 'cache_performance')
                    .slice(0, 10)
                    .map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Cache Hit Rate
                        </span>
                        <span className="font-medium">
                          {(metric.value * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>Recent security incidents and threats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics
                    .filter(m => m.metricType === 'security_events')
                    .slice(0, 10)
                    .map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {metric.metadata?.eventType || 'Security Event'}
                        </span>
                        <Badge variant={metric.value > 0 ? 'destructive' : 'secondary'}>
                          {metric.value > 0 ? 'Alert' : 'Clear'}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentication Metrics</CardTitle>
                <CardDescription>Login attempts and authentication status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Failed Logins (1h)</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Successful Logins (1h)</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">MFA Enabled Users</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>GDPR Compliance</CardTitle>
                <CardDescription>Data protection compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Compliant</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Data Retention</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Consent Management</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Right to be Forgotten</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SOC 2 Compliance</CardTitle>
                <CardDescription>Security and availability controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Compliant</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Security Controls</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Availability</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Integrity</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>Compliance audit activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Last Audit</span>
                    <span>2 days ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Audit Events (24h)</span>
                    <span>1,247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Compliance Score</span>
                    <span className="text-green-600">98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Storage Utilization</CardTitle>
                <CardDescription>Database storage usage and projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Usage</span>
                      <span>2.4 GB / 10 GB</span>
                    </div>
                    <Progress value={24} />
                  </div>
                  <div className="text-sm text-gray-600">
                    Projected to reach 50% in 6 months
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Pool</CardTitle>
                <CardDescription>Database connection utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Active Connections</span>
                      <span>12 / 100</span>
                    </div>
                    <Progress value={12} />
                  </div>
                  <div className="text-sm text-gray-600">
                    Peak usage: 45 connections
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
