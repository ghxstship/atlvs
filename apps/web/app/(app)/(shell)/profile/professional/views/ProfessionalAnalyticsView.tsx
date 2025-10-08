'use client';

import { TrendingUp, Users, Award, Building, BarChart3, PieChart, Calendar, Target } from "lucide-react";
import React from 'react';
import {
 Card,
 Badge
} from '@ghxstship/ui';
import type { ProfessionalStats, ProfessionalAnalytics } from '../types';
import { EMPLOYMENT_TYPE_LABELS, PROFILE_STATUS_LABELS } from '../types';

interface ProfessionalAnalyticsViewProps {
 stats: ProfessionalStats;
 analytics: ProfessionalAnalytics;
 loading?: boolean;
}

export default function ProfessionalAnalyticsView({
 stats,
 analytics,
 loading = false
}: ProfessionalAnalyticsViewProps) {
 if (loading) {
 return (
 <div className="space-y-lg">
 {[...Array(4)].map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="animate-pulse space-y-md">
 <div className="h-icon-xs bg-muted rounded w-1/4"></div>
 <div className="h-component-xl bg-muted rounded"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground">Total Profiles</p>
 <p className="text-3xl font-bold">{stats.totalProfiles}</p>
 </div>
 <div className="h-icon-2xl w-icon-2xl bg-blue-100 rounded-lg flex items-center justify-center">
 <Users className="h-icon-md w-icon-md text-blue-600" />
 </div>
 </div>
 <div className="mt-4 flex items-center text-sm">
 <span className="text-green-600">
 {stats.activeProfiles} active
 </span>
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
 <p className="text-3xl font-bold">{stats.averageCompletion.toFixed(1)}%</p>
 </div>
 <div className="h-icon-2xl w-icon-2xl bg-green-100 rounded-lg flex items-center justify-center">
 <Target className="h-icon-md w-icon-md text-green-600" />
 </div>
 </div>
 <div className="mt-4">
 <div className="w-full bg-muted rounded-full h-2">
 <div 
 className="bg-green-500 h-2 rounded-full" 
 style={{ width: `${stats.averageCompletion}%` }}
 ></div>
 </div>
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground">Departments</p>
 <p className="text-3xl font-bold">{stats.byDepartment.length}</p>
 </div>
 <div className="h-icon-2xl w-icon-2xl bg-purple-100 rounded-lg flex items-center justify-center">
 <Building className="h-icon-md w-icon-md text-purple-600" />
 </div>
 </div>
 <div className="mt-4 text-sm text-muted-foreground">
 Across organization
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground">Top Skills</p>
 <p className="text-3xl font-bold">{stats.topSkills.length}</p>
 </div>
 <div className="h-icon-2xl w-icon-2xl bg-orange-100 rounded-lg flex items-center justify-center">
 <Award className="h-icon-md w-icon-md text-orange-600" />
 </div>
 </div>
 <div className="mt-4 text-sm text-muted-foreground">
 Unique skills tracked
 </div>
 </Card>
 </div>

 {/* Profile Trends */}
 {analytics.profileTrends.length > 0 && (
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <Calendar className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Profile Trends</h3>
 </div>
 <div className="space-y-md">
 {analytics.profileTrends.map((trend) => (
 <div key={trend.period} className="flex items-center justify-between p-md bg-muted/50 rounded-lg">
 <div>
 <div className="font-medium">{trend.period}</div>
 <div className="text-sm text-muted-foreground">
 {trend.totalProfiles} total • {trend.activeProfiles} active
 </div>
 </div>
 <div className="text-right">
 <div className="text-2xl font-bold text-primary">
 {trend.averageCompletion.toFixed(1)}%
 </div>
 <div className="text-sm text-muted-foreground">avg completion</div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Employment Type & Status Distribution */}
 <div className="grid md:grid-cols-2 gap-lg">
 {/* Employment Type Distribution */}
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <PieChart className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Employment Types</h3>
 </div>
 <div className="space-y-sm">
 {analytics.employmentTypeDistribution.map((item) => (
 <div key={item.type} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 bg-primary rounded-full"></div>
 <span className="font-medium">{EMPLOYMENT_TYPE_LABELS[item.type]}</span>
 </div>
 <div className="text-right">
 <div className="font-semibold">{item.count}</div>
 <div className="text-sm text-muted-foreground">
 {item.percentage.toFixed(1)}%
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Status Distribution */}
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <BarChart3 className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Profile Status</h3>
 </div>
 <div className="space-y-sm">
 {stats.byStatus.map((item) => (
 <div key={item.status} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Badge variant="outline">{PROFILE_STATUS_LABELS[item.status]}</Badge>
 </div>
 <div className="font-semibold">{item.count}</div>
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Completion Distribution */}
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <Target className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Profile Completion Distribution</h3>
 </div>
 <div className="space-y-sm">
 {stats.completionDistribution.map((item) => (
 <div key={item.range} className="flex items-center gap-md">
 <div className="w-component-lg text-sm font-medium">{item.range}</div>
 <div className="flex-1 bg-muted rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full" 
 style={{ 
 width: `${stats.totalProfiles > 0 ? (item.count / stats.totalProfiles) * 100 : 0}%` 
 }}
 ></div>
 </div>
 <div className="w-icon-2xl text-right font-medium">{item.count}</div>
 </div>
 ))}
 </div>
 </Card>

 {/* Department Breakdown */}
 {analytics.departmentBreakdown.length > 0 && (
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <Building className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Department Breakdown</h3>
 </div>
 <div className="grid md:grid-cols-2 gap-md">
 {analytics.departmentBreakdown.map((dept) => (
 <div key={dept.department} className="p-md bg-muted/50 rounded-lg">
 <div className="flex items-center justify-between mb-2">
 <h4 className="font-medium">{dept.department}</h4>
 <div className="text-2xl font-bold text-primary">
 {dept.totalEmployees}
 </div>
 </div>
 <div className="text-sm text-muted-foreground mb-3">
 {dept.averageCompletion.toFixed(1)}% avg completion
 </div>
 <div className="flex flex-wrap gap-xs">
 {dept.topSkills.slice(0, 3).map((skill) => (
 <Badge key={skill} variant="outline" className="text-xs">
 {skill}
 </Badge>
 ))}
 {dept.topSkills.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{dept.topSkills.length - 3}
 </Badge>
 )}
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Top Skills */}
 {analytics.skillAnalytics.length > 0 && (
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <Award className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Top Skills Across Organization</h3>
 </div>
 <div className="grid md:grid-cols-2 gap-md">
 {analytics.skillAnalytics.slice(0, 10).map((skill, index) => (
 <div key={skill.skill} className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
 <div className="flex items-center gap-sm">
 <div className="w-icon-md h-icon-md bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
 {index + 1}
 </div>
 <div>
 <div className="font-medium">{skill.skill}</div>
 <div className="text-xs text-muted-foreground">
 {skill.departments.length} dept{skill.departments.length !== 1 ? 's' : ''}
 </div>
 </div>
 </div>
 <Badge variant="outline">{skill.frequency}</Badge>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Hiring Trends */}
 {analytics.hiringTrends.length > 0 && (
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <TrendingUp className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Hiring Trends (Last 12 Months)</h3>
 </div>
 <div className="space-y-sm">
 {analytics.hiringTrends.map((trend) => (
 <div key={trend.month} className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
 <div className="font-medium">{trend.month}</div>
 <div className="flex items-center gap-md">
 <div className="text-center">
 <div className="text-lg font-bold text-green-600">{trend.hires}</div>
 <div className="text-xs text-muted-foreground">hires</div>
 </div>
 <div className="text-center">
 <div className="text-lg font-bold text-red-600">{trend.departures}</div>
 <div className="text-xs text-muted-foreground">departures</div>
 </div>
 <div className="text-center">
 <div className={`text-lg font-bold ${trend.netGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
 {trend.netGrowth >= 0 ? '+' : ''}{trend.netGrowth}
 </div>
 <div className="text-xs text-muted-foreground">net</div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Completion Metrics Summary */}
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <Target className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Completion Metrics</h3>
 </div>
 <div className="grid md:grid-cols-4 gap-lg">
 <div className="text-center">
 <div className="text-3xl font-bold text-primary mb-2">
 {analytics.completionMetrics.averageCompletion.toFixed(1)}%
 </div>
 <div className="text-sm text-muted-foreground">Average Completion</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-green-600 mb-2">
 {analytics.completionMetrics.highCompletion}
 </div>
 <div className="text-sm text-muted-foreground">High Completion (&gt;80%)</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-yellow-600 mb-2">
 {analytics.completionMetrics.mediumCompletion}
 </div>
 <div className="text-sm text-muted-foreground">Medium Completion (50-80%)</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-red-600 mb-2">
 {analytics.completionMetrics.lowCompletion}
 </div>
 <div className="text-sm text-muted-foreground">Low Completion (&lt;50%)</div>
 </div>
 </div>
 </Card>
 </div>
 );
}
