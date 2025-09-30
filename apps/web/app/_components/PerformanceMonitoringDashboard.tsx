'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { AlertTriangle, TrendingUp, Activity, Zap } from 'lucide-react';

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  tti: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  responseTime: number;
}

export function PerformanceMonitoringDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Initialize performance monitoring
    if (typeof window !== 'undefined') {
      // Web Vitals monitoring
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => {
          updateMetric('cls', metric.value * 1000); // Convert to milliseconds
        });

        getFID((metric) => {
          updateMetric('fid', metric.value);
        });

        getFCP((metric) => {
          updateMetric('fcp', metric.value);
        });

        getLCP((metric) => {
          updateMetric('lcp', metric.value);
        });

        getTTFB((metric) => {
          updateMetric('tti', metric.value);
        });
      });

      // Memory and performance monitoring
      const updatePerformanceMetrics = () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const usedMemory = memory.usedJSHeapSize / memory.totalJSHeapSize;
          updateMetric('memoryUsage', usedMemory * 100);
        }

        // CPU usage estimation (rough approximation)
        if ('timing' in performance) {
          const timing = performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          updateMetric('responseTime', loadTime);
        }
      };

      updatePerformanceMetrics();
      const interval = setInterval(updatePerformanceMetrics, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, []);

  const updateMetric = (key: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => {
      const newMetrics = { ...prev, [key]: value } as PerformanceMetrics;

      // Check for alerts
      const newAlerts: string[] = [];
      if (newMetrics.lcp && newMetrics.lcp > 2500) {
        newAlerts.push('LCP exceeds 2.5s threshold');
      }
      if (newMetrics.fid && newMetrics.fid > 100) {
        newAlerts.push('FID exceeds 100ms threshold');
      }
      if (newMetrics.cls && newMetrics.cls > 0.1) {
        newAlerts.push('CLS exceeds 0.1 threshold');
      }
      if (newMetrics.memoryUsage && newMetrics.memoryUsage > 85) {
        newAlerts.push('Memory usage exceeds 85%');
      }

      setAlerts(newAlerts);
      return newMetrics;
    });
  };

  const getMetricColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricIcon = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value <= thresholds.poor) return <Activity className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading performance metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {alerts.map((alert, index) => (
                <li key={index} className="text-red-700 text-sm">• {alert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Web Vitals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getMetricColor(metrics.lcp || 0, { good: 2500, poor: 4000 })}`}>
                  {metrics.lcp ? `${(metrics.lcp / 1000).toFixed(1)}s` : 'N/A'}
                </div>
                <p className="text-xs text-gray-600">Target: &lt; 2.5s</p>
              </div>
              {getMetricIcon(metrics.lcp || 0, { good: 2500, poor: 4000 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">First Input Delay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getMetricColor(metrics.fid || 0, { good: 100, poor: 300 })}`}>
                  {metrics.fid ? `${metrics.fid.toFixed(0)}ms` : 'N/A'}
                </div>
                <p className="text-xs text-gray-600">Target: &lt; 100ms</p>
              </div>
              {getMetricIcon(metrics.fid || 0, { good: 100, poor: 300 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cumulative Layout Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getMetricColor(metrics.cls || 0, { good: 0.1, poor: 0.25 })}`}>
                  {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                </div>
                <p className="text-xs text-gray-600">Target: &lt; 0.1</p>
              </div>
              {getMetricIcon(metrics.cls || 0, { good: 0.1, poor: 0.25 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getMetricColor(metrics.memoryUsage || 0, { good: 70, poor: 85 })}`}>
                  {metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-xs text-gray-600">Target: &lt; 85%</p>
              </div>
              {getMetricIcon(metrics.memoryUsage || 0, { good: 70, poor: 85 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">First Contentful Paint</p>
              <p className="text-lg font-semibold">
                {metrics.fcp ? `${(metrics.fcp / 1000).toFixed(1)}s` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Time to Interactive</p>
              <p className="text-lg font-semibold">
                {metrics.tti ? `${(metrics.tti / 1000).toFixed(1)}s` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-lg font-semibold">
                {metrics.responseTime ? `${metrics.responseTime}ms` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-lg font-semibold">
                {metrics.errorRate ? `${metrics.errorRate.toFixed(2)}%` : '0.00%'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
