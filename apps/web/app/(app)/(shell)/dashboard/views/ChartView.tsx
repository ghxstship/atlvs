'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Settings,
  RefreshCw,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';

// Chart Types
export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'scatter' | 'heatmap';

// Chart Configuration
export interface ChartConfig {
  type: ChartType;
  title?: string;
  subtitle?: string;
  xAxis?: {
    field: string;
    label?: string;
    format?: (value: unknown) => string;
  };
  yAxis?: {
    field: string | string[];
    label?: string;
    format?: (value: unknown) => string;
  };
  series?: {
    field: string;
    label?: string;
    color?: string;
  }[];
  groupBy?: string;
  filters?: Record<string, unknown>;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  showDataLabels?: boolean;
  interactive?: boolean;
  animation?: boolean;
}

// Chart Data
export interface ChartDataPoint {
  x: unknown;
  y: unknown;
  label?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: ChartType;
}

// Chart View Props
export interface ChartViewProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  loading?: boolean;
  error?: string;
  className?: string;
  height?: number;

  // Chart Controls
  onChartTypeChange?: (type: ChartType) => void;
  onConfigChange?: (config: Partial<ChartConfig>) => void;
  onRefresh?: () => void;

  // Export & Actions
  onExport?: (format: 'png' | 'jpeg' | 'svg' | 'pdf') => void;
  onFullscreen?: () => void;
  onSettings?: () => void;

  // Data Interaction
  onDataPointClick?: (point: ChartDataPoint, series: ChartSeries) => void;
  onLegendClick?: (seriesName: string) => void;

  // Customization
  theme?: 'light' | 'dark';
  responsive?: boolean;
  showControls?: boolean;
  showTitle?: boolean;
  compact?: boolean;
}

// Chart View Component
export const ChartView: React.FC<ChartViewProps> = ({
  data,
  config,
  loading = false,
  error,
  className,
  height = 400,

  // Chart Controls
  onChartTypeChange,
  onConfigChange,
  onRefresh,

  // Export & Actions
  onExport,
  onFullscreen,
  onSettings,

  // Data Interaction
  onDataPointClick,
  onLegendClick,

  // Customization
  theme = 'light',
  responsive = true,
  showControls = true,
  showTitle = true,
  compact = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState<Set<string>(new Set());

  // Process chart data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chartData = useMemo(() => {
    if (!data.length) return { series: [], xAxis: [], yAxis: [] };

    try {
      const series: ChartSeries[] = [];
      const xAxis: unknown[] = [];
      const yAxis: unknown[] = [];

      // Group data if needed
      let groupedData = data;
      if (config.groupBy) {
        const groups: Record<string, Record<string, unknown>[]> = {};
        data.forEach(row => {
          const groupKey = String(row[config.groupBy!]);
          if (!groups[groupKey]) groups[groupKey] = [];
          groups[groupKey].push(row);
        });
        // Convert groups to series format
        Object.entries(groups).forEach(([groupName, groupData]) => {
          const seriesData: ChartDataPoint[] = groupData.map(row => ({
            x: config.xAxis?.field ? row[config.xAxis.field] : row.id,
            y: config.yAxis?.field
              ? (Array.isArray(config.yAxis.field)
                  ? config.yAxis.field.map(f => row[f])
                  : row[config.yAxis.field])
              : 1,
            label: groupName,
            metadata: row
          }));

          series.push({
            name: groupName,
            data: seriesData,
            color: config.colors?.[series.length % (config.colors?.length || 1)]
          });
        });
      } else {
        // Single series
        const seriesData: ChartDataPoint[] = data.map(row => ({
          x: config.xAxis?.field ? row[config.xAxis.field] : row.id,
          y: config.yAxis?.field
            ? (Array.isArray(config.yAxis.field)
                ? config.yAxis.field.map(f => row[f])
                : row[config.yAxis.field])
            : 1,
          metadata: row
        }));

        series.push({
          name: config.title || 'Data',
          data: seriesData,
          color: config.colors?.[0] || 'hsl(var(--color-primary))'
        });
      }

      return { series, xAxis, yAxis };
    } catch (err) {
      console.error('Error processing chart data:', err);
      return { series: [], xAxis: [], yAxis: [] };
    }
  }, [data, config]);

  // Handle legend click
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleLegendClick = useCallback((seriesName: string) => {
    setVisibleSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesName)) {
        newSet.delete(seriesName);
      } else {
        newSet.add(seriesName);
      }
      return newSet;
    });
    onLegendClick?.(seriesName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLegendClick]);

  // Render chart based on type
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderChart = useCallback(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-xs">
            <RefreshCw className="h-icon-sm w-icon-sm animate-spin" />
            <span>Loading chart...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-destructive mb-2">Chart Error</div>
            <div className="text-sm text-muted-foreground">{error}</div>
            {onRefresh && (
              <Button variant="secondary" size="sm" onClick={onRefresh} className="mt-2">
                <RefreshCw className="h-icon-xs w-icon-xs mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (!chartData.series.length) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            No data available for chart
          </div>
        </div>
      );
    }

    // Simplified chart rendering - in a real implementation, this would use a charting library
    return (
      <div className="relative">
        {/* Chart Placeholder */}
        <div
          className={cn(
            'bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center',
            theme === 'dark' && 'bg-muted/50'
          )}
          style={{ height: height - 120 }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">
              {config.type === 'bar' && '📊'}
              {config.type === 'line' && '📈'}
              {config.type === 'pie' && '🥧'}
              {config.type === 'area' && '📊'}
              {config.type === 'donut' && '🍩'}
              {config.type === 'scatter' && '📍'}
              {config.type === 'heatmap' && '🔥'}
            </div>
            <div className="text-lg font-medium capitalize">{config.type} Chart</div>
            <div className="text-sm text-muted-foreground mt-1">
              {chartData.series.length} series, {chartData.series[0]?.data.length || 0} data points
            </div>
          </div>
        </div>

        {/* Legend */}
        {config.showLegend && chartData.series.length > 1 && (
          <div className="flex flex-wrap gap-md mt-4 justify-center">
            {chartData.series.map((series, index) => (
              <button
                key={series.name}
                onClick={() => handleLegendClick(series.name)}
                className={cn(
                  'flex items-center gap-xs px-sm py-xs rounded-full text-sm transition-opacity',
                  visibleSeries.has(series.name) ? 'opacity-50' : 'opacity-100'
                )}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: series.color || `hsl(${index * 360 / chartData.series.length}, 70%, 50%)` }}
                />
                <span>{series.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }, [
    loading,
    error,
    chartData,
    config,
    height,
    theme,
    onRefresh,
    handleLegendClick,
    visibleSeries
  ]);

  const chartTypeIcons = {
    bar: BarChart3,
    line: TrendingUp,
    area: TrendingUp,
    pie: PieChart,
    donut: PieChart,
    scatter: TrendingUp,
    heatmap: TrendingUp
  };

  const ChartIcon = chartTypeIcons[config.type] || BarChart3;

  return (
    <Card className={cn('relative', isFullscreen && 'fixed inset-4 z-50', className)}>
      {/* Header */}
      {(showTitle || showControls) && (
        <CardHeader className={cn('pb-2', compact && 'py-xs')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <ChartIcon className="h-icon-sm w-icon-sm text-primary" />
              {showTitle && (
                <div>
                  <CardTitle className={cn('text-lg', compact && 'text-base')}>
                    {config.title || 'Chart'}
                  </CardTitle>
                  {config.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            {showControls && (
              <div className="flex items-center gap-xs">
                {/* Chart Type Selector */}
                {onChartTypeChange && (
                  <Select value={config.type} onValueChange={onChartTypeChange}>
                    <SelectTrigger className="w-component-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                      <SelectItem value="pie">Pie</SelectItem>
                      <SelectItem value="donut">Donut</SelectItem>
                      <SelectItem value="scatter">Scatter</SelectItem>
                      <SelectItem value="heatmap">Heatmap</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Refresh */}
                {onRefresh && (
                  <Button variant="ghost" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-icon-xs w-icon-xs" />
                  </Button>
                )}

                {/* Settings */}
                {onSettings && (
                  <Button variant="ghost" size="sm" onClick={onSettings}>
                    <Settings className="h-icon-xs w-icon-xs" />
                  </Button>
                )}

                {/* Fullscreen */}
                {onFullscreen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsFullscreen(!isFullscreen);
                      onFullscreen();
                    }}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-icon-xs w-icon-xs" />
                    ) : (
                      <Maximize2 className="h-icon-xs w-icon-xs" />
                    )}
                  </Button>
                )}

                {/* Export */}
                {onExport && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Download className="h-icon-xs w-icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onExport('png')}>
                        Export as PNG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('jpeg')}>
                        Export as JPEG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('svg')}>
                        Export as SVG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('pdf')}>
                        Export as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* More Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-icon-xs w-icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-icon-xs w-icon-xs mr-2" />
                      View Data
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-icon-xs w-icon-xs mr-2" />
                      Chart Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <EyeOff className="h-icon-xs w-icon-xs mr-2" />
                      Hide Chart
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>
      )}

      {/* Chart Content */}
      <CardContent className={cn(compact && 'p-xs')}>
        <div
          className={cn(
            'w-full',
            responsive && 'aspect-video',
            theme === 'dark' && 'dark'
          )}
          style={!responsive ? { height } : undefined}
        >
          {renderChart()}
        </div>

        {/* Chart Metadata */}
        {!compact && chartData.series.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-muted-foreground">
            <div>
              {chartData.series.length} series • {chartData.series[0]?.data.length || 0} data points
            </div>
            <div className="flex items-center gap-xs">
              <Badge variant="secondary" className="text-xs">
                {config.type}
              </Badge>
              {config.interactive && (
                <Badge variant="secondary" className="text-xs">
                  Interactive
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export type { ChartViewProps, ChartConfig, ChartType, ChartDataPoint, ChartSeries };
