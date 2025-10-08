'use client';

import { Users, ShieldCheck, AlertTriangle, Phone, MapPin, TrendingUp, Activity } from "lucide-react";
import { Card, Badge, Progress } from '@ghxstship/ui';
import type { ContactStats, ContactAnalytics } from '../types';

interface ContactAnalyticsViewProps {
 stats: ContactStats;
 analytics: ContactAnalytics;
 loading: boolean;
 analyticsLoading: boolean;
}

export default function ContactAnalyticsView({
 stats,
 analytics,
 loading,
 analyticsLoading
}: ContactAnalyticsViewProps) {
 if (loading || analyticsLoading) {
 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {Array.from({ length: 4 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse space-y-md">
 <div className="h-icon-xs bg-muted rounded w-1/3"></div>
 <div className="h-icon-xl bg-muted rounded"></div>
 <div className="h-icon-xs bg-muted rounded w-1/2"></div>
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <h3 className="text-sm text-muted-foreground">Total Contacts</h3>
 <Users className="h-icon-sm w-icon-sm text-primary" />
 </div>
 <div className="text-3xl font-semibold mt-2">{stats.totalContacts}</div>
 <p className="text-xs text-muted-foreground mt-1">All contacts in organization</p>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <h3 className="text-sm text-muted-foreground">Verification Rate</h3>
 <ShieldCheck className="h-icon-sm w-icon-sm text-primary" />
 </div>
 <div className="text-3xl font-semibold mt-2">{analytics.verificationRate}%</div>
 <Progress value={analytics.verificationRate} className="mt-3" />
 <p className="text-xs text-muted-foreground mt-1">
 {stats.verifiedContacts} verified / {stats.totalContacts} total
 </p>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <h3 className="text-sm text-muted-foreground">Emergency Coverage</h3>
 <AlertTriangle className="h-icon-sm w-icon-sm text-primary" />
 </div>
 <div className="text-3xl font-semibold mt-2">{analytics.emergencyContactCoverage}%</div>
 <Progress value={analytics.emergencyContactCoverage} className="mt-3" />
 <p className="text-xs text-muted-foreground mt-1">
 {stats.withEmergencyContact} contacts with emergency details
 </p>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <h3 className="text-sm text-muted-foreground">Contact Completeness</h3>
 <TrendingUp className="h-icon-sm w-icon-sm text-primary" />
 </div>
 <div className="text-3xl font-semibold mt-2">{analytics.contactCompleteness}%</div>
 <Progress value={analytics.contactCompleteness} className="mt-3" />
 <p className="text-xs text-muted-foreground mt-1">
 Average profile completeness score
 </p>
 </Card>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg space-y-md">
 <div className="flex items-center gap-xs">
 <Phone className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-semibold">Preferred Contact Methods</h3>
 </div>
 <div className="space-y-sm">
 {stats.contactMethodDistribution.length === 0 ? (
 <div className="text-sm text-muted-foreground">No contact method data available.</div>
 ) : (
 stats.contactMethodDistribution.map(method => (
 <div key={method.method} className="space-y-xs">
 <div className="flex items-center justify-between text-sm">
 <span className="capitalize">{method.method}</span>
 <Badge variant="secondary">{method.count} contacts</Badge>
 </div>
 <Progress value={Number(method.percentage.toFixed(2))} />
 </div>
 ))
 )}
 </div>
 </Card>

 <Card className="p-lg space-y-md">
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-semibold">Top Countries</h3>
 </div>
 <div className="space-y-sm">
 {stats.countryDistribution.length === 0 ? (
 <div className="text-sm text-muted-foreground">No location data available.</div>
 ) : (
 stats.countryDistribution.map(country => (
 <div key={country.country} className="space-y-xs">
 <div className="flex items-center justify-between text-sm">
 <span className="uppercase">{country.country}</span>
 <Badge variant="outline">{country.count} contacts</Badge>
 </div>
 <Progress value={Number(country.percentage.toFixed(2))} />
 </div>
 ))
 )}
 </div>
 </Card>
 </div>

 <Card className="p-lg space-y-md">
 <div className="flex items-center gap-xs">
 <Activity className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-semibold">Recent Updates</h3>
 </div>
 <div className="space-y-xs">
 {analytics.recentUpdates.length === 0 ? (
 <div className="text-sm text-muted-foreground">No recent updates in the last 30 days.</div>
 ) : (
 analytics.recentUpdates.slice(-10).map(update => (
 <div key={update.date} className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">{new Date(update.date).toLocaleDateString()}</span>
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
