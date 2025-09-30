'use client';

import { BarChart3, TrendingUp, Users, DollarSign, Activity, Target } from "lucide-react";
import { useMemo } from 'react';
import { Card, Skeleton } from '@ghxstship/ui';
import type { ProgrammingOverviewData, OverviewAnalytics } from '../types';

interface ProgrammingOverviewAnalyticsViewProps {
 data: ProgrammingOverviewData;
 analytics: OverviewAnalytics;
 loading: boolean;
 analyticsLoading: boolean;
 period: '7d' | '30d' | '90d' | '1y';
 moduleFilter: string;
}

export default function ProgrammingOverviewAnalyticsView({
 data,
 analytics,
 loading,
 analyticsLoading,
 period,
 moduleFilter,
}: ProgrammingOverviewAnalyticsViewProps) {
 const trendData = useMemo(() => [
 {
 title: 'Event Trends',
 data: analytics.eventTrends,
 color: 'text-blue-600',
 bgColor: 'bg-blue-50',
 icon: BarChart3,
 },
 {
 title: 'Workshop Trends',
 data: analytics.workshopTrends,
 color: 'text-green-600',
 bgColor: 'bg-green-50',
 icon: Users,
 },
 {
 title: 'Space Trends',
 data: analytics.spaceTrends,
 color: 'text-purple-600',
 bgColor: 'bg-purple-50',
 icon: Activity,
 },
 {
 title: 'Performance Trends',
 data: analytics.performanceTrends,
 color: 'text-red-600',
 bgColor: 'bg-red-50',
 icon: TrendingUp,
 },
 ], [analytics]);

 if (loading || analyticsLoading) {
 return (
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {Array.from({ length: 4 }).map((_, i) => (
 <Card key={i} className="p-6">
 <Skeleton className="h-4 w-24 mb-4" />
 <Skeleton className="h-32 w-full" />
 </Card>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Analytics Summary */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
 <DollarSign className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">${analytics.revenueAnalytics.total_revenue.toLocaleString()}</p>
 <p className="text-sm text-green-600 mt-1">+12% from last period</p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Total Participants</h3>
 <Users className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{analytics.participantAnalytics.total_participants.toLocaleString()}</p>
 <p className="text-sm text-green-600 mt-1">+8% from last period</p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Active Modules</h3>
 <Activity className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{analytics.moduleUsage.length}</p>
 <p className="text-sm text-blue-600 mt-1">All modules active</p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Avg Performance</h3>
 <Target className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">
 {Math.round(
 analytics.performanceMetrics.reduce((sum, metric) => sum + metric.value, 0) /
 analytics.performanceMetrics.length
 )}%
 </p>
 <p className="text-sm text-green-600 mt-1">Above target</p>
 </Card>
 </div>

 {/* Trend Charts */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {trendData.map((trend, index) => {
 const Icon = trend.icon;
 const latestValue = trend.data[trend.data.length - 1]?.value || 0;
 const previousValue = trend.data[trend.data.length - 2]?.value || 0;
 const change = previousValue > 0 ? ((latestValue - previousValue) / previousValue) * 100 : 0;
 
 return (
 <Card key={index} className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold">{trend.title}</h3>
 <div className={`p-2 rounded-lg ${trend.bgColor}`}>
 <Icon className={`h-4 w-4 ${trend.color}`} />
 </div>
 </div>
 
 <div className="mb-4">
 <p className="text-2xl font-bold">{latestValue}</p>
 <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
 {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs previous period
 </p>
 </div>

 {/* Simple trend visualization */}
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>Trend ({period})</span>
 <span>Latest: {latestValue}</span>
 </div>
 <div className="h-2 bg-muted rounded-full overflow-hidden">
 <div
 className={`h-full ${trend.color.replace('text-', 'bg-')} transition-all duration-300`}
 style={{ width: `${Math.min(100, (latestValue / Math.max(...trend.data.map(d => d.value))) * 100)}%` }}
 />
 </div>
 </div>
 </Card>
 );
 })}
 </div>

 {/* Performance Metrics */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {analytics.performanceMetrics.map((metric, index) => (
 <div key={index} className="p-4 rounded-lg bg-muted/50">
 <h4 className="font-medium text-sm mb-2">{metric.metric}</h4>
 <div className="flex items-center justify-between mb-2">
 <span className="text-2xl font-bold">{metric.value}%</span>
 <span className={`text-sm ${
 metric.trend === 'up' ? 'text-green-600' : 
 metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
 }`}>
 {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
 </span>
 </div>
 {metric.target && (
 <div className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>Target: {metric.target}%</span>
 <span>{metric.value >= metric.target ? '✓' : '○'}</span>
 </div>
 <div className="w-full bg-muted rounded-full h-1">
 <div
 className={`h-1 rounded-full ${
 metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
 }`}
 style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
 />
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 </Card>

 {/* Module Usage */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Module Usage Analytics</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {analytics.moduleUsage.map((module, index) => (
 <div key={index} className="p-4 rounded-lg bg-muted/50">
 <h4 className="font-medium text-sm mb-2">{module.module}</h4>
 <p className="text-xl font-bold">{module.usage_count}</p>
 <p className="text-xs text-muted-foreground mb-2">
 {module.active_users} active users
 </p>
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Growth</span>
 <span className={`font-medium ${
 module.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
 }`}>
 {module.growth_rate >= 0 ? '+' : ''}{module.growth_rate}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Revenue Analytics */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Revenue by Module</h3>
 <div className="space-y-3">
 {analytics.revenueAnalytics.revenue_by_module.map((item, index) => {
 const percentage = analytics.revenueAnalytics.total_revenue > 0 
 ? (item.revenue / analytics.revenueAnalytics.total_revenue) * 100 
 : 0;
 return (
 <div key={index} className="flex items-center justify-between">
 <span className="text-sm font-medium">{item.module}</span>
 <div className="flex items-center gap-2">
 <span className="text-sm">${item.revenue.toLocaleString()}</span>
 <div className="w-16 bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full"
 style={{ width: `${percentage}%` }}
 />
 </div>
 <span className="text-xs text-muted-foreground w-8">
 {percentage.toFixed(0)}%
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Participant Distribution</h3>
 <div className="space-y-3">
 {analytics.participantAnalytics.participants_by_module.map((item, index) => {
 const percentage = analytics.participantAnalytics.total_participants > 0 
 ? (item.count / analytics.participantAnalytics.total_participants) * 100 
 : 0;
 return (
 <div key={index} className="flex items-center justify-between">
 <span className="text-sm font-medium">{item.module}</span>
 <div className="flex items-center gap-2">
 <span className="text-sm">{item.count.toLocaleString()}</span>
 <div className="w-16 bg-muted rounded-full h-2">
 <div
 className="bg-blue-500 h-2 rounded-full"
 style={{ width: `${percentage}%` }}
 />
 </div>
 <span className="text-xs text-muted-foreground w-8">
 {percentage.toFixed(0)}%
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Engagement Metrics */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {analytics.participantAnalytics.engagement_metrics.map((metric, index) => (
 <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
 <h4 className="font-medium text-sm mb-2">{metric.metric}</h4>
 <p className="text-2xl font-bold">{metric.value}</p>
 <p className={`text-sm mt-1 ${
 metric.trend === 'up' ? 'text-green-600' : 
 metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
 }`}>
 {metric.trend === 'up' ? '↗ Improving' : 
 metric.trend === 'down' ? '↘ Declining' : '→ Stable'}
 </p>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
}
