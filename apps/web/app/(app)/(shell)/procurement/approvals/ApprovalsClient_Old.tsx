'use client';

import { CheckCircle, XCircle, Clock, AlertTriangle, Users, TrendingUp, Filter, Settings, Plus, Search, Download, Upload, RefreshCw, Eye, Edit, Trash2, MoreHorizontal, Grid3X3, List, LayoutDashboard, Calendar, BarChart3 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { 
 Button, 
 Badge, 
 Card, 
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
 Input,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Checkbox
} from '@ghxstship/ui';
import { 
 DataGrid,
 KanbanBoard,
 ListView,
 CalendarView,
 DashboardView,
 ViewSwitcher,
 DataActions
} from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import { ApprovalsService } from './lib/approvalsService';
import type { 
 ApprovalStep, 
 ApprovalFilters, 
 ApprovalSortOptions,
 ApprovalStatistics,
 ApprovalDashboardData
} from './types';

// ATLVS View Types
type ApprovalViewType = 'dashboard' | 'grid' | 'list' | 'kanban' | 'calendar';

// ATLVS Data Record
interface ApprovalRecord extends ApprovalStep {
 record_type: 'approval';
}

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
 const [loading, setLoading] = useState(false);
 const [data, setData] = useState<ApprovalRecord[]>([]);
 const [dashboardData, setDashboardData] = useState<ApprovalDashboardData | null>(null);
 const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
 const [viewMode, setViewMode] = useState<ApprovalViewType>('dashboard');
 const [showCreatePolicy, setShowCreatePolicy] = useState(false);
 const [showApprovalDrawer, setShowApprovalDrawer] = useState(false);
 const [selectedApproval, setSelectedApproval] = useState<ApprovalStep | null>(null);
 
 // Filters and sorting
 const [filters, setFilters] = useState<ApprovalFilters>({
 status: 'all',
 priority: 'all',
 search: ''
 });
 const [sortConfig, setSortConfig] = useState<ApprovalSortOptions>({
 field: 'created_at',
 direction: 'desc'
 });

 const approvalsService = new ApprovalsService();

 // Field configuration for approval steps
 const fieldConfig: FieldConfig[] = [
 {
 key: 'request',
 label: 'Request',
 type: 'text',
 sortable: true,
 searchable: true,
 render: (value: unknown) => (
 <div>
 <p className="font-medium">{value?.title || 'Unknown Request'}</p>
 <p className="text-sm text-muted-foreground">
 by {value?.requester?.name || 'Unknown'}
 </p>
 </div>
 )
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: [
 { value: 'pending', label: 'Pending' },
 { value: 'approved', label: 'Approved' },
 { value: 'rejected', label: 'Rejected' },
 { value: 'skipped', label: 'Skipped' }
 ],
 filterable: true,
 sortable: true,
 render: (value: string) => {
 const statusConfig = {
 pending: { color: 'warning' as const, icon: Clock },
 approved: { color: 'success' as const, icon: CheckCircle },
 rejected: { color: 'destructive' as const, icon: XCircle },
 skipped: { color: 'secondary' as const, icon: AlertTriangle }
 };
 const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending;
 const Icon = config.icon;
 return (
 <Badge variant={config.color} className="flex items-center gap-1">
 <Icon className="h-3 w-3" />
 {value.charAt(0).toUpperCase() + value.slice(1)}
 </Badge>
 );
 }
 },
 {
 key: 'step_order',
 label: 'Step',
 type: 'number',
 sortable: true,
 render: (value: number) => (
 <Badge variant="outline">Step {value}</Badge>
 )
 },
 {
 key: 'approver',
 label: 'Approver',
 type: 'text',
 sortable: true,
 render: (value: unknown) => (
 <div className="flex items-center gap-2">
 <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
 <span className="text-xs font-medium">
 {value?.name?.charAt(0)?.toUpperCase() || '?'}
 </span>
 </div>
 <div>
 <p className="font-medium">{value?.name || 'Unknown'}</p>
 <p className="text-xs text-muted-foreground">{value?.email}</p>
 </div>
 </div>
 )
 },
 {
 key: 'estimated_total',
 label: 'Amount',
 type: 'currency',
 sortable: true,
 render: (value: number, record: DataRecord) => {
 const currency = record.request?.currency || 'USD';
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: currency
 }).format(record.request?.estimated_total || 0);
 }
 },
 {
 key: 'created_at',
 label: 'Requested',
 type: 'date',
 sortable: true
 },
 {
 key: 'approved_at',
 label: 'Decided',
 type: 'date',
 sortable: true,
 render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
 }
 ];

 // Load dashboard data
 const loadDashboardData = useCallback(async () => {
 setLoading(true);
 try {
 const { data: dashboard, error } = await approvalsService.getDashboardData(
 organizationId,
 userId
 );

 if (error) {
 toast.error('Failed to load dashboard data', { description: error });
 return;
 }

 setDashboardData(dashboard);
 } catch (error) {
 console.error('Error loading dashboard data:', error);
 toast.error('Failed to load dashboard data');
 } finally {
 setLoading(false);
 }
 }, [organizationId, userId]);

 // Load approval steps data
 const loadApprovalSteps = useCallback(async () => {
 setLoading(true);
 try {
 let approvals;
 
 if (activeTab === 'pending') {
 approvals = await approvalsService.getPendingApprovals(
 organizationId,
 userId,
 filters,
 sortConfig
 );
 } else {
 approvals = await approvalsService.getApprovalSteps(
 organizationId,
 filters,
 sortConfig
 );
 }

 if (approvals.error) {
 toast.error('Failed to load approvals', { description: approvals.error });
 return;
 }

 // Transform data for DataViews
 const transformedData: DataRecord[] = approvals.data.map(approval => ({
 id: approval.id!,
 ...approval,
 record_type: 'approval',
 estimated_total: approval.request?.estimated_total || 0
 }));

 setData(transformedData);
 } catch (error) {
 console.error('Error loading approvals:', error);
 toast.error('Failed to load approvals');
 } finally {
 setLoading(false);
 }
 }, [organizationId, userId, activeTab, filters, sortConfig]);

 // Load data based on active tab
 useEffect(() => {
 if (activeTab === 'dashboard') {
 loadDashboardData();
 } else if (activeTab === 'pending' || activeTab === 'all') {
 loadApprovalSteps();
 }
 }, [activeTab, loadDashboardData, loadApprovalSteps]);

 // Handle record selection
 const handleRecordSelect = (record: DataRecord) => {
 setSelectedRecord(record);
 setDrawerOpen(true);
 };

 // Handle approval actions
 const handleRecordAction = async (action: string, record: DataRecord) => {
 try {
 switch (action) {
 case 'approve':
 if (record.status === 'pending') {
 const { error } = await approvalsService.makeDecision(record.id, {
 step_id: record.id,
 action: 'approve',
 notes: 'Approved via UI'
 });
 if (error) {
 toast.error('Failed to approve', { description: error });
 } else {
 toast.success('Request approved');
 loadApprovalSteps();
 }
 }
 break;
 case 'reject':
 if (record.status === 'pending') {
 const { error } = await approvalsService.makeDecision(record.id, {
 step_id: record.id,
 action: 'reject',
 notes: 'Rejected via UI'
 });
 if (error) {
 toast.error('Failed to reject', { description: error });
 } else {
 toast.success('Request rejected');
 loadApprovalSteps();
 }
 }
 break;
 }
 } catch (error) {
 console.error('Error performing action:', error);
 toast.error(`Failed to ${action} request`);
 }
 };

 // Handle search
 const handleSearch = (query: string) => {
 };

 // Handle filter changes
 const handleFilter = (newFilters: FilterConfig[]) => {
 const approvalFilters: ApprovalFilters = {};
 
 newFilters.forEach(filter => {
 switch (filter.field) {
 case 'status':
 approvalFilters.status = filter.value as unknown[];
 break;
 }
 });

 setFilters(approvalFilters);
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

 // DataView configuration
 const dataViewConfig: DataViewConfig = {
 id: 'procurement-approvals',
 name: 'Procurement Approvals',
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
 onRefresh: activeTab === 'dashboard' ? loadDashboardData : loadApprovalSteps,
 actions: [
 {
 id: 'approve',
 label: 'Approve',
 icon: 'check',
 variant: 'success',
 condition: (record) => record.status === 'pending'
 },
 {
 id: 'reject',
 label: 'Reject',
 icon: 'x',
 variant: 'destructive',
 condition: (record) => record.status === 'pending'
 }
 ]
 };

 // Render dashboard view
 const renderDashboard = () => {
 if (!dashboardData) return null;

 return (
 <div className="space-y-6">
 {/* Statistics Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <Card className="p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Pending Approvals</p>
 <p className="text-2xl font-semibold">{dashboardData.statistics.total_pending}</p>
 </div>
 <Clock className="h-8 w-8 text-yellow-500" />
 </div>
 </Card>
 
 <Card className="p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Approved</p>
 <p className="text-2xl font-semibold">{dashboardData.statistics.total_approved}</p>
 </div>
 <CheckCircle className="h-8 w-8 text-green-500" />
 </div>
 </Card>
 
 <Card className="p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Approval Rate</p>
 <p className="text-2xl font-semibold">{dashboardData.statistics.approval_rate.toFixed(1)}%</p>
 </div>
 <TrendingUp className="h-8 w-8 text-blue-500" />
 </div>
 </Card>
 
 <Card className="p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Avg. Time</p>
 <p className="text-2xl font-semibold">{dashboardData.statistics.average_approval_time.toFixed(1)}h</p>
 </div>
 <Users className="h-8 w-8 text-purple-500" />
 </div>
 </Card>
 </div>

 {/* Pending Approvals */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4">Pending Your Approval</h3>
 {dashboardData.pending_approvals.length > 0 ? (
 <div className="space-y-3">
 {dashboardData.pending_approvals.map((approval) => (
 <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
 <div className="flex-1">
 <p className="font-medium">{approval.request?.title}</p>
 <p className="text-sm text-muted-foreground">
 Requested by {(approval.request as unknown)?.requester?.name || 'Unknown'} • 
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(approval.request?.estimated_total || 0)}
 </p>
 </div>
 <div className="flex gap-2">
 <Button 
 size="sm" 
 variant="outline"
 onClick={() => handleRecordAction('approve', approval as unknown)}
 >
 <CheckCircle className="h-4 w-4 mr-1" />
 Approve
 </Button>
 <Button 
 size="sm" 
 variant="outline"
 onClick={() => handleRecordAction('reject', approval as unknown)}
 >
 <XCircle className="h-4 w-4 mr-1" />
 Reject
 </Button>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-muted-foreground">No pending approvals</p>
 )}
 </Card>

 {/* Overdue Approvals */}
 {dashboardData.overdue_approvals.length > 0 && (
 <Card className="p-6">
 <h3 className="text-lg font-semibold mb-4 text-red-600">Overdue Approvals</h3>
 <div className="space-y-3">
 {dashboardData.overdue_approvals.map((approval) => (
 <div key={approval.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
 <div className="flex-1">
 <p className="font-medium">{approval.request?.title}</p>
 <p className="text-sm text-muted-foreground">
 Pending for {Math.floor((Date.now() - new Date(approval.created_at!).getTime()) / (1000 * 60 * 60))} hours
 </p>
 </div>
 <AlertTriangle className="h-5 w-5 text-red-500" />
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>
 );
 };

 return (
 <div className={className}>
 <div className="space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-semibold text-foreground">Procurement Approvals</h1>
 <p className="text-sm text-muted-foreground">
 Manage approval workflows and make approval decisions
 </p>
 </div>
 <div className="flex gap-2">
 <Button 
 variant="outline"
 onClick={() => setCreatePolicyOpen(true)}
 className="flex items-center gap-2"
 >
 <Settings className="h-4 w-4" />
 Policies
 </Button>
 <Button 
 onClick={() => setCreatePolicyOpen(true)}
 className="flex items-center gap-2"
 >
 <Plus className="h-4 w-4" />
 New Policy
 </Button>
 </div>
 </div>

 {/* Tab Navigation */}
 <div className="border-b">
 <nav className="flex space-x-8">
 {[
 { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
 { key: 'pending', label: 'Pending', icon: Clock },
 { key: 'all', label: 'All Approvals', icon: CheckCircle },
 { key: 'policies', label: 'Policies', icon: Settings }
 ].map(({ key, label, icon: Icon }) => (
 <button
 key={key}
 onClick={() => setActiveTab(key as unknown)}
 className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
 activeTab === key
 ? 'border-primary text-primary'
 : 'border-transparent text-muted-foreground hover:text-foreground'
 }`}
 >
 <Icon className="h-4 w-4" />
 {label}
 </button>
 ))}
 </nav>
 </div>

 {/* Content */}
 {activeTab === 'dashboard' && renderDashboard()}
 
 {(activeTab === 'pending' || activeTab === 'all') && (
 <DataViewProvider config={dataViewConfig}>
 <DataViews />
 </DataViewProvider>
 )}

 {activeTab === 'policies' && (
 <div className="text-center py-12">
 <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
 <h3 className="text-lg font-medium mb-2">Approval Policies</h3>
 <p className="text-muted-foreground mb-4">
 Configure approval workflows and policies for your organization
 </p>
 <Button onClick={() => setCreatePolicyOpen(true)}>
 Create First Policy
 </Button>
 </div>
 )}

 {/* Approval Details Drawer */}
 <Drawer
 open={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 record={selectedRecord}
 fields={fieldConfig}
 mode="view"
 title="Approval Details"
 tabs={[
 {
 key: 'details',
 label: 'Details',
 content: selectedRecord ? (
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-medium text-muted-foreground">Request</label>
 <p className="text-sm">{selectedRecord.request?.title}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Status</label>
 <div className="mt-1">
 {fieldConfig.find(f => f.key === 'status')?.render?.(selectedRecord.status, selectedRecord)}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Approver</label>
 <p className="text-sm">{selectedRecord.approver?.name}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Step</label>
 <p className="text-sm">Step {selectedRecord.step_order}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Amount</label>
 <p className="text-sm">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: selectedRecord.request?.currency || 'USD'
 }).format(selectedRecord.request?.estimated_total || 0)}
 </p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Requester</label>
 <p className="text-sm">{selectedRecord.request?.requester?.name}</p>
 </div>
 </div>
 {selectedRecord.notes && (
 <div>
 <label className="text-sm font-medium text-muted-foreground">Notes</label>
 <p className="text-sm mt-1">{selectedRecord.notes}</p>
 </div>
 )}
 </div>
 ) : null
 }
 ]}
 />

 {/* Create Policy Drawer */}
 <CreatePolicyClient
 open={createPolicyOpen}
 onClose={() => setCreatePolicyOpen(false)}
 onSuccess={() => {
 setCreatePolicyOpen(false);
 toast.success('Policy created successfully');
 }}
 organizationId={organizationId}
 />
 </div>
 </div>
 );
}
