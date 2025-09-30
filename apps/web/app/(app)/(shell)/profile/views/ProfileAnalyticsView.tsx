'use client';

import { Users, UserCheck, UserX, Clock, TrendingUp, TrendingDown, RefreshCw, BarChart3 } from "lucide-react";
import { Card, Button } from '@ghxstship/ui';
import type { ProfileStats } from '../types';

interface ProfileAnalyticsViewProps {
 stats: ProfileStats;
 loading: boolean;
 onRefresh: () => void;
}

export default function ProfileAnalyticsView({
 stats,
 loading,
 onRefresh
}: ProfileAnalyticsViewProps) {
 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {Array.from({ length: 4 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="flex items-center justify-between mb-sm">
 <div className="w-24 h-4 bg-muted rounded" />
 <div className="w-8 h-8 bg-muted rounded" />
 </div>
 <div className="w-16 h-8 bg-muted rounded mb-xs" />
 <div className="w-20 h-3 bg-muted rounded" />
 </Card>
 ))}
 </div>
 
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg animate-pulse">
 <div className="w-32 h-6 bg-muted rounded mb-md" />
 <div className="space-y-sm">
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="flex justify-between">
 <div className="w-24 h-4 bg-muted rounded" />
 <div className="w-12 h-4 bg-muted rounded" />
 </div>
 ))}
 </div>
 </Card>
 
 <Card className="p-lg animate-pulse">
 <div className="w-32 h-6 bg-muted rounded mb-md" />
 <div className="w-full h-48 bg-muted rounded" />
 </Card>
 </div>
 </div>
 );
 }

 const completionTrend = stats.completion_average > 75 ? 'up' : stats.completion_average > 50 ? 'stable' : 'down';
 const activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

 return (
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold">Profile Analytics</h2>
 <p className="text-muted-foreground">
 Insights and statistics about your organization's profiles
 </p>
 </div>
 <Button variant="outline" onClick={onRefresh}>
 <RefreshCw className="h-4 w-4 mr-sm" />
 Refresh
 </Button>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-sm">
 <p className="text-sm font-medium text-muted-foreground">Total Profiles</p>
 <Users className="h-5 w-5 text-muted-foreground" />
 </div>
 <p className="text-3xl font-bold">{stats.total}</p>
 <p className="text-sm text-muted-foreground">
 All registered profiles
 </p>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between mb-sm">
 <p className="text-sm font-medium text-muted-foreground">Active Profiles</p>
 <UserCheck className="h-5 w-5 text-green-600" />
 </div>
 <p className="text-3xl font-bold text-green-600">{stats.active}</p>
 <p className="text-sm text-muted-foreground">
 {activePercentage}% of total
 </p>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between mb-sm">
 <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
 {completionTrend === 'up' ? (
 <TrendingUp className="h-5 w-5 text-green-600" />
 ) : completionTrend === 'down' ? (
 <TrendingDown className="h-5 w-5 text-red-600" />
 ) : (
 <BarChart3 className="h-5 w-5 text-yellow-600" />
 )}
 </div>
 <p className={`text-3xl font-bold ${
 completionTrend === 'up' ? 'text-green-600' : 
 completionTrend === 'down' ? 'text-red-600' : 
 'text-yellow-600'
 }`}>
 {Math.round(stats.completion_average)}%
 </p>
 <p className="text-sm text-muted-foreground">
 Profile completion rate
 </p>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between mb-sm">
 <p className="text-sm font-medium text-muted-foreground">Recent Updates</p>
 <Clock className="h-5 w-5 text-muted-foreground" />
 </div>
 <p className="text-3xl font-bold">{stats.recent_updates}</p>
 <p className="text-sm text-muted-foreground">
 Last 7 days
 </p>
 </Card>
 </div>

 {/* Detailed Analytics */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {/* Status Breakdown */}
 <Card className="p-lg">
 <h3 className="text-lg font-semibold mb-md">Status Breakdown</h3>
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-green-500 rounded-full" />
 <span className="text-sm">Active</span>
 </div>
 <div className="text-right">
 <span className="font-semibold">{stats.active}</span>
 <span className="text-sm text-muted-foreground ml-sm">
 ({activePercentage}%)
 </span>
 </div>
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-red-500 rounded-full" />
 <span className="text-sm">Inactive</span>
 </div>
 <div className="text-right">
 <span className="font-semibold">{stats.inactive}</span>
 <span className="text-sm text-muted-foreground ml-sm">
 ({stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}%)
 </span>
 </div>
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-yellow-500 rounded-full" />
 <span className="text-sm">Pending</span>
 </div>
 <div className="text-right">
 <span className="font-semibold">{stats.pending}</span>
 <span className="text-sm text-muted-foreground ml-sm">
 ({stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%)
 </span>
 </div>
 </div>

 {stats.suspended !== undefined && (
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-gray-500 rounded-full" />
 <span className="text-sm">Suspended</span>
 </div>
 <div className="text-right">
 <span className="font-semibold">{stats.suspended}</span>
 <span className="text-sm text-muted-foreground ml-sm">
 ({stats.total > 0 ? Math.round((stats.suspended / stats.total) * 100) : 0}%)
 </span>
 </div>
 </div>
 )}
 </div>
 </Card>

 {/* Department Distribution */}
 <Card className="p-lg">
 <h3 className="text-lg font-semibold mb-md">Department Distribution</h3>
 {stats.by_department ? (
 <div className="space-y-md">
 {Object.entries(stats.by_department)
 .sort(([,a], [,b]) => b - a)
 .slice(0, 6)
 .map(([department, count]) => (
 <div key={department} className="flex items-center justify-between">
 <span className="text-sm capitalize">{department.replace('_', ' ')}</span>
 <div className="flex items-center gap-sm">
 <div className="w-20 bg-muted rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full" 
 style={{ 
 width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` 
 }}
 />
 </div>
 <span className="font-semibold w-8 text-right">{count}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-lg text-muted-foreground">
 <BarChart3 className="h-12 w-12 mx-auto mb-sm opacity-50" />
 <p>Department data not available</p>
 </div>
 )}
 </Card>
 </div>

 {/* Employment Type Distribution */}
 {stats.by_employment_type && (
 <Card className="p-lg">
 <h3 className="text-lg font-semibold mb-md">Employment Type Distribution</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
 {Object.entries(stats.by_employment_type).map(([type, count]) => (
 <div key={type} className="text-center">
 <p className="text-2xl font-bold">{count}</p>
 <p className="text-sm text-muted-foreground capitalize">
 {type.replace('_', ' ')}
 </p>
 <p className="text-xs text-muted-foreground">
 {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
 </p>
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>
 );
}
