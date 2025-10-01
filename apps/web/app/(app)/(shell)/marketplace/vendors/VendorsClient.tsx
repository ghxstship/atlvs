'use client';

import { Plus, Users, Star, Eye, Edit, Trash2, MapPin, Briefcase, Award, TrendingUp, Clock, DollarSign } from "lucide-react";
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
import type { VendorProfile } from '../types';
import CreateVendorClient from '../drawers/CreateVendorClient';

interface VendorsClientProps {
 orgId: string;
 userId: string;
}

const VENDORS_FIELD_CONFIGS = [
 {
 key: 'display_name',
 label: 'Vendor Name',
 type: 'text' as const,
 sortable: true,
 filterable: true,
 searchable: true,
 visible: true,
 width: 200
 },
 {
 key: 'business_type',
 label: 'Type',
 type: 'select' as const,
 options: [
 { label: 'Individual', value: 'individual' },
 { label: 'Company', value: 'company' },
 { label: 'Agency', value: 'agency' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'primary_category',
 label: 'Category',
 type: 'select' as const,
 options: [
 { label: 'Audio/Visual', value: 'audio_visual' },
 { label: 'Lighting', value: 'lighting' },
 { label: 'Staging', value: 'staging' },
 { label: 'Production', value: 'production' },
 { label: 'Creative', value: 'creative' },
 { label: 'Technical', value: 'technical' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 140
 },
 {
 key: 'availability_status',
 label: 'Availability',
 type: 'select' as const,
 options: [
 { label: 'Available', value: 'available' },
 { label: 'Busy', value: 'busy' },
 { label: 'Unavailable', value: 'unavailable' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'rating',
 label: 'Rating',
 type: 'number' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 100
 },
 {
 key: 'total_reviews',
 label: 'Reviews',
 type: 'number' as const,
 sortable: true,
 filterable: false,
 visible: true,
 width: 100
 },
 {
 key: 'total_projects',
 label: 'Projects',
 type: 'number' as const,
 sortable: true,
 filterable: false,
 visible: true,
 width: 100
 },
 {
 key: 'hourly_rate',
 label: 'Rate',
 type: 'currency' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'years_experience',
 label: 'Experience',
 type: 'number' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select' as const,
 options: [
 { label: 'Pending', value: 'pending' },
 { label: 'Active', value: 'active' },
 { label: 'Suspended', value: 'suspended' },
 { label: 'Inactive', value: 'inactive' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 }
];

export default function VendorsClient({ orgId, userId }: VendorsClientProps) {
 const [vendors, setVendors] = useState<VendorProfile[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('grid');
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
 const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
 const [stats, setStats] = useState({
 total: 0,
 active: 0,
 verified: 0,
 avgRating: 0
 });

 const supabase = createBrowserClient();

 useEffect(() => {
 loadVendors();
 }, [orgId]);

 const loadVendors = async () => {
 try {
 setLoading(true);
 
 const { data: vendorsData, error } = await supabase
 .from('opendeck_vendor_profiles')
 .select('*')
 .eq('organization_id', orgId)
 .order('created_at', { ascending: false });

 if (error) throw error;

 setVendors(vendorsData || []);
 
 // Calculate stats
 const totalVendors = vendorsData?.length || 0;
 const activeVendors = vendorsData?.filter(v => v.status === 'active').length || 0;
 const verifiedVendors = vendorsData?.filter(v => v.verified).length || 0;
 const avgRating = totalVendors > 0 
 ? vendorsData?.reduce((sum, v) => sum + (v.rating || 0), 0) / totalVendors 
 : 0;

 setStats({
 total: totalVendors,
 active: activeVendors,
 verified: verifiedVendors,
 avgRating: Math.round(avgRating * 10) / 10
 });
 } catch (error) {
 console.error('Error loading vendors:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleCreateVendor = () => {
 setSelectedVendor(null);
 setDrawerMode('create');
 setDrawerOpen(true);
 };

 const handleEditVendor = (vendor: VendorProfile) => {
 setSelectedVendor(vendor);
 setDrawerMode('edit');
 setDrawerOpen(true);
 };

 const handleViewVendor = (vendor: VendorProfile) => {
 setSelectedVendor(vendor);
 setDrawerMode('view');
 setDrawerOpen(true);
 };

 const handleDeleteVendor = async (vendor: VendorProfile) => {
 if (!confirm('Are you sure you want to delete this vendor profile?')) return;

 try {
 const { error } = await supabase
 .from('opendeck_vendor_profiles')
 .delete()
 .eq('id', vendor.id);

 if (error) throw error;
 await loadVendors();
 } catch (error) {
 console.error('Error deleting vendor:', error);
 }
 };

 const handleExport = async (format: 'csv' | 'json' | 'excel') => {
 try {
 const exportData = vendors.map(vendor => ({
 name: vendor.name,
 business_name: vendor.business_name,
 business_type: vendor.business_type,
 primary_category: vendor.primary_category,
 availability_status: vendor.availability_status,
 rating: vendor.rating,
 total_reviews: vendor.total_reviews,
 total_projects: vendor.total_projects,
 hourly_rate: vendor.hourly_rate,
 currency: vendor.currency,
 years_experience: vendor.years_experience,
 status: vendor.status,
 verified: vendor.verified,
 created_at: vendor.created_at
 }));

 const filename = `marketplace-vendors-${new Date().toISOString().split('T')[0]}`;
 
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
 console.error('Error exporting vendors:', error);
 }
 };

 const handleBulkAction = async (action: string, selectedIds: string[]) => {
 if (action === 'delete') {
 if (!confirm(`Are you sure you want to delete ${selectedIds.length} vendor profiles?`)) return;
 
 try {
 const { error } = await supabase
 .from('opendeck_vendor_profiles')
 .delete()
 .in('id', selectedIds);

 if (error) throw error;
 await loadVendors();
 } catch (error) {
 console.error('Error bulk deleting vendors:', error);
 }
 } else if (action === 'verify') {
 try {
 const { error } = await supabase
 .from('opendeck_vendor_profiles')
 .update({ verified: true, verification_date: new Date().toISOString() })
 .in('id', selectedIds);

 if (error) throw error;
 await loadVendors();
 } catch (error) {
 console.error('Error bulk verifying vendors:', error);
 }
 }
 };

 const getRowActions = (vendor: VendorProfile) => [
 {
 label: 'View',
 icon: Eye,
 onClick: () => handleViewVendor(vendor)
 },
 {
 label: 'Edit',
 icon: Edit,
 onClick: () => handleEditVendor(vendor),
 disabled: vendor.user_id !== userId
 },
 {
 label: 'Delete',
 icon: Trash2,
 onClick: () => handleDeleteVendor(vendor),
 disabled: vendor.user_id !== userId,
 variant: 'destructive' as const
 }
 ];

 const renderVendorCard = (vendor: VendorProfile) => {
 const statusColors = {
 pending: 'warning',
 active: 'success',
 suspended: 'destructive',
 inactive: 'secondary'
 };

 const availabilityColors = {
 available: 'success',
 busy: 'warning',
 unavailable: 'destructive'
 };

 return (
 <Card key={vendor.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm">
 <Users className="h-icon-sm w-icon-sm color-primary" />
 <Badge variant={statusColors[vendor.status] as unknown}>
 {vendor.status}
 </Badge>
 {vendor.verified && <Badge variant="primary">Verified</Badge>}
 </div>
 <Badge variant={availabilityColors[vendor.availability_status] as unknown}>
 {vendor.availability_status}
 </Badge>
 </div>
 
 <h3 className="text-heading-4 mb-xs">{vendor.display_name || vendor.name}</h3>
 <p className="text-body-sm color-muted mb-xs">{vendor.business_name}</p>
 <p className="text-body-sm color-muted mb-sm line-clamp-xs">{vendor.tagline || vendor.bio}</p>
 
 <div className="flex items-center gap-md mb-sm text-body-sm color-muted">
 <div className="flex items-center gap-xs">
 <Briefcase className="h-icon-xs w-icon-xs" />
 <span>{vendor.primary_category?.replace('_', ' ')}</span>
 </div>
 {vendor.years_experience && (
 <div className="flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 <span>{vendor.years_experience}y exp</span>
 </div>
 )}
 {vendor.hourly_rate && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs" />
 <span>{vendor.currency} {vendor.hourly_rate}/hr</span>
 </div>
 )}
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-md text-body-sm color-muted">
 <div className="flex items-center gap-xs">
 <Star className="h-icon-xs w-icon-xs fill-current color-warning" />
 <span>{vendor.rating || 0}</span>
 </div>
 <span>{vendor.total_reviews || 0} reviews</span>
 <span>{vendor.total_projects || 0} projects</span>
 </div>
 <div className="flex items-center gap-xs">
 <Button size="sm" variant="outline" onClick={() => handleViewVendor(vendor)}>
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 {vendor.user_id === userId && (
 <Button size="sm" variant="outline" onClick={() => handleEditVendor(vendor)}>
 <Edit className="h-icon-xs w-icon-xs" />
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
 <h1 className="text-heading-2">Marketplace Vendors</h1>
 <p className="color-muted">Browse and manage vendor profiles</p>
 </div>
 <Button onClick={handleCreateVendor}>
 <Plus className="h-icon-xs w-icon-xs mr-sm" />
 Create Profile
 </Button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Vendors</p>
 <p className="text-heading-3 font-bold">{stats.total}</p>
 </div>
 <Users className="h-icon-lg w-icon-lg color-primary" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Active</p>
 <p className="text-heading-3 font-bold">{stats.active}</p>
 </div>
 <TrendingUp className="h-icon-lg w-icon-lg color-success" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Verified</p>
 <p className="text-heading-3 font-bold">{stats.verified}</p>
 </div>
 <Award className="h-icon-lg w-icon-lg color-warning" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Avg Rating</p>
 <p className="text-heading-3 font-bold">{stats.avgRating}</p>
 </div>
 <Star className="h-icon-lg w-icon-lg color-secondary" />
 </div>
 </Card>
 </div>

 {/* Data View */}
 <StateManagerProvider>
 <DataViewProvider
 data={vendors}
 fields={VENDORS_FIELD_CONFIGS}
 onExport={handleExport}
 onBulkAction={handleBulkAction}
 >
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <ViewSwitcher
 currentView={selectedView}
 onViewChange={setSelectedView}
 availableViews={['grid', 'list']}
 />
 </div>

 <div className="stack-sm">
 <DataActions
 onExport={handleExport}
 showBulkActions={true}
 bulkActions={[
 { label: 'Delete Selected', value: 'delete', variant: 'destructive' },
 { label: 'Verify Selected', value: 'verify', variant: 'default' }
 ]}
 />
 
 {selectedView === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {vendors.map(renderVendorCard)}
 </div>
 ) : (
 <DataGrid
 viewType={selectedView}
 onRowClick={handleViewVendor}
 rowActions={getRowActions}
 emptyMessage="No vendors found"
 loading={loading}
 className="min-h-content-lg"
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
 title={drawerMode === 'create' ? 'Create Vendor Profile' : drawerMode === 'edit' ? 'Edit Vendor Profile' : 'View Vendor Profile'}
 size="lg"
 >
 <CreateVendorClient
 mode={drawerMode}
 vendor={selectedVendor}
 onSuccess={() => {
 setDrawerOpen(false);
 loadVendors();
 }}
 onCancel={() => setDrawerOpen(false)}
 />
 </Drawer>
 </div>
 );
}
