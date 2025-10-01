'use client';

import { BarChart3, TrendingUp, Users, UserCheck, Award, Calendar, Building, Activity, RefreshCw } from "lucide-react";
import { useState, useEffect } from 'react';
import { Card, Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import type { 
 ProfileOverviewStats, 
 ProfileOverviewAnalytics,
 RecentActivity 
} from '../types';
import { createEmptyProfileOverviewStats, createEmptyProfileOverviewAnalytics } from '../types';

interface ProfileOverviewAnalyticsViewProps {
 stats: ProfileOverviewStats;
 analytics: ProfileOverviewAnalytics;
 recentActivity: RecentActivity[];
 loading?: boolean;
 onRefresh?: () => void;
 onPeriodChange?: (period: '7d' | '30d' | '90d' | '1y') => void;
}

export default function ProfileOverviewAnalyticsView({
 stats,
 analytics,
 recentActivity,
 loading = false,
 onRefresh,
 onPeriodChange,
}: ProfileOverviewAnalyticsViewProps) {
 const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

 const handlePeriodChange = (period: '7d' | '30d' | '90d' | '1y') => {
 setSelectedPeriod(period);
 onPeriodChange?.(period);
 };

 const getActivityIcon = (activityType: string) => {
 const icons = {
 profile_updated: Activity,
 certification_added: Award,
 certification_expired: Award,
 job_history_added: Building,
 emergency_contact_updated: Users,
 health_record_updated: UserCheck,
 travel_info_updated: Calendar,
 uniform_sizing_updated: Users,
 performance_review_completed: BarChart3,
 endorsement_received: TrendingUp,
 };
 
 const IconComponent = icons[activityType as keyof typeof icons] || Activity;
 return <IconComponent className="h-icon-xs w-icon-xs" />;
 };

 const getActivityColor = (activityType: string) => {
 const colors = {
 profile_updated: 'color-accent',
 certification_added: 'color-success',
 certification_expired: 'color-destructive',
 job_history_added: 'color-primary',
 emergency_contact_updated: 'color-warning',
 health_record_updated: 'color-info',
 travel_info_updated: 'color-secondary',
 uniform_sizing_updated: 'color-muted',
 performance_review_completed: 'color-accent',
 endorsement_received: 'color-success',
 };
 
 return colors[activityType as keyof typeof colors] || 'color-muted';
 };

 if (loading) {
 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="h-icon-lg w-container-xs bg-secondary rounded animate-pulse"></div>
 <div className="flex gap-sm">
 <div className="h-icon-xl w-component-xl bg-secondary rounded animate-pulse"></div>
 <div className="h-icon-xl w-icon-xl bg-secondary rounded animate-pulse"></div>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 {Array.from({ length: 4 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="h-icon-xs w-component-md bg-secondary rounded mb-md"></div>
 <div className="h-icon-lg w-icon-2xl bg-secondary rounded mb-sm"></div>
 <div className="h-3 w-component-lg bg-secondary rounded"></div>
 </Card>
 ))}
 </div>

 {/* Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg animate-pulse">
 <div className="h-icon-xs w-component-xl bg-secondary rounded mb-lg"></div>
 <div className="h-container-sm bg-secondary rounded"></div>
 </Card>
 <Card className="p-lg animate-pulse">
 <div className="h-icon-xs w-component-xl bg-secondary rounded mb-lg"></div>
 <div className="h-container-sm bg-secondary rounded"></div>
 </Card>
 </div>
 </div>
 );
 }

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <h2 className="text-heading-3">Profile Analytics</h2>
 <div className="flex items-center gap-sm">
 <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
 <SelectTrigger className="w-component-xl">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="7d">Last 7 days</SelectItem>
 <SelectItem value="30d">Last 30 days</SelectItem>
 <SelectItem value="90d">Last 90 days</SelectItem>
 <SelectItem value="1y">Last year</SelectItem>
 </SelectContent>
 </Select>
 
 {onRefresh && (
 <Button variant="outline" size="sm" onClick={onRefresh}>
 <RefreshCw className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 </div>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center gap-md mb-md">
 <div className="p-sm bg-accent/10 rounded-lg">
 <Users className="h-icon-sm w-icon-sm color-accent" />
 </div>
 <div>
 <div className="text-body-sm color-muted">Total Profiles</div>
 <div className="text-heading-3">{stats.totalProfiles}</div>
 </div>
 </div>
 <div className="text-body-sm color-muted">
 {stats.activeProfiles} active profiles
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center gap-md mb-md">
 <div className="p-sm bg-success/10 rounded-lg">
 <UserCheck className="h-icon-sm w-icon-sm color-success" />
 </div>
 <div>
 <div className="text-body-sm color-muted">Active Profiles</div>
 <div className="text-heading-3">{stats.activeProfiles}</div>
 </div>
 </div>
 <div className="text-body-sm color-muted">
 {stats.totalProfiles > 0 
 ? Math.round((stats.activeProfiles / stats.totalProfiles) * 100)
 : 0
 }% of total
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center gap-md mb-md">
 <div className="p-sm bg-warning/10 rounded-lg">
 <BarChart3 className="h-icon-sm w-icon-sm color-warning" />
 </div>
 <div>
 <div className="text-body-sm color-muted">Avg Completion</div>
 <div className="text-heading-3">{stats.averageCompletion}%</div>
 </div>
 </div>
 <div className="text-body-sm color-muted">
 Profile completion rate
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center gap-md mb-md">
 <div className="p-sm bg-info/10 rounded-lg">
 <Activity className="h-icon-sm w-icon-sm color-info" />
 </div>
 <div>
 <div className="text-body-sm color-muted">Recent Logins</div>
 <div className="text-heading-3">{stats.recentLogins}</div>
 </div>
 </div>
 <div className="text-body-sm color-muted">
 Last 7 days
 </div>
 </Card>
 </div>

 {/* Charts and Distributions */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {/* Department Distribution */}
 <Card className="p-lg">
 <h3 className="text-heading-4 mb-lg">Department Distribution</h3>
 <div className="stack-md">
 {stats.departmentDistribution.slice(0, 6).map((dept, index) => (
 <div key={dept.department} className="flex items-center justify-between">
 <div className="flex items-center gap-md">
 <div className={`
 h-3 w-3 rounded-full
 ${index === 0 ? 'bg-accent' : ''}
 ${index === 1 ? 'bg-success' : ''}
 ${index === 2 ? 'bg-warning' : ''}
 ${index === 3 ? 'bg-info' : ''}
 ${index === 4 ? 'bg-destructive' : ''}
 ${index >= 5 ? 'bg-secondary' : ''}
 `} />
 <span className="text-body-sm">{dept.department}</span>
 </div>
 <div className="flex items-center gap-md">
 <span className="text-body-sm font-medium">{dept.count}</span>
 <span className="text-body-sm color-muted">
 ({Math.round(dept.percentage)}%)
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Completion Distribution */}
 <Card className="p-lg">
 <h3 className="text-heading-4 mb-lg">Completion Distribution</h3>
 <div className="stack-md">
 {stats.completionDistribution.map((range, index) => (
 <div key={range.range} className="flex items-center justify-between">
 <div className="flex items-center gap-md">
 <div className={`
 h-3 w-3 rounded-full
 ${range.range === '76-100%' ? 'bg-success' : ''}
 ${range.range === '51-75%' ? 'bg-warning' : ''}
 ${range.range === '26-50%' ? 'bg-info' : ''}
 ${range.range === '0-25%' ? 'bg-destructive' : ''}
 `} />
 <span className="text-body-sm">{range.range}</span>
 </div>
 <div className="flex items-center gap-md">
 <span className="text-body-sm font-medium">{range.count}</span>
 <span className="text-body-sm color-muted">
 ({Math.round(range.percentage)}%)
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Status Distribution */}
 <Card className="p-lg">
 <h3 className="text-heading-4 mb-lg">Status Distribution</h3>
 <div className="stack-md">
 {stats.statusDistribution.map((status, index) => (
 <div key={status.status} className="flex items-center justify-between">
 <div className="flex items-center gap-md">
 <Badge 
 variant={
 status.status === 'active' ? 'success' :
 status.status === 'inactive' ? 'secondary' :
 status.status === 'pending' ? 'warning' :
 'destructive'
 } 
 size="sm"
 >
 {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
 </Badge>
 </div>
 <div className="flex items-center gap-md">
 <span className="text-body-sm font-medium">{status.count}</span>
 <span className="text-body-sm color-muted">
 ({Math.round(status.percentage)}%)
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Department Stats */}
 <Card className="p-lg">
 <h3 className="text-heading-4 mb-lg">Department Performance</h3>
 <div className="stack-md">
 {analytics.departmentStats.slice(0, 5).map((dept) => (
 <div key={dept.department} className="p-md bg-secondary/30 rounded-lg">
 <div className="flex items-center justify-between mb-sm">
 <span className="text-body-sm font-medium">{dept.department}</span>
 <span className="text-body-sm color-muted">
 {dept.totalProfiles} profiles
 </span>
 </div>
 <div className="flex items-center justify-between text-body-sm">
 <span>Avg Completion: {dept.averageCompletion}%</span>
 <span>Active: {dept.activeProfiles}</span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Recent Activity */}
 <Card className="p-lg">
 <h3 className="text-heading-4 mb-lg">Recent Activity</h3>
 {recentActivity.length > 0 ? (
 <div className="stack-md">
 {recentActivity.slice(0, 10).map((activity) => (
 <div key={activity.id} className="flex items-center gap-md p-md bg-secondary/30 rounded-lg">
 <div className={`p-sm rounded-lg bg-secondary ${getActivityColor(activity.activity_type)}`}>
 {getActivityIcon(activity.activity_type)}
 </div>
 <div className="flex-1">
 <div className="text-body-sm font-medium">
 {activity.activity_description}
 </div>
 <div className="text-body-sm color-muted">
 {activity.user_name} • {new Date(activity.created_at).toLocaleString()}
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-lg color-muted">
 <Activity className="h-icon-lg w-icon-lg mx-auto mb-md opacity-50" />
 <p>No recent activity</p>
 </div>
 )}
 </Card>

 {/* Certification Stats */}
 {analytics.certificationStats.length > 0 && (
 <Card className="p-lg">
 <h3 className="text-heading-4 mb-lg">Certification Statistics</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
 {analytics.certificationStats.map((cert) => (
 <div key={cert.department} className="p-md bg-secondary/30 rounded-lg">
 <h4 className="text-body-sm font-medium mb-md">{cert.department}</h4>
 <div className="stack-sm text-body-sm">
 <div className="flex justify-between">
 <span>Total Certifications:</span>
 <span className="font-medium">{cert.totalCertifications}</span>
 </div>
 <div className="flex justify-between">
 <span>Average per Person:</span>
 <span className="font-medium">{cert.averageCertifications}</span>
 </div>
 <div className="flex justify-between">
 <span>Expiring Soon:</span>
 <span className="font-medium color-warning">{cert.expiringCertifications}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>
 );
}
