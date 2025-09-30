'use client';

import { BarChart3, TrendingUp, Activity, Clock, User, Calendar } from "lucide-react";
import { Card, Skeleton } from '@ghxstship/ui';
import type { ActivityStats, ActivityAnalytics } from '../types';
import { ACTIVITY_TYPE_CONFIG } from '../types';

interface ActivityAnalyticsViewProps {
 stats: ActivityStats;
 analytics: ActivityAnalytics;
 loading: boolean;
 analyticsLoading: boolean;
}

export default function ActivityAnalyticsView({
 stats,
 analytics,
 loading,
 analyticsLoading,
}: ActivityAnalyticsViewProps) {
 if (loading || analyticsLoading) {
 return (
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {Array.from({ length: 4 }).map((_, i) => (
 <Card key={i} className="p-6">
 <Skeleton className="h-4 w-24 mb-4" />
 <Skeleton className="h-8 w-16 mb-2" />
 <Skeleton className="h-3 w-20" />
 </Card>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Total Activities</h3>
 <Activity className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{stats.totalActivities}</p>
 <p className="text-sm text-muted-foreground mt-1">All time</p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Today</h3>
 <Calendar className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{stats.todayActivities}</p>
 <p className="text-sm text-green-600 mt-1">
 {stats.weekActivities > 0 
 ? `${Math.round((stats.todayActivities / stats.weekActivities) * 100)}% of week`
 : 'No weekly activity'
 }
 </p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">This Week</h3>
 <TrendingUp className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{stats.weekActivities}</p>
 <p className="text-sm text-blue-600 mt-1">
 {stats.monthActivities > 0 
 ? `${Math.round((stats.weekActivities / stats.monthActivities) * 100)}% of month`
 : 'No monthly activity'
 }
 </p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
 <BarChart3 className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{stats.monthActivities}</p>
 <p className="text-sm text-purple-600 mt-1">
 {stats.totalActivities > 0 
 ? `${Math.round((stats.monthActivities / stats.totalActivities) * 100)}% of total`
 : 'No total activity'
 }
 </p>
 </Card>
 </div>

 {/* Activity Type Distribution */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Activity Type Distribution</h3>
 <div className="space-y-4">
 {analytics.typeDistribution.slice(0, 8).map((item) => {
 const config = ACTIVITY_TYPE_CONFIG[item.type] || ACTIVITY_TYPE_CONFIG.profile_updated;
 return (
 <div key={item.type} className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded ${config.color}`}>
 <User className="h-3 w-3" />
 </div>
 <span className="text-sm font-medium">{config.label}</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-sm text-muted-foreground">{item.count}</span>
 <div className="w-24 bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full transition-all"
 style={{ width: `${item.percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium w-12 text-right">
 {item.percentage.toFixed(1)}%
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* User Engagement */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="text-center p-4 rounded-lg bg-muted/50">
 <div className="text-2xl font-bold text-blue-600">
 {stats.userEngagement.profileUpdates}
 </div>
 <div className="text-sm text-muted-foreground">Profile Updates</div>
 </div>
 
 <div className="text-center p-4 rounded-lg bg-muted/50">
 <div className="text-2xl font-bold text-green-600">
 {stats.userEngagement.certificationsAdded}
 </div>
 <div className="text-sm text-muted-foreground">Certifications Added</div>
 </div>
 
 <div className="text-center p-4 rounded-lg bg-muted/50">
 <div className="text-2xl font-bold text-purple-600">
 {stats.userEngagement.reviewsCompleted}
 </div>
 <div className="text-sm text-muted-foreground">Reviews Completed</div>
 </div>
 </div>
 
 {stats.userEngagement.lastActivity && (
 <div className="mt-4 p-3 bg-muted/50 rounded-lg">
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Clock className="h-4 w-4" />
 <span>Last activity: {new Date(stats.userEngagement.lastActivity).toLocaleString()}</span>
 </div>
 </div>
 )}
 </Card>

 {/* Activity Trends */}
 {stats.activityTrends.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Activity Trends (Last 30 Days)</h3>
 <div className="space-y-2">
 {stats.activityTrends.slice(-10).map((trend) => (
 <div key={trend.date} className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">
 {new Date(trend.date).toLocaleDateString()}
 </span>
 <div className="flex items-center gap-2">
 <div className="w-32 bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full transition-all"
 style={{ 
 width: `${Math.min(100, (trend.count / Math.max(...stats.activityTrends.map(t => t.count))) * 100)}%` 
 }}
 />
 </div>
 <span className="text-sm font-medium w-8 text-right">
 {trend.count}
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Time Patterns */}
 {analytics.timePatterns.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Activity by Time of Day</h3>
 <div className="grid grid-cols-12 gap-1">
 {analytics.timePatterns.map((pattern) => {
 const maxCount = Math.max(...analytics.timePatterns.map(p => p.count));
 const height = maxCount > 0 ? (pattern.count / maxCount) * 100 : 0;
 
 return (
 <div key={pattern.hour} className="flex flex-col items-center">
 <div className="h-20 w-full flex items-end">
 <div
 className="w-full bg-primary rounded-t transition-all"
 style={{ height: `${height}%` }}
 title={`${pattern.hour}:00 - ${pattern.count} activities`}
 />
 </div>
 <div className="text-xs text-muted-foreground mt-1">
 {pattern.hour}
 </div>
 </div>
 );
 })}
 </div>
 <div className="mt-2 text-xs text-muted-foreground text-center">
 Hours (24-hour format)
 </div>
 </Card>
 )}

 {/* Daily Activity Breakdown */}
 {analytics.dailyActivity.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Daily Activity Breakdown</h3>
 <div className="space-y-3">
 {analytics.dailyActivity.slice(-7).map((day) => (
 <div key={day.date} className="space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">
 {new Date(day.date).toLocaleDateString('en-US', { 
 weekday: 'short', 
 month: 'short', 
 day: 'numeric' 
 })}
 </span>
 <span className="text-sm text-muted-foreground">
 {day.count} activities
 </span>
 </div>
 
 <div className="flex gap-1 h-2">
 {Object.entries(day.types).map(([type, count]) => {
 const config = ACTIVITY_TYPE_CONFIG[type as keyof typeof ACTIVITY_TYPE_CONFIG] || ACTIVITY_TYPE_CONFIG.profile_updated;
 const width = day.count > 0 ? (count / day.count) * 100 : 0;
 
 return (
 <div
 key={type}
 className={`h-full rounded-sm ${config.color.replace('text-', 'bg-').replace('100', '500')}`}
 style={{ width: `${width}%` }}
 title={`${config.label}: ${count}`}
 />
 );
 })}
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>
 );
}
