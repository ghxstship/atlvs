'use client';

import { Plus, Search, Filter, Eye, Edit, Trash2, Star, MapPin, Calendar, DollarSign, Package, Users, Briefcase } from "lucide-react";
import { useState, useEffect } from 'react';
import { 
 DataGrid,
 ViewSwitcher,
 DataActions,
 DataViewProvider,
 StateManagerProvider,
 Drawer,
 Button,
 Badge,
 Card,
 type DataRecord
} from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import type { MarketplaceListing, ListingFilters } from '../types';
import CreateListingClient from '../drawers/CreateListingDrawer';

interface ListingsClientProps {
 orgId: string;
 userId: string;
}

const LISTINGS_FIELD_CONFIGS = [
 {
 key: 'title',
 label: 'Title',
 type: 'text' as const,
 sortable: true,
 filterable: true,
 searchable: true,
 visible: true,
 width: 250
 },
 {
 key: 'type',
 label: 'Type',
 type: 'select' as const,
 options: [
 { label: 'Offer', value: 'offer' },
 { label: 'Request', value: 'request' },
 { label: 'Exchange', value: 'exchange' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'category',
 label: 'Category',
 type: 'select' as const,
 options: [
 { label: 'Equipment', value: 'equipment' },
 { label: 'Services', value: 'services' },
 { label: 'Talent', value: 'talent' },
 { label: 'Locations', value: 'locations' },
 { label: 'Materials', value: 'materials' },
 { label: 'Other', value: 'other' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 140
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select' as const,
 options: [
 { label: 'Draft', value: 'draft' },
 { label: 'Active', value: 'active' },
 { label: 'Archived', value: 'archived' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'pricing',
 label: 'Price',
 type: 'currency' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 140
 },
 {
 key: 'location',
 label: 'Location',
 type: 'text' as const,
 sortable: true,
 filterable: true,
 searchable: true,
 visible: true,
 width: 160
 },
 {
 key: 'featured',
 label: 'Featured',
 type: 'boolean' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 100
 },
 {
 key: 'view_count',
 label: 'Views',
 type: 'number' as const,
 sortable: true,
 filterable: false,
 visible: true,
 width: 100
 },
 {
 key: 'response_count',
 label: 'Responses',
 type: 'number' as const,
 sortable: true,
 filterable: false,
 visible: true,
 width: 120
 },
 {
 key: 'created_at',
 label: 'Created',
 type: 'datetime' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 160
 }
];

export default function ListingsClient({ orgId, userId }: ListingsClientProps) {
 const [listings, setListings] = useState<MarketplaceListing[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('grid');
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
 const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
 const [filters, setFilters] = useState<ListingFilters>({});
 const [stats, setStats] = useState({
 total: 0,
 active: 0,
 featured: 0,
 responses: 0
 });

 const supabase = createBrowserClient();

 useEffect(() => {
 loadListings();
 }, [orgId, filters]);

 const loadListings = async () => {
 try {
 setLoading(true);
 
 // Build query parameters
 const params = new URLSearchParams();
 if (filters.type) params.append('type', filters.type);
 if (filters.category) params.append('category', filters.category);
 if (filters.location) params.append('location', filters.location);
 if (filters.minPrice) params.append('minPrice', filters.minPrice);
 if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
 if (filters.search) params.append('search', filters.search);
 if (filters.featured) params.append('featured', 'true');
 if (filters.showMine) params.append('showMine', 'true');
 if (filters.active) params.append('active', 'true');

 const response = await fetch(`/api/v1/marketplace/listings?${params.toString()}`);
 const data = await response.json();

 if (response.ok) {
 const listingsData = data.listings || [];
 setListings(listingsData);
 
 // Calculate stats
 setStats({
 total: listingsData.length,
 active: listingsData.filter((l: MarketplaceListing) => l.status === 'active').length,
 featured: listingsData.filter((l: MarketplaceListing) => l.featured).length,
 responses: listingsData.reduce((sum: number, l: MarketplaceListing) => sum + (l.response_count || 0), 0)
 });
 } else {
 console.error('Error loading listings:', data.error);
 }
 } catch (error) {
 console.error('Error loading listings:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleCreateListing = () => {
 setSelectedListing(null);
 setDrawerMode('create');
 setDrawerOpen(true);
 };

 const handleEditListing = (listing: MarketplaceListing) => {
 setSelectedListing(listing);
 setDrawerMode('edit');
 setDrawerOpen(true);
 };

 const handleViewListing = (listing: MarketplaceListing) => {
 setSelectedListing(listing);
 setDrawerMode('view');
 setDrawerOpen(true);
 };

 const handleDeleteListing = async (listing: MarketplaceListing) => {
 if (!confirm('Are you sure you want to delete this listing?')) return;

 try {
 const response = await fetch('/api/v1/marketplace/listings', {
 method: 'DELETE',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ id: listing.id })
 });

 if (response.ok) {
 await loadListings();
 } else {
 const data = await response.json();
 console.error('Error deleting listing:', data.error);
 }
 } catch (error) {
 console.error('Error deleting listing:', error);
 }
 };

 const handleExport = async (format: 'csv' | 'json' | 'excel') => {
 try {
 const exportData = listings.map(listing => ({
 title: listing.title,
 type: listing.type,
 category: listing.category,
 status: listing.status,
 price: listing.pricing?.amount || 0,
 currency: listing.pricing?.currency || 'USD',
 location: listing.location?.city || '',
 featured: listing.featured,
 views: listing.view_count || 0,
 responses: listing.response_count || 0,
 created: listing.created_at
 }));

 const filename = `marketplace-listings-${new Date().toISOString().split('T')[0]}`;
 
 if (format === 'csv') {
 const csv = [
 Object.keys(exportData[0]).join(','),
 ...exportData.map(row => Object.values(row).join(','))
 ].join('\n');
 
 const blob = new Blob([csv], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${filename}.csv`;
 a.click();
 URL.revokeObjectURL(url);
 } else if (format === 'json') {
 const json = JSON.stringify(exportData, null, 2);
 const blob = new Blob([json], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${filename}.json`;
 a.click();
 URL.revokeObjectURL(url);
 }
 } catch (error) {
 console.error('Error exporting listings:', error);
 }
 };

 const handleBulkAction = async (action: string, selectedIds: string[]) => {
 if (action === 'delete') {
 if (!confirm(`Are you sure you want to delete ${selectedIds.length} listings?`)) return;
 
 try {
 await Promise.all(
 selectedIds.map(id => 
 fetch('/api/v1/marketplace/listings', {
 method: 'DELETE',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ id })
 })
 )
 );
 await loadListings();
 } catch (error) {
 console.error('Error bulk deleting listings:', error);
 }
 } else if (action === 'feature') {
 try {
 await Promise.all(
 selectedIds.map(id => 
 fetch('/api/v1/marketplace/listings', {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ id, featured: true })
 })
 )
 );
 await loadListings();
 } catch (error) {
 console.error('Error bulk featuring listings:', error);
 }
 }
 };

 const handleSearch = (query: string) => {
 setFilters(prev => ({ ...prev, search: query }));
 };

 const handleFilter = (newFilters: Partial<ListingFilters>) => {
 setFilters(prev => ({ ...prev, ...newFilters }));
 };

 const getRowActions = (listing: MarketplaceListing) => [
 {
 label: 'View',
 icon: Eye,
 onClick: () => handleViewListing(listing)
 },
 {
 label: 'Edit',
 icon: Edit,
 onClick: () => handleEditListing(listing),
 disabled: listing.created_by !== userId
 },
 {
 label: 'Delete',
 icon: Trash2,
 onClick: () => handleDeleteListing(listing),
 disabled: listing.created_by !== userId,
 variant: 'destructive' as const
 }
 ];

 const renderListingCard = (listing: MarketplaceListing) => {
 const typeIcons = {
 offer: Package,
 request: Search,
 exchange: Users
 };
 const TypeIcon = typeIcons[listing.type];

 return (
 <Card key={listing.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm">
 <TypeIcon className="h-5 w-5 color-primary" />
 <Badge variant={listing.type === 'offer' ? 'success' : listing.type === 'request' ? 'warning' : 'secondary'}>
 {listing.type}
 </Badge>
 {listing.featured && <Badge variant="primary">Featured</Badge>}
 </div>
 <Badge variant={listing.status === 'active' ? 'success' : 'secondary'}>
 {listing.status}
 </Badge>
 </div>
 
 <h3 className="text-heading-4 mb-xs">{listing.title}</h3>
 <p className="text-body-sm color-muted mb-sm line-clamp-2">{listing.description}</p>
 
 <div className="flex items-center gap-md mb-sm text-body-sm color-muted">
 <div className="flex items-center gap-xs">
 <Briefcase className="h-4 w-4" />
 <span>{listing.category}</span>
 </div>
 {listing.location?.city && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-4 w-4" />
 <span>{listing.location.city}</span>
 </div>
 )}
 {listing.pricing?.amount && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-4 w-4" />
 <span>{listing.pricing.currency} {listing.pricing.amount}</span>
 </div>
 )}
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-md text-body-sm color-muted">
 <span>{listing.view_count || 0} views</span>
 <span>{listing.response_count || 0} responses</span>
 </div>
 <div className="flex items-center gap-xs">
 <Button size="sm" variant="outline" onClick={() => handleViewListing(listing)}>
 <Eye className="h-4 w-4" />
 </Button>
 {listing.created_by === userId && (
 <Button size="sm" variant="outline" onClick={() => handleEditListing(listing)}>
 <Edit className="h-4 w-4" />
 </Button>
 )}
 </div>
 </div>
 </Card>
 );
 };

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-2">Marketplace Listings</h1>
 <p className="color-muted">Browse and manage marketplace listings</p>
 </div>
 <Button onClick={handleCreateListing}>
 <Plus className="h-4 w-4 mr-sm" />
 Create Listing
 </Button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Listings</p>
 <p className="text-heading-3 font-bold">{stats.total}</p>
 </div>
 <Briefcase className="h-8 w-8 color-primary" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Active</p>
 <p className="text-heading-3 font-bold">{stats.active}</p>
 </div>
 <Package className="h-8 w-8 color-success" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Featured</p>
 <p className="text-heading-3 font-bold">{stats.featured}</p>
 </div>
 <Star className="h-8 w-8 color-warning" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Responses</p>
 <p className="text-heading-3 font-bold">{stats.responses}</p>
 </div>
 <Users className="h-8 w-8 color-secondary" />
 </div>
 </Card>
 </div>

 {/* Data View */}
 <StateManagerProvider>
 <DataViewProvider
 data={listings}
 fields={LISTINGS_FIELD_CONFIGS}
 onExport={handleExport}
 onBulkAction={handleBulkAction}
 >
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <ViewSwitcher
 currentView={selectedView}
 onViewChange={setSelectedView}
 availableViews={['grid', 'list', 'kanban']}
 />
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setFilters(prev => ({ ...prev, showMine: !prev.showMine }))}
 >
 {filters.showMine ? 'Show All' : 'Show Mine'}
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setFilters(prev => ({ ...prev, featured: !prev.featured }))}
 >
 {filters.featured ? 'All Listings' : 'Featured Only'}
 </Button>
 </div>
 </div>

 <div className="stack-sm">
 <DataActions
 onSearch={handleSearch}
 onFilter={handleFilter}
 onExport={handleExport}
 showBulkActions={true}
 bulkActions={[
 { label: 'Delete Selected', value: 'delete', variant: 'destructive' },
 { label: 'Feature Selected', value: 'feature', variant: 'default' }
 ]}
 />
 
 {selectedView === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {listings.map(renderListingCard)}
 </div>
 ) : (
 <DataGrid
 viewType={selectedView}
 onRowClick={handleViewListing}
 rowActions={getRowActions}
 emptyMessage="No listings found"
 loading={loading}
 className="min-h-[400px]"
 />
 )}
 </div>
 </Card>
 </DataViewProvider>
 </StateManagerProvider>

 {/* Create/Edit Drawer */}
 <Drawer
 isOpen={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 title={drawerMode === 'create' ? 'Create Listing' : drawerMode === 'edit' ? 'Edit Listing' : 'View Listing'}
 size="lg"
 >
 <CreateListingClient
 mode={drawerMode}
 listing={selectedListing}
 onSuccess={() => {
 setDrawerOpen(false);
 loadListings();
 }}
 onCancel={() => setDrawerOpen(false)}
 />
 </Drawer>
 </div>
 );
}
