'use client';

import { Plus, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Search, Download, Upload, RefreshCw, Eye, Edit, Trash2, Grid3X3, List, LayoutDashboard, Calendar, BarChart3, Filter } from "lucide-react";
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { 
 Button, 
 Badge, 
 Card,
 Input,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
 Checkbox
} from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import { RequestsService } from './lib/requestsService';
import { CreateRequestClient } from './CreateRequestClient';
import type { ProcurementRequest, RequestFilters, RequestSortOptions } from './types';

interface RequestsClientProps {
 className?: string;
 organizationId?: string;
}

// View Types
type RequestViewMode = 'dashboard' | 'grid' | 'list' | 'kanban' | 'calendar';

export default function RequestsClient({ className, organizationId = 'default-org' }: RequestsClientProps) {
 const t = useTranslations();
 const supabase = createBrowserClient();
 
 // State management
 const [loading, setLoading] = useState(false);
 const [requests, setRequests] = useState<ProcurementRequest[]>([]);
 const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
 const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
 const [viewMode, setViewMode] = useState<RequestViewMode>('dashboard');
 const [showCreateDrawer, setShowCreateDrawer] = useState(false);
 const [showRequestDrawer, setShowRequestDrawer] = useState(false);
 
 // Filters and sorting
 const [filters, setFilters] = useState({
 search: '',
 status: 'all',
 priority: 'all',
 category: 'all'
 });
 const [sort, setSort] = useState<RequestSortOptions>({ field: 'created_at', direction: 'desc' });

 const requestsService = new RequestsService();

 // Field configuration for procurement requests
 const fieldConfig: FieldConfig[] = [
 {
 key: 'title',
 label: 'Request Title',
 type: 'text',
 required: true,
 sortable: true,
 searchable: true
 },
 {
 key: 'requester',
 label: 'Requester',
 type: 'text',
 sortable: true,
 render: (value: unknown) => value?.name || 'Unknown'
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: [
 { value: 'draft', label: 'Draft' },
 { value: 'submitted', label: 'Submitted' },
 { value: 'under_review', label: 'Under Review' },
 { value: 'approved', label: 'Approved' },
 { value: 'rejected', label: 'Rejected' },
 { value: 'cancelled', label: 'Cancelled' },
 { value: 'converted', label: 'Converted' }
 ],
 filterable: true,
 sortable: true,
 render: (value: string) => {
 const statusConfig = {
 draft: { color: 'gray' as const, icon: FileText },
 submitted: { color: 'blue' as const, icon: Clock },
 under_review: { color: 'yellow' as const, icon: AlertTriangle },
 approved: { color: 'green' as const, icon: CheckCircle },
 rejected: { color: 'red' as const, icon: XCircle },
 cancelled: { color: 'gray' as const, icon: XCircle },
 converted: { color: 'purple' as const, icon: CheckCircle }
 };
 const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.draft;
 const Icon = config.icon;
 return (
 <Badge variant={config.color} className="flex items-center gap-xs">
 <Icon className="h-3 w-3" />
 {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
 </Badge>
 );
 }
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
 render: (value: string) => {
 const priorityColors = {
 low: 'gray' as const,
 medium: 'blue' as const,
 high: 'yellow' as const,
 urgent: 'red' as const
 };
 return (
 <Badge variant={priorityColors[value as keyof typeof priorityColors] || 'gray'}>
 {value.charAt(0).toUpperCase() + value.slice(1)}
 </Badge>
 );
 }
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
 { value: 'maintenance', label: 'Maintenance' },
 { value: 'other', label: 'Other' }
 ],
 filterable: true,
 sortable: true
 },
 {
 key: 'estimated_total',
 label: 'Estimated Total',
 type: 'currency',
 sortable: true,
 render: (value: number, record: DataRecord) => {
 const currency = record.currency || 'USD';
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: currency
 }).format(value || 0);
 }
 },
 {
 key: 'project',
 label: 'Project',
 type: 'text',
 sortable: true,
 render: (value: unknown) => value?.name || 'No Project'
 },
 {
 key: 'requested_delivery_date',
 label: 'Requested Delivery',
 type: 'date',
 sortable: true
 },
 {
 key: 'created_at',
 label: 'Created',
 type: 'date',
 sortable: true
 },
 {
 key: 'updated_at',
 label: 'Updated',
 type: 'date',
 sortable: true
 }
 ];

 // Load data function
 const loadData = useCallback(async () => {
 setLoading(true);
 try {
 const { data: requests, error } = await requestsService.getRequests(
 organizationId,
 filters,
 sortConfig
 );

 if (error) {
 toast.error('Failed to load requests', { description: error });
 return;
 }

 // Transform data for DataViews
 const transformedData: DataRecord[] = requests.map(request => ({
 id: request.id!,
 ...request,
 record_type: 'request'
 }));

 setData(transformedData);
 } catch (error) {
 console.error('Error loading requests:', error);
 toast.error('Failed to load requests');
 } finally {
 setLoading(false);
 }
 }, [organizationId, filters, sortConfig]);

 // Load data on mount and when dependencies change
 useEffect(() => {
 loadData();
 }, [loadData]);

 // Handle record selection
 const handleRecordSelect = (record: DataRecord) => {
 setSelectedRecord(record);
 setDrawerOpen(true);
 };

 // Handle record actions
 const handleRecordAction = async (action: string, record: DataRecord) => {
 try {
 switch (action) {
 case 'submit':
 if (record.status === 'draft') {
 await requestsService.submitRequest(record.id);
 toast.success('Request submitted for approval');
 loadData();
 }
 break;
 case 'approve':
 if (record.status === 'submitted' || record.status === 'under_review') {
 // In a real app, this would check permissions
 await requestsService.approveRequest(record.id, 'current-user-id');
 toast.success('Request approved');
 loadData();
 }
 break;
 case 'reject':
 if (record.status === 'submitted' || record.status === 'under_review') {
 await requestsService.rejectRequest(record.id, 'current-user-id', 'Rejected by user');
 toast.success('Request rejected');
 loadData();
 }
 break;
 case 'convert':
 if (record.status === 'approved') {
 const { data: result, error } = await requestsService.convertToPurchaseOrder(record.id);
 if (error) {
 toast.error('Failed to convert to purchase order', { description: error });
 } else {
 toast.success(`Converted to purchase order: ${result?.orderId}`);
 loadData();
 }
 }
 break;
 case 'delete':
 await requestsService.deleteRequest(record.id);
 toast.success('Request deleted');
 loadData();
 break;
 }
 } catch (error) {
 console.error('Error performing action:', error);
 toast.error(`Failed to ${action} request`);
 }
 };

 // Handle search
 const handleSearch = (query: string) => {
 // In a real implementation, this would update filters
 };

 // Handle filter changes
 const handleFilter = (newFilters: FilterConfig[]) => {
 const requestFilters: RequestFilters = {};
 
 newFilters.forEach(filter => {
 switch (filter.field) {
 case 'status':
 requestFilters.status = filter.value as unknown[];
 break;
 case 'priority':
 requestFilters.priority = filter.value as unknown[];
 break;
 case 'category':
 requestFilters.category = filter.value as unknown[];
 break;
 }
 });

 setFilters(requestFilters);
 };

 // Handle sort changes
 const handleSort = (sorts: SortConfig[]) => {
 if (sorts.length > 0) {
 const sort = sorts[0];
 setSortConfig({
 field: sort.field as unknown,
 direction: sort.direction
 });
 }
 };

 // Handle export
 const handleExport = (data: DataRecord[], format: string) => {
 toast.success(`Exported ${data.length} requests as ${format.toUpperCase()}`);
 };

 // Handle import
 const handleImport = (data: unknown[]) => {
 toast.success(`Imported ${data.length} requests`);
 loadData();
 };

 // DataView configuration
 const dataViewConfig: DataViewConfig = {
 id: 'procurement-requests',
 name: 'Procurement Requests',
 viewType: 'grid',
 defaultView: 'grid',
 fields: fieldConfig,
 data: data,
 loading: loading,
 onRecordSelect: handleRecordSelect,
 onRecordAction: handleRecordAction,
 onSearch: handleSearch,
 onFilter: handleFilter,
 onSort: handleSort,
 onRefresh: loadData,
 onExport: handleExport,
 onImport: handleImport,
 actions: [
 {
 id: 'submit',
 label: 'Submit',
 icon: 'send',
 variant: 'primary',
 condition: (record) => record.status === 'draft'
 },
 {
 id: 'approve',
 label: 'Approve',
 icon: 'check',
 variant: 'success',
 condition: (record) => ['submitted', 'under_review'].includes(record.status)
 },
 {
 id: 'reject',
 label: 'Reject',
 icon: 'x',
 variant: 'destructive',
 condition: (record) => ['submitted', 'under_review'].includes(record.status)
 },
 {
 id: 'convert',
 label: 'Convert to PO',
 icon: 'arrow-right',
 variant: 'secondary',
 condition: (record) => record.status === 'approved'
 },
 {
 id: 'delete',
 label: 'Delete',
 icon: 'trash',
 variant: 'destructive',
 condition: (record) => ['draft', 'cancelled'].includes(record.status)
 }
 ]
 };

 return (
 <div className={className}>
 <DataViewProvider config={dataViewConfig}>
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-semibold text-foreground">Procurement Requests</h1>
 <p className="text-sm text-muted-foreground">
 Manage purchase requisitions and approval workflows
 </p>
 </div>
 <Button 
 onClick={() => setCreateDrawerOpen(true)}
 className="flex items-center gap-xs"
 >
 <Plus className="h-icon-xs w-icon-xs" />
 New Request
 </Button>
 </div>

 {/* Data Views */}
 <DataViews />

 {/* Request Details Drawer */}
 <Drawer
 open={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 record={selectedRecord}
 fields={fieldConfig}
 mode="view"
 title="Request Details"
 tabs={[
 {
 key: 'details',
 label: 'Details',
 content: selectedRecord ? (
 <div className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium text-muted-foreground">Title</label>
 <p className="text-sm">{selectedRecord.title}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Status</label>
 <div className="mt-1">
 {fieldConfig.find(f => f.key === 'status')?.render?.(selectedRecord.status, selectedRecord)}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Priority</label>
 <div className="mt-1">
 {fieldConfig.find(f => f.key === 'priority')?.render?.(selectedRecord.priority, selectedRecord)}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Category</label>
 <p className="text-sm">{selectedRecord.category}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Estimated Total</label>
 <p className="text-sm">
 {fieldConfig.find(f => f.key === 'estimated_total')?.render?.(selectedRecord.estimated_total, selectedRecord)}
 </p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Requester</label>
 <p className="text-sm">{selectedRecord.requester?.name}</p>
 </div>
 </div>
 {selectedRecord.description && (
 <div>
 <label className="text-sm font-medium text-muted-foreground">Description</label>
 <p className="text-sm mt-1">{selectedRecord.description}</p>
 </div>
 )}
 {selectedRecord.business_justification && (
 <div>
 <label className="text-sm font-medium text-muted-foreground">Business Justification</label>
 <p className="text-sm mt-1">{selectedRecord.business_justification}</p>
 </div>
 )}
 </div>
 ) : null
 },
 {
 key: 'items',
 label: 'Items',
 content: selectedRecord?.items ? (
 <div className="space-y-md">
 {selectedRecord.items.map((item: unknown, index: number) => (
 <div key={index} className="border rounded-lg p-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium text-muted-foreground">Item Name</label>
 <p className="text-sm">{item.name}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Category</label>
 <p className="text-sm">{item.category}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Quantity</label>
 <p className="text-sm">{item.quantity} {item.unit}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Estimated Price</label>
 <p className="text-sm">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: selectedRecord.currency || 'USD'
 }).format(item.estimated_total_price || 0)}
 </p>
 </div>
 </div>
 {item.description && (
 <div className="mt-2">
 <label className="text-sm font-medium text-muted-foreground">Description</label>
 <p className="text-sm mt-1">{item.description}</p>
 </div>
 )}
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No items found</p>
 )
 },
 {
 key: 'activity',
 label: 'Activity',
 content: (
 <div className="space-y-md">
 <p className="text-sm text-muted-foreground">Activity log will be implemented here</p>
 </div>
 )
 }
 ]}
 />

 {/* Create Request Drawer */}
 <CreateRequestClient
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 onSuccess={() => {
 setCreateDrawerOpen(false);
 loadData();
 }}
 organizationId={organizationId}
 />
 </div>
 </DataViewProvider>
 </div>
 );
}
