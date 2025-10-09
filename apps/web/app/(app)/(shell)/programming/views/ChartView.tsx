'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip
} from "@ghxstship/ui";
import { Badge } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { BarChart, Download, Minus, Pie, PieChart, TrendingDown, TrendingUp } from "lucide-react";
import type { ProgrammingEntity } from '../types';

interface ChartViewProps<T extends ProgrammingEntity> {
  data: T[];
  loading?: boolean;
  chartType?: 'bar' | 'line' | 'area' | 'pie';
  groupBy?: 'status' | 'type' | 'month' | 'venue' | 'instructor';
  metric?: 'count' | 'capacity' | 'duration';
  title?: string;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  emptyMessage?: string;
  className?: string;
}

// Use design tokens for chart colors
const COLORS = [
  'hsl(var(--color-primary))',
  'hsl(var(--color-success))',
  'hsl(var(--color-warning))',
  'hsl(var(--color-accent))',
  'hsl(var(--color-purple))',
  'hsl(var(--color-teal))'
];

export function ChartView<T extends ProgrammingEntity>({
  data,
  loading = false,
  chartType = 'bar',
  groupBy = 'status',
  metric = 'count',
  title = 'Programming Analytics',
  onExport,
  emptyMessage = 'No data available for charting',
  className
}: ChartViewProps<T>) {
  // Process data for charts
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    const grouped: Record<string, { count: number; totalCapacity: number; totalDuration: number; items: T[] }> = {};

    data.forEach(item => {
      let groupKey = 'Unknown';

      // Determine group key based on groupBy parameter
      switch (groupBy) {
        case 'status':
          groupKey = ('status' in item ? item.status : 'unknown') as string;
          break;
        case 'type':
          groupKey = ('type' in item ? item.type : 'unknown') as string;
          break;
        case 'month':
          let date: Date | null = null;
          if ('start_date' in item) {
            date = new Date((item as any).start_date);
          } else if ('date' in item) {
            date = new Date((item as any).date);
          }
          groupKey = date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Unknown';
          break;
        case 'venue':
          groupKey = ('venue' in item ? (item as any).venue : 'No Venue') as string;
          break;
        case 'instructor':
          groupKey = ('instructor' in item ? (item as any).instructor : 'No Instructor') as string;
          break;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = { count: 0, totalCapacity: 0, totalDuration: 0, items: [] };
      }

      grouped[groupKey].count++;
      grouped[groupKey].items.push(item);

      // Aggregate additional metrics
      if ('capacity' in item && typeof (item as any).capacity === 'number') {
        grouped[groupKey].totalCapacity += (item as any).capacity;
      }

      if ('duration' in item && typeof (item as any).duration === 'number') {
        grouped[groupKey].totalDuration += (item as any).duration;
      }
    });

    // Convert to chart format
    return Object.entries(grouped).map(([key, value]) => ({
      name: key,
      count: value.count,
      capacity: value.totalCapacity,
      duration: value.totalDuration,
      avgCapacity: value.count > 0 ? Math.round(value.totalCapacity / value.count) : 0,
      avgDuration: value.count > 0 ? Math.round(value.totalDuration / value.count) : 0
    }));
  }, [data, groupBy]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = data.length;
    const totalCapacity = data.reduce((sum, item) => {
      return sum + (('capacity' in item && typeof (item as any).capacity === 'number') ? (item as any).capacity : 0);
    }, 0);

    const totalDuration = data.reduce((sum, item) => {
      return sum + (('duration' in item && typeof (item as any).duration === 'number') ? (item as any).duration : 0);
    }, 0);

    return {
      totalItems,
      totalCapacity,
      totalDuration,
      avgCapacity: totalItems > 0 ? Math.round(totalCapacity / totalItems) : 0,
      avgDuration: totalItems > 0 ? Math.round(totalDuration / totalItems) : 0
    };
  }, [data]);

  const getMetricValue = (item: unknown) => {
    switch (metric) {
      case 'capacity':
        return item.capacity || 0;
      case 'duration':
        return item.duration || 0;
      case 'count':
      default:
        return item.count || 0;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'capacity':
        return 'Total Capacity';
      case 'duration':
        return 'Total Duration (min)';
      case 'count':
      default:
        return 'Count';
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${value} ${name === 'count' ? 'items' : name === 'capacity' ? 'capacity' : 'minutes'}`,
                  getMetricLabel()
                ]}
              />
              <Bar dataKey={metric} fill="hsl(var(--color-primary))" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${value} ${name === 'count' ? 'items' : name === 'capacity' ? 'capacity' : 'minutes'}`,
                  getMetricLabel()
                ]}
              />
              <Line type="monotone" dataKey={metric} stroke="hsl(var(--color-primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${value} ${name === 'count' ? 'items' : name === 'capacity' ? 'capacity' : 'minutes'}`,
                  getMetricLabel()
                ]}
              />
              <Area type="monotone" dataKey={metric} stroke="hsl(var(--color-primary))" fill="hsl(var(--color-primary))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="hsl(var(--color-primary))"
                dataKey={metric}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${value} ${name === 'count' ? 'items' : name === 'capacity' ? 'capacity' : 'minutes'}`,
                  getMetricLabel()
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-lg ${className}`}>
        <Card>
          <CardHeader>
            <div className="h-icon-md bg-gray-200 animate-pulse rounded w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="h-container-md bg-gray-100 animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-xsxl ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-lg ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <Card>
          <CardContent className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalItems}</p>
              </div>
              <div className="h-icon-lg w-icon-lg bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{summaryStats.totalItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {summaryStats.totalCapacity > 0 && (
          <Card>
            <CardContent className="p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalCapacity}</p>
                </div>
                <div className="h-icon-lg w-icon-lg bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {summaryStats.totalDuration > 0 && (
          <Card>
            <CardContent className="p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalDuration}m</p>
                </div>
                <div className="h-icon-lg w-icon-lg bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">⏱️</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{chartData.length}</p>
              </div>
              <div className="h-icon-lg w-icon-lg bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-xs">
              {title}
              <Badge variant="outline">{chartType.toUpperCase()}</Badge>
              <Badge variant="secondary">{groupBy}</Badge>
            </CardTitle>

            {onExport && (
              <div className="flex gap-xs">
                <Button variant="outline" size="sm" onClick={() => onExport('png')}>
                  <Download className="h-icon-xs w-icon-xs mr-2" />
                  PNG
                </Button>
                <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
                  <Download className="h-icon-xs w-icon-xs mr-2" />
                  CSV
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-xs">Category</th>
                  <th className="text-left p-xs">Count</th>
                  {metric === 'capacity' && <th className="text-left p-xs">Total Capacity</th>}
                  {metric === 'duration' && <th className="text-left p-xs">Total Duration</th>}
                  <th className="text-left p-xs">Average</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-xs font-medium">{item.name}</td>
                    <td className="p-xs">{item.count}</td>
                    {metric === 'capacity' && <td className="p-xs">{item.capacity}</td>}
                    {metric === 'duration' && <td className="p-xs">{item.duration}m</td>}
                    <td className="p-xs">
                      {metric === 'capacity' ? item.avgCapacity :
                       metric === 'duration' ? `${item.avgDuration}m` :
                       item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChartView;
