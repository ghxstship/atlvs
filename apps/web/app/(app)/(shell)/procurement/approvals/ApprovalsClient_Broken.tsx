'use client';

import { CheckCircle, XCircle, Clock, AlertTriangle, Users, TrendingUp, Filter, Settings, Plus, Search, Download, Upload, RefreshCw, Eye, Edit, Trash2, MoreHorizontal, Grid3X3, List, LayoutDashboard, Calendar, BarChart3 } from "lucide-react";
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
 TabsTrigger
} from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import { approvalsService } from './lib/approvalsService';
import { CreatePolicyClient } from './CreatePolicyClient';
import type { 
 ApprovalStep, 
 ApprovalSortOptions,
 ApprovalDashboardData
} from './types';

interface ApprovalsClientProps {
 className?: string;
 organizationId?: string;
 userId?: string;
}

export default function ApprovalsClient({ 
 className, 
 organizationId = 'default-org',
 userId = 'current-user-id'
}: ApprovalsClientProps) {
 const t = useTranslations();
 const supabase = createBrowserClient();
 
 // State management
 const [loading, setLoading] = useState(false);
 const [data, setData] = useState<DataRecord[]>([]);
 const [dashboardData, setDashboardData] = useState<ApprovalDashboardData | null>(null);
 const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
 const [showCreatePolicy, setShowCreatePolicy] = useState(false);
 const [showApprovalDrawer, setShowApprovalDrawer] = useState(false);
 const [selectedApproval, setSelectedApproval] = useState<ApprovalStep | null>(null);
 
 // Filters and sorting
 const [filters, setFilters] = useState({
 status: 'all' as string,
 priority: 'all' as string,
 search: ''
 });
 const [sort, setSort] = useState<ApprovalSortOptions>({
 field: 'created_at',
 direction: 'desc'
 });

 const approvalsService = new ApprovalsService();

 // Field configuration for ATLVS DataViews
 const fieldConfig: FieldConfig[] = [
 {
 key: 'request_title',
 label: 'Request',
 type: 'text',
 sortable: true,
 filterable: true,
 width: 200
 },
 {
 key: 'requester_name',
 label: 'Requester',
 type: 'text',
 sortable: true,
 filterable: true,
 width: 150
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 sortable: true,
 filterable: true,
 width: 120
 },
 {
 key: 'priority',
 label: 'Priority',
 type: 'select',
 sortable: true,
 filterable: true,
 width: 100
 },
 {
 key: 'amount',
 label: 'Amount',
 type: 'currency',
 sortable: true,
 filterable: true,
 width: 120
 },
 {
 key: 'due_date',
 label: 'Due Date',
 type: 'date',
 sortable: true,
 filterable: true,
 width: 120
 },
 {
 key: 'created_at',
 label: 'Created',
 type: 'date',
 sortable: true,
 filterable: true,
 width: 120
 }
 ];

 // Filter configuration for ATLVS
 const filterConfig: FilterConfig[] = [
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: [
 { value: 'all', label: 'All Status' },
 { value: 'pending', label: 'Pending' },
 { value: 'approved', label: 'Approved' },
 { value: 'rejected', label: 'Rejected' },
 { value: 'skipped', label: 'Skipped' }
 ]
 },
 {
 key: 'priority',
 label: 'Priority',
 type: 'select',
 options: [
 { value: 'all', label: 'All Priorities' },
 { value: 'low', label: 'Low' },
 { value: 'medium', label: 'Medium' },
 { value: 'high', label: 'High' },
 { value: 'urgent', label: 'Urgent' }
 ]
 },
 {
 key: 'search',
 label: 'Search',
 type: 'text',
 placeholder: 'Search approvals...'
 }
 ];

 // Sort configuration for ATLVS
 const sortConfig: SortConfig[] = [
 { key: 'created_at', label: 'Created Date' },
 { key: 'due_date', label: 'Due Date' },
 { key: 'amount', label: 'Amount' },
 { key: 'status', label: 'Status' },
 { key: 'priority', label: 'Priority' }
 ];

 // Field visibility state
 const [visibleFields, setVisibleFields] = useState<string[]>(
 fieldConfig.map(field => field.key)
 );
 const [fieldOrder, setFieldOrder] = useState<string[]>(
 fieldConfig.map(field => field.key)
 );

 // DataView configuration for ATLVS
 const dataViewConfig: DataViewConfig = {
 id: 'procurement-approvals',
 name: 'Procurement Approvals',
 viewType: 'grid',
 defaultView: 'grid',
 fields: fieldConfig.filter(field => visibleFields.includes(field.key)),
 filters: filterConfig,
 sorts: sortConfig,
 actions: {
 create: true,
 edit: true,
 delete: true,
 export: true,
 import: true,
 bulkActions: true,
 fieldVisibility: true,
 fieldReordering: true
 },
 views: {
 grid: { enabled: true, default: true },
 list: { enabled: true },
 kanban: { enabled: true, groupBy: 'status' },
 calendar: { enabled: true, dateField: 'due_date' },
 dashboard: { enabled: true }
 },
 preferences: {
 visibleFields,
 fieldOrder,
 pageSize: 25,
 defaultSort: { field: 'created_at', direction: 'desc' }
 }
 };

 // Load approvals data
 const loadApprovals = useCallback(async () => {
 try {
 setLoading(true);
 
 // Load approval steps
 const { data: approvals, error } = await approvalsService.getApprovalSteps(
 organizationId,
 filters,
 sort
 );

 if (error) {
 console.error('Error loading approvals:', error);
 return;
 }

 // Transform to DataRecord format for ATLVS
 const transformedData: DataRecord[] = (approvals || []).map((approval: ApprovalStep) => ({
 id: approval.id,
 request_title: approval.request?.title || 'Unknown Request',
 requester_name: (approval.request as unknown)?.requester?.name || 'Unknown',
 status: approval.status,
 priority: approval.priority || 'medium',
 amount: approval.request?.estimated_total || 0,
 due_date: approval.due_date,
 created_at: approval.created_at,
 updated_at: approval.updated_at,
 record_type: 'approval'
 }));

 setData(transformedData);

 // Load dashboard data
 const { data: dashboard } = await approvalsService.getDashboardData(organizationId, userId);
 setDashboardData(dashboard);

 } catch (error) {
 console.error('Error loading approvals:', error);
 } finally {
 setLoading(false);
 }
 }, [organizationId, userId, filters, sort]);

 // Load data on mount and when dependencies change
 useEffect(() => {
 loadApprovals();
 }, [loadApprovals]);

 // Handle filter changes
 const handleFilterChange = useCallback((newFilters: Partial<ApprovalFilters>) => {
 setFilters(prev => ({ ...prev, ...newFilters }));
 }, []);

 // Handle sort changes
 const handleSortChange = useCallback((newSort: ApprovalSortOptions) => {
 setSort(newSort);
 }, []);

 // Handle approval actions
 const handleApprovalAction = useCallback(async (
 approvalId: string, 
 action: 'approve' | 'reject' | 'skip',
 notes?: string
 ) => {
 try {
 setLoading(true);
 
 const { error } = await approvalsService.processApproval(
 organizationId,
 approvalId,
 action,
 userId,
 notes
 );

 if (error) {
 console.error('Error processing approval:', error);
 return;
 }

 // Reload data
 await loadApprovals();
 
 } catch (error) {
 console.error('Error processing approval:', error);
 } finally {
 setLoading(false);
 }
 }, [organizationId, userId, loadApprovals]);

 // Handle record selection
 const handleRecordSelect = useCallback((recordIds: string[]) => {
 setSelectedApprovals(recordIds);
 }, []);

 // Handle record actions
 const handleRecordAction = useCallback((action: string, record: DataRecord) => {
 switch (action) {
 case 'view':
 setSelectedApproval(record as unknown);
 setShowApprovalDrawer(true);
 break;
 case 'approve':
 handleApprovalAction(record.id, 'approve');
 break;
 case 'reject':
 handleApprovalAction(record.id, 'reject');
 break;
 case 'skip':
 handleApprovalAction(record.id, 'skip');
 break;
 }
 }, [handleApprovalAction]);

 // Handle bulk actions
 const handleBulkAction = useCallback(async (action: string, recordIds: string[]) => {
 try {
 setLoading(true);
 
 for (const recordId of recordIds) {
 await handleApprovalAction(recordId, action as unknown);
 }
 
 setSelectedApprovals([]);
 
 } catch (error) {
 console.error('Error processing bulk action:', error);
 } finally {
 setLoading(false);
 }
 }, [handleApprovalAction]);

 // Render dashboard cards
 const renderDashboardCards = () => {
 if (!dashboardData) return null;

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Pending Approvals</p>
 <p className="text-2xl font-bold">{dashboardData.pending_count}</p>
 </div>
 <Clock className="h-icon-lg w-icon-lg text-warning" />
 </div>
 </Card>
 
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Approved Today</p>
 <p className="text-2xl font-bold">{dashboardData.approved_today}</p>
 </div>
 <CheckCircle className="h-icon-lg w-icon-lg text-success" />
 </div>
 </Card>
 
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Overdue</p>
 <p className="text-2xl font-bold">{dashboardData.overdue_count}</p>
 </div>
 <AlertTriangle className="h-icon-lg w-icon-lg text-destructive" />
 </div>
 </Card>
 
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Value</p>
 <p className="text-2xl font-bold">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(dashboardData.total_value || 0)}
 </p>
 </div>
 <TrendingUp className="h-icon-lg w-icon-lg text-info" />
 </div>
 </Card>
 </div>
 );
 };

 return (
 <div className={`space-y-lg ${className || ''}`}>
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Users className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Procurement Approvals</h3>
 <Badge variant="secondary">
 {data.length} approval{data.length !== 1 ? 's' : ''}
 </Badge>
 </div>
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setShowCreatePolicy(true)}
 >
 <Settings className="h-icon-xs w-icon-xs mr-sm" />
 Policies
 </Button>
 <Button variant="outline" size="sm">
 <Upload className="h-icon-xs w-icon-xs mr-sm" />
 Import
 </Button>
 <Button variant="outline" size="sm">
 <Download className="h-icon-xs w-icon-xs mr-sm" />
 Export
 </Button>
 <Button size="sm" onClick={loadApprovals}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-sm" />
 Refresh
 </Button>
 </div>
 </div>

 {/* Dashboard Cards */}
 {renderDashboardCards()}

 {/* ATLVS DataViews */}
 <DataViewProvider config={dataViewConfig}>
 <div className="space-y-md">
 {/* Data Actions */}
 <DataActions
 selectedCount={selectedApprovals.length}
 onBulkAction={handleBulkAction}
 onFilterChange={handleFilterChange}
 onSortChange={handleSortChange}
 filters={filters}
 sort={sort}
 />

 {/* View Switcher and Data Display */}
 <ViewSwitcher
 data={data}
 loading={loading}
 selectedRecords={selectedApprovals}
 onRecordSelect={handleRecordSelect}
 onRecordAction={handleRecordAction}
 fieldConfig={fieldConfig}
 />
 </div>
 </DataViewProvider>

 {/* Approval Details Drawer */}
 <AppDrawer
 open={showApprovalDrawer}
 onClose={() => setShowApprovalDrawer(false)}
 title="Approval Details"
 size="md"
 >
 {selectedApproval && (
 <div className="space-y-md">
 <div>
 <h4 className="font-medium mb-sm">Request Information</h4>
 <p className="text-sm text-muted-foreground">
 {selectedApproval.request?.title || 'No title'}
 </p>
 </div>
 
 <div>
 <h4 className="font-medium mb-sm">Status</h4>
 <Badge variant={
 selectedApproval.status === 'approved' ? 'success' :
 selectedApproval.status === 'rejected' ? 'destructive' :
 selectedApproval.status === 'pending' ? 'warning' : 'secondary'
 }>
 {selectedApproval.status}
 </Badge>
 </div>

 <div className="flex gap-sm pt-md border-t">
 <Button
 variant="outline"
 onClick={() => handleApprovalAction(selectedApproval.id, 'approve')}
 disabled={selectedApproval.status !== 'pending'}
 >
 <CheckCircle className="h-icon-xs w-icon-xs mr-sm" />
 Approve
 </Button>
 <Button
 variant="outline"
 onClick={() => handleApprovalAction(selectedApproval.id, 'reject')}
 disabled={selectedApproval.status !== 'pending'}
 >
 <XCircle className="h-icon-xs w-icon-xs mr-sm" />
 Reject
 </Button>
 </div>
 </div>
 )}
 </AppDrawer>

 {/* Create Policy Drawer */}
 <CreatePolicyClient
 open={showCreatePolicy}
 onClose={() => setShowCreatePolicy(false)}
 onSuccess={() => {
 setShowCreatePolicy(false);
 loadApprovals();
 }}
 organizationId={organizationId}
 />
 </div>
 );
}
