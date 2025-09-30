'use client';

import { BarChart3, TrendingUp, Award, AlertTriangle, Clock, CheckCircle, Building, Calendar } from "lucide-react";
import { Card, Skeleton } from '@ghxstship/ui';
import type { CertificationStats, CertificationAnalytics } from '../types';

interface CertificationAnalyticsViewProps {
 stats: CertificationStats;
 analytics: CertificationAnalytics;
 loading: boolean;
 analyticsLoading: boolean;
}

export default function CertificationAnalyticsView({
 stats,
 analytics,
 loading,
 analyticsLoading,
}: CertificationAnalyticsViewProps) {
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
 <h3 className="text-sm font-medium text-muted-foreground">Total Certifications</h3>
 <Award className="h-4 w-4 text-muted-foreground" />
 </div>
 <p className="text-2xl font-bold">{stats.totalCertifications}</p>
 <p className="text-sm text-muted-foreground mt-1">All certifications</p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Active Certifications</h3>
 <CheckCircle className="h-4 w-4 text-green-500" />
 </div>
 <p className="text-2xl font-bold text-green-600">{stats.activeCertifications}</p>
 <p className="text-sm text-green-600 mt-1">
 {stats.totalCertifications > 0 
 ? `${Math.round((stats.activeCertifications / stats.totalCertifications) * 100)}% of total`
 : 'No certifications'
 }
 </p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Expiring Soon</h3>
 <Clock className="h-4 w-4 text-yellow-500" />
 </div>
 <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
 <p className="text-sm text-yellow-600 mt-1">
 Next 30 days
 </p>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium text-muted-foreground">Expired</h3>
 <AlertTriangle className="h-4 w-4 text-red-500" />
 </div>
 <p className="text-2xl font-bold text-red-600">{stats.expiredCertifications}</p>
 <p className="text-sm text-red-600 mt-1">
 Need renewal
 </p>
 </Card>
 </div>

 {/* Compliance Metrics */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Compliance Overview</h3>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="text-center p-4 rounded-lg bg-green-50">
 <div className="text-2xl font-bold text-green-600">
 {analytics.complianceMetrics.overallCompliance}%
 </div>
 <div className="text-sm text-green-700">Overall Compliance</div>
 </div>
 
 <div className="text-center p-4 rounded-lg bg-yellow-50">
 <div className="text-2xl font-bold text-yellow-600">
 {analytics.complianceMetrics.criticalCertifications}
 </div>
 <div className="text-sm text-yellow-700">Critical Expiring</div>
 </div>
 
 <div className="text-center p-4 rounded-lg bg-blue-50">
 <div className="text-2xl font-bold text-blue-600">
 {analytics.complianceMetrics.renewalRate}%
 </div>
 <div className="text-sm text-blue-700">Renewal Rate</div>
 </div>
 
 <div className="text-center p-4 rounded-lg bg-purple-50">
 <div className="text-2xl font-bold text-purple-600">
 {analytics.complianceMetrics.averageRenewalTime}
 </div>
 <div className="text-sm text-purple-700">Avg Renewal Days</div>
 </div>
 </div>
 </Card>

 {/* Organization Distribution */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Certifications by Organization</h3>
 <div className="space-y-4">
 {stats.organizationDistribution.slice(0, 8).map((item) => (
 <div key={item.organization} className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded bg-primary/10">
 <Building className="h-4 w-4 text-primary" />
 </div>
 <span className="text-sm font-medium">{item.organization}</span>
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

 {/* Status Distribution */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {stats.statusDistribution.map((item) => {
 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active': return 'text-green-600 bg-green-50';
 case 'expired': return 'text-red-600 bg-red-50';
 case 'suspended': return 'text-yellow-600 bg-yellow-50';
 case 'revoked': return 'text-gray-600 bg-gray-50';
 default: return 'text-blue-600 bg-blue-50';
 }
 };

 return (
 <div key={item.status} className={`text-center p-4 rounded-lg ${getStatusColor(item.status)}`}>
 <div className="text-2xl font-bold">
 {item.count}
 </div>
 <div className="text-sm font-medium capitalize">{item.status}</div>
 <div className="text-xs opacity-75">
 {item.percentage.toFixed(1)}%
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Expiry Trends */}
 {stats.expiryTrends.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Expiry Timeline (Next 12 Months)</h3>
 <div className="space-y-3">
 {stats.expiryTrends.slice(0, 12).map((trend) => (
 <div key={trend.month} className="flex items-center justify-between">
 <span className="text-sm font-medium w-20">
 {trend.month}
 </span>
 <div className="flex-1 mx-4">
 <div className="flex items-center gap-2">
 <div className="flex-1 bg-muted rounded-full h-2">
 <div
 className="bg-yellow-500 h-2 rounded-full transition-all"
 style={{ 
 width: `${Math.min(100, (trend.expiring / Math.max(1, Math.max(...stats.expiryTrends.map(t => t.expiring)))) * 100)}%` 
 }}
 />
 </div>
 <span className="text-sm text-muted-foreground w-8 text-right">
 {trend.expiring}
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Organization Analysis */}
 {analytics.organizationAnalysis.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Organization Performance</h3>
 <div className="space-y-4">
 {analytics.organizationAnalysis.slice(0, 5).map((org) => (
 <div key={org.organization} className="p-4 border rounded-lg">
 <div className="flex items-center justify-between mb-2">
 <h4 className="font-medium">{org.organization}</h4>
 <div className="flex items-center gap-4 text-sm text-muted-foreground">
 <span>{org.totalCertifications} total</span>
 <span>{org.activeCertifications} active</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-sm">Avg Validity:</span>
 <span className="text-sm font-medium">{org.averageValidityPeriod} days</span>
 <div className="flex-1 bg-muted rounded-full h-2 ml-2">
 <div
 className="bg-primary h-2 rounded-full transition-all"
 style={{ 
 width: `${Math.min(100, (org.averageValidityPeriod / 1095) * 100)}%` // 3 years max
 }}
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Expiry Analysis */}
 {analytics.expiryAnalysis.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Expiry Analysis</h3>
 <div className="space-y-3">
 {analytics.expiryAnalysis.map((analysis) => (
 <div key={analysis.timeframe} className="flex items-center justify-between">
 <span className="text-sm font-medium">{analysis.timeframe}</span>
 <div className="flex items-center gap-2">
 <span className="text-sm text-muted-foreground">{analysis.count}</span>
 <div className="w-20 bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full transition-all"
 style={{ width: `${analysis.percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium w-10 text-right">
 {analysis.percentage.toFixed(1)}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Recent Activity */}
 {stats.recentActivity.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Recent Activity (Last 30 Days)</h3>
 <div className="space-y-2">
 {stats.recentActivity.slice(-10).map((activity) => (
 <div key={activity.date} className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">
 {new Date(activity.date).toLocaleDateString()}
 </span>
 <div className="flex items-center gap-4 text-sm">
 {activity.added > 0 && (
 <span className="text-green-600">+{activity.added} added</span>
 )}
 {activity.renewed > 0 && (
 <span className="text-blue-600">{activity.renewed} renewed</span>
 )}
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Certification Trends */}
 {analytics.certificationTrends.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Certification Trends</h3>
 <div className="space-y-2">
 {analytics.certificationTrends.slice(-15).map((trend) => (
 <div key={trend.date} className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">
 {new Date(trend.date).toLocaleDateString()}
 </span>
 <div className="flex items-center gap-4 text-sm">
 {trend.newCertifications > 0 && (
 <span className="text-green-600">{trend.newCertifications} new</span>
 )}
 {trend.renewals > 0 && (
 <span className="text-blue-600">{trend.renewals} renewals</span>
 )}
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>
 );
}
