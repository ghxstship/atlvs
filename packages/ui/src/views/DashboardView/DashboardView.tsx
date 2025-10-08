/**
 * DashboardView Component — Widget-Based Dashboard
 * KPI metrics, charts, and data summaries
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, MoreVertical } from 'lucide-react';
import type { ViewProps, DashboardWidget } from '../types';

export interface DashboardViewProps extends Omit<ViewProps, 'onRecordClick'> {
  /** Widgets configuration */
  widgets: DashboardWidget[];
  
  /** Widget click handler */
  onWidgetClick?: (widget: DashboardWidget) => void;
  
  /** Custom className */
  className?: string;
}

/**
 * DashboardView Component
 */
export function DashboardView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  widgets,
  onWidgetClick,
  className = '',
}: DashboardViewProps) {
  // Calculate metrics
  const calculateMetric = (widget: DashboardWidget) => {
    if (!widget.config.metric || !widget.config.field) return null;
    
    const values = data
      .map(record => record[widget.config.field!])
      .filter(v => typeof v === 'number');
    
    if (values.length === 0) return null;
    
    switch (widget.config.metric) {
      case 'count':
        return data.length;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'average':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      default:
        return null;
    }
  };
  
  // Format metric value
  const formatMetric = (value: number | null, format?: string) => {
    if (value === null) return 'N/A';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };
  
  const sizeClasses = {
    sm: 'col-span-1',
    md: 'col-span-2',
    lg: 'col-span-3',
    xl: 'col-span-4',
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading data</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 h-full overflow-auto ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map(widget => {
          const value = widget.type === 'metric' ? calculateMetric(widget) : null;
          
          return (
            <div
              key={widget.id}
              className={`
                ${sizeClasses[widget.size]}
                p-4 rounded-lg
                border border-border
                bg-card
                hover:border-primary
                transition-colors
                ${onWidgetClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onWidgetClick?.(widget)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    {widget.title}
                  </h3>
                  {widget.config.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {widget.config.subtitle}
                    </p>
                  )}
                </div>
                <button className="p-1 rounded hover:bg-muted transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              {/* Content */}
              {widget.type === 'metric' && (
                <div>
                  <div className="text-3xl font-bold mb-2">
                    {formatMetric(value, widget.config.format)}
                  </div>
                  
                  {/* Trend indicator (mock) */}
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success">12%</span>
                    <span className="text-muted-foreground">vs last period</span>
                  </div>
                </div>
              )}
              
              {widget.type === 'chart' && (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Chart: {widget.config.chartType}
                </div>
              )}
              
              {widget.type === 'list' && (
                <div className="space-y-2">
                  {data.slice(0, widget.config.limit || 5).map(record => (
                    <div
                      key={record.id}
                      className="text-sm truncate text-muted-foreground"
                    >
                      • {record[widget.config.field || 'name'] || 'Item'}
                    </div>
                  ))}
                </div>
              )}
              
              {widget.type === 'table' && (
                <div className="text-sm text-muted-foreground">
                  Table view
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

DashboardView.displayName = 'DashboardView';
