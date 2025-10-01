"use client";

import { TrendingUp, TrendingDown, Calendar, DollarSign, Users, MapPin, Music, Clock, Target, Activity } from "lucide-react";
import { useMemo } from "react";
import {
 Badge,
 Card,
} from "@ghxstship/ui";
import type { ProgrammingPerformance, PerformanceAnalytics, PerformanceProject, PerformanceEvent } from "../types";
import { STATUS_BADGE, PERFORMANCE_TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingPerformancesAnalyticsViewProps = {
 performances: ProgrammingPerformance[];
 loading: boolean;
 selectedPerformances: Set<string>;
 onSelectionChange: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onEdit: (performance: ProgrammingPerformance) => void;
 onView: (performance: ProgrammingPerformance) => void;
 onDelete: (performance: ProgrammingPerformance) => void;
 sortConfig: unknown;
 onSort: (sort: unknown) => void;
 users: User[];
 projects: PerformanceProject[];
 events: PerformanceEvent[];
};

export default function ProgrammingPerformancesAnalyticsView({
 performances,
 loading,
 users,
 projects,
 events,
}: ProgrammingPerformancesAnalyticsViewProps) {

 const analytics = useMemo((): PerformanceAnalytics => {
 const now = new Date();
 const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
 const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

 // Basic counts
 const totalPerformances = performances.length;
 const upcomingPerformances = performances.filter(p => new Date(p.starts_at) > now).length;
 const completedPerformances = performances.filter(p => p.status === 'completed').length;
 const cancelledPerformances = performances.filter(p => p.status === 'cancelled').length;

 // Duration analytics
 const durationsWithValues = performances
 .map(p => p.duration_minutes)
 .filter((d): d is number => d !== null && d !== undefined);
 const averageDuration = durationsWithValues.length > 0 
 ? Math.round(durationsWithValues.reduce((sum, d) => sum + d, 0) / durationsWithValues.length)
 : 0;

 // Revenue analytics
 const revenueData = performances.map(p => {
 const minPrice = p.ticket_info.price_min || 0;
 const maxPrice = p.ticket_info.price_max || minPrice;
 const avgPrice = (minPrice + maxPrice) / 2;
 const attendance = p.audience_info.expected_attendance || 0;
 return avgPrice * attendance;
 });
 const totalRevenue = revenueData.reduce((sum, rev) => sum + rev, 0);

 // Attendance analytics
 const attendanceData = performances
 .map(p => p.audience_info.expected_attendance)
 .filter((a): a is number => a !== null && a !== undefined);
 const averageAttendance = attendanceData.length > 0
 ? Math.round(attendanceData.reduce((sum, a) => sum + a, 0) / attendanceData.length)
 : 0;

 // Top venues
 const venueMap = new Map<string, number>();
 performances.forEach(p => {
 if (p.venue) {
 venueMap.set(p.venue, (venueMap.get(p.venue) || 0) + 1);
 }
 });
 const topVenues = Array.from(venueMap.entries())
 .map(([venue, count]) => ({ venue, count }))
 .sort((a, b) => b.count - a.count)
 .slice(0, 5);

 // Performance by type
 const typeMap = new Map<string, number>();
 performances.forEach(p => {
 const type = p.performance_type || 'other';
 typeMap.set(type, (typeMap.get(type) || 0) + 1);
 });
 const performancesByType = Array.from(typeMap.entries())
 .map(([type, count]) => ({ type: type as unknown, count }))
 .sort((a, b) => b.count - a.count);

 // Performance by status
 const statusMap = new Map<string, number>();
 performances.forEach(p => {
 statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
 });
 const performancesByStatus = Array.from(statusMap.entries())
 .map(([status, count]) => ({ status: status as unknown, count }))
 .sort((a, b) => b.count - a.count);

 // Monthly trends
 const monthlyMap = new Map<string, { count: number; revenue: number }>();
 performances.forEach(p => {
 const date = new Date(p.starts_at);
 const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
 
 const existing = monthlyMap.get(monthKey) || { count: 0, revenue: 0 };
 const minPrice = p.ticket_info.price_min || 0;
 const maxPrice = p.ticket_info.price_max || minPrice;
 const avgPrice = (minPrice + maxPrice) / 2;
 const attendance = p.audience_info.expected_attendance || 0;
 const revenue = avgPrice * attendance;
 
 monthlyMap.set(monthKey, {
 count: existing.count + 1,
 revenue: existing.revenue + revenue,
 });
 });

 const monthlyTrends = Array.from(monthlyMap.entries())
 .map(([month, data]) => ({ month, ...data }))
 .sort((a, b) => a.month.localeCompare(b.month))
 .slice(-12); // Last 12 months

 return {
 totalPerformances,
 upcomingPerformances,
 completedPerformances,
 cancelledPerformances,
 averageDuration,
 totalRevenue,
 averageAttendance,
 topVenues,
 performancesByType,
 performancesByStatus,
 monthlyTrends,
 };
 }, [performances]);

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: "USD",
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(amount);
 };

 const formatMonth = (monthString: string) => {
 const [year, month] = monthString.split('-');
 return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", {
 month: "short",
 year: "numeric",
 });
 };

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-xsxl">
 <div className="text-center">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading analytics...</p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Performances</p>
 <p className="text-2xl font-bold">{analytics.totalPerformances}</p>
 </div>
 <Music className="h-icon-lg w-icon-lg text-primary" />
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Upcoming</p>
 <p className="text-2xl font-bold">{analytics.upcomingPerformances}</p>
 </div>
 <Calendar className="h-icon-lg w-icon-lg text-blue-500" />
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Revenue</p>
 <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
 </div>
 <DollarSign className="h-icon-lg w-icon-lg text-green-500" />
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Avg Attendance</p>
 <p className="text-2xl font-bold">{analytics.averageAttendance.toLocaleString()}</p>
 </div>
 <Users className="h-icon-lg w-icon-lg text-purple-500" />
 </div>
 </Card>
 </div>

 {/* Secondary Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Completed</p>
 <p className="text-xl font-semibold">{analytics.completedPerformances}</p>
 </div>
 <div className="flex items-center text-green-600">
 <TrendingUp className="h-icon-xs w-icon-xs mr-1" />
 <span className="text-sm">
 {analytics.totalPerformances > 0 
 ? Math.round((analytics.completedPerformances / analytics.totalPerformances) * 100)
 : 0}%
 </span>
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Cancelled</p>
 <p className="text-xl font-semibold">{analytics.cancelledPerformances}</p>
 </div>
 <div className="flex items-center text-red-600">
 <TrendingDown className="h-icon-xs w-icon-xs mr-1" />
 <span className="text-sm">
 {analytics.totalPerformances > 0 
 ? Math.round((analytics.cancelledPerformances / analytics.totalPerformances) * 100)
 : 0}%
 </span>
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Avg Duration</p>
 <p className="text-xl font-semibold">{analytics.averageDuration} min</p>
 </div>
 <Clock className="h-icon-md w-icon-md text-orange-500" />
 </div>
 </Card>
 </div>

 {/* Charts and Breakdowns */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {/* Performance Types */}
 <Card className="p-md">
 <h3 className="text-lg font-semibold mb-md">Performance Types</h3>
 <div className="space-y-sm">
 {analytics.performancesByType.map(({ type, count }) => {
 const typeConfig = PERFORMANCE_TYPE_BADGE[type];
 const percentage = analytics.totalPerformances > 0 
 ? Math.round((count / analytics.totalPerformances) * 100)
 : 0;
 
 return (
 <div key={type} className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <span className="text-lg">{typeConfig.icon}</span>
 <span className="text-sm">{typeConfig.label}</span>
 </div>
 <div className="flex items-center gap-sm">
 <div className="w-component-lg bg-muted rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full"
 style={{ width: `${percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium w-icon-lg text-right">{count}</span>
 <span className="text-xs text-muted-foreground w-icon-lg text-right">{percentage}%</span>
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Performance Status */}
 <Card className="p-md">
 <h3 className="text-lg font-semibold mb-md">Performance Status</h3>
 <div className="space-y-sm">
 {analytics.performancesByStatus.map(({ status, count }) => {
 const statusConfig = STATUS_BADGE[status];
 const percentage = analytics.totalPerformances > 0 
 ? Math.round((count / analytics.totalPerformances) * 100)
 : 0;
 
 return (
 <div key={status} className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>
 <div className="flex items-center gap-sm">
 <div className="w-component-lg bg-muted rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full"
 style={{ width: `${percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium w-icon-lg text-right">{count}</span>
 <span className="text-xs text-muted-foreground w-icon-lg text-right">{percentage}%</span>
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Top Venues */}
 <Card className="p-md">
 <h3 className="text-lg font-semibold mb-md">Top Venues</h3>
 {analytics.topVenues.length > 0 ? (
 <div className="space-y-sm">
 {analytics.topVenues.map(({ venue, count }) => {
 const percentage = analytics.totalPerformances > 0 
 ? Math.round((count / analytics.totalPerformances) * 100)
 : 0;
 
 return (
 <div key={venue} className="flex items-center justify-between">
 <div className="flex items-center gap-sm min-w-0 flex-1">
 <MapPin className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
 <span className="text-sm truncate">{venue}</span>
 </div>
 <div className="flex items-center gap-sm">
 <div className="w-component-lg bg-muted rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full"
 style={{ width: `${percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium w-icon-lg text-right">{count}</span>
 <span className="text-xs text-muted-foreground w-icon-lg text-right">{percentage}%</span>
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No venue data available</p>
 )}
 </Card>

 {/* Monthly Trends */}
 <Card className="p-md">
 <h3 className="text-lg font-semibold mb-md">Monthly Trends</h3>
 {analytics.monthlyTrends.length > 0 ? (
 <div className="space-y-sm">
 {analytics.monthlyTrends.slice(-6).map(({ month, count, revenue }) => (
 <div key={month} className="flex items-center justify-between">
 <span className="text-sm">{formatMonth(month)}</span>
 <div className="flex items-center gap-md">
 <div className="flex items-center gap-xs">
 <Activity className="h-3 w-3 text-muted-foreground" />
 <span className="text-sm">{count}</span>
 </div>
 <div className="flex items-center gap-xs">
 <DollarSign className="h-3 w-3 text-muted-foreground" />
 <span className="text-sm">{formatCurrency(revenue)}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No trend data available</p>
 )}
 </Card>
 </div>

 {/* Summary Stats */}
 <Card className="p-md">
 <h3 className="text-lg font-semibold mb-md">Summary</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md text-sm">
 <div>
 <p className="text-muted-foreground">Success Rate</p>
 <p className="text-lg font-semibold">
 {analytics.totalPerformances > 0 
 ? Math.round(((analytics.completedPerformances) / analytics.totalPerformances) * 100)
 : 0}%
 </p>
 </div>
 <div>
 <p className="text-muted-foreground">Cancellation Rate</p>
 <p className="text-lg font-semibold">
 {analytics.totalPerformances > 0 
 ? Math.round((analytics.cancelledPerformances / analytics.totalPerformances) * 100)
 : 0}%
 </p>
 </div>
 <div>
 <p className="text-muted-foreground">Avg Revenue/Performance</p>
 <p className="text-lg font-semibold">
 {analytics.totalPerformances > 0 
 ? formatCurrency(analytics.totalRevenue / analytics.totalPerformances)
 : formatCurrency(0)}
 </p>
 </div>
 <div>
 <p className="text-muted-foreground">Total Expected Audience</p>
 <p className="text-lg font-semibold">
 {performances.reduce((sum, p) => sum + (p.audience_info.expected_attendance || 0), 0).toLocaleString()}
 </p>
 </div>
 </div>
 </Card>
 </div>
 );
}
