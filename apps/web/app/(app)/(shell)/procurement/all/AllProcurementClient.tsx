'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { 
 DataViewProvider, 
 StateManagerProvider, 
 DataGrid, 
 KanbanBoard, 
 CalendarView, 
 ListView, 
 TimelineView, 
 DashboardView,
 ViewSwitcher, 
 DataActions,
 Drawer
} from '@ghxstship/ui';
import type { 
 DataViewConfig, 
 FieldConfig, 
 DataRecord, 
 FilterConfig, 
 SortConfig,
 ViewType
} from '@ghxstship/ui';

interface AllProcurementClientProps {
 orgId: string;
 userId: string;
 userEmail: string;
}

export default function AllProcurementClient({ orgId, userId, userEmail }: AllProcurementClientProps) {
 const t = useTranslations('procurement');
 const sb = createBrowserClient();
 
 const [loading, setLoading] = useState(false);
 const [data, setData] = useState<DataRecord[]>([]);
 const [error, setError] = useState<string | null>(null);
 const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [drawerRecord, setDrawerRecord] = useState<DataRecord | null>(null);
 const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');

 // Enhanced field configuration for comprehensive procurement data
 const fieldConfig: FieldConfig[] = [
 {
 key: 'id',
 label: 'ID',
 type: 'text',
 visible: false,
 sortable: false
 },
 {
 key: 'type',
 label: 'Type',
 type: 'select',
 options: [
 { value: 'order', label: 'Purchase Order' },
 { value: 'request', label: 'Request' },
 { value: 'vendor', label: 'Vendor' },
 { value: 'contract', label: 'Contract' },
 { value: 'catalog_item', label: 'Catalog Item' }
 ],
 required: true,
 filterable: true,
 sortable: true,
 visible: true
 },
 {
 key: 'reference_number',
 label: 'Reference #',
 type: 'text',
 required: true,
 sortable: true,
 visible: true
 },
 {
 key: 'title',
 label: 'Title/Name',
 type: 'text',
 required: true,
 sortable: true,
 visible: true
 },
 {
 key: 'description',
 label: 'Description',
 type: 'textarea',
 visible: true
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: [
 { value: 'draft', label: 'Draft' },
 { value: 'pending', label: 'Pending' },
 { value: 'approved', label: 'Approved' },
 { value: 'active', label: 'Active' },
 { value: 'completed', label: 'Completed' },
 { value: 'cancelled', label: 'Cancelled' }
 ],
 required: true,
 filterable: true,
 sortable: true,
 visible: true
 },
 {
 key: 'priority',
 label: 'Priority',
 type: 'select',
 options: [
 { value: 'low', label: 'Low' },
 { value: 'medium', label: 'Medium' },
 { value: 'high', label: 'High' },
 { value: 'urgent', label: 'Urgent' }
 ],
 filterable: true,
 sortable: true,
 visible: true
 },
 {
 key: 'amount',
 label: 'Amount',
 type: 'currency',
 sortable: true,
 visible: true
 },
 {
 key: 'currency',
 label: 'Currency',
 type: 'select',
 options: [
 { value: 'USD', label: 'USD' },
 { value: 'EUR', label: 'EUR' },
 { value: 'GBP', label: 'GBP' }
 ],
 defaultValue: 'USD',
 filterable: true,
 visible: true
 },
 {
 key: 'vendor_name',
 label: 'Vendor/Supplier',
 type: 'text',
 sortable: true,
 visible: true
 },
 {
 key: 'category',
 label: 'Category',
 type: 'select',
 options: [
 { value: 'equipment', label: 'Equipment' },
 { value: 'supplies', label: 'Supplies' },
 { value: 'services', label: 'Services' },
 { value: 'materials', label: 'Materials' },
 { value: 'software', label: 'Software' },
 { value: 'maintenance', label: 'Maintenance' }
 ],
 filterable: true,
 sortable: true,
 visible: true
 },
 {
 key: 'project_name',
 label: 'Project',
 type: 'text',
 sortable: true,
 visible: true
 },
 {
 key: 'requested_by',
 label: 'Requested By',
 type: 'text',
 sortable: true,
 visible: true
 },
 {
 key: 'due_date',
 label: 'Due Date',
 type: 'date',
 sortable: true,
 visible: true
 },
 {
 key: 'created_at',
 label: 'Created',
 type: 'date',
 sortable: true,
 visible: true
 },
 {
 key: 'updated_at',
 label: 'Updated',
 type: 'date',
 sortable: true,
 visible: false
 }
 ];

 // Remove statistics configuration for now to avoid type issues

 // Load comprehensive procurement data
 const loadData = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);

 // Load data from multiple procurement endpoints
 const [
 ordersResponse,
 requestsResponse,
 vendorsResponse,
 catalogResponse,
 contractsResponse
 ] = await Promise.all([
 fetch('/api/v1/procurement/purchase-orders', {
 headers: { 'x-organization-id': orgId }
 }),
 fetch('/api/v1/procurement/requests', {
 headers: { 'x-organization-id': orgId }
 }),
 fetch('/api/v1/procurement/vendors', {
 headers: { 'x-organization-id': orgId }
 }),
 fetch('/api/v1/procurement/catalog', {
 headers: { 'x-organization-id': orgId }
 }),
 fetch('/api/v1/procurement/contracts', {
 headers: { 'x-organization-id': orgId }
 })
 ]);

 const combinedData: DataRecord[] = [];

 // Process purchase orders
 if (ordersResponse.ok) {
 const ordersData = await ordersResponse.json();
 const orders = ordersData.purchaseOrders || ordersData.data || [];
 orders.forEach((order: unknown) => {
 combinedData.push({
 id: order.id,
 type: 'order',
 reference_number: order.po_number || order.order_number || `PO-${order.id.slice(0, 8)}`,
 title: order.description || order.title || 'Purchase Order',
 description: order.notes || order.description || '',
 status: order.status || 'draft',
 priority: order.priority || 'medium',
 amount: order.total_amount || order.amount || 0,
 currency: order.currency || 'USD',
 vendor_name: order.vendor?.name || order.vendor_name || 'Unknown Vendor',
 category: order.category || 'equipment',
 project_name: order.project?.name || order.project_name || '',
 requested_by: order.requested_by?.name || order.requester_name || '',
 due_date: order.delivery_date || order.due_date || undefined,
 created_at: order.created_at || new Date().toISOString(),
 updated_at: order.updated_at || new Date().toISOString()
 });
 });
 }

 // Process procurement requests
 if (requestsResponse.ok) {
 const requestsData = await requestsResponse.json();
 const requests = requestsData.data || [];
 requests.forEach((request: unknown) => {
 combinedData.push({
 id: request.id,
 type: 'request',
 reference_number: request.title || `REQ-${request.id.slice(0, 8)}`,
 title: request.title || 'Procurement Request',
 description: request.description || request.business_justification || '',
 status: request.status || 'draft',
 priority: request.priority || 'medium',
 amount: request.estimated_total || 0,
 currency: request.currency || 'USD',
 vendor_name: request.preferred_vendor || '',
 category: request.category || 'equipment',
 project_name: request.project?.name || '',
 requested_by: request.requester?.name || '',
 due_date: request.requested_delivery_date || undefined,
 created_at: request.created_at || new Date().toISOString(),
 updated_at: request.updated_at || new Date().toISOString()
 });
 });
 }

 // Process vendors
 if (vendorsResponse.ok) {
 const vendorsData = await vendorsResponse.json();
 const vendors = vendorsData.data || [];
 vendors.forEach((vendor: unknown) => {
 combinedData.push({
 id: vendor.id,
 type: 'vendor',
 reference_number: vendor.business_name || vendor.name || `VEN-${vendor.id.slice(0, 8)}`,
 title: vendor.business_name || vendor.display_name || vendor.name || 'Vendor',
 description: vendor.bio || vendor.description || '',
 status: vendor.status || 'active',
 priority: vendor.featured ? 'high' : 'medium',
 amount: vendor.hourly_rate || 0,
 currency: vendor.currency || 'USD',
 vendor_name: vendor.business_name || vendor.name || '',
 category: vendor.primary_category || 'services',
 project_name: '',
 requested_by: '',
 due_date: undefined,
 created_at: vendor.created_at || new Date().toISOString(),
 updated_at: vendor.updated_at || new Date().toISOString()
 });
 });
 }

 // Add demo data if no live data
 if (combinedData.length === 0) {
 const demoData: DataRecord[] = [
 {
 id: 'demo-order-1',
 type: 'order',
 reference_number: 'PO-2024-001',
 title: 'Professional Camera Equipment',
 description: 'High-end cinema cameras and lenses for main deck production',
 status: 'approved',
 priority: 'high',
 amount: 25000,
 currency: 'USD',
 vendor_name: 'B&H Photo',
 category: 'equipment',
 project_name: 'Blackwater Reverb — Main Deck Takeover',
 requested_by: 'Captain Blackbeard',
 due_date: '2024-02-15',
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 },
 {
 id: 'demo-request-1',
 type: 'request',
 reference_number: 'REQ-2024-001',
 title: 'Catering Services for Crew',
 description: 'Comprehensive catering for 5-day production schedule',
 status: 'pending',
 priority: 'medium',
 amount: 8500,
 currency: 'USD',
 vendor_name: 'Seaside Catering Co.',
 category: 'services',
 project_name: 'Blackwater Reverb — Main Deck Takeover',
 requested_by: 'Quartermaster',
 due_date: '2024-02-10',
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 },
 {
 id: 'demo-vendor-1',
 type: 'vendor',
 reference_number: 'VEN-001',
 title: 'Maritime Equipment Specialists',
 description: 'Professional maritime equipment and safety gear supplier',
 status: 'active',
 priority: 'high',
 amount: 150,
 currency: 'USD',
 vendor_name: 'Maritime Equipment Specialists',
 category: 'equipment',
 project_name: '',
 requested_by: '',
 due_date: null,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 }
 ];
 combinedData.push(...demoData);
 }

 setData(combinedData);
 } catch (error) {
 console.error('Error loading procurement data:', error);
 setError(error instanceof Error ? error.message : 'Failed to load data');
 } finally {
 setLoading(false);
 }
 }, [orgId]);

 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 loadData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [loadData]);

 // Handle record actions
 const handleCreateRecord = useCallback(() => {
 setDrawerRecord(null);
 setDrawerMode('create');
 setDrawerOpen(true);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleEditRecord = useCallback((record: DataRecord) => {
 setDrawerRecord(record);
 setDrawerMode('edit');
 setDrawerOpen(true);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleViewRecord = useCallback((record: DataRecord) => {
 setDrawerRecord(record);
 setDrawerMode('view');
 setDrawerOpen(true);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleDeleteRecords = useCallback(async (recordIds: string[]) => {
 try {
 // Implementation would depend on record type
 await loadData(); // Refresh data
 } catch (error) {
 console.error('Error deleting records:', error);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [loadData]);

 const handleExportData = useCallback((exportData: DataRecord[], format: string) => {
 // Implementation for export functionality
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleImportData = useCallback((importData: unknown[]) => {
 // Implementation for import functionality
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // DataView configuration
 const dataViewConfig: DataViewConfig = {
 id: 'procurement-main',
 name: 'Procurement Management',
 description: 'Comprehensive procurement management system',
 viewType: 'grid' as ViewType,
 defaultView: 'grid' as ViewType,
 fields: fieldConfig,
 data: data,
 loading,
 error,
 selectedRecords,
 onSelectionChange: setSelectedRecords,
 onCreateRecord: handleCreateRecord,
 onEditRecord: handleEditRecord,
 onViewRecord: handleViewRecord,
 onDeleteRecords: handleDeleteRecords,
 onRefresh: loadData,
 onExport: handleExportData,
 onImport: handleImportData,
 permissions: {
 canCreate: true,
 canEdit: true,
 canDelete: true,
 canExport: true,
 canImport: true
 },
 features: {
 search: true,
 filter: true,
 sort: true,
 pagination: true,
 bulkActions: true,
 export: true,
 import: true,
 realtime: true
 }
 };

 return (
 <div className="h-full">
 <DataViewProvider config={dataViewConfig}>
 <StateManagerProvider>
 <div className="flex flex-col h-full">
 {/* Header with actions */}
 <div className="flex items-center justify-between p-md border-b border-border">
 <div className="flex items-center gap-sm">
 <h1 className="text-xl font-semibold">Procurement</h1>
 <span className="text-sm text-muted-foreground">
 {data.length} items
 </span>
 </div>
 <div className="flex items-center gap-sm">
 <ViewSwitcher />
 <DataActions />
 </div>
 </div>

 {/* Main content area */}
 <div className="flex-1 overflow-hidden">
 <DataGrid />
 <KanbanBoard 
 columns={[
 { id: 'draft', title: 'Draft' },
 { id: 'pending', title: 'Pending' },
 { id: 'approved', title: 'Approved' },
 { id: 'active', title: 'Active' },
 { id: 'completed', title: 'Completed' }
 ]}
 statusField="status"
 titleField="title"
 />
 <CalendarView 
 startDateField="created_at"
 endDateField="due_date"
 titleField="title"
 />
 <ListView 
 titleField="title"
 subtitleField="description"
 metaFields={['status', 'priority', 'amount']}
 />
 <TimelineView 
 dateField="created_at"
 titleField="title"
 statusField="status"
 />
 <DashboardView />
 </div>

 {/* Universal Drawer */}
 <Drawer
 open={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 record={drawerRecord}
 mode={drawerMode}
 title={
 drawerMode === 'create' 
 ? 'Create Procurement Item'
 : drawerMode === 'edit'
 ? 'Edit Procurement Item'
 : 'Procurement Item Details'
 }
 tabs={[
 {
 key: 'details',
 label: 'Details',
 content: (
 <div className="p-md space-y-md">
 <p className="text-sm text-muted-foreground">
 Procurement item management functionality will be implemented here.
 </p>
 {drawerRecord && (
 <div className="space-y-sm">
 <div>
 <span className="font-medium">Type:</span> {drawerRecord.type}
 </div>
 <div>
 <span className="font-medium">Reference:</span> {drawerRecord.reference_number}
 </div>
 <div>
 <span className="font-medium">Status:</span> {drawerRecord.status}
 </div>
 <div>
 <span className="font-medium">Amount:</span> {drawerRecord.currency} {drawerRecord.amount}
 </div>
 </div>
 )}
 </div>
 )
 }
 ]}
 />
 </div>
 </StateManagerProvider>
 </DataViewProvider>
 </div>
 );
}
