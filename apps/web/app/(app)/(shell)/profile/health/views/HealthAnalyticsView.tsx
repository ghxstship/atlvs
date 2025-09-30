'use client';

import { Activity, TrendingUp, AlertTriangle, Clock, Shield, Calendar, BarChart3, PieChart, Heart, CheckCircle, User } from "lucide-react";
import { Card, Badge, Progress } from '@ghxstship/ui';
import type { HealthStats, HealthAnalytics } from '../types';
import {
 RECORD_TYPE_LABELS,
 SEVERITY_LABELS,
 CATEGORY_LABELS,
 formatDate,
 formatDateShort,
 getDaysUntilExpiry,
 getRecordTypeIcon,
} from '../types';

interface HealthAnalyticsViewProps {
 stats: HealthStats;
 analytics: HealthAnalytics;
 loading: boolean;
 analyticsLoading: boolean;
}

export default function HealthAnalyticsView({
 stats,
 analytics,
 loading,
 analyticsLoading,
}: HealthAnalyticsViewProps) {
 if (loading || analyticsLoading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {[...Array(8)].map((_, i) => (
 <Card key={i} className="p-6">
 <div className="space-y-3">
 <div className="h-4 w-24 bg-muted animate-pulse rounded" />
 <div className="h-8 w-16 bg-muted animate-pulse rounded" />
 <div className="h-2 w-full bg-muted animate-pulse rounded" />
 </div>
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Records</p>
 <p className="text-3xl font-bold mt-1">{stats.totalRecords}</p>
 </div>
 <Activity className="h-8 w-8 text-primary opacity-20" />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Active Records</p>
 <p className="text-3xl font-bold mt-1">{stats.activeRecords}</p>
 <p className="text-xs text-muted-foreground mt-1">
 {stats.totalRecords > 0 
 ? `${Math.round((stats.activeRecords / stats.totalRecords) * 100)}%`
 : '0%'}
 </p>
 </div>
 <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Expiring Soon</p>
 <p className="text-3xl font-bold mt-1">{stats.expiringRecords}</p>
 <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
 </div>
 <Clock className="h-8 w-8 text-orange-500 opacity-20" />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Critical</p>
 <p className="text-3xl font-bold mt-1">{stats.criticalRecords}</p>
 <p className="text-xs text-muted-foreground mt-1">High priority</p>
 </div>
 <AlertTriangle className="h-8 w-8 text-red-500 opacity-20" />
 </div>
 </Card>
 </div>

 {/* Health Scores */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Health Score</h3>
 <Heart className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-2xl font-bold">{analytics.healthScore}%</span>
 <Badge variant={analytics.healthScore >= 80 ? 'default' : analytics.healthScore >= 60 ? 'secondary' : 'destructive'}>
 {analytics.healthScore >= 80 ? 'Excellent' : analytics.healthScore >= 60 ? 'Good' : 'Needs Attention'}
 </Badge>
 </div>
 <Progress value={analytics.healthScore} className="h-2" />
 <p className="text-sm text-muted-foreground">
 Based on record completeness and recency
 </p>
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Completeness Score</h3>
 <Shield className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-2xl font-bold">{analytics.completenessScore}%</span>
 <Badge variant={analytics.completenessScore >= 80 ? 'default' : 'secondary'}>
 {analytics.completenessScore >= 80 ? 'Complete' : 'Incomplete'}
 </Badge>
 </div>
 <Progress value={analytics.completenessScore} className="h-2" />
 <p className="text-sm text-muted-foreground">
 Percentage of fields filled across all records
 </p>
 </div>
 </Card>
 </div>

 {/* Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Record Type Distribution */}
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Record Types</h3>
 <PieChart className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 {stats.byType.map(({ type, count }) => {
 const percentage = stats.totalRecords > 0 
 ? (count / stats.totalRecords) * 100 
 : 0;
 
 return (
 <div key={type} className="space-y-1">
 <div className="flex items-center justify-between text-sm">
 <span className="flex items-center gap-2">
 <span>{getRecordTypeIcon(type)}</span>
 {RECORD_TYPE_LABELS[type]}
 </span>
 <span className="font-medium">{count}</span>
 </div>
 <Progress value={percentage} className="h-2" />
 </div>
 );
 })}
 </div>
 </Card>

 {/* Severity Distribution */}
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Severity Levels</h3>
 <BarChart3 className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 {stats.bySeverity.map(({ severity, count }) => {
 const percentage = stats.totalRecords > 0 
 ? (count / stats.totalRecords) * 100 
 : 0;
 
 return (
 <div key={severity} className="space-y-1">
 <div className="flex items-center justify-between text-sm">
 <span>{SEVERITY_LABELS[severity]}</span>
 <span className="font-medium">{count}</span>
 </div>
 <Progress value={percentage} className="h-2" />
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Expiry Alerts */}
 {analytics.expiryAlerts.length > 0 && (
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Expiry Alerts</h3>
 <AlertTriangle className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 {analytics.expiryAlerts.slice(0, 10).map(({ record, daysUntilExpiry, urgency }) => (
 <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
 <div className="flex items-center gap-3">
 <span className="text-lg">{getRecordTypeIcon(record.record_type)}</span>
 <div>
 <p className="font-medium">{record.title}</p>
 <p className="text-sm text-muted-foreground">
 {RECORD_TYPE_LABELS[record.record_type]}
 {record.provider && ` • ${record.provider}`}
 </p>
 </div>
 </div>
 <div className="text-right">
 <Badge 
 variant={urgency === 'critical' ? 'destructive' : urgency === 'high' ? 'secondary' : 'outline'}
 >
 {daysUntilExpiry < 0 
 ? `Expired ${Math.abs(daysUntilExpiry)}d ago`
 : daysUntilExpiry === 0
 ? 'Expires today'
 : `${daysUntilExpiry}d left`
 }
 </Badge>
 <p className="text-xs text-muted-foreground mt-1">
 {formatDateShort(record.expiry_date!)}
 </p>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Trends */}
 {analytics.recordTrends.length > 0 && (
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Record Trends</h3>
 <TrendingUp className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-2">
 {analytics.recordTrends.map(({ month, count, byType }) => (
 <div key={month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <div className="flex items-center gap-4">
 <Calendar className="h-4 w-4 text-muted-foreground" />
 <span className="font-medium">
 {new Date(month + '-01').toLocaleDateString('en-US', { 
 year: 'numeric', 
 month: 'long' 
 })}
 </span>
 </div>
 <div className="flex items-center gap-4">
 <Badge variant="secondary">{count} records</Badge>
 <div className="flex gap-1">
 {Object.entries(byType).slice(0, 3).map(([type, typeCount]) => (
 <span key={type} className="text-xs" title={`${typeCount} ${RECORD_TYPE_LABELS[type as keyof typeof RECORD_TYPE_LABELS] || type}`}>
 {getRecordTypeIcon(type as keyof typeof RECORD_TYPE_LABELS)}
 </span>
 ))}
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Provider Distribution */}
 {analytics.providerDistribution.length > 0 && (
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Top Healthcare Providers</h3>
 <User className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 {analytics.providerDistribution.map(({ provider, count }) => (
 <div key={provider} className="flex items-center justify-between p-3 border rounded-lg">
 <span className="font-medium">{provider}</span>
 <Badge variant="outline">{count} records</Badge>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Tag Cloud */}
 {analytics.tagCloud.length > 0 && (
 <Card className="p-6">
 <h3 className="font-semibold mb-4">Common Tags</h3>
 <div className="flex flex-wrap gap-2">
 {analytics.tagCloud.map(({ tag, frequency, weight }) => {
 const size = weight > 75 ? 'text-lg' : weight > 50 ? 'text-base' : weight > 25 ? 'text-sm' : 'text-xs';
 const opacity = weight > 75 ? 'opacity-100' : weight > 50 ? 'opacity-80' : weight > 25 ? 'opacity-60' : 'opacity-40';
 
 return (
 <Badge
 key={tag}
 variant="secondary"
 className={`${size} ${opacity} hover:opacity-100 transition-opacity`}
 >
 {tag} ({frequency})
 </Badge>
 );
 })}
 </div>
 </Card>
 )}

 {/* Recent Activity */}
 {analytics.recentActivity.length > 0 && (
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Recent Activity</h3>
 <Activity className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 {analytics.recentActivity.slice(0, 5).map((record) => (
 <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
 <div className="flex items-center gap-3">
 <span className="text-lg">{getRecordTypeIcon(record.record_type)}</span>
 <div>
 <p className="font-medium">{record.title}</p>
 <p className="text-sm text-muted-foreground">
 {RECORD_TYPE_LABELS[record.record_type]}
 {record.provider && ` • ${record.provider}`}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-sm font-medium">{formatDateShort(record.date_recorded)}</p>
 <p className="text-xs text-muted-foreground">
 {record.updated_at !== record.created_at ? 'Updated' : 'Created'}
 </p>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Category Breakdown */}
 {analytics.categoryBreakdown.length > 0 && (
 <Card className="p-6">
 <h3 className="font-semibold mb-4">Category Breakdown</h3>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {analytics.categoryBreakdown.map(({ category, percentage }) => (
 <div key={category} className="text-center p-4 bg-muted/50 rounded-lg">
 <p className="text-2xl font-bold">{percentage}%</p>
 <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[category]}</p>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Upcoming Reminders */}
 {stats.upcomingReminders.length > 0 && (
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Upcoming Reminders</h3>
 <Clock className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 {stats.upcomingReminders.map(({ record, daysUntilExpiry }) => (
 <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
 <div className="flex items-center gap-3">
 <span className="text-lg">{getRecordTypeIcon(record.record_type)}</span>
 <div>
 <p className="font-medium">{record.title}</p>
 <p className="text-sm text-muted-foreground">
 Reminder set for {record.reminder_days_before} days before expiry
 </p>
 </div>
 </div>
 <Badge variant="outline">
 {daysUntilExpiry} days left
 </Badge>
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>
 );
}
