'use client';

import React, { useState, useCallback, useState, useEffect, useMemo } from 'react';
import { BarChart3, Calendar, LayoutDashboard, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardContent, CardHeader, CardTitle, Skeleton } from '@ghxstship/ui';
import { dashboardQueries } from '../lib/queries';
import type { OverviewMetric, DashboardQuickInsight, DashboardWidget } from '../types';

interface DashboardOverviewTabProps {
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

export default function DashboardOverviewTab({
  dashboard,
  widgetData,
  user,
  orgId,
  userRole,
  isViewMode = false,
  preferences,
  tabData,
  onTabDataChange
}: DashboardOverviewTabProps) {
  const [metrics, setMetrics] = useState<OverviewMetric[]>([]);
  const [insights, setInsights] = useState<DashboardQuickInsight[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load overview data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadOverviewData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const loadOverviewData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    setIsLoading(true);

    try {
      // Load metrics
      const metricsData = [
        {
          id: 'total_dashboards',
          label: 'Total Dashboards',
          value: 15,
          format: 'number' as const,
          icon: LayoutDashboard,
          color: 'blue'
        },
        {
          id: 'active_widgets',
          label: 'Active Widgets',
          value: 127,
          format: 'number' as const,
          icon: BarChart3,
          color: 'green'
        },
        {
          id: 'total_users',
          label: 'Team Members',
          value: 8,
          format: 'number' as const,
          icon: Users,
          color: 'purple'
        },
        {
          id: 'last_updated',
          label: 'Last Updated',
          value: '2 hours ago',
          format: 'text' as const,
          icon: RefreshCw,
          color: 'orange'
        }
      ];

      // Load insights
      const insightsData = [
        {
          id: 'performance',
          title: 'Performance Up 15%',
          description: 'Dashboard load times improved significantly',
          value: '+15%',
          format: 'percentage' as const,
          trend: 'up' as const
        },
        {
          id: 'usage',
          title: 'High Usage Today',
          description: '234 dashboard views in the last 24 hours',
          value: '234',
          format: 'number' as const,
          trend: 'up' as const
        },
        {
          id: 'widgets',
          title: 'New Widgets Added',
          description: '3 new widgets deployed this week',
          value: '3',
          format: 'number' as const
        }
      ];

      // Load recent widgets
      const widgetsData = [
        {
          id: '1',
          type: 'metric',
          title: 'Revenue Metric',
          config: {},
          position: { x: 0, y: 0, w: 4, h: 2 },
          is_visible: true,
          organization_id: orgId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'chart',
          title: 'Sales Chart',
          config: {},
          position: { x: 4, y: 0, w: 8, h: 4 },
          is_visible: true,
          organization_id: orgId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setMetrics(metricsData);
      setInsights(insightsData);
      setWidgets(widgetsData);

    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadOverviewData(true);
  };

  // Render metrics grid
  const renderMetrics = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-lg">
                <Skeleton className="h-icon-xs w-component-lg mb-2" />
                <Skeleton className="h-icon-lg w-component-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold">
                      {metric.value}
                    </p>
                  </div>
                  {Icon && (
                    <div className={`p-xs rounded-lg bg-${metric.color}-100 text-${metric.color}-600`}>
                      <Icon className="h-icon-md w-icon-md" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render insights
  const renderInsights = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-md">
                <Skeleton className="h-icon-xs w-component-xl mb-2" />
                <Skeleton className="h-3 w-container-xs" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-8">
        {insights.map((insight) => (
          <Card key={insight.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-md">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">{insight.title}</h4>
                {insight.trend && (
                  <Badge variant={insight.trend === 'up' ? 'default' : 'secondary'}>
                    {insight.trend === 'up' ? '↗' : '↘'} {insight.value}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render recent widgets
  const renderRecentWidgets = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-md">
                <Skeleton className="h-icon-xs w-component-lg mb-2" />
                <Skeleton className="h-component-xl w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {widgets.slice(0, 6).map((widget) => (
          <Card key={widget.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-xs">
                <BarChart3 className="h-icon-xs w-icon-xs" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-component-lg bg-muted/50 rounded flex items-center justify-center">
                <span className="text-sm text-muted-foreground capitalize">
                  {widget.type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Updated {new Date(widget.updated_at).toLocaleDateString()}</span>
                <Badge variant="secondary" className="text-xs">
                  v1.0
                </Badge>
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
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Monitor your dashboard performance and recent activity
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="secondary"
        >
          <RefreshCw className={`h-icon-xs w-icon-xs mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        {renderMetrics()}
      </section>

      {/* Insights */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Recent Insights</h3>
        {renderInsights()}
      </section>

      {/* Recent Widgets */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Recent Widgets</h3>
        {renderRecentWidgets()}
      </section>
    </div>
  );
}
