"use client";

import { LineChart, Users, Star, ArrowUpRight, ArrowDownRight, Globe, Briefcase, MessageSquare, Sparkles } from "lucide-react";
import { Card, Badge, Button } from '@ghxstship/ui';
import type { OpenDeckStats } from '../types';

interface MarketplaceDashboardProps {
 stats: OpenDeckStats | null;
 loading: boolean;
 onRefresh: () => void;
}

export function MarketplaceDashboard({ stats, loading, onRefresh }: MarketplaceDashboardProps) {
 return (
 <section className="stack-md">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-heading-3">Marketplace Overview</h2>
 <p className="text-body-sm color-muted">
 Real-time insights across offers, requests, and vendor engagement.
 </p>
 </div>
 <Button onClick={onRefresh} variant="outline" disabled={loading}>
 {loading ? 'Refreshing…' : 'Refresh Data'}
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md">
 <Card className="p-md stack-sm">
 <div className="flex items-center justify-between">
 <p className="text-body-sm color-muted">Active Listings</p>
 <LineChart className="h-icon-sm w-icon-sm color-accent" />
 </div>
 <p className="text-heading-2">
 {stats ? stats.totalListings.toLocaleString() : '—'}
 </p>
 <p className="text-body-xs color-muted">
 {stats ? `Updated ${new Date(stats.lastUpdated).toLocaleTimeString()}` : 'Awaiting data'}
 </p>
 </Card>

 <Card className="p-md stack-sm">
 <div className="flex items-center justify-between">
 <p className="text-body-sm color-muted">Featured Spotlight</p>
 <Sparkles className="h-icon-sm w-icon-sm color-warning" />
 </div>
 <p className="text-heading-2">{stats ? stats.featuredListings : '—'}</p>
 <Badge variant="secondary" className="w-fit">
 {stats ? `${Math.round((stats.featuredListings / Math.max(stats.totalListings, 1)) * 100)}% featured` : 'No data'}
 </Badge>
 </Card>

 <Card className="p-md stack-sm">
 <div className="flex items-center justify-between">
 <p className="text-body-sm color-muted">Response Velocity</p>
 <MessageSquare className="h-icon-sm w-icon-sm color-success" />
 </div>
 <p className="text-heading-2">{stats ? `${stats.averageResponseRate}%` : '—'}</p>
 <p className="text-body-xs color-success flex items-center gap-xs">
 <ArrowUpRight className="h-3 w-3" />
 {stats ? `${stats.totalResponses.toLocaleString()} responses` : 'Awaiting engagement'}
 </p>
 </Card>

 <Card className="p-md stack-sm">
 <div className="flex items-center justify-between">
 <p className="text-body-sm color-muted">Vendor Ecosystem</p>
 <Users className="h-icon-sm w-icon-sm color-info" />
 </div>
 <p className="text-heading-2">{stats ? stats.totalVendors : '—'}</p>
 <p className="text-body-xs color-muted flex items-center gap-xs">
 <Globe className="h-3 w-3" />
 {stats ? `${stats.totalProjects} active projects` : 'Awaiting data'}
 </p>
 </Card>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-2 gap-md">
 <Card className="p-lg stack-md">
 <header className="flex items-center justify-between">
 <div>
 <h3 className="text-heading-4">Listing Performance</h3>
 <p className="text-body-sm color-muted">Conversions by listing type over the last 30 days</p>
 </div>
 <Badge variant="outline">Live</Badge>
 </header>
 <div className="h-container-sm grid place-items-center border border-dashed border-border rounded-lg">
 <ArrowUpRight className="h-icon-2xl w-icon-2xl color-muted" />
 <p className="text-body-sm color-muted">Integrate with analytics provider to render chart</p>
 </div>
 </Card>

 <Card className="p-lg stack-md">
 <header className="flex items-center justify-between">
 <div>
 <h3 className="text-heading-4">Engagement Summary</h3>
 <p className="text-body-sm color-muted">How clients and vendors collaborate across the marketplace</p>
 </div>
 <Badge variant="outline">Realtime</Badge>
 </header>

 <div className="grid grid-cols-1 gap-md">
 <div className="flex items-center justify-between">
 <div className="stack-2xs">
 <p className="text-body-sm color-muted flex items-center gap-xs">
 <Briefcase className="h-icon-xs w-icon-xs" /> Active Requests
 </p>
 <p className="text-heading-3">{stats ? stats.activeRequests : '—'}</p>
 </div>
 <Badge variant="secondary" className="flex items-center gap-xs">
 <ArrowUpRight className="h-3 w-3" />
 Growth
 </Badge>
 </div>

 <div className="flex items-center justify-between">
 <div className="stack-2xs">
 <p className="text-body-sm color-muted flex items-center gap-xs">
 <Star className="h-icon-xs w-icon-xs" /> Featured Offers
 </p>
 <p className="text-heading-3">{stats ? stats.activeOffers : '—'}</p>
 </div>
 <Badge variant="outline" className="flex items-center gap-xs">
 <ArrowDownRight className="h-3 w-3" />
 Optimise
 </Badge>
 </div>

 <div className="flex items-center justify-between">
 <div className="stack-2xs">
 <p className="text-body-sm color-muted flex items-center gap-xs">
 <Users className="h-icon-xs w-icon-xs" /> Exchanges Facilitated
 </p>
 <p className="text-heading-3">{stats ? stats.activeExchanges : '—'}</p>
 </div>
 <Badge variant="secondary">Collaboration</Badge>
 </div>
 </div>
 </Card>
 </div>
 </section>
 );
}
