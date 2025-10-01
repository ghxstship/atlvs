'use client';

import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, FileText, Calendar, Users } from "lucide-react";
import { useMemo } from 'react';
import {
 Badge,
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 Progress,
} from '@ghxstship/ui';

import { STATUS_COLORS, PRIORITY_COLORS, CHART_COLORS } from '@ghxstship/config/tokens/chart-colors';
import type { ProgrammingRider, RiderAnalytics } from '../types';

interface ProgrammingRidersAnalyticsViewProps {
 riders: ProgrammingRider[];
 loading: boolean;
}

// Rider-specific kind colors using design tokens
const KIND_COLORS = {
 technical: CHART_COLORS.info,
 hospitality: CHART_COLORS.success,
 stage_plot: CHART_COLORS.purple,
 security: CHART_COLORS.error,
 catering: CHART_COLORS.warning,
 transportation: CHART_COLORS.warning,
 accommodation: CHART_COLORS.pink,
 production: CHART_COLORS.indigo,
 artist: CHART_COLORS.teal,
 crew: CHART_COLORS.muted,
};

export default function ProgrammingRidersAnalyticsView({
 riders,
 loading,
}: ProgrammingRidersAnalyticsViewProps) {
 const analytics = useMemo((): RiderAnalytics => {
 const totalRiders = riders.length;
 const pendingRiders = riders.filter(r => r.status === 'pending_review' || r.status === 'under_review').length;
 const approvedRiders = riders.filter(r => r.status === 'approved').length;
 const fulfilledRiders = riders.filter(r => r.status === 'fulfilled').length;
 const rejectedRiders = riders.filter(r => r.status === 'rejected').length;

 // Calculate average times
 const approvedWithTimes = riders.filter(r => r.approved_at && r.created_at);
 const averageApprovalTime = approvedWithTimes.length > 0
 ? approvedWithTimes.reduce((sum, r) => {
 const created = new Date(r.created_at).getTime();
 const approved = new Date(r.approved_at!).getTime();
 return sum + (approved - created);
 }, 0) / approvedWithTimes.length / (1000 * 60 * 60 * 24) // Convert to days
 : 0;

 const fulfilledWithTimes = riders.filter(r => r.fulfilled_at && r.created_at);
 const averageFulfillmentTime = fulfilledWithTimes.length > 0
 ? fulfilledWithTimes.reduce((sum, r) => {
 const created = new Date(r.created_at).getTime();
 const fulfilled = new Date(r.fulfilled_at!).getTime();
 return sum + (fulfilled - created);
 }, 0) / fulfilledWithTimes.length / (1000 * 60 * 60 * 24) // Convert to days
 : 0;

 // Group by kind
 const ridersByKind = riders.reduce((acc, rider) => {
 const existing = acc.find(item => item.kind === rider.kind);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ kind: rider.kind, count: 1 });
 }
 return acc;
 }, [] as Array<{ kind: unknown; count: number }>);

 // Group by status
 const ridersByStatus = riders.reduce((acc, rider) => {
 const existing = acc.find(item => item.status === rider.status);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ status: rider.status, count: 1 });
 }
 return acc;
 }, [] as Array<{ status: unknown; count: number }>);

 // Group by priority
 const ridersByPriority = riders.reduce((acc, rider) => {
 const existing = acc.find(item => item.priority === rider.priority);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ priority: rider.priority, count: 1 });
 }
 return acc;
 }, [] as Array<{ priority: unknown; count: number }>);

 // Monthly trends
 const monthlyTrends = riders.reduce((acc, rider) => {
 const month = new Date(rider.created_at).toLocaleDateString('en-US', { 
 year: 'numeric', 
 month: 'short' 
 });
 const existing = acc.find(item => item.month === month);
 const fulfilled = rider.status === 'fulfilled' ? 1 : 0;
 
 if (existing) {
 existing.count++;
 existing.fulfilled += fulfilled;
 } else {
 acc.push({ month, count: 1, fulfilled });
 }
 return acc;
 }, [] as Array<{ month: string; count: number; fulfilled: number }>);

 // Top events
 const topEvents = riders
 .filter(r => r.event)
 .reduce((acc, rider) => {
 const eventTitle = rider.event!.title;
 const existing = acc.find(item => item.event === eventTitle);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ event: eventTitle, count: 1 });
 }
 return acc;
 }, [] as Array<{ event: string; count: number }>)
 .sort((a, b) => b.count - a.count)
 .slice(0, 5);

 return {
 totalRiders,
 pendingRiders,
 approvedRiders,
 fulfilledRiders,
 rejectedRiders,
 averageApprovalTime,
 averageFulfillmentTime,
 ridersByKind: ridersByKind.sort((a, b) => b.count - a.count),
 ridersByStatus: ridersByStatus.sort((a, b) => b.count - a.count),
 ridersByPriority: ridersByPriority.sort((a, b) => b.count - a.count),
 monthlyTrends: monthlyTrends.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()),
 topEvents,
 };
 }, [riders]);

 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 {Array.from({ length: 4 }).map((_, index) => (
 <Card key={index} className="animate-pulse">
 <CardHeader>
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 </CardHeader>
 <CardContent>
 <div className="h-icon-lg bg-muted rounded w-1/2"></div>
 </CardContent>
 </Card>
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {Array.from({ length: 4 }).map((_, index) => (
 <Card key={index} className="animate-pulse">
 <CardHeader>
 <div className="h-icon-xs bg-muted rounded w-1/2"></div>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {Array.from({ length: 3 }).map((_, itemIndex) => (
 <div key={itemIndex} className="h-3 bg-muted rounded"></div>
 ))}
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
 }

 if (riders.length === 0) {
 return (
 <Card className="p-xl">
 <div className="text-center">
 <BarChart3 className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold">No data to analyze</h3>
 <p className="text-muted-foreground">
 Create some riders to see analytics and insights.
 </p>
 </div>
 </Card>
 );
 }

 const fulfillmentRate = analytics.totalRiders > 0 
 ? (analytics.fulfilledRiders / analytics.totalRiders) * 100 
 : 0;

 const approvalRate = analytics.totalRiders > 0 
 ? (analytics.approvedRiders / analytics.totalRiders) * 100 
 : 0;

 return (
 <div className="space-y-lg">
 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
 <FileText className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analytics.totalRiders}</div>
 <p className="text-xs text-muted-foreground">
 Across all events and projects
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Fulfillment Rate</CardTitle>
 <CheckCircle className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{fulfillmentRate.toFixed(1)}%</div>
 <Progress value={fulfillmentRate} className="mt-2" />
 <p className="text-xs text-muted-foreground mt-1">
 {analytics.fulfilledRiders} of {analytics.totalRiders} fulfilled
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Avg. Approval Time</CardTitle>
 <Clock className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">
 {analytics.averageApprovalTime.toFixed(1)}d
 </div>
 <p className="text-xs text-muted-foreground">
 Days from creation to approval
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
 <AlertTriangle className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analytics.pendingRiders}</div>
 <p className="text-xs text-muted-foreground">
 Require attention
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Charts and Breakdowns */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {/* Status Breakdown */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <TrendingUp className="h-icon-sm w-icon-sm" />
 Status Breakdown
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.ridersByStatus.map((item) => {
 const percentage = (item.count / analytics.totalRiders) * 100;
 return (
 <div key={item.status} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: STATUS_COLORS[item.status] }}
 />
 <span className="text-sm capitalize">
 {item.status.replace('_', ' ')}
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <span className="text-sm font-medium">{item.count}</span>
 <span className="text-xs text-muted-foreground">
 ({percentage.toFixed(1)}%)
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>

 {/* Kind Breakdown */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Users className="h-icon-sm w-icon-sm" />
 Rider Types
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.ridersByKind.map((item) => {
 const percentage = (item.count / analytics.totalRiders) * 100;
 return (
 <div key={item.kind} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: KIND_COLORS[item.kind] }}
 />
 <span className="text-sm capitalize">
 {item.kind.replace('_', ' ')}
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <span className="text-sm font-medium">{item.count}</span>
 <span className="text-xs text-muted-foreground">
 ({percentage.toFixed(1)}%)
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>

 {/* Priority Distribution */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <AlertTriangle className="h-icon-sm w-icon-sm" />
 Priority Distribution
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.ridersByPriority.map((item) => {
 const percentage = (item.count / analytics.totalRiders) * 100;
 return (
 <div key={item.priority} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: PRIORITY_COLORS[item.priority] }}
 />
 <span className="text-sm capitalize">{item.priority}</span>
 </div>
 <div className="flex items-center gap-xs">
 <span className="text-sm font-medium">{item.count}</span>
 <span className="text-xs text-muted-foreground">
 ({percentage.toFixed(1)}%)
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>

 {/* Top Events */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm" />
 Top Events by Riders
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.topEvents.length > 0 ? (
 analytics.topEvents.map((item, index) => (
 <div key={item.event} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Badge variant="outline" className="text-xs">
 #{index + 1}
 </Badge>
 <span className="text-sm truncate">{item.event}</span>
 </div>
 <span className="text-sm font-medium">{item.count}</span>
 </div>
 ))
 ) : (
 <p className="text-sm text-muted-foreground">No events with riders yet</p>
 )}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Monthly Trends */}
 {analytics.monthlyTrends.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <BarChart3 className="h-icon-sm w-icon-sm" />
 Monthly Trends
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-md">
 {analytics.monthlyTrends.map((item) => {
 const fulfillmentRate = item.count > 0 ? (item.fulfilled / item.count) * 100 : 0;
 return (
 <div key={item.month} className="space-y-xs">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">{item.month}</span>
 <div className="flex items-center gap-md text-sm">
 <span>{item.count} created</span>
 <span className="text-green-600">{item.fulfilled} fulfilled</span>
 <span className="text-muted-foreground">
 ({fulfillmentRate.toFixed(1)}%)
 </span>
 </div>
 </div>
 <Progress value={fulfillmentRate} className="h-2" />
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 );
}
