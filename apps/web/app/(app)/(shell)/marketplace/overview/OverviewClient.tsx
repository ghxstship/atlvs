'use client';

import { LayoutDashboard, TrendingUp, Users, Briefcase, DollarSign, Star, Activity, Plus, Search, Filter, Download, Eye, MessageSquare, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState, useEffect } from 'react';
import { 
 Card, 
 Badge, 
 Button,
 DataGrid,
 ViewSwitcher,
 DataActions,
 DataViewProvider,
 StateManagerProvider,
 Drawer,
 type DataRecord
} from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import type { MarketplaceStats } from '../types';

interface OverviewClientProps {
 orgId: string;
 userId: string;
 userRole: 'vendor' | 'client' | 'both';
}

interface DashboardMetric {
 id: string;
 title: string;
 value: string | number;
 change: string;
 trend: 'up' | 'down' | 'neutral';
 icon: React.ComponentType<{ className?: string }>;
 color: 'primary' | 'success' | 'warning' | 'destructive';
}

interface RecentActivity extends DataRecord {
 id: string;
 type: 'listing_created' | 'proposal_submitted' | 'contract_signed' | 'payment_received';
 title: string;
 description: string;
 timestamp: string;
 user: string;
 status: 'active' | 'pending' | 'completed';
}

const OVERVIEW_FIELD_CONFIGS = [
 {
 key: 'type',
 label: 'Type',
 type: 'select' as const,
 options: [
 { label: 'Listing Created', value: 'listing_created' },
 { label: 'Proposal Submitted', value: 'proposal_submitted' },
 { label: 'Contract Signed', value: 'contract_signed' },
 { label: 'Payment Received', value: 'payment_received' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 140
 },
 {
 key: 'title',
 label: 'Activity',
 type: 'text' as const,
 sortable: true,
 filterable: true,
 searchable: true,
 visible: true,
 width: 200
 },
 {
 key: 'description',
 label: 'Description',
 type: 'text' as const,
 sortable: false,
 filterable: false,
 searchable: true,
 visible: true,
 width: 300
 },
 {
 key: 'user',
 label: 'User',
 type: 'text' as const,
 sortable: true,
 filterable: true,
 searchable: true,
 visible: true,
 width: 150
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select' as const,
 options: [
 { label: 'Active', value: 'active' },
 { label: 'Pending', value: 'pending' },
 { label: 'Completed', value: 'completed' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'timestamp',
 label: 'Time',
 type: 'datetime' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 160
 }
];

export default function OverviewClient({ orgId, userId, userRole }: OverviewClientProps) {
 const [stats, setStats] = useState<MarketplaceStats | null>(null);
 const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
 const [loading, setLoading] = useState(true);
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('grid');

 const supabase = createBrowserClient();

 useEffect(() => {
 loadDashboardData();
 }, [orgId]);

 const loadDashboardData = async () => {
 try {
 setLoading(true);
 
 // Load marketplace statistics
 const { data: listings } = await supabase
 .from('marketplace_listings')
 .select('*')
 .eq('organization_id', orgId);

 const { data: projects } = await supabase
 .from('opendeck_projects')
 .select('*')
 .eq('organization_id', orgId);

 const { data: vendors } = await supabase
 .from('opendeck_vendor_profiles')
 .select('*')
 .eq('organization_id', orgId);

 const { data: proposals } = await supabase
 .from('opendeck_proposals')
 .select('*');

 // Calculate stats
 const marketplaceStats: MarketplaceStats = {
 totalListings: listings?.length || 0,
 featuredListings: listings?.filter(l => l.featured)?.length || 0,
 totalResponses: proposals?.length || 0,
 averageResponseRate: 0,
 activeOffers: listings?.filter(l => l.type === 'offer' && l.status === 'active')?.length || 0,
 activeRequests: listings?.filter(l => l.type === 'request' && l.status === 'active')?.length || 0,
 activeExchanges: listings?.filter(l => l.type === 'exchange' && l.status === 'active')?.length || 0,
 totalVendors: vendors?.length || 0,
 totalProjects: projects?.length || 0,
 lastUpdated: new Date().toISOString()
 };

 setStats(marketplaceStats);

 // Load recent activity (mock data for now)
 const mockActivity: RecentActivity[] = [
 {
 id: '1',
 type: 'listing_created',
 title: 'New Equipment Listing',
 description: 'LED Wall Panel System posted by TechCorp',
 timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
 user: 'TechCorp',
 status: 'active'
 },
 {
 id: '2',
 type: 'proposal_submitted',
 title: 'Proposal Submitted',
 description: 'Sound Engineer proposal for Festival 2024',
 timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
 user: 'AudioPro',
 status: 'pending'
 },
 {
 id: '3',
 type: 'contract_signed',
 title: 'Contract Executed',
 description: 'Lighting Design contract for Concert Series',
 timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
 user: 'LightMaster',
 status: 'completed'
 }
 ];

 setRecentActivity(mockActivity);
 } catch (error) {
 console.error('Error loading dashboard data:', error);
 } finally {
 setLoading(false);
 }
 };

 const getDashboardMetrics = (): DashboardMetric[] => {
 if (!stats) return [];

 return [
 {
 id: 'total-listings',
 title: 'Total Listings',
 value: stats.totalListings,
 change: '+12%',
 trend: 'up',
 icon: Briefcase,
 color: 'primary'
 },
 {
 id: 'active-vendors',
 title: 'Active Vendors',
 value: stats.totalVendors,
 change: '+8%',
 trend: 'up',
 icon: Users,
 color: 'success'
 },
 {
 id: 'total-projects',
 title: 'Active Projects',
 value: stats.totalProjects,
 change: '+15%',
 trend: 'up',
 icon: LayoutDashboard,
 color: 'warning'
 },
 {
 id: 'total-responses',
 title: 'Total Responses',
 value: stats.totalResponses,
 change: '-3%',
 trend: 'down',
 icon: MessageSquare,
 color: 'destructive'
 }
 ];
 };

 const handleExport = async (format: 'csv' | 'json' | 'excel') => {
 // Implementation for exporting overview data
 };

 const handleBulkAction = async (action: string, selectedIds: string[]) => {
 // Implementation for bulk actions on activity items
 };

 if (loading) {
 return (
 <div className="stack-lg">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-2">Marketplace Overview</h1>
 <p className="color-muted">Digital marketplace dashboard and analytics</p>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {[...Array(4)].map((_, i) => (
 <Card key={i} className="p-md animate-pulse">
 <div className="h-icon-xs bg-muted rounded mb-sm"></div>
 <div className="h-icon-lg bg-muted rounded mb-xs"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </Card>
 ))}
 </div>
 </div>
 );
 }

 const metrics = getDashboardMetrics();

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-2">Marketplace Overview</h1>
 <p className="color-muted">
 Digital marketplace for live and experiential entertainment
 </p>
 </div>
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => loadDashboardData()}
 >
 <Activity className="h-icon-xs w-icon-xs mr-xs" />
 Refresh
 </Button>
 </div>
 </div>

 {/* Metrics Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {metrics.map((metric) => {
 const Icon = metric.icon;
 const TrendIcon = metric.trend === 'up' ? ArrowUpRight : 
 metric.trend === 'down' ? ArrowDownRight : Activity;
 
 return (
 <Card key={metric.id} className="p-md">
 <div className="flex items-center justify-between mb-sm">
 <Icon className={`h-icon-sm w-icon-sm color-${metric.color}`} />
 <Badge 
 variant={metric.trend === 'up' ? 'success' : 
 metric.trend === 'down' ? 'destructive' : 'secondary'}
 size="sm"
 >
 <TrendIcon className="h-3 w-3 mr-xs" />
 {metric.change}
 </Badge>
 </div>
 <div className="stack-xs">
 <h3 className="text-heading-4 font-bold">{metric.value}</h3>
 <p className="text-body-sm color-muted">{metric.title}</p>
 </div>
 </Card>
 );
 })}
 </div>

 {/* Quick Actions */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Quick Actions</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sm">
 <Button variant="outline" className="justify-start">
 <Plus className="h-icon-xs w-icon-xs mr-sm" />
 Create Listing
 </Button>
 <Button variant="outline" className="justify-start">
 <Briefcase className="h-icon-xs w-icon-xs mr-sm" />
 Post Project
 </Button>
 <Button variant="outline" className="justify-start">
 <Users className="h-icon-xs w-icon-xs mr-sm" />
 Browse Vendors
 </Button>
 <Button variant="outline" className="justify-start">
 <Star className="h-icon-xs w-icon-xs mr-sm" />
 View Reviews
 </Button>
 </div>
 </Card>

 {/* Recent Activity */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-heading-4">Recent Activity</h3>
 <ViewSwitcher
 currentView={selectedView}
 onViewChange={setSelectedView}
 availableViews={['grid', 'list']}
 />
 </div>

 <StateManagerProvider>
 <DataViewProvider
 data={recentActivity}
 fields={OVERVIEW_FIELD_CONFIGS}
 onExport={handleExport}
 onBulkAction={handleBulkAction}
 >
 <div className="stack-sm">
 <DataActions
 onExport={handleExport}
 showBulkActions={true}
 searchConfig={{
 placeholder: "Search activity...",
 }}
 filterConfig={{
 fields: OVERVIEW_FIELD_CONFIGS,
 }}
 />
 
 <DataGrid
 viewType={selectedView}
 emptyMessage="No recent activity found"
 className="min-h-content-md"
 />
 </div>
 </DataViewProvider>
 </StateManagerProvider>
 </Card>

 {/* Marketplace Insights */}
 {stats && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Listing Distribution</h3>
 <div className="stack-sm">
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Offers</span>
 <Badge variant="primary">{stats.activeOffers}</Badge>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Requests</span>
 <Badge variant="secondary">{stats.activeRequests}</Badge>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Exchanges</span>
 <Badge variant="outline">{stats.activeExchanges}</Badge>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Featured</span>
 <Badge variant="success">{stats.featuredListings}</Badge>
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Performance Metrics</h3>
 <div className="stack-sm">
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Response Rate</span>
 <span className="font-medium">{stats.averageResponseRate}%</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Active Vendors</span>
 <span className="font-medium">{stats.totalVendors}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Total Projects</span>
 <span className="font-medium">{stats.totalProjects}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Last Updated</span>
 <span className="text-body-sm color-muted">
 {new Date(stats.lastUpdated).toLocaleTimeString()}
 </span>
 </div>
 </div>
 </Card>
 </div>
 )}

 {/* Universal Drawer for Actions */}
 <Drawer
 isOpen={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 title="Marketplace Action"
 size="lg"
 >
 <div className="p-md">
 <p>Marketplace action content will go here...</p>
 </div>
 </Drawer>
 </div>
 );
}
