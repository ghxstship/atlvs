'use client';

import { BarChart3, TrendingUp, Users, Award, Building, Globe } from "lucide-react";
import { Card, Skeleton } from '@ghxstship/ui';
import type { ProfileStats, ProfileAnalytics } from '../types';

interface ProfileAnalyticsViewProps {
 stats: ProfileStats;
 analytics: ProfileAnalytics;
 loading: boolean;
 analyticsLoading: boolean;
}

export default function ProfileAnalyticsView({
 stats,
 analytics,
 loading,
 analyticsLoading,
}: ProfileAnalyticsViewProps) {
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
 <h3 className="text-sm font-medium text-muted-foreground">Total Profiles</h3>
 <Users className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{stats.totalProfiles}</p>
 <p className="text-sm text-muted-foreground mt-1">All profiles</p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Active Profiles</h3>
 <TrendingUp className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{stats.activeProfiles}</p>
 <p className="text-sm text-green-600 mt-1">
 {stats.totalProfiles > 0 
 ? `${Math.round((stats.activeProfiles / stats.totalProfiles) * 100)}% of total`
 : 'No profiles'
 }
 </p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Avg Completion</h3>
 <BarChart3 className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{stats.averageCompletion}%</p>
 <p className="text-sm text-blue-600 mt-1">
 {stats.averageCompletion >= 80 ? 'Excellent' : 
 stats.averageCompletion >= 60 ? 'Good' : 'Needs improvement'}
 </p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Recent Updates</h3>
 <Award className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{stats.recentUpdates}</p>
 <p className="text-sm text-purple-600 mt-1">Last 7 days</p>
 </Card>
 </div>

 {/* Department Distribution */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
 <div className="space-y-4">
 {stats.departmentDistribution.slice(0, 8).map((item) => (
 <div key={item.department} className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded bg-primary/10">
 <Building className="h-4 w-4 text-primary" />
 </div>
 <span className="text-sm font-medium">{item.department}</span>
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
 ))}
 </div>
 </Card>

 {/* Profile Completion Distribution */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Profile Completion Distribution</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {stats.completionDistribution.map((item) => {
 const getColor = (range: string) => {
 if (range.includes('76-100')) return 'text-green-600 bg-green-50';
 if (range.includes('51-75')) return 'text-blue-600 bg-blue-50';
 if (range.includes('26-50')) return 'text-yellow-600 bg-yellow-50';
 return 'text-red-600 bg-red-50';
 };

 return (
 <div key={item.range} className={`text-center p-4 rounded-lg ${getColor(item.range)}`}>
 <div className="text-2xl font-bold">
 {item.count}
 </div>
 <div className="text-sm font-medium">{item.range}</div>
 <div className="text-xs opacity-75">
 {item.percentage.toFixed(1)}%
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Employment Type Distribution */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Employment Type Distribution</h3>
 <div className="space-y-3">
 {stats.employmentTypeDistribution.map((item) => (
 <div key={item.type} className="flex items-center justify-between">
 <span className="text-sm font-medium capitalize">{item.type}</span>
 <div className="flex items-center gap-2">
 <span className="text-sm text-muted-foreground">{item.count}</span>
 <div className="w-20 bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full transition-all"
 style={{ width: `${item.percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium w-10 text-right">
 {item.percentage.toFixed(1)}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Department Analytics */}
 {analytics.departmentStats.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Department Analytics</h3>
 <div className="space-y-4">
 {analytics.departmentStats.map((dept) => (
 <div key={dept.department} className="p-4 border rounded-lg">
 <div className="flex items-center justify-between mb-2">
 <h4 className="font-medium">{dept.department}</h4>
 <div className="flex items-center gap-4 text-sm text-muted-foreground">
 <span>{dept.totalProfiles} profiles</span>
 <span>{dept.activeProfiles} active</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-sm">Avg Completion:</span>
 <div className="flex-1 bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full transition-all"
 style={{ width: `${dept.averageCompletion}%` }}
 />
 </div>
 <span className="text-sm font-medium">{dept.averageCompletion}%</span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Skills Analysis */}
 {analytics.skillsAnalysis.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Top Skills</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {analytics.skillsAnalysis.slice(0, 10).map((skill) => (
 <div key={skill.skill} className="flex items-center justify-between p-3 border rounded-lg">
 <div>
 <div className="font-medium text-sm">{skill.skill}</div>
 <div className="text-xs text-muted-foreground">
 {skill.departments.length} departments
 </div>
 </div>
 <div className="text-right">
 <div className="text-lg font-bold">{skill.count}</div>
 <div className="text-xs text-muted-foreground">people</div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Language Distribution */}
 {analytics.languageDistribution.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Language Distribution</h3>
 <div className="space-y-3">
 {analytics.languageDistribution.map((lang) => (
 <div key={lang.language} className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Globe className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm font-medium">{lang.language}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-sm text-muted-foreground">{lang.count}</span>
 <div className="w-20 bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full transition-all"
 style={{ width: `${lang.percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium w-10 text-right">
 {lang.percentage.toFixed(1)}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Completion Trends */}
 {analytics.completionTrends.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Profile Completion Trends</h3>
 <div className="space-y-2">
 {analytics.completionTrends.slice(-10).map((trend) => (
 <div key={trend.date} className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">
 {new Date(trend.date).toLocaleDateString()}
 </span>
 <div className="flex items-center gap-2">
 <span className="text-sm">{trend.profilesUpdated} updates</span>
 <div className="w-20 bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full transition-all"
 style={{ width: `${trend.averageCompletion}%` }}
 />
 </div>
 <span className="text-sm font-medium w-10 text-right">
 {Math.round(trend.averageCompletion)}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>
 );
}
