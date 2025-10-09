'use client';

import { TrendingUp, TrendingDown, Minus, Target, AlertCircle } from "lucide-react";
import React from 'react';
import { Card, Badge } from '@ghxstship/ui';
import type { BaseWidgetProps, OverviewMetric } from '../types';

interface EnhancedMetricWidgetProps extends BaseWidgetProps {
 metric?: OverviewMetric;
}

export default function EnhancedMetricWidget({ 
 widget, 
 data, 
 isLoading, 
 metric 
}: EnhancedMetricWidgetProps) {
 if (isLoading) {
 return (
 <Card className="p-lg animate-pulse">
 <div className="space-y-md">
 <div className="h-icon-xs bg-muted rounded w-1/2"></div>
 <div className="h-icon-lg bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/3"></div>
 </div>
 </Card>
 );
 }

 const formatValue = (value: number | string, format: string) => {
 if (typeof value === 'string') return value;
 
 switch (format) {
 case 'currency':
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(value);
 case 'percentage':
 return `${value}%`;
 case 'duration':
 return `${value}h`;
 case 'number':
 default:
 return new Intl.NumberFormat('en-US').format(value);
 }
 };

 const getChangeIcon = (changeType?: string) => {
 switch (changeType) {
 case 'increase':
 return <TrendingUp className="w-icon-xs h-icon-xs text-green-500" />;
 case 'decrease':
 return <TrendingDown className="w-icon-xs h-icon-xs text-red-500" />;
 default:
 return <Minus className="w-icon-xs h-icon-xs text-gray-500" />;
 }
 };

 const getStatusColor = (status?: string) => {
 switch (status) {
 case 'good':
 return 'text-green-600 bg-green-50 border-green-200';
 case 'warning':
 return 'text-yellow-600 bg-yellow-50 border-yellow-200';
 case 'critical':
 return 'text-red-600 bg-red-50 border-red-200';
 default:
 return 'text-blue-600 bg-blue-50 border-blue-200';
 }
 };

 // Use metric data if provided, otherwise fall back to widget config
 const displayMetric = metric || {
 id: widget.id,
 label: widget.title,
 value: widget.config.value || 0,
 format: widget.config.format || 'number',
 change: widget.config.change,
 change_type: widget.config.change_type,
 target: widget.config.target,
 status: widget.config.status
 };

 const progress = displayMetric.target 
 ? Math.min(100, ((displayMetric.e.target.value as number) / displayMetric.target) * 100)
 : undefined;

 return (
 <Card className={`p-lg border-l-4 ${getStatusColor(displayMetric.status)}`}>
 <div className="space-y-md">
 {/* Header */}
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-medium text-muted-foreground">
 {displayMetric.label}
 </h3>
 {displayMetric.status && (
 <Badge variant={displayMetric.status === 'good' ? 'success' : 
 displayMetric.status === 'warning' ? 'warning' : 'destructive'}>
 {displayMetric.status}
 </Badge>
 )}
 </div>

 {/* Main Value */}
 <div className="flex items-baseline space-x-sm">
 <span className="text-2xl font-bold text-foreground">
 {formatValue(displayMetric.value, displayMetric.format)}
 </span>
 {displayMetric.change !== undefined && (
 <div className="flex items-center space-x-xs">
 {getChangeIcon(displayMetric.change_type)}
 <span className={`text-sm font-medium ${
 displayMetric.change_type === 'increase' ? 'text-green-600' :
 displayMetric.change_type === 'decrease' ? 'text-red-600' :
 'text-gray-600'
 }`}>
 {Math.abs(displayMetric.change)}%
 </span>
 </div>
 )}
 </div>

 {/* Target Progress */}
 {displayMetric.target && progress !== undefined && (
 <div className="space-y-xs">
 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span>Target: {formatValue(displayMetric.target, displayMetric.format)}</span>
 <span>{Math.round(progress)}%</span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-2">
 <div 
 className={`h-2 rounded-full transition-all duration-300 ${
 progress >= 100 ? 'bg-green-500' :
 progress >= 75 ? 'bg-blue-500' :
 progress >= 50 ? 'bg-yellow-500' :
 'bg-red-500'
 }`}
 style={{ width: `${Math.min(100, progress)}%` }}
 />
 </div>
 </div>
 )}

 {/* Previous Value Comparison */}
 {displayMetric.previous_value !== undefined && (
 <div className="text-xs text-muted-foreground">
 Previous: {formatValue(displayMetric.previous_value, displayMetric.format)}
 </div>
 )}

 {/* Description */}
 {widget.description && (
 <p className="text-xs text-muted-foreground">
 {widget.description}
 </p>
 )}
 </div>
 </Card>
 );
}
