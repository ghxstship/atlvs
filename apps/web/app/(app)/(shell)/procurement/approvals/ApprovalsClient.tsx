'use client';

import { AlertTriangle, BarChart3, Calendar, CheckCircle, Clock, Download, Edit, Eye, Filter, Grid3X3, LayoutDashboard, List, MoreHorizontal, Plus, RefreshCw, Search, Settings, Trash2, TrendingUp, Upload, Users, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { AppDrawer, Badge, Button, Card, Checkbox, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Tabs, TabsList, TabsTrigger, TabsContent } from '@ghxstship/ui';
import { ApprovalsService } from './lib/approvalsService';
import { CreatePolicyClient } from './CreatePolicyClient';
import type { 
 ApprovalStep, 
 ApprovalSortOptions,
 ApprovalDashboardData
} from './types';

// View Types
type ApprovalViewMode = 'dashboard' | 'grid' | 'list' | 'kanban' | 'calendar';

// Filters Interface
interface ApprovalFilters {
 search: string;
 status: string;
 priority: string;
 approver_id?: string;
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
 
 // State management
 const [loading, setLoading] = useState(false);
 const [approvals, setApprovals] = useState<ApprovalStep[]>([]);
 const [dashboardData, setDashboardData] = useState<ApprovalDashboardData | null>(null);
 const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
 const [viewMode, setViewMode] = useState<ApprovalViewMode>('dashboard');
 const [showCreatePolicy, setShowCreatePolicy] = useState(false);
 const [showApprovalDrawer, setShowApprovalDrawer] = useState(false);
 const [selectedApproval, setSelectedApproval] = useState<ApprovalStep | null>(null);
 
 // Filters and sorting
 const [filters, setFilters] = useState<ApprovalFilters>({
 search: '',
 status: 'all',
 priority: 'all'
 });
 const [sort, setSort] = useState<ApprovalSortOptions>({
 field: 'created_at',
 direction: 'desc'
 });

 const approvalsService = new ApprovalsService();

 // Load approvals data
 // eslint-disable-next-line react-hooks/exhaustive-deps
 const loadApprovals = useCallback(async () => {
 try {
 setLoading(true);
 
 // Load approval steps
 const { data: approvalSteps, error } = await approvalsService.getApprovalSteps(
 organizationId,
 filters,
 sort
 );

 if (error) {
 console.error('Error loading approvals:', error);
 // Fallback to demo data
 const demoApprovals: ApprovalStep[] = [
 {
 id: 'demo-approval-1',
 request_id: 'demo-request-1',
 approver_id: userId,
 step_order: 1,
 status: 'pending',
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 request: {
 id: 'demo-request-1',
 title: 'Camera Equipment Purchase',
 status: 'submitted',
 estimated_total: 25000
 }
 },
 {
 id: 'demo-approval-2',
 request_id: 'demo-request-2',
 approver_id: userId,
 step_order: 1,
 status: 'pending',
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 request: {
 id: 'demo-request-2',
 title: 'Catering Services Contract',
 status: 'submitted',
 estimated_total: 8500
 }
 }
 ];
 setApprovals(demoApprovals);
 } else {
 setApprovals(approvalSteps || []);
 }

 // Load dashboard data
 const { data: dashboard } = await approvalsService.getDashboardData(organizationId, userId);
 setDashboardData(dashboard);

 } catch (error) {
 console.error('Error loading approvals:', error);
 // Set demo data on error
 setApprovals([]);
 } finally {
 setLoading(false);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [organizationId, userId, filters, sort]);

 // Load data on mount and when dependencies change
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 loadApprovals();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [loadApprovals]);

 // Handle filter changes
 // eslint-disable-next-line react-hooks/exhaustive-deps
 const handleFilterChange = useCallback((newFilters: Partial<ApprovalFilters>) => {
 setFilters(prev => ({ ...prev, ...newFilters }));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // Handle sort changes
 // eslint-disable-next-line react-hooks/exhaustive-deps
 const handleSortChange = useCallback((newSort: ApprovalSortOptions) => {
 setSort(newSort);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // Handle approval actions
 // eslint-disable-next-line react-hooks/exhaustive-deps
 const handleApprovalAction = useCallback(async (
 approvalId: string, 
 action: 'approve' | 'reject' | 'skip',
 notes?: string
 ) => {
 try {
 setLoading(true);
 
 // Mock approval action for demo
 
 // Update local state
 setApprovals(prev => prev.map(approval => 
 approval.id === approvalId 
 ? { ...approval, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'skipped' }
 : approval
 ));
 
 } catch (error) {
 console.error('Error processing approval:', error);
 } finally {
 setLoading(false);
 }
 }, []);

 // Handle record selection
 const handleRecordSelect = // eslint-disable-next-line react-hooks/exhaustive-deps
  useCallback((recordIds: string[]) => {
 setSelectedApprovals(recordIds);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // Handle record actions
 // eslint-disable-next-line react-hooks/exhaustive-deps
 const handleRecordAction = useCallback((action: string, approval: ApprovalStep) => {
 switch (action) {
 case 'view':
 setSelectedApproval(approval);
 setShowApprovalDrawer(true);
 break;
 case 'approve':
 handleApprovalAction(approval.id!, 'approve');
 break;
 case 'reject':
 handleApprovalAction(approval.id!, 'reject');
 break;
 case 'skip':
 handleApprovalAction(approval.id!, 'skip');
 break;
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [handleApprovalAction]);

 // Handle bulk actions
 // eslint-disable-next-line react-hooks/exhaustive-deps
 const handleBulkAction = useCallback(async (action: string) => {
 try {
 setLoading(true);
 
 for (const approvalId of selectedApprovals) {
 await handleApprovalAction(approvalId, action as unknown);
 }
 
 setSelectedApprovals([]);
 
 } catch (error) {
 console.error('Error processing bulk action:', error);
 } finally {
 setLoading(false);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [selectedApprovals, handleApprovalAction]);

 // Render dashboard cards
 const renderDashboardCards = () => {
 const pendingCount = approvals.filter(a => a.status === 'pending').length;
 const approvedToday = approvals.filter(a => 
 a.status === 'approved' && 
 a.approved_at && 
 new Date(a.approved_at).toDateString() === new Date().toDateString()
 ).length;
 const totalValue = approvals.reduce((sum, a) => sum + (a.request?.estimated_total || 0), 0);

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <Clock className="h-icon-lg w-icon-lg text-warning" />
          </div>
        </Card>

        <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Approved Today</p>
 <p className="text-2xl font-bold">{approvedToday}</p>
 </div>
 <CheckCircle className="h-icon-lg w-icon-lg text-success" />
 </div>
 </Card>
 
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Overdue</p>
 <p className="text-2xl font-bold">0</p>
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
 }).format(totalValue)}
 </p>
 </div>
 <TrendingUp className="h-icon-lg w-icon-lg text-info" />
 </div>
 </Card>
 </div>
 );
 };

 // Render approval list
 const renderApprovalList = () => {
 const filteredApprovals = approvals.filter(approval => {
 if (filters.search && !approval.request?.title?.toLowerCase().includes(filters.search.toLowerCase())) {
 return false;
 }
 if (filters.status !== 'all' && approval.status !== filters.status) {
 return false;
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 return true;
 });

 return (
 <div className="space-y-sm">
 {filteredApprovals.map((approval) => (
 <Card key={approval.id} className="p-md">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-sm mb-sm">
 <h4 className="font-medium">{approval.request?.title || 'Unknown Request'}</h4>
 <Badge variant={
 approval.status === 'approved' ? 'success' :
 approval.status === 'rejected' ? 'destructive' :
 approval.status === 'pending' ? 'warning' : 'secondary'
 }>
 {approval.status}
 </Badge>
 </div>
 <p className="text-sm text-muted-foreground">
 Amount: {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(approval.request?.estimated_total || 0)}
 </p>
 </div>
 <div className="flex gap-sm">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleRecordAction('view', approval)}
 >
 <Eye className="h-icon-xs w-icon-xs mr-sm" />
 View
 </Button>
 {approval.status === 'pending' && (
 <>
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleRecordAction('approve', approval)}
 >
 <CheckCircle className="h-icon-xs w-icon-xs mr-sm" />
 Approve
 </Button>
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleRecordAction('reject', approval)}
 >
 <XCircle className="h-icon-xs w-icon-xs mr-sm" />
 Reject
 </Button>
 </>
 )}
 </div>
 </div>
 </Card>
 ))}
 {filteredApprovals.length === 0 && (
 <Card className="p-xl text-center">
 <Users className="h-icon-2xl w-icon-2xl mx-auto mb-md text-muted-foreground" />
 <h3 className="text-lg font-medium mb-sm">No approvals found</h3>
 <p className="text-sm text-muted-foreground">
 {filters.search || filters.status !== 'all' 
 ? 'Try adjusting your filters to see more results.'
 : 'There are no pending approvals at this time.'
 }
 </p>
 </Card>
 )}
 </div>
 );
 };

 // Render view content based on current view mode
 const renderViewContent = () => {
 switch (viewMode) {
 case 'dashboard':
 return (
 <div className="space-y-lg">
 {renderDashboardCards()}
 <Card className="p-md">
 <h3 className="text-lg font-semibold mb-md">Recent Approvals</h3>
 {renderApprovalList()}
 </Card>
 </div>
 );
 case 'list':
 return renderApprovalList();
 case 'grid':
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {approvals.map((approval) => (
 <Card key={approval.id} className="p-md">
 <div className="space-y-sm">
 <div className="flex items-center justify-between">
 <h4 className="font-medium">{approval.request?.title || 'Unknown Request'}</h4>
 <Badge variant={
 approval.status === 'approved' ? 'success' :
 approval.status === 'rejected' ? 'destructive' :
 approval.status === 'pending' ? 'warning' : 'secondary'
 }>
 {approval.status}
 </Badge>
 </div>
 <p className="text-sm text-muted-foreground">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(approval.request?.estimated_total || 0)}
 </p>
 <div className="flex gap-sm pt-sm">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleRecordAction('view', approval)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 {approval.status === 'pending' && (
 <>
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleRecordAction('approve', approval)}
 >
 <CheckCircle className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleRecordAction('reject', approval)}
 >
 <XCircle className="h-icon-xs w-icon-xs" />
 </Button>
 </>
 )}
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 default:
 return renderApprovalList();
 }
 };

 return (
 <div className={`space-y-lg ${className || ''}`}>
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Users className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Procurement Approvals</h3>
 <Badge variant="secondary">
 {approvals.length} approval{approvals.length !== 1 ? 's' : ''}
 </Badge>
 </div>
 <div className="flex items-center gap-sm">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => setShowCreatePolicy(true)}
 >
 <Settings className="h-icon-xs w-icon-xs mr-sm" />
 Policies
 </Button>
 <Button variant="secondary" size="sm">
 <Upload className="h-icon-xs w-icon-xs mr-sm" />
 Import
 </Button>
 <Button variant="secondary" size="sm">
 <Download className="h-icon-xs w-icon-xs mr-sm" />
 Export
 </Button>
 <Button size="sm" onClick={loadApprovals}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-sm" />
 Refresh
 </Button>
 </div>
 </div>

 {/* Filters */}
 <Card className="p-md">
 <div className="flex flex-col lg:flex-row gap-md">
 {/* Search */}
 <div className="relative flex-1">
 <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
 <Input
 placeholder="Search approvals..."
 value={filters.search}
 onChange={(e) => handleFilterChange({ search: e.target.value })}
 className="pl-10"
 />
 </div>

 {/* Status Filter */}
 <Select
 value={filters.status}
 onValueChange={(value) => handleFilterChange({ status: value })}
 >
 <SelectTrigger className="max-w-compact">
 <SelectValue placeholder="All Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Status</SelectItem>
 <SelectItem value="pending">Pending</SelectItem>
 <SelectItem value="approved">Approved</SelectItem>
 <SelectItem value="rejected">Rejected</SelectItem>
 <SelectItem value="skipped">Skipped</SelectItem>
 </SelectContent>
 </Select>

 {/* Priority Filter */}
 <Select
 value={filters.priority}
 onValueChange={(value) => handleFilterChange({ priority: value })}
 >
 <SelectTrigger className="max-w-compact">
 <SelectValue placeholder="All Priorities" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Priorities</SelectItem>
 <SelectItem value="low">Low</SelectItem>
 <SelectItem value="medium">Medium</SelectItem>
 <SelectItem value="high">High</SelectItem>
 <SelectItem value="urgent">Urgent</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </Card>

 {/* View Mode Tabs */}
 <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ApprovalViewMode)}>
 <div className="flex items-center justify-between">
 <TabsList>
 <TabsTrigger value="dashboard">
 <LayoutDashboard className="h-icon-xs w-icon-xs mr-sm" />
 Dashboard
 </TabsTrigger>
 <TabsTrigger value="grid">
 <Grid3X3 className="h-icon-xs w-icon-xs mr-sm" />
 Grid
 </TabsTrigger>
 <TabsTrigger value="list">
 <List className="h-icon-xs w-icon-xs mr-sm" />
 List
 </TabsTrigger>
 <TabsTrigger value="kanban">
 <BarChart3 className="h-icon-xs w-icon-xs mr-sm" />
 Kanban
 </TabsTrigger>
 <TabsTrigger value="calendar">
 <Calendar className="h-icon-xs w-icon-xs mr-sm" />
 Calendar
 </TabsTrigger>
 </TabsList>

 {/* Bulk Actions */}
 {selectedApprovals.length > 0 && (
 <div className="flex items-center gap-sm">
 <span className="text-sm text-muted-foreground">
 {selectedApprovals.length} selected
 </span>
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleBulkAction('approve')}
 >
 <CheckCircle className="h-icon-xs w-icon-xs mr-sm" />
 Approve All
 </Button>
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleBulkAction('reject')}
 >
 <XCircle className="h-icon-xs w-icon-xs mr-sm" />
 Reject All
 </Button>
 </div>
 )}
 </div>

 <TabsContent value={viewMode} className="mt-md">
 {loading ? (
 <Card className="p-xl text-center">
 <RefreshCw className="h-icon-lg w-icon-lg mx-auto mb-md animate-spin" />
 <p className="text-muted-foreground">Loading approvals...</p>
 </Card>
 ) : (
 renderViewContent()
 )}
 </TabsContent>
 </Tabs>

 {/* Approval Details Drawer */}
 <AppDrawer
 open={showApprovalDrawer}
 onClose={() => setShowApprovalDrawer(false)}
 title="Approval Details"
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

 <div>
 <h4 className="font-medium mb-sm">Amount</h4>
 <p className="text-lg font-semibold">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(selectedApproval.request?.estimated_total || 0)}
 </p>
 </div>

 {selectedApproval.status === 'pending' && (
 <div className="flex gap-sm pt-md border-t">
 <Button
 onClick={() => {
 handleApprovalAction(selectedApproval.id!, 'approve');
 setShowApprovalDrawer(false);
 }}
 >
 <CheckCircle className="h-icon-xs w-icon-xs mr-sm" />
 Approve
 </Button>
 <Button
 variant="secondary"
 onClick={() => {
 handleApprovalAction(selectedApproval.id!, 'reject');
 setShowApprovalDrawer(false);
 }}
 >
 <XCircle className="h-icon-xs w-icon-xs mr-sm" />
 Reject
 </Button>
 </div>
 )}
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
