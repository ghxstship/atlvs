"use client";

import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart, LineChart, TrendingUp, Download, RefreshCw, Calendar, Filter, Pie, BarChart } from 'lucide-react';
import { Card, Button, Select, Badge, Tooltip } from '@ghxstship/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import type { DigitalAsset } from '../types';

interface ChartViewProps {
  files: DigitalAsset[];
  onExportChart: (chartType: string, format: 'png' | 'svg' | 'pdf') => void;
  formatFileSize: (bytes: number) => string;
}

export default function ChartView({
  files,
  onExportChart,
  formatFileSize
}: ChartViewProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'area'>('bar');
  const [metric, setMetric] = useState<'count' | 'size' | 'access' | 'status'>('count');
  const [groupBy, setGroupBy] = useState<'category' | 'access_level' | 'status' | 'date'>('category');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Prepare chart data based on selected options
  const chartData = useMemo(() => {
    const data: Record<string, any> = {};

    files.forEach(file => {
      let key: string;

      switch (groupBy) {
        case 'category':
          key = file.category;
          break;
        case 'access_level':
          key = file.access_level;
          break;
        case 'status':
          key = file.status;
          break;
        case 'date':
          const date = new Date(file.created_at);
          switch (dateRange) {
            case 'week':
              key = `${date.getFullYear()}-W${Math.ceil((date.getDate() - date.getDay() + 1) / 7)}`;
              break;
            case 'month':
              key = date.toISOString().slice(0, 7); // YYYY-MM
              break;
            case 'quarter':
              const quarter = Math.floor(date.getMonth() / 3) + 1;
              key = `${date.getFullYear()}-Q${quarter}`;
              break;
            case 'year':
              key = date.getFullYear().toString();
              break;
            default:
              key = date.toISOString().slice(0, 7);
          }
          break;
        default:
          key = 'other';
      }

      if (!data[key]) {
        data[key] = {
          name: key,
          count: 0,
          totalSize: 0,
          accessCount: 0,
          active: 0,
          archived: 0,
          processing: 0,
          error: 0
        };
      }

      data[key].count += 1;
      data[key].totalSize += file.file_size || 0;

      if (groupBy === 'status') {
        data[key][file.status] = (data[key][file.status] || 0) + 1;
      }
    });

    return Object.values(data);
  }, [files, groupBy, dateRange]);

  // Chart colors using design tokens
  const colors = [
    'hsl(var(--color-primary))',
    'hsl(var(--color-destructive))',
    'hsl(var(--color-success))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-purple))',
    'hsl(var(--color-info))',
    'hsl(var(--color-accent))',
    'hsl(var(--color-success))',
  ];

  // Render appropriate chart
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: unknown, name: string) => {
                  if (metric === 'size') {
                    return [formatFileSize(value), 'Total Size'];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                dataKey={metric === 'size' ? 'totalSize' : 'count'}
                fill={colors[0]}
                name={metric === 'size' ? 'Total Size' : 'Count'}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="hsl(var(--color-primary))"
                dataKey={metric === 'size' ? 'totalSize' : 'count'}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => {
                  if (metric === 'size') {
                    return [formatFileSize(value), 'Total Size'];
                  }
                  return [value, 'Count'];
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: unknown) => {
                  if (metric === 'size') {
                    return [formatFileSize(value), 'Total Size'];
                  }
                  return [value, 'Count'];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={metric === 'size' ? 'totalSize' : 'count'}
                stroke={colors[0]}
                strokeWidth={2}
                name={metric === 'size' ? 'Total Size' : 'Count'}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: unknown) => {
                  if (metric === 'size') {
                    return [formatFileSize(value), 'Total Size'];
                  }
                  return [value, 'Count'];
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey={metric === 'size' ? 'totalSize' : 'count'}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
                name={metric === 'size' ? 'Total Size' : 'Count'}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
    const categories = [...new Set(files.map(f => f.category))].length;
    const activeFiles = files.filter(f => f.status === 'active').length;

    return { totalFiles, totalSize, categories, activeFiles };
  }, [files]);

  return (
    <div className="space-y-lg">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <Card className="p-md">
          <div className="flex items-center gap-sm">
            <BarChart3 className="w-icon-lg h-icon-lg text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold">{summaryStats.totalFiles}</p>
            </div>
          </div>
        </Card>

        <Card className="p-md">
          <div className="flex items-center gap-sm">
            <TrendingUp className="w-icon-lg h-icon-lg text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-2xl font-bold">{formatFileSize(summaryStats.totalSize)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-md">
          <div className="flex items-center gap-sm">
            <PieChart className="w-icon-lg h-icon-lg text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold">{summaryStats.categories}</p>
            </div>
          </div>
        </Card>

        <Card className="p-md">
          <div className="flex items-center gap-sm">
            <LineChart className="w-icon-lg h-icon-lg text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Active Files</p>
              <p className="text-2xl font-bold">{summaryStats.activeFiles}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Controls */}
      <Card className="p-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Analytics Chart</h3>
          <div className="flex items-center gap-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportChart(chartType, 'png')}
            >
              <Download className="w-icon-xs h-icon-xs mr-2" />
              Export PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportChart(chartType, 'svg')}
            >
              <Download className="w-icon-xs h-icon-xs mr-2" />
              Export SVG
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Chart Type</label>
            <Select value={chartType} onChange={(value: unknown) => setChartType(value)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="bar">Bar Chart</Select.Item>
                <Select.Item value="pie">Pie Chart</Select.Item>
                <Select.Item value="line">Line Chart</Select.Item>
                <Select.Item value="area">Area Chart</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Metric</label>
            <Select value={metric} onChange={(value: unknown) => setMetric(value)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="count">File Count</Select.Item>
                <Select.Item value="size">Total Size</Select.Item>
                <Select.Item value="access">Access Count</Select.Item>
                <Select.Item value="status">Status Distribution</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Group By</label>
            <Select value={groupBy} onChange={(value: unknown) => setGroupBy(value)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="category">Category</Select.Item>
                <Select.Item value="access_level">Access Level</Select.Item>
                <Select.Item value="status">Status</Select.Item>
                <Select.Item value="date">Date</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {groupBy === 'date' && (
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <Select value={dateRange} onChange={(value: unknown) => setDateRange(value)}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="week">Weekly</Select.Item>
                  <Select.Item value="month">Monthly</Select.Item>
                  <Select.Item value="quarter">Quarterly</Select.Item>
                  <Select.Item value="year">Yearly</Select.Item>
                </Select.Content>
              </Select>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="border border-gray-200 rounded-lg p-md">
          {chartData.length === 0 ? (
            <div className="text-center py-xsxl">
              <BarChart3 className="w-icon-2xl h-icon-2xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data to display</h3>
              <p className="text-gray-500">Upload some files to see analytics.</p>
            </div>
          ) : (
            renderChart()
          )}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-md">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-xs">
            <h4 className="font-medium text-gray-900">File Distribution</h4>
            <div className="text-sm text-gray-600">
              {chartData.length > 0 && (
                <>
                  <p>Largest category: <strong>
                    {chartData.reduce((max, curr) =>
                      (curr.count || 0) > (max.count || 0) ? curr : max
                    ).name}
                  </strong></p>
                  <p>Most common access level: <strong>
                    {files.length > 0 &&
                      files.reduce((acc: Record<string, number>, file) => {
                        acc[file.access_level] = (acc[file.access_level] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>) &&
                      Object.entries(
                        files.reduce((acc: Record<string, number>, file) => {
                          acc[file.access_level] = (acc[file.access_level] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).sort(([,a], [,b]) => b - a)[0][0]
                    }
                  </strong></p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-xs">
            <h4 className="font-medium text-gray-900">Storage Usage</h4>
            <div className="text-sm text-gray-600">
              <p>Average file size: <strong>
                {files.length > 0 ? formatFileSize(Math.round(
                  files.reduce((sum, file) => sum + (file.file_size || 0), 0) / files.length
                )) : 'N/A'}
              </strong></p>
              <p>Active files: <strong>{summaryStats.activeFiles}</strong></p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
