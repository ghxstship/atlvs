'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/atomic/Button';
import { Skeleton } from '../../components/atomic/Skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  PieChart,
  Activity,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  Download,
  Filter
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatDate } from '../../utils/formatters';
import type { UnifiedService } from '../services/UnifiedService';
import type { FieldConfig } from '../drawers/UnifiedDrawer';

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'activity' | 'table' | 'custom';
  title: string;
  description?: string;
  span: 1 | 2 | 3 | 4 | 6 | 12;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Metric widget
  value?: number | string;
  previousValue?: number;
  target?: number;
  format?: 'number' | 'currency' | 'percent';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  
  // Chart widget
  chartType?: 'line' | 'bar' | 'pie' | 'donut' | 'area';
  chartData?: any[];
  
  // List widget
  items?: any[];
  itemRenderer?: (item: any) => React.ReactNode;
  
  // Progress widget
  progress?: number;
  progressLabel?: string;
  
  // Activity widget
  activities?: Array<{
    id: string;
    title: string;
    description?: string;
    timestamp: Date;
    user?: { name: string; avatar?: string };
    type?: string;
  }>;
  
  // Custom widget
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface UnifiedDashboardViewProps {
  service?: UnifiedService<any>;
  fields?: FieldConfig[];
  widgets: DashboardWidget[];
  loading?: boolean;
  onWidgetClick?: (widget: DashboardWidget) => void;
  onRefresh?: () => void;
  refreshInterval?: number;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  subtitle?: string;
  actions?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }>;
}

export const UnifiedDashboardView: React.FC<UnifiedDashboardViewProps> = ({
  service,
  fields = [],
  widgets,
  loading: externalLoading,
  onWidgetClick,
  onRefresh,
  refreshInterval,
  columns = 12,
  gap = 'md',
  title,
  subtitle,
  actions = [],
}) => {
  const [loading, setLoading] = useState(externalLoading || false);
  const [refreshing, setRefreshing] = useState(false);
  const [widgetData, setWidgetData] = useState<Record<string, any>>({});

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onRefresh?.();
    setRefreshing(false);
  };

  const renderMetricWidget = (widget: DashboardWidget) => {
    const value = widget.value || 0;
    const previousValue = widget.previousValue || 0;
    const trend = widget.trend || (value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral');
    const trendValue = widget.trendValue || (previousValue ? ((Number(value) - previousValue) / previousValue) * 100 : 0);
    
    const formatValue = (val: number | string) => {
      if (typeof val === 'string') return val;
      
      switch (widget.format) {
        case 'currency':
          return formatCurrency(val);
        case 'percent':
          return formatPercent(val);
        case 'number':
        default:
          return formatNumber(val);
      }
    };
    
    const getTrendIcon = () => {
      switch (trend) {
        case 'up':
          return <TrendingUp className="h-icon-xs w-icon-xs text-success" />;
        case 'down':
          return <TrendingDown className="h-icon-xs w-icon-xs text-destructive" />;
        default:
          return <Minus className="h-icon-xs w-icon-xs text-muted-foreground" />;
      }
    };
    
    const getTrendColor = () => {
      switch (trend) {
        case 'up':
          return 'text-success';
        case 'down':
          return 'text-destructive';
        default:
          return 'text-muted-foreground';
      }
    };

    return (
      <Card 
        className={`cursor-pointer hover:shadow-lg transition-shadow ${getHeightClass(widget.height)}`}
        onClick={() => onWidgetClick?.(widget)}
      >
        <CardHeader className="pb-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {widget.title}
            </CardTitle>
            {widget.icon && (
              <widget.icon className={`h-icon-xs w-icon-xs ${getColorClass(widget.color)}`} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-xs">
            <div className="text-2xl font-bold">
              {formatValue(value)}
            </div>
            
            {widget.target && (
              <div className="text-sm text-muted-foreground">
                Target: {formatValue(widget.target)}
              </div>
            )}
            
            {trendValue !== 0 && (
              <div className="flex items-center gap-xs text-sm">
                {getTrendIcon()}
                <span className={getTrendColor()}>
                  {Math.abs(trendValue).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">
                  vs last period
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderChartWidget = (widget: DashboardWidget) => {
    return (
      <Card 
        className={`cursor-pointer hover:shadow-lg transition-shadow ${getHeightClass(widget.height)}`}
        onClick={() => onWidgetClick?.(widget)}
      >
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
          {widget.description && (
            <p className="text-sm text-muted-foreground">{widget.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-container-sm flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-icon-2xl w-icon-2xl mx-auto mb-sm" />
              <p className="text-sm">Chart: {widget.chartType}</p>
              <p className="text-xs mt-xs">
                {widget.chartData?.length || 0} data points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListWidget = (widget: DashboardWidget) => {
    const items = widget.items || [];
    
    return (
      <Card 
        className={`cursor-pointer hover:shadow-lg transition-shadow ${getHeightClass(widget.height)}`}
        onClick={() => onWidgetClick?.(widget)}
      >
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
          {widget.description && (
            <p className="text-sm text-muted-foreground">{widget.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-md">
              No items to display
            </p>
          ) : (
            <div className="space-y-sm">
              {items.slice(0, 5).map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between">
                  {widget.itemRenderer ? (
                    widget.itemRenderer(item)
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.name || item.title || item.description}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      {item.status && (
                        <Badge variant={getStatusVariant(item.status)}>
                          {item.status}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              ))}
              {items.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-sm">
                  +{items.length - 5} more items
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderProgressWidget = (widget: DashboardWidget) => {
    const progress = widget.progress || 0;
    const progressLabel = widget.progressLabel || `${progress}%`;
    
    return (
      <Card 
        className={`cursor-pointer hover:shadow-lg transition-shadow ${getHeightClass(widget.height)}`}
        onClick={() => onWidgetClick?.(widget)}
      >
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
          {widget.description && (
            <p className="text-sm text-muted-foreground">{widget.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progressLabel}</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            
            {widget.target && (
              <div className="text-xs text-muted-foreground">
                Target: {widget.target}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActivityWidget = (widget: DashboardWidget) => {
    const activities = widget.activities || [];
    
    return (
      <Card 
        className={`cursor-pointer hover:shadow-lg transition-shadow ${getHeightClass(widget.height)}`}
        onClick={() => onWidgetClick?.(widget)}
      >
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-md">
              No recent activity
            </p>
          ) : (
            <div className="space-y-sm">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex gap-sm">
                  {activity.user?.avatar ? (
                    <img 
                      src={activity.user.avatar} 
                      alt={activity.user.name}
                      className="h-icon-lg w-icon-lg rounded-full"
                    />
                  ) : (
                    <div className="h-icon-lg w-icon-lg rounded-full bg-muted flex items-center justify-center">
                      <Activity className="h-icon-xs w-icon-xs" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
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

  const renderWidget = (widget: DashboardWidget) => {
    if (loading) {
      return (
        <Card key={widget.id} className={`${getSpanClass(widget.span)} ${getHeightClass(widget.height)}`}>
          <CardHeader>
            <Skeleton className="h-icon-sm w-3/4" />
            <Skeleton className="h-icon-xs w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-icon-lg w-1/3 mb-sm" />
            <Skeleton className="h-icon-xs w-full" />
          </CardContent>
        </Card>
      );
    }

    const content = (() => {
      switch (widget.type) {
        case 'metric':
          return renderMetricWidget(widget);
        case 'chart':
          return renderChartWidget(widget);
        case 'list':
          return renderListWidget(widget);
        case 'progress':
          return renderProgressWidget(widget);
        case 'activity':
          return renderActivityWidget(widget);
        case 'custom':
          if (widget.component) {
            const CustomComponent = widget.component;
            return (
              <Card className={`${getHeightClass(widget.height)}`}>
                <CustomComponent {...widget.props} />
              </Card>
            );
          }
          return null;
        default:
          return renderMetricWidget(widget);
      }
    })();

    return (
      <div key={widget.id} className={getSpanClass(widget.span)}>
        {content}
      </div>
    );
  };

  const getSpanClass = (span: number) => {
    const spanMap = {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      6: 'col-span-6',
      12: 'col-span-12',
    };
    return spanMap[span as keyof typeof spanMap] || 'col-span-1';
  };

  const getHeightClass = (height?: string) => {
    const heightMap = {
      sm: 'h-component-xl',
      md: 'h-container-xs',
      lg: 'h-container-sm',
      xl: 'h-container-md',
    };
    return heightMap[height as keyof typeof heightMap] || '';
  };

  const getColorClass = (color?: string) => {
    const colorMap = {
      default: 'text-muted-foreground',
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      destructive: 'text-destructive',
    };
    return colorMap[color as keyof typeof colorMap] || 'text-muted-foreground';
  };

  const getStatusVariant = (status: string): any => {
    const lowercased = status?.toLowerCase();
    if (['active', 'completed', 'approved', 'success'].includes(lowercased)) {
      return 'success';
    }
    if (['pending', 'in_progress', 'processing'].includes(lowercased)) {
      return 'warning';
    }
    if (['inactive', 'cancelled', 'rejected', 'failed'].includes(lowercased)) {
      return 'destructive';
    }
    return 'default';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 60) return 'bg-primary';
    if (progress >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getGapClass = () => {
    const gapMap = {
      xs: 'gap-xs',
      sm: 'gap-sm',
      md: 'gap-md',
      lg: 'gap-lg',
      xl: 'gap-xl',
    };
    return gapMap[gap] || 'gap-md';
  };

  return (
    <div className="space-y-md">
      {/* Dashboard Header */}
      {(title || subtitle || actions.length > 0) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h1 className="text-3xl font-bold">{title}</h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground mt-xs">{subtitle}</p>
            )}
          </div>
          
          {actions.length > 0 && (
            <div className="flex items-center gap-sm">
              {actions.map(action => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.icon && <action.icon className="h-icon-xs w-icon-xs mr-xs" />}
                  {action.label}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-icon-xs w-icon-xs ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dashboard Grid */}
      <div className={`grid grid-cols-${columns} ${getGapClass()}`}>
        {widgets.map(renderWidget)}
      </div>
    </div>
  );
};

export default UnifiedDashboardView;
