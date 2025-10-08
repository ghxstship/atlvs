'use client';

import React from 'react';
import { Card, Button } from '@ghxstship/ui';
import type { BaseWidgetProps } from '../types';
import { BarChart3, Download, LineChart, Maximize2, PieChart } from 'lucide-react';

interface EnhancedChartWidgetProps extends BaseWidgetProps {
 onExpand?: () => void;
 onExport?: () => void;
}

// Use design tokens for chart colors
const COLORS = [
 'hsl(var(--color-primary))', 'hsl(var(--color-success))', 'hsl(var(--color-warning))',
 'hsl(var(--color-destructive))', 'hsl(var(--color-purple))', 'hsl(var(--color-info))',
 'hsl(var(--color-success))', 'hsl(var(--color-accent))', 'hsl(var(--color-pink))',
 'hsl(var(--color-muted))'
];

export default function EnhancedChartWidget({ 
 widget, 
 data, 
 isLoading,
 onExpand,
 onExport
}: EnhancedChartWidgetProps) {
 if (isLoading) {
 return (
 <Card className="p-lg">
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <div className="h-icon-md bg-muted rounded w-1/3 animate-pulse"></div>
 <div className="flex space-x-sm">
 <div className="h-icon-lg w-icon-lg bg-muted rounded animate-pulse"></div>
 <div className="h-icon-lg w-icon-lg bg-muted rounded animate-pulse"></div>
 </div>
 </div>
 <div className="h-container-sm bg-muted rounded animate-pulse"></div>
 </div>
 </Card>
 );
 }

 const chartData = data?.data || [];
 const chartType = widget.config.chartType || 'bar';

 const renderChart = () => {
 if (!chartData.length) {
 return (
 <div className="flex items-center justify-center h-container-sm text-muted-foreground">
 <div className="text-center space-y-sm">
 <BarChart3 className="w-icon-2xl h-icon-2xl mx-auto opacity-50" />
 <p>No data available</p>
 </div>
 </div>
 );
 }

 const maxValue = Math.max(...chartData.map((item: unknown) => item.value || 0));

 switch (chartType) {
 case 'bar':
 case 'column':
 return (
 <div className="h-container-sm flex items-end justify-around space-x-xs p-md">
 {chartData.slice(0, 10).map((item: unknown, index: number) => {
 const height = maxValue > 0 ? (item.value / maxValue) * 200 : 0;
 return (
 <div key={index} className="flex flex-col items-center space-y-xs">
 <div className="text-xs text-muted-foreground">{item.value}</div>
 <div
 className="w-icon-lg rounded-t transition-all duration-300"
 style={{
 height: `${height}px`,
 backgroundColor: COLORS[index % COLORS.length],
 minHeight: '4px'
 }}
 />
 <div className="text-xs text-muted-foreground max-w-12 truncate">
 {item.name || item.label}
 </div>
 </div>
 );
 })}
 </div>
 );

 case 'line':
 return (
 <div className="h-container-sm flex items-center justify-center">
 <div className="text-center space-y-sm">
 <LineChart className="w-icon-2xl h-icon-2xl mx-auto text-blue-500" />
 <p className="text-sm text-muted-foreground">Line Chart</p>
 <p className="text-xs text-muted-foreground">{chartData.length} data points</p>
 </div>
 </div>
 );

 case 'pie':
 case 'donut':
 return (
 <div className="h-container-sm flex items-center justify-center">
 <div className="text-center space-y-sm">
 <PieChart className="w-icon-2xl h-icon-2xl mx-auto text-purple-500" />
 <p className="text-sm text-muted-foreground">
 {chartType === 'donut' ? 'Donut' : 'Pie'} Chart
 </p>
 <div className="space-y-xs">
 {chartData.slice(0, 5).map((item: unknown, index: number) => (
 <div key={index} className="flex items-center justify-between text-xs">
 <div className="flex items-center space-x-xs">
 <div
 className="w-3 h-3 rounded"
 style={{ backgroundColor: COLORS[index % COLORS.length] }}
 />
 <span>{item.name || item.label}</span>
 </div>
 <span className="font-medium">{item.value}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 );

 default:
 return (
 <div className="flex items-center justify-center h-container-sm text-muted-foreground">
 <div className="text-center space-y-sm">
 <BarChart3 className="w-icon-2xl h-icon-2xl mx-auto opacity-50" />
 <p>Chart type: {chartType}</p>
 <p className="text-xs">{chartData.length} data points</p>
 </div>
 </div>
 );
 }
 };

 const getChartIcon = () => {
 switch (chartType) {
 case 'line':
 case 'area':
 return <LineChart className="w-icon-xs h-icon-xs" />;
 case 'pie':
 case 'donut':
 return <PieChart className="w-icon-xs h-icon-xs" />;
 default:
 return <BarChart3 className="w-icon-xs h-icon-xs" />;
 }
 };

 return (
 <Card className="p-lg">
 <div className="space-y-md">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-sm">
 {getChartIcon()}
 <div>
 <h3 className="font-semibold text-foreground">{widget.title}</h3>
 {widget.description && (
 <p className="text-sm text-muted-foreground">{widget.description}</p>
 )}
 </div>
 </div>
 <div className="flex items-center space-x-sm">
 {onExport && (
 <Button
 variant="ghost"
 size="sm"
 onClick={onExport}
 className="p-xs"
 >
 <Download className="w-icon-xs h-icon-xs" />
 </Button>
 )}
 {onExpand && (
 <Button
 variant="ghost"
 size="sm"
 onClick={onExpand}
 className="p-xs"
 >
 <Maximize2 className="w-icon-xs h-icon-xs" />
 </Button>
 )}
 </div>
 </div>

 {/* Chart */}
 <div className="w-full">
 {renderChart()}
 </div>

 {/* Footer Stats */}
 {data?.metadata && (
 <div className="flex items-center justify-between text-xs text-muted-foreground pt-sm border-t">
 <span>
 {data.metadata.total_count} data points
 </span>
 <span>
 Updated {new Date(data.metadata.last_updated).toLocaleTimeString()}
 </span>
 </div>
 )}
 </div>
 </Card>
 );
}
