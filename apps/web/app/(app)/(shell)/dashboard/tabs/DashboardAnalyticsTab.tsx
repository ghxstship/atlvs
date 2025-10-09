'use client';


import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DatePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@ghxstship/ui";

import React, { useState, useCallback, useState, useEffect, useMemo } from 'react';
import { BarChart3, Calendar, Download, Filter, PieChart, RefreshCw, TrendingUp } from 'lucide-react';
import { ChartView } from '../views/ChartView';
import { analyticsQueries } from '../lib/queries';

interface DashboardAnalyticsTabProps {
  dashboard?: unknown;
  widgetData?: Record<string, any>;
  user: unknown;
  orgId: string;
  userRole: string;
  isViewMode?: boolean;
  preferences?: unknown;
  tabData?: unknown;
  onTabDataChange?: (data: unknown) => void;
}

export default function DashboardAnalyticsTab({
  dashboard,
  widgetData,
  user,
  orgId,
  userRole,
  isViewMode = false,
  preferences,
  tabData,
  onTabDataChange
}: DashboardAnalyticsTabProps) {
  const [analyticsData, setAnalyticsData] = useState<(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [selectedModule, setSelectedModule] = useState('all');

  // Load analytics data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadAnalyticsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, dateRange, selectedModule]);

  const loadAnalyticsData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    setIsLoading(true);

    try {
      const modules = selectedModule === 'all'
        ? ['projects', 'finance', 'people', 'jobs']
        : [selectedModule];

      const data = await analyticsQueries.getAnalyticsData(modules, {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      });

      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadAnalyticsData(true);
  };

  // Chart configurations
  const chartConfigs = useMemo(() => [
    {
      type: 'bar' as const,
      title: 'Module Usage',
      subtitle: 'Activity across different modules',
      xAxis: { field: 'module', label: 'Module' },
      yAxis: { field: 'usage', label: 'Usage Count' },
      colors: ['hsl(var(--color-primary))', 'hsl(var(--color-success))', 'hsl(var(--color-warning))', 'hsl(var(--color-destructive))']
    },
    {
      type: 'line' as const,
      title: 'Performance Trends',
      subtitle: 'Load times and response metrics over time',
      xAxis: { field: 'date', label: 'Date' },
      yAxis: { field: 'response_time', label: 'Response Time (ms)' },
      colors: ['hsl(var(--color-primary))']
    },
    {
      type: 'pie' as const,
      title: 'Data Distribution',
      subtitle: 'Breakdown of data types',
      xAxis: { field: 'type', label: 'Type' },
      yAxis: { field: 'count', label: 'Count' },
      colors: ['hsl(var(--color-primary))', 'hsl(var(--color-success))', 'hsl(var(--color-warning))', 'hsl(var(--color-destructive))', 'hsl(var(--color-purple))']
    }
  ], []);

  // Sample data for charts
  const sampleChartData = useMemo(() => [
    { module: 'Projects', usage: 245 },
    { module: 'Finance', usage: 189 },
    { module: 'People', usage: 156 },
    { module: 'Jobs', usage: 98 }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  // Render metrics cards
  const renderMetricsCards = () => {
    const metrics = [
      {
        title: 'Total Views',
        value: '12,456',
        change: '+12.5%',
        trend: 'up' as const,
        icon: BarChart3
      },
      {
        title: 'Avg Response Time',
        value: '245ms',
        change: '-8.2%',
        trend: 'up' as const,
        icon: TrendingUp
      },
      {
        title: 'Active Users',
        value: '1,234',
        change: '+5.1%',
        trend: 'up' as const,
        icon: PieChart
      },
      {
        title: 'Data Points',
        value: '89.2K',
        change: '+15.3%',
        trend: 'up' as const,
        icon: Calendar
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className={`text-xs flex items-center gap-xs ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {metric.change} from last month
                    </p>
                  </div>
                  <Icon className="h-icon-lg w-icon-lg text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render charts
  const renderCharts = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-icon-xs bg-muted animate-pulse rounded w-component-xl" />
                <div className="h-3 bg-muted animate-pulse rounded w-container-xs mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-container-sm bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {chartConfigs.map((config, index) => (
          <ChartView
            key={index}
            data={sampleChartData}
            config={config}
            height={300}
            onExport={(format) => {
            }}
          />
        ))}
      </div>
    );
  };

  // Render data tables
  const renderDataTables = () => {
    const tables = [
      {
        title: 'Top Performing Dashboards',
        headers: ['Name', 'Views', 'Avg Load Time', 'Last Updated'],
        data: [
          ['Sales Overview', '2,345', '1.2s', '2 hours ago'],
          ['Project Metrics', '1,892', '0.8s', '4 hours ago'],
          ['Team Performance', '1,567', '1.5s', '6 hours ago'],
          ['Financial Summary', '1,234', '0.9s', '1 day ago']
        ]
      },
      {
        title: 'Recent Activity',
        headers: ['Action', 'User', 'Resource', 'Timestamp'],
        data: [
          ['Created dashboard', 'John Doe', 'Q4 Planning', '5 min ago'],
          ['Updated widget', 'Jane Smith', 'Sales Chart', '12 min ago'],
          ['Shared dashboard', 'Mike Johnson', 'Team Overview', '1 hour ago'],
          ['Exported data', 'Sarah Wilson', 'Financial Report', '2 hours ago']
        ]
      }
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {tables.map((table, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{table.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {table.headers.map((header, i) => (
                        <th key={i} className="text-left p-xs font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.data.map((row, i) => (
                      <tr key={i} className="border-b">
                        {row.map((cell, j) => (
                          <td key={j} className="p-xs">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="p-lg space-y-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your dashboards
          </p>
        </div>

        <div className="flex items-center gap-xs">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-icon-xs w-icon-xs mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline">
            <Download className="h-icon-xs w-icon-xs mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-md">
          <div className="flex flex-wrap items-center gap-md">
            <div className="flex items-center gap-xs">
              <Filter className="h-icon-xs w-icon-xs" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="people">People</SelectItem>
                <SelectItem value="jobs">Jobs</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-xs">
              <DatePicker
                date={dateRange.start}
                onDateChange={(date) => date && setDateRange(prev => ({ ...prev, start: date }))}
                placeholder="Start date"
              />
              <span className="text-muted-foreground">to</span>
              <DatePicker
                date={dateRange.end}
                onDateChange={(date) => date && setDateRange(prev => ({ ...prev, end: date }))}
                placeholder="End date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="tables">Data Tables</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-lg">
          {renderMetricsCards()}
        </TabsContent>

        <TabsContent value="charts" className="space-y-lg">
          {renderCharts()}
        </TabsContent>

        <TabsContent value="tables" className="space-y-lg">
          {renderDataTables()}
        </TabsContent>

        <TabsContent value="reports" className="space-y-lg">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-xsxl">
                <BarChart3 className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Advanced Reporting</h3>
                <p className="text-muted-foreground mb-4">
                  Create custom reports with advanced filtering and scheduling
                </p>
                <Button>Create Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
