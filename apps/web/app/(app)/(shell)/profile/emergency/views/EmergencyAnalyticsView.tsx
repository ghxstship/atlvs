'use client';

import { ShieldAlert, ShieldCheck, Users, Activity, Clock, TrendingUp, PhoneCall } from "lucide-react";
import { Card, Badge, Progress } from '@ghxstship/ui';
import type { EmergencyContactStats, EmergencyContactAnalytics } from '../types';

interface EmergencyAnalyticsViewProps {
 stats: EmergencyContactStats;
 analytics: EmergencyContactAnalytics;
 loading: boolean;
 analyticsLoading: boolean;
}

export default function EmergencyAnalyticsView({
 stats,
 analytics,
 loading,
 analyticsLoading
}: EmergencyAnalyticsViewProps) {
 if (loading || analyticsLoading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
 {Array.from({ length: 6 }).map((_, index) => (
 <Card key={index} className="p-lg animate-pulse space-y-md">
 <div className="h-icon-xs w-1/3 bg-muted rounded" />
 <div className="h-icon-xl w-full bg-muted rounded" />
 <div className="h-icon-xs w-1/2 bg-muted rounded" />
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md">
 <Card className="p-lg space-y-xs">
 <div className="flex items-center justify-between">
 <p className="text-sm text-muted-foreground">Total Contacts</p>
 <Users className="h-icon-sm w-icon-sm text-primary" />
 </div>
 <p className="text-3xl font-semibold">{stats.totalContacts}</p>
 <p className="text-xs text-muted-foreground">All active emergency contacts</p>
 </Card>

 <Card className="p-lg space-y-sm">
 <div className="flex items-center justify-between">
 <p className="text-sm text-muted-foreground">Verification Rate</p>
 <ShieldCheck className="h-icon-sm w-icon-sm text-success" />
 </div>
 <p className="text-3xl font-semibold">{analytics.verificationRate}%</p>
 <Progress value={analytics.verificationRate} />
 <p className="text-xs text-muted-foreground">
 {stats.verifiedContacts} verified / {stats.totalContacts} total
 </p>
 </Card>

 <Card className="p-lg space-y-sm">
 <div className="flex items-center justify-between">
 <p className="text-sm text-muted-foreground">Primary Coverage</p>
 <ShieldAlert className="h-icon-sm w-icon-sm text-warning" />
 </div>
 <p className="text-3xl font-semibold">{analytics.primaryCoverage}%</p>
 <Progress value={analytics.primaryCoverage} />
 <p className="text-xs text-muted-foreground">
 {stats.primaryContacts} primary contacts available
 </p>
 </Card>

 <Card className="p-lg space-y-sm">
 <div className="flex items-center justify-between">
 <p className="text-sm text-muted-foreground">Average Response Time</p>
 <Clock className="h-icon-sm w-icon-sm text-primary" />
 </div>
 <p className="text-3xl font-semibold">{analytics.averageResponseTime}m</p>
 <p className="text-xs text-muted-foreground">Minutes to respond on average</p>
 </Card>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
 <Card className="p-lg space-y-md">
 <div className="flex items-center gap-xs">
 <TrendingUp className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
 Priority Distribution
 </h3>
 </div>
 <div className="space-y-sm">
 {stats.byPriority.map(priority => (
 <div key={priority.priority} className="space-y-xs">
 <div className="flex justify-between text-sm">
 <span className="capitalize">{priority.priority}</span>
 <Badge variant={priority.priority === 'critical' ? 'destructive' : 'secondary'}>
 {priority.count} contacts
 </Badge>
 </div>
 <Progress value={Number(priority.percentage.toFixed(1))} />
 </div>
 ))}
 </div>
 </Card>

 <Card className="p-lg space-y-md">
 <div className="flex items-center gap-xs">
 <PhoneCall className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
 Availability Coverage
 </h3>
 </div>
 <div className="space-y-sm">
 {stats.availabilityBreakdown.map(item => (
 <div key={item.availability} className="space-y-xs">
 <div className="flex justify-between text-sm">
 <span className="capitalize">{item.availability.replace('_', ' ')}</span>
 <Badge variant="outline">{item.count}</Badge>
 </div>
 <Progress value={Number(item.percentage.toFixed(1))} />
 </div>
 ))}
 </div>
 </Card>
 </div>

 <Card className="p-lg space-y-md">
 <div className="flex items-center gap-xs">
 <Activity className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
 Recent Updates (30 days)
 </h3>
 </div>
 <div className="space-y-xs">
 {analytics.recentUpdates.length === 0 ? (
 <p className="text-sm text-muted-foreground">No recent activity recorded.</p>
 ) : (
 analytics.recentUpdates.slice(-12).map(update => (
 <div key={update.date} className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">
 {new Date(update.date).toLocaleDateString()}
 </span>
 <div className="flex items-center gap-sm">
 <Badge variant="secondary">{update.updates} updates</Badge>
 <Badge variant="outline">{update.verifications} verifications</Badge>
 </div>
 </div>
 ))
 )}
 </div>
 </Card>
 </div>
 );
}
