'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { TrendingUp, TrendingDown, BarChart3, LineChart, Activity, Clock, Database, Zap } from 'lucide-react';

// Types for metrics data
export interface MetricDataPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface MetricSeries {
  id: string;
  name: string;
  description: string;
  unit: string;
  color: string;
  data: MetricDataPoint[];
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface PerformanceMetricsChartProps {
  className?: string;
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
  refreshInterval?: number;
  metrics?: string[];
  onMetricAlert?: (metric: string, value: number, threshold: number) => void;
}

const AVAILABLE_METRICS = [
  {
    id: 'response_time',
    name: 'Response Time',
    description: 'Average API response time',
    unit: 'ms',
    color: '#3B82F6',
    threshold: { warning: 500, critical: 1000 }
  },
  {
    id: 'throughput',
    name: 'Throughput',
    description: 'Requests per second',
    unit: 'req/s',
    color: '#10B981',
    threshold: { warning: 100, critical: 50 }
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    description: 'Percentage of failed requests',
    unit: '%',
    color: '#EF4444',
    threshold: { warning: 1, critical: 5 }
  },
  {
    id: 'database_connections',
    name: 'DB Connections',
    description: 'Active database connections',
    unit: 'count',
    color: '#8B5CF6',
    threshold: { warning: 80, critical: 95 }
  },
  {
    id: 'cpu_usage',
    name: 'CPU Usage',
    description: 'Server CPU utilization',
    unit: '%',
    color: '#F59E0B',
    threshold: { warning: 70, critical: 90 }
  },
  {
    id: 'memory_usage',
    name: 'Memory Usage',
    description: 'Server memory utilization',
    unit: '%',
    color: '#06B6D4',
    threshold: { warning: 80, critical: 95 }
  }
];

export const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({
  className = '',
  timeRange = '24h',
  refreshInterval = 30000,
  metrics = ['response_time', 'throughput', 'error_rate'],
  onMetricAlert
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(metrics);
  const [metricsData, setMetricsData] = useState<MetricSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Generate mock data for demonstration
  const generateMockData = (metricId: string, points: number = 50): MetricDataPoint[] => {
    const now = new Date();
    const interval = timeRange === '1h' ? 60000 : 
                    timeRange === '6h' ? 360000 : 
                    timeRange === '24h' ? 1800000 : 
                    timeRange === '7d' ? 7200000 : 86400000;

    return Array.from({ length: points }, (_, i) => {
      const timestamp = new Date(now.getTime() - (points - i - 1) * interval);
      let value: number;

      switch (metricId) {
        case 'response_time':
          value = 200 + Math.random() * 300 + Math.sin(i / 10) * 100;
          break;
        case 'throughput':
          value = 80 + Math.random() * 40 + Math.cos(i / 8) * 20;
          break;
        case 'error_rate':
          value = Math.random() * 2 + Math.sin(i / 15) * 0.5;
          break;
        case 'database_connections':
          value = 30 + Math.random() * 20 + Math.sin(i / 12) * 10;
          break;
        case 'cpu_usage':
          value = 40 + Math.random() * 30 + Math.cos(i / 6) * 15;
          break;
        case 'memory_usage':
          value = 50 + Math.random() * 25 + Math.sin(i / 9) * 12;
          break;
        default:
          value = Math.random() * 100;
      }

      return {
        timestamp: timestamp.toISOString(),
        value: Math.max(0, value)
      };
    });
  };

  // Load metrics data
  useEffect(() => {
    const loadMetricsData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = selectedMetrics.map(metricId => {
        const metricConfig = AVAILABLE_METRICS.find(m => m.id === metricId);
        if (!metricConfig) return null;

        return {
          id: metricId,
          name: metricConfig.name,
          description: metricConfig.description,
          unit: metricConfig.unit,
          color: metricConfig.color,
          data: generateMockData(metricId),
          threshold: metricConfig.threshold
        };
      }).filter(Boolean) as MetricSeries[];

      setMetricsData(data);
      setLastUpdated(new Date());
      setLoading(false);

      // Check for alerts
      data.forEach(metric => {
        if (metric.threshold && metric.data.length > 0) {
          const latestValue = metric.data[metric.data.length - 1].value;
          if (latestValue > metric.threshold.critical) {
            onMetricAlert?.(metric.name, latestValue, metric.threshold.critical);
          }
        }
      });
    };

    loadMetricsData();
  }, [selectedMetrics, timeRange, onMetricAlert]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        // Update with new data point
        setMetricsData(prev => prev.map(metric => ({
          ...metric,
          data: [
            ...metric.data.slice(1),
            ...generateMockData(metric.id, 1)
          ]
        })));
        setLastUpdated(new Date());
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [loading, refreshInterval]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return metricsData.map(metric => {
      const values = metric.data.map(d => d.value);
      const latest = values[values.length - 1] || 0;
      const previous = values[values.length - 2] || 0;
      const change = previous !== 0 ? ((latest - previous) / previous) * 100 : 0;
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length || 0;
      const max = Math.max(...values) || 0;
      const min = Math.min(...values) || 0;

      let status: 'good' | 'warning' | 'critical' = 'good';
      if (metric.threshold) {
        if (latest > metric.threshold.critical) status = 'critical';
        else if (latest > metric.threshold.warning) status = 'warning';
      }

      return {
        ...metric,
        latest,
        change,
        avg,
        max,
        min,
        status
      };
    });
  }, [metricsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'ms') return `${Math.round(value)}ms`;
    if (unit === 'req/s') return `${Math.round(value)} req/s`;
    if (unit === 'count') return Math.round(value).toString();
    return value.toFixed(2);
  };

  // Simple SVG chart component
  const SimpleChart: React.FC<{ metric: MetricSeries; width: number; height: number }> = ({ 
    metric, 
    width, 
    height 
  }) => {
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const values = metric.data.map(d => d.value);
    const maxValue = Math.max(...values) * 1.1;
    const minValue = Math.min(...values) * 0.9;
    const valueRange = maxValue - minValue || 1;

    const points = metric.data.map((point, index) => {
      const x = padding + (index / (metric.data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = chartType === 'area' ? 
      `${padding},${height - padding} ${points} ${padding + chartWidth},${height - padding}` : 
      points;

    return (
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id={`grid-${metric.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={chartWidth} height={chartHeight} x={padding} y={padding} fill={`url(#grid-${metric.id})`} />

        {/* Threshold lines */}
        {metric.threshold && (
          <>
            {/* Warning threshold */}
            <line
              x1={padding}
              y1={padding + chartHeight - ((metric.threshold.warning - minValue) / valueRange) * chartHeight}
              x2={padding + chartWidth}
              y2={padding + chartHeight - ((metric.threshold.warning - minValue) / valueRange) * chartHeight}
              stroke="#F59E0B"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.7"
            />
            {/* Critical threshold */}
            <line
              x1={padding}
              y1={padding + chartHeight - ((metric.threshold.critical - minValue) / valueRange) * chartHeight}
              x2={padding + chartWidth}
              y2={padding + chartHeight - ((metric.threshold.critical - minValue) / valueRange) * chartHeight}
              stroke="#EF4444"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.7"
            />
          </>
        )}

        {/* Chart area/line */}
        {chartType === 'area' ? (
          <polygon
            points={areaPoints}
            fill={metric.color}
            fillOpacity="0.2"
            stroke={metric.color}
            strokeWidth="2"
          />
        ) : (
          <polyline
            points={points}
            fill="none"
            stroke={metric.color}
            strokeWidth="2"
          />
        )}

        {/* Data points */}
        {metric.data.map((point, index) => {
          const x = padding + (index / (metric.data.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={metric.color}
              className="hover:r-4 transition-all cursor-pointer"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            {lastUpdated && `Updated: ${lastUpdated.toLocaleTimeString()}`}
          </div>
          <Button
            onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            variant="outline"
            size="sm"
          >
            {chartType === 'line' ? <LineChart className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryStats.map((stat) => (
          <Card key={stat.id} className="p-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{stat.name}</h3>
              <Badge variant={getStatusColor(stat.status)}>
                {stat.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl font-bold" style={{ color: stat.color }}>
                {formatValue(stat.latest, stat.unit)}
              </span>
              <div className="flex items-center text-sm">
                {stat.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span className={stat.change > 0 ? 'text-red-500' : 'text-green-500'}>
                  {Math.abs(stat.change).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Avg: {formatValue(stat.avg, stat.unit)}</div>
              <div>Range: {formatValue(stat.min, stat.unit)} - {formatValue(stat.max, stat.unit)}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metricsData.map((metric) => (
          <Card key={metric.id} className="p-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
                <span className="text-sm text-gray-500">{metric.unit}</span>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <SimpleChart metric={metric} width={400} height={200} />
            )}
            
            {metric.threshold && (
              <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Warning: {formatValue(metric.threshold.warning, metric.unit)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Critical: {formatValue(metric.threshold.critical, metric.unit)}</span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Metric Selection */}
      <Card className="p-lg">
        <h3 className="text-lg font-semibold mb-4">Select Metrics to Display</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AVAILABLE_METRICS.map((metric) => (
            <label key={metric.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMetrics([...selectedMetrics, metric.id]);
                  } else {
                    setSelectedMetrics(selectedMetrics.filter(id => id !== metric.id));
                  }
                }}
                className="rounded border-gray-300"
              />
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
                <span className="text-sm font-medium">{metric.name}</span>
              </div>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};
