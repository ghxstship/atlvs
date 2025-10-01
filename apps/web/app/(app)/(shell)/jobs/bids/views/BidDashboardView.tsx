'use client';

import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Calendar, Target, Activity, Building } from "lucide-react";
import { useMemo } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { JobBid, BidStats } from '../types';

interface BidDashboardViewProps {
 bids: JobBid[];
 stats?: BidStats;
 loading?: boolean;
 onViewAll?: () => void;
 onCreateNew?: () => void;
}

export default function BidDashboardView({
 bids,
 stats,
 loading = false,
 onViewAll,
 onCreateNew
}: BidDashboardViewProps) {

 const calculatedStats = useMemo(() => {
 if (stats) return stats;

 // Calculate stats from bids if not provided
 const total = bids.length;
 const byStatus = bids.reduce((acc, bid) => {
 const status = bid.status || 'submitted';
 acc[status] = (acc[status] || 0) + 1;
 return acc;
 }, {} as Record<string, number>);

 const totalValue = bids.reduce((sum, bid) => sum + (bid.amount || 0), 0);
 const averageBidValue = total > 0 ? totalValue / total : 0;
 
 const accepted = byStatus.accepted || 0;
 const winRate = total > 0 ? (accepted / total) * 100 : 0;

 const recentBids = bids.filter(bid => {
 const submittedDate = new Date(bid.submitted_at);
 const weekAgo = new Date();
 weekAgo.setDate(weekAgo.getDate() - 7);
 return submittedDate >= weekAgo;
 }).length;

 return {
 total,
 byStatus,
 totalValue,
 averageBidValue,
 winRate,
 recentBids,
 activeBids: (byStatus.submitted || 0) + (byStatus.under_review || 0),
 pendingBids: byStatus.submitted || 0,
 acceptedBids: byStatus.accepted || 0,
 rejectedBids: byStatus.rejected || 0,
 byType: { fixed_price: 0, hourly: 0, milestone_based: 0, retainer: 0 }
 };
 }, [bids, stats]);

 const recentBids = useMemo(() => {
 return bids
 .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
 .slice(0, 5);
 }, [bids]);

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'accepted': return 'success';
 case 'under_review': return 'info';
 case 'submitted': return 'warning';
 case 'rejected': return 'destructive';
 case 'withdrawn': return 'secondary';
 default: return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'accepted': return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'under_review': return <Clock className="h-icon-xs w-icon-xs" />;
 case 'submitted': return <DollarSign className="h-icon-xs w-icon-xs" />;
 case 'rejected': return <XCircle className="h-icon-xs w-icon-xs" />;
 case 'withdrawn': return <AlertCircle className="h-icon-xs w-icon-xs" />;
 default: return <Clock className="h-icon-xs w-icon-xs" />;
 }
 };

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(amount);
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {[...Array(8)].map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="stack-sm">
 <div className="h-icon-md w-icon-md bg-secondary rounded" />
 <div className="h-icon-xs w-component-lg bg-secondary rounded" />
 <div className="h-icon-lg w-component-md bg-secondary rounded" />
 </div>
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-heading-3 color-foreground">Bids Dashboard</h2>
 <p className="color-muted">Overview of bid submissions and performance metrics</p>
 </div>
 <div className="flex gap-sm">
 {onViewAll && (
 <Button variant="outline" onClick={onViewAll}>
 View All
 </Button>
 )}
 {onCreateNew && (
 <Button onClick={onCreateNew}>
 <DollarSign className="h-icon-xs w-icon-xs mr-xs" />
 New Bid
 </Button>
 )}
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Bids</p>
 <p className="text-heading-2 font-semibold color-foreground">
 {calculatedStats.total}
 </p>
 <p className="text-body-xs color-muted">
 {calculatedStats.recentBids} this week
 </p>
 </div>
 <DollarSign className="h-icon-lg w-icon-lg color-accent" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Value</p>
 <p className="text-heading-2 font-semibold color-foreground">
 {formatCurrency(calculatedStats.totalValue)}
 </p>
 <p className="text-body-xs color-muted">
 Avg: {formatCurrency(calculatedStats.averageBidValue)}
 </p>
 </div>
 <TrendingUp className="h-icon-lg w-icon-lg color-success" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Win Rate</p>
 <p className="text-heading-2 font-semibold color-foreground">
 {Math.round(calculatedStats.winRate)}%
 </p>
 <p className="text-body-xs color-muted">
 {calculatedStats.acceptedBids} accepted
 </p>
 </div>
 <Target className="h-icon-lg w-icon-lg color-success" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Active Bids</p>
 <p className="text-heading-2 font-semibold color-foreground">
 {calculatedStats.activeBids}
 </p>
 <p className="text-body-xs color-muted">Under review</p>
 </div>
 <Activity className="h-icon-lg w-icon-lg color-info" />
 </div>
 </Card>
 </div>

 {/* Status Breakdown */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg">
 <div className="stack-md">
 <div className="flex items-center justify-between">
 <h3 className="text-heading-4 color-foreground">Status Breakdown</h3>
 <TrendingUp className="h-icon-sm w-icon-sm color-muted" />
 </div>
 
 <div className="stack-sm">
 {Object.entries(calculatedStats.byStatus).map(([status, count]) => (
 <div key={status} className="flex items-center justify-between p-sm border border-border rounded-md">
 <div className="flex items-center gap-sm">
 {getStatusIcon(status)}
 <span className="text-body-sm color-foreground capitalize">
 {status.replace('_', ' ')}
 </span>
 </div>
 <div className="flex items-center gap-sm">
 <Badge variant={getStatusColor(status)}>
 {count}
 </Badge>
 <span className="text-body-xs color-muted">
 {calculatedStats.total > 0 
 ? Math.round((count / calculatedStats.total) * 100)
 : 0
 }%
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </Card>

 {/* Recent Bids */}
 <Card className="p-lg">
 <div className="stack-md">
 <div className="flex items-center justify-between">
 <h3 className="text-heading-4 color-foreground">Recent Bids</h3>
 <Calendar className="h-icon-sm w-icon-sm color-muted" />
 </div>
 
 <div className="stack-sm">
 {recentBids.length === 0 ? (
 <div className="text-center p-lg">
 <DollarSign className="h-icon-lg w-icon-lg color-muted mx-auto mb-sm" />
 <p className="color-muted">No recent bids</p>
 </div>
 ) : (
 recentBids.map((bid) => (
 <div key={bid.id} className="flex items-center justify-between p-sm border border-border rounded-md">
 <div className="flex items-center gap-sm flex-1 min-w-0">
 <div className="h-icon-md w-icon-md bg-secondary rounded-full flex items-center justify-center">
 <Building className="h-3 w-3" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-body-sm font-medium color-foreground truncate">
 {bid.opportunity_title || 'Untitled Opportunity'}
 </p>
 <p className="text-body-xs color-muted truncate">
 {formatCurrency(bid.amount)} • {new Date(bid.submitted_at).toLocaleDateString()}
 </p>
 </div>
 </div>
 <Badge variant={getStatusColor(bid.status)} size="sm">
 {bid.status}
 </Badge>
 </div>
 ))
 )}
 </div>
 </div>
 </Card>
 </div>

 {/* Performance Metrics */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
 <Card className="p-lg">
 <div className="stack-sm">
 <div className="flex items-center gap-sm">
 <CheckCircle className="h-icon-sm w-icon-sm color-success" />
 <h4 className="text-body-sm font-medium color-foreground">Accepted Bids</h4>
 </div>
 <p className="text-heading-3 font-semibold color-success">
 {calculatedStats.acceptedBids}
 </p>
 <p className="text-body-xs color-muted">
 {formatCurrency(
 bids
 .filter(bid => bid.status === 'accepted')
 .reduce((sum, bid) => sum + bid.amount, 0)
 )} total value
 </p>
 </div>
 </Card>

 <Card className="p-lg">
 <div className="stack-sm">
 <div className="flex items-center gap-sm">
 <Clock className="h-icon-sm w-icon-sm color-info" />
 <h4 className="text-body-sm font-medium color-foreground">Under Review</h4>
 </div>
 <p className="text-heading-3 font-semibold color-info">
 {calculatedStats.byStatus.under_review || 0}
 </p>
 <p className="text-body-xs color-muted">
 {formatCurrency(
 bids
 .filter(bid => bid.status === 'under_review')
 .reduce((sum, bid) => sum + bid.amount, 0)
 )} potential value
 </p>
 </div>
 </Card>

 <Card className="p-lg">
 <div className="stack-sm">
 <div className="flex items-center gap-sm">
 <XCircle className="h-icon-sm w-icon-sm color-destructive" />
 <h4 className="text-body-sm font-medium color-foreground">Rejected Bids</h4>
 </div>
 <p className="text-heading-3 font-semibold color-destructive">
 {calculatedStats.rejectedBids}
 </p>
 <p className="text-body-xs color-muted">
 {calculatedStats.total > 0 
 ? Math.round((calculatedStats.rejectedBids / calculatedStats.total) * 100)
 : 0
 }% rejection rate
 </p>
 </div>
 </Card>
 </div>
 </div>
 );
}
