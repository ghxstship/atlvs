'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Select } from '../Select';
import { Badge } from '../Badge';
import { Loader } from '../Loader';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Target,
  Activity,
  Plus,
  Settings,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { DataRecord, ViewProps, DashboardWidget } from './types';
import { useDataView } from './DataViewProvider';

interface DashboardViewProps extends ViewProps {
  widgets?: DashboardWidget[];
  onWidgetAdd?: (widget: DashboardWidget) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetUpdate?: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  onWidgetReorder?: (widgets: DashboardWidget[]) => void;
  customizable?: boolean;
  refreshInterval?: number;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'total-records',
    type: 'metric',
    title: 'Total Records',
    size: 'small',
    position: { x: 0, y: 0, w: 1, h: 1 },
    config: {
      metric: 'count',
      format: 'number',
      icon: 'database'
    }
  },
  {
    id: 'recent-activity',
    type: 'list',
    title: 'Recent Activity',
    size: 'medium',
    position: { x: 1, y: 0, w: 2, h: 2 },
    config: {
      limit: 5,
      showTimestamp: true
    }
  },
  {
    id: 'status-breakdown',
    type: 'chart',
    title: 'Status Breakdown',
    size: 'medium',
    position: { x: 0, y: 1, w: 2, h: 2 },
    config: {
      chartType: 'pie',
      groupBy: 'status'
    }
  },
  {
    id: 'trends',
    type: 'chart',
    title: 'Trends Over Time',
    size: 'large',
    position: { x: 0, y: 3, w: 3, h: 2 },
    config: {
      chartType: 'line',
      timeRange: '30d',
      groupBy: 'createdAt'
    }
  }
];

export function DashboardView({
  data = [],
  loading = false,
  error,
  onRecordClick,
  onRecordSelect,
  selectedRecords = [],
  widgets = DEFAULT_WIDGETS,
  onWidgetAdd,
  onWidgetRemove,
  onWidgetUpdate,
  onWidgetReorder,
  customizable = false,
  refreshInterval
}: DashboardViewProps) {
  const { filters, search } = useDataView();
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter data based on current filters and search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (search) {
      result = result.filter(record =>
        Object.values(record).some(value =>
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Apply filters
    filters.forEach(filter => {
      if (filter.value) {
        result = result.filter(record => {
          const recordValue = record[filter.field];
          switch (filter.operator) {
            case 'equals':
              return recordValue === filter.value;
            case 'contains':
              return String(recordValue).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'gt':
              return Number(recordValue) > Number(filter.value);
            case 'lt':
              return Number(recordValue) < Number(filter.value);
            default:
              return true;
          }
        });
      }
    });

    return result;
  }, [data, search, filters]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const calculateMetric = useCallback((widget: DashboardWidget) => {
    const { config } = widget;
    
    switch (config.metric) {
      case 'count':
        return filteredData.length;
      case 'sum':
        return filteredData.reduce((sum, record) => sum + (Number(record[config.field || '']) || 0), 0);
      case 'average':
        const values = filteredData.map(record => Number(record[config.field || '']) || 0);
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      case 'max':
        return Math.max(...filteredData.map(record => Number(record[config.field || '']) || 0));
      case 'min':
        return Math.min(...filteredData.map(record => Number(record[config.field || '']) || 0));
      default:
        return 0;
    }
  }, [filteredData]);

  const formatMetricValue = useCallback((value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      default:
        return String(value);
    }
  }, []);

  const getChartData = useCallback((widget: DashboardWidget) => {
    const { config } = widget;
    
    if (config.groupBy) {
      const groups = filteredData.reduce((acc, record) => {
        const key = String(record[config.groupBy!]);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(groups).map(([label, value]) => ({ label, value }));
    }
    
    return [];
  }, [filteredData]);

  const getRecentActivity = useCallback((limit: number = 5) => {
    return filteredData
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, limit);
  }, [filteredData]);

  const renderWidget = useCallback((widget: DashboardWidget) => {
    const isExpanded = expandedWidget === widget.id;
    
    return (
      <Card 
        key={widget.id}
        className={`relative ${isExpanded ? 'col-span-full row-span-full z-10' : ''}`}
        variant="elevated"
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between p-md border-b border-border">
          <div className="flex items-center gap-sm">
            {widget.config.icon && (
              <div className="p-xs rounded bg-primary/10">
                {widget.config.icon === 'database' && <BarChart3 className="h-4 w-4 text-primary" />}
                {widget.config.icon === 'users' && <Users className="h-4 w-4 text-primary" />}
                {widget.config.icon === 'dollar' && <DollarSign className="h-4 w-4 text-primary" />}
                {widget.config.icon === 'activity' && <Activity className="h-4 w-4 text-primary" />}
              </div>
            )}
            <h3 className="font-semibold text-sm">{widget.title}</h3>
          </div>
          
          <div className="flex items-center gap-xs">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setExpandedWidget(isExpanded ? null : widget.id)}
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            
            {customizable && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onWidgetRemove?.(widget.id)}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="p-md">
          {widget.type === 'metric' && (
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatMetricValue(calculateMetric(widget), widget.config.format || 'number')}
              </div>
              {widget.config.subtitle && (
                <div className="text-sm text-muted-foreground mt-xs">
                  {widget.config.subtitle}
                </div>
              )}
            </div>
          )}

          {widget.type === 'chart' && (
            <div className="space-y-sm">
              {widget.config.chartType === 'pie' && (
                <div className="space-y-xs">
                  {getChartData(widget).map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-sm">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                        />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {widget.config.chartType === 'bar' && (
                <div className="space-y-xs">
                  {getChartData(widget).map((item, index) => (
                    <div key={item.label} className="space-y-xs">
                      <div className="flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(item.value / Math.max(...getChartData(widget).map(d => d.value))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {widget.config.chartType === 'line' && (
                <div className="text-center py-xl text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-sm" />
                  <div className="text-sm">Line chart visualization</div>
                  <div className="text-xs">Chart library integration needed</div>
                </div>
              )}
            </div>
          )}

          {widget.type === 'list' && (
            <div className="space-y-sm">
              {getRecentActivity(widget.config.limit || 5).map((record, index) => (
                <div 
                  key={record.id}
                  className="flex items-center justify-between p-sm rounded hover:bg-muted/50 cursor-pointer"
                  onClick={() => onRecordClick?.(record)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{record.name || `Record ${index + 1}`}</div>
                    {record.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {record.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-sm">
                    {record.status && (
                      <Badge 
                        variant={
                          record.status === 'active' ? 'success' :
                          record.status === 'pending' ? 'warning' :
                          record.status === 'inactive' ? 'secondary' : 'default'
                        }
                        size="sm"
                      >
                        {record.status}
                      </Badge>
                    )}
                    
                    {widget.config.showTimestamp && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(record.updatedAt || record.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredData.length === 0 && (
                <div className="text-center py-xl text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-sm opacity-50" />
                  <div className="text-sm">No recent activity</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }, [
    expandedWidget, 
    refreshing, 
    customizable, 
    calculateMetric, 
    formatMetricValue, 
    getChartData, 
    getRecentActivity, 
    filteredData, 
    onRecordClick, 
    onWidgetRemove, 
    handleRefresh
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2xl">
        <Loader text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-2xl">
        <div className="text-destructive mb-sm">Error loading dashboard</div>
        <div className="text-sm text-muted-foreground">{error}</div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="mt-md">
          <RefreshCw className="h-4 w-4 mr-sm" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <Badge variant="secondary">{filteredData.length} records</Badge>
        </div>
        
        <div className="flex items-center gap-sm">
          {customizable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onWidgetAdd?.({
                id: `widget-${Date.now()}`,
                type: 'metric',
                title: 'New Widget',
                size: 'small',
                position: { x: 0, y: 0, w: 1, h: 1 },
                config: { metric: 'count', format: 'number' }
              })}
            >
              <Plus className="h-4 w-4 mr-sm" />
              Add Widget
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-sm ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-sm" />
            Export
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md auto-rows-min">
        {widgets.map(renderWidget)}
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-2xl">
          <BarChart3 className="h-12 w-12 mx-auto mb-md text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-sm">
            No widgets configured
          </h3>
          <p className="text-muted-foreground mb-md">
            Add widgets to create your custom dashboard view
          </p>
          {customizable && (
            <Button
              onClick={() => onWidgetAdd?.({
                id: `widget-${Date.now()}`,
                type: 'metric',
                title: 'Total Records',
                size: 'small',
                position: { x: 0, y: 0, w: 1, h: 1 },
                config: { metric: 'count', format: 'number' }
              })}
            >
              <Plus className="h-4 w-4 mr-sm" />
              Add Your First Widget
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
