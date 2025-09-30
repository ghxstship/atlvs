'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../unified/Card';
import { Button } from '../../unified/Button';
import { Badge } from '../../unified/Badge';
import { Skeleton } from '../../unified/Skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Download,
  Settings,
  ChevronRight,
  Activity
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import type { OverviewConfig, OverviewWidget } from '../../config/types';
import type { UnifiedService } from '../../unified/services/UnifiedService';

interface OverviewTemplateProps {
  config: OverviewConfig;
  services: Record<string, UnifiedService<any>>;
  orgId: string;
  onCreate?: (entity: string) => void;
  onRefresh?: () => void;
}

export const OverviewTemplate: React.FC<OverviewTemplateProps> = ({
  config,
  services,
  orgId,
  onCreate,
  onRefresh
}) => {
  const [loading, setLoading] = useState(true);
  const [widgetData, setWidgetData] = useState<Record<string, any>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWidgetData();
    
    // Set up auto-refresh if configured
    if (config.refresh && config.refreshInterval) {
      const interval = setInterval(loadWidgetData, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [config]);

  const loadWidgetData = async () => {
    setLoading(true);
    const data: Record<string, any> = {};
    
    // Load data for each widget
    for (const widget of config.widgets) {
      try {
        const widgetData = await loadWidget(widget);
        data[widget.id] = widgetData;
      } catch (error) {
        console.error(`Failed to load widget ${widget.id}:`, error);
        data[widget.id] = null;
      }
    }
    
    setWidgetData(data);
    setLoading(false);
  };

  const loadWidget = async (widget: OverviewWidget): Promise<any> => {
    switch (widget.type) {
      case 'metric':
        if (widget.value) {
          return typeof widget.value === 'function' 
            ? await widget.value()
            : widget.value;
        }
        // Calculate metric from service
        return calculateMetric(widget.metric!);
      
      case 'chart':
        if (widget.chartData) {
          return typeof widget.chartData === 'function'
            ? await widget.chartData()
            : widget.chartData;
        }
        // Load chart data from service
        return loadChartData(widget.chart!);
      
      case 'list':
        if (widget.entity && services[widget.entity]) {
          const result = await services[widget.entity].list({
            limit: widget.limit || 5,
            filters: widget.filters
          });
          return result.data;
        }
        return [];
      
      case 'activity':
        if (widget.activities) {
          return typeof widget.activities === 'function'
            ? await widget.activities()
            : widget.activities;
        }
        return [];
      
      default:
        return null;
    }
  };

  const calculateMetric = async (metric: string): Promise<any> => {
    // Example metric calculations - customize based on your needs
    switch (metric) {
      case 'total_budget':
        const budgets = await services.budgets?.list({ limit: 100 });
        return budgets?.data.reduce((sum, b) => sum + b.amount, 0) || 0;
      
      case 'total_spent':
        const expenses = await services.expenses?.list({ 
          limit: 100,
          filters: { status: 'paid' }
        });
        return expenses?.data.reduce((sum, e) => sum + e.amount, 0) || 0;
      
      case 'remaining_budget':
        const totalBudget = await calculateMetric('total_budget');
        const totalSpent = await calculateMetric('total_spent');
        return totalBudget - totalSpent;
      
      case 'total_revenue':
        const revenue = await services.revenue?.list({
          limit: 100,
          filters: { status: 'received' }
        });
        return revenue?.data.reduce((sum, r) => sum + r.amount, 0) || 0;
      
      default:
        return 0;
    }
  };

  const loadChartData = async (chart: string): Promise<any[]> => {
    // Example chart data loading - customize based on your needs
    switch (chart) {
      case 'spending_trend':
        // Load last 12 months of spending data
        return [
          { month: 'Jan', amount: 45000 },
          { month: 'Feb', amount: 52000 },
          { month: 'Mar', amount: 48000 },
          { month: 'Apr', amount: 61000 },
          { month: 'May', amount: 55000 },
          { month: 'Jun', amount: 67000 },
        ];
      
      case 'budget_utilization':
        // Load budget utilization by category
        return [
          { category: 'Operations', value: 75 },
          { category: 'Marketing', value: 60 },
          { category: 'Development', value: 85 },
          { category: 'Production', value: 40 },
        ];
      
      default:
        return [];
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWidgetData();
    onRefresh?.();
    setRefreshing(false);
  };

  const renderMetricWidget = (widget: OverviewWidget) => {
    const value = widgetData[widget.id];
    const isLoading = loading || value === undefined;
    
    return (
      <Card key={widget.id} className={`col-span-${widget.span || 3}`}>
        <CardHeader className="pb-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {widget.title}
            </CardTitle>
            {widget.icon && (
              <widget.icon className={`h-4 w-4 text-${widget.color || 'muted-foreground'}`} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-xs">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {typeof value === 'number' 
                  ? widget.metric?.includes('budget') || widget.metric?.includes('revenue') || widget.metric?.includes('spent')
                    ? formatCurrency(value)
                    : formatNumber(value)
                  : value
                }
              </div>
              {widget.change !== undefined && (
                <div className="flex items-center gap-xs text-sm mt-xs">
                  {widget.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : widget.change < 0 ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={
                    widget.change > 0 ? 'text-success' : 
                    widget.change < 0 ? 'text-destructive' : 
                    'text-muted-foreground'
                  }>
                    {Math.abs(widget.change)}%
                  </span>
                  {widget.changeLabel && (
                    <span className="text-muted-foreground">
                      {widget.changeLabel}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderChartWidget = (widget: OverviewWidget) => {
    const data = widgetData[widget.id] || [];
    const isLoading = loading || !widgetData[widget.id];
    
    return (
      <Card key={widget.id} className={`col-span-${widget.span || 6}`}>
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
          {widget.description && (
            <p className="text-sm text-muted-foreground">{widget.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {/* Chart would be rendered here using a charting library */}
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-sm" />
                <p>Chart: {widget.chart}</p>
                <p className="text-xs mt-xs">{data.length} data points</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderListWidget = (widget: OverviewWidget) => {
    const items = widgetData[widget.id] || [];
    const isLoading = loading || !widgetData[widget.id];
    
    return (
      <Card key={widget.id} className={`col-span-${widget.span || 6}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{widget.title}</CardTitle>
            {widget.entity && onCreate && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onCreate(widget.entity!)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-sm">
              {Array.from({ length: widget.limit || 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-md">
              No items to display
            </p>
          ) : (
            <div className="space-y-sm">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.name || item.title || item.description}
                    </p>
                    {widget.columns && (
                      <div className="flex gap-sm text-xs text-muted-foreground mt-xs">
                        {widget.columns.slice(1, 3).map(col => (
                          <span key={col.key}>
                            {col.format ? col.format(item[col.key]) : item[col.key]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.status && (
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderActivityWidget = (widget: OverviewWidget) => {
    const activities = widgetData[widget.id] || [];
    const isLoading = loading || !widgetData[widget.id];
    
    return (
      <Card key={widget.id} className={`col-span-${widget.span || 6}`}>
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-sm">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24 mt-xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-md">
              No recent activity
            </p>
          ) : (
            <div className="space-y-sm">
              {activities.map((activity: any) => (
                <div key={activity.id} className="flex gap-sm">
                  {activity.icon ? (
                    <div className={`p-xs rounded-full bg-${activity.color || 'primary'}/10`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color || 'primary'}`} />
                    </div>
                  ) : activity.user?.avatar ? (
                    <img 
                      src={activity.user.avatar} 
                      alt={activity.user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Activity className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-xs">
                      {formatDate(activity.timestamp, true)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderWidget = (widget: OverviewWidget) => {
    switch (widget.type) {
      case 'metric':
        return renderMetricWidget(widget);
      case 'chart':
        return renderChartWidget(widget);
      case 'list':
        return renderListWidget(widget);
      case 'activity':
        return renderActivityWidget(widget);
      case 'custom':
        if (widget.component) {
          const CustomComponent = widget.component;
          return (
            <div key={widget.id} className={`col-span-${widget.span || 6}`}>
              <CustomComponent {...widget.props} />
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): any => {
    const lowercased = status?.toLowerCase();
    if (['active', 'completed', 'approved', 'paid', 'success'].includes(lowercased)) {
      return 'success';
    }
    if (['pending', 'in_progress', 'processing', 'sent'].includes(lowercased)) {
      return 'warning';
    }
    if (['inactive', 'cancelled', 'rejected', 'failed', 'overdue'].includes(lowercased)) {
      return 'destructive';
    }
    return 'default';
  };

  const getLayoutClass = () => {
    switch (config.layout) {
      case 'masonry':
        return 'columns-1 md:columns-2 lg:columns-3 xl:columns-4';
      case 'flex':
        return 'flex flex-wrap';
      default:
        return `grid grid-cols-${config.columns || 12}`;
    }
  };

  const getGapClass = () => {
    const gapMap = {
      xs: 'gap-xs',
      sm: 'gap-sm',
      md: 'gap-md',
      lg: 'gap-lg',
      xl: 'gap-xl'
    };
    return gapMap[config.gap || 'md'];
  };

  return (
    <div className="space-y-md">
      {/* Header Actions */}
      {config.refresh && (
        <div className="flex justify-end gap-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-xs" />
            Export
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Widgets Grid */}
      <div className={`${getLayoutClass()} ${getGapClass()}`}>
        {config.widgets.map(renderWidget)}
      </div>
    </div>
  );
};

export default OverviewTemplate;
