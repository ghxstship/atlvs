'use client';

import { TrendingUp, Globe, CreditCard, ShieldCheck, Plane, Calendar, Target, MapPin } from "lucide-react";
import {
 Card,
 Badge,
} from '@ghxstship/ui';
import type { TravelStats, TravelAnalytics } from '../types';
import { TRAVEL_TYPE_LABELS, TRAVEL_STATUS_LABELS, getStatusBadgeVariant } from '../types';

interface TravelAnalyticsViewProps {
 stats: TravelStats;
 analytics: TravelAnalytics;
 loading?: boolean;
}

export default function TravelAnalyticsView({
 stats,
 analytics,
 loading = false,
}: TravelAnalyticsViewProps) {
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
 <p className="text-sm font-medium text-muted-foreground">Total Trips</p>
 <p className="text-3xl font-bold">{stats.totalTrips}</p>
 </div>
 <div className="h-icon-2xl w-icon-2xl bg-blue-100 rounded-lg flex items-center justify-center">
 <Plane className="h-icon-md w-icon-md text-blue-600" />
 </div>
 </div>
 <div className="mt-4 flex items-center text-sm">
 <span className="text-green-600">
 {stats.completedTrips} completed
 </span>
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
 <p className="text-3xl font-bold">${stats.totalExpenses.toLocaleString()}</p>
 </div>
 <div className="h-icon-2xl w-icon-2xl bg-green-100 rounded-lg flex items-center justify-center">
 <CreditCard className="h-icon-md w-icon-md text-green-600" />
 </div>
 </div>
 <div className="mt-4 text-sm text-muted-foreground">
 Avg duration {stats.averageTripDuration.toFixed(1)} days
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground">Countries Visited</p>
 <p className="text-3xl font-bold">{stats.byCountry.length}</p>
 </div>
 <div className="h-icon-2xl w-icon-2xl bg-purple-100 rounded-lg flex items-center justify-center">
 <Globe className="h-icon-md w-icon-md text-purple-600" />
 </div>
 </div>
 <div className="mt-4 text-sm text-muted-foreground">
 Top destination {stats.topDestinations[0]?.destination ?? 'N/A'}
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground">Visa Compliance</p>
 <p className="text-3xl font-bold">{analytics.complianceMetrics.visaCompliance}%</p>
 </div>
 <div className="h-icon-2xl w-icon-2xl bg-orange-100 rounded-lg flex items-center justify-center">
 <ShieldCheck className="h-icon-md w-icon-md text-orange-600" />
 </div>
 </div>
 <div className="mt-4 text-sm text-muted-foreground">
 Documentation {analytics.complianceMetrics.documentationComplete}%
 </div>
 </Card>
 </div>

 {/* Travel Trends */}
 {analytics.travelTrends.length > 0 && (
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <TrendingUp className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Travel Trends</h3>
 </div>
 <div className="space-y-md">
 {analytics.travelTrends.map((trend) => (
 <div key={trend.period} className="flex items-center justify-between p-md bg-muted/50 rounded-lg">
 <div>
 <div className="font-medium">{trend.period}</div>
 <div className="text-sm text-muted-foreground">
 {trend.totalTrips} trips • ${trend.totalExpenses.toLocaleString()} total expenses
 </div>
 </div>
 <div className="text-right">
 <div className="text-sm text-muted-foreground">Business</div>
 <div className="text-lg font-semibold text-primary">
 {trend.businessTrips}
 </div>
 </div>
 <div className="text-right">
 <div className="text-sm text-muted-foreground">Personal</div>
 <div className="text-lg font-semibold text-secondary">
 {trend.personalTrips}
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Travel Type Distribution & Status */}
 <div className="grid md:grid-cols-2 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <Plane className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Travel Types</h3>
 </div>
 <div className="space-y-sm">
 {stats.byTravelType.map((item) => (
 <div key={item.type} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Badge variant="outline">{TRAVEL_TYPE_LABELS[item.type]}</Badge>
 </div>
 <div className="text-right">
 <div className="font-semibold">{item.count} trips</div>
 <div className="text-sm text-muted-foreground">
 ${item.totalExpenses.toLocaleString()} • {item.averageDuration.toFixed(1)} days avg
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <Target className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Trip Status</h3>
 </div>
 <div className="space-y-sm">
 {stats.byStatus.map((item) => (
 <div key={item.status} className="flex items-center justify-between">
 <Badge variant={getStatusBadgeVariant(item.status)}>
 {TRAVEL_STATUS_LABELS[item.status]}
 </Badge>
 <div className="font-semibold">{item.count}</div>
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Top Destinations */}
 {stats.topDestinations.length > 0 && (
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <MapPin className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Top Destinations</h3>
 </div>
 <div className="grid md:grid-cols-2 gap-md">
 {stats.topDestinations.slice(0, 10).map((dest, index) => (
 <div key={`${dest.destination}-${dest.country}`} className="flex items-center justify-between bg-muted/50 p-sm rounded-lg">
 <div className="flex items-center gap-sm">
 <div className="w-icon-md h-icon-md bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
 {index + 1}
 </div>
 <div>
 <div className="font-medium">{dest.destination}</div>
 <div className="text-xs text-muted-foreground">{dest.country}</div>
 </div>
 </div>
 <Badge variant="outline">${dest.totalExpenses.toLocaleString()}</Badge>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Visa Analytics */}
 {analytics.visaAnalytics.length > 0 && (
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <ShieldCheck className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Visa Analytics</h3>
 </div>
 <div className="space-y-sm">
 {analytics.visaAnalytics.slice(0, 10).map((visa) => (
 <div key={visa.country} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Globe className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="font-medium">{visa.country}</span>
 </div>
 <div className="flex items-center gap-md text-sm">
 <span className="text-muted-foreground">
 {visa.visaRequired ? 'Visa Required' : 'No Visa Required'}
 </span>
 <span className="font-semibold text-green-600">
 {visa.approvalRate.toFixed(0)}% approval
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Seasonal Patterns */}
 {analytics.seasonalPatterns.length > 0 && (
 <Card className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <Calendar className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-lg font-semibold">Seasonal Patterns</h3>
 </div>
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-md">
 {analytics.seasonalPatterns.map((pattern) => (
 <div key={pattern.month} className="bg-muted/50 p-md rounded-lg">
 <div className="font-medium text-primary mb-2">{pattern.month}</div>
 <div className="grid grid-cols-3 gap-xs text-center">
 <div>
 <div className="text-xs text-muted-foreground">Business</div>
 <div className="text-lg font-semibold">{pattern.businessTrips}</div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Personal</div>
 <div className="text-lg font-semibold">{pattern.personalTrips}</div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Avg $</div>
 <div className="text-lg font-semibold">{pattern.averageExpenses.toFixed(0)}</div>
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
