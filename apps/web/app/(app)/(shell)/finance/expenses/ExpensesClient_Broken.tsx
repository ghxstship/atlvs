'use client';

import { AlertTriangle, Badge, Button, Calendar, Card, Check, Clock, CreditCard, DollarSign, Download, Edit, FileText, Filter, Input, Plus, Receipt, RefreshCw, Search, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Trash2, Upload, User as UserIcon, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import {
  Badge,
  Button,
  CalendarView,
  Card,
  DataActions,
  DataGrid,
  DataViewProvider,
  Drawer,
  Input,
  KanbanBoard,
  ListView,
  Select,
  StateManagerProvider,
  ViewSwitcher,
  Skeleton
} from '@ghxstship/ui';
import { ExpensesService } from './lib/expenses-service';
import CreateExpenseDrawer from './drawers/CreateExpenseDrawer';
import ExpenseGridView from './views/ExpenseGridView';
import ExpenseListView from './views/ExpenseListView';
import type { 
 Expense, 
 ExpensesClientProps, 
 ExpenseFilters, 
 ExpenseStatistics 
} from './types';
// Field configurations for ATLVS
const EXPENSE_FIELD_CONFIGS: FieldConfig[] = [
 {
 key: 'title',
 label: 'Title',
 type: 'text',
 sortable: true,
 filterable: true,
 required: true
 },
 {
 key: 'amount',
 label: 'Amount',
 type: 'currency',
 sortable: true,
 filterable: true,
 required: true
 },
 {
 key: 'category',
 label: 'Category',
 type: 'select',
 sortable: true,
 filterable: true,
 required: true
 },
 {
 key: 'status',
 label: 'Status',
 type: 'badge',
 sortable: true,
 filterable: true
 },
 {
 key: 'vendor',
 label: 'Vendor',
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'submitted_by',
 label: 'Submitted By',
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'created_at',
 label: 'Created',
 type: 'date',
 sortable: true,
 filterable: true
 }
];

export default function ExpensesClient({ user, orgId, translations }: ExpensesClientProps) {
 const [expenses, setExpenses] = useState<Expense[]>([]);
 const [loading, setLoading] = useState(true);
 const [statistics, setStatistics] = useState<ExpenseStatistics | null>(null);
 const [creating, setCreating] = useState(false);
 const [editing, setEditing] = useState<Expense | null>(null);
 const [viewing, setViewing] = useState<Expense | null>(null);
 const [selectedIds, setSelectedIds] = useState<string[]>([]);
 const [filters, setFilters] = useState<ExpenseFilters>({
 status: [],
 category: [],
 search: ''
 });
 const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('grid');
 const [refreshing, setRefreshing] = useState(false);

 const expensesService = new ExpensesService();

 // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
 loadExpenses();
 loadStatistics();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId, filters]);

 const loadExpenses = async () => {
 try {
 setLoading(true);
 const data = await expensesService.getExpenses(orgId, filters);
 setExpenses(data);
 } catch (error) {
 console.error('Error loading expenses:', error);
 } finally {
 setLoading(false);
 }
 };

 const loadStatistics = async () => {
 try {
 const stats = await expensesService.getExpenseStatistics(orgId);
 setStatistics(stats);
 } catch (error) {
 console.error('Error loading expense statistics:', error);
 }
 };

 const handleRefresh = async () => {
 setRefreshing(true);
 await Promise.all([loadExpenses(), loadStatistics()]);
 setRefreshing(false);
 };

 const handleCreateExpense = () => {
 setSelectedExpense(null);
 setDrawerMode('create');
 setDrawerOpen(true);
 };

 const handleEditExpense = (expense: Expense) => {
 setSelectedExpense(expense);
 setDrawerMode('edit');
 setDrawerOpen(true);
 };

 const handleViewExpense = (expense: Expense) => {
 setSelectedExpense(expense);
 setDrawerMode('view');
 setDrawerOpen(true);
 };

 const handleDeleteExpense = async (expenseId: string) => {
 if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) return;

 try {
 const response = await fetch('/api/v1/finance/expenses', {
 method: 'DELETE',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ id: expenseId })
 });

 if (!response.ok) throw new Error('Failed to delete expense');
 await loadExpenses();
 } catch (error) {
 console.error('Error deleting expense:', error);
 }
 };

 const handleSaveExpense = async (expenseData: Partial<Expense>) => {
 try {
 if (drawerMode === 'create') {
 const response = await fetch('/api/v1/finance/expenses', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 description: expenseData.description,
 amount: expenseData.amount,
 currency: expenseData.currency,
 category: expenseData.category,
 budgetId: expenseData.budget_id,
 projectId: expenseData.project_id,
 expenseDate: expenseData.expense_date,
 receiptUrl: expenseData.receipt_url,
 status: expenseData.status
 })
 });

 if (!response.ok) throw new Error('Failed to create expense');
 } else if (drawerMode === 'edit' && selectedExpense) {
 const response = await fetch('/api/v1/finance/expenses', {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 id: selectedExpense.id,
 description: expenseData.description,
 amount: expenseData.amount,
 currency: expenseData.currency,
 category: expenseData.category,
 budgetId: expenseData.budget_id,
 projectId: expenseData.project_id,
 expenseDate: expenseData.expense_date,
 receiptUrl: expenseData.receipt_url,
 status: expenseData.status
 })
 });

 if (!response.ok) throw new Error('Failed to update expense');
 }

 setDrawerOpen(false);
 await loadExpenses();
 } catch (error) {
 console.error('Error saving expense:', error);
 }
 };

 const handleApproveExpense = async (expenseId: string) => {
 try {
 const response = await fetch('/api/v1/finance/expenses', {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 id: expenseId,
 status: 'approved',
 approvedBy: user.id,
 approvedAt: new Date().toISOString()
 })
 });

 if (!response.ok) throw new Error('Failed to approve expense');
 await loadExpenses();
 } catch (error) {
 console.error('Error approving expense:', error);
 }
 };

 const handleRejectExpense = async (expenseId: string, reason: string) => {
 try {
 const response = await fetch('/api/v1/finance/expenses', {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 id: expenseId,
 status: 'rejected',
 rejectedReason: reason
 })
 });

 if (!response.ok) throw new Error('Failed to reject expense');
 await loadExpenses();
 } catch (error) {
 console.error('Error rejecting expense:', error);
 }
 };

 const filteredExpenses = expenses.filter(expense => {
 const matchesSearch = searchTerm === '' || 
 expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
 expense.category.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;
 const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
 return matchesSearch && matchesStatus && matchesCategory;
 });

 const getExpenseStatusIcon = (expense: Expense) => {
 switch (expense.status) {
 case 'approved':
 return <Check className="h-icon-sm w-icon-sm text-green-500" />;
 case 'rejected':
 return <X className="h-icon-sm w-icon-sm text-red-500" />;
 case 'submitted':
 return <Clock className="h-icon-sm w-icon-sm text-yellow-500" />;
 case 'paid':
 return <CreditCard className="h-icon-sm w-icon-sm text-blue-500" />;
 case 'draft':
 return <FileText className="h-icon-sm w-icon-sm text-gray-500" />;
 default:
 return <Clock className="h-icon-sm w-icon-sm text-gray-500" />;
 }
 };

 const getExpenseStatusColor = (expense: Expense) => {
 switch (expense.status) {
 case 'approved':
 return 'bg-green-100 text-green-800';
 case 'rejected':
 return 'bg-red-100 text-red-800';
 case 'submitted':
 return 'bg-yellow-100 text-yellow-800';
 case 'paid':
 return 'bg-blue-100 text-blue-800';
 case 'draft':
 return 'bg-gray-100 text-gray-800';
 default:
 return 'bg-gray-100 text-gray-800';
 }
 };

 const formatCurrency = (amount: number, currency = 'USD') => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: currency
 }).format(amount);
 };

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString();
 };

 // ATLVS DataViews field configuration
 const fields: FieldConfig[] = [
 {
 key: 'description',
 label: 'Description',
 type: 'text',
 required: true,
 sortable: true,
 filterable: true
 },
 {
 key: 'amount',
 label: 'Amount',
 type: 'currency',
 required: true,
 sortable: true,
 filterable: true
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
 filterable: true
 },
 {
 key: 'category',
 label: 'Category',
 type: 'select',
 options: [
 { value: 'equipment', label: 'Equipment' },
 { value: 'construction', label: 'Construction' },
 { value: 'catering', label: 'Catering' },
 { value: 'travel', label: 'Travel' },
 { value: 'marketing', label: 'Marketing' },
 { value: 'operations', label: 'Operations' },
 { value: 'office', label: 'Office Supplies' },
 { value: 'professional', label: 'Professional Services' },
 { value: 'other', label: 'Other' }
 ],
 required: true,
 filterable: true,
 sortable: true
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: [
 { value: 'draft', label: 'Draft' },
 { value: 'submitted', label: 'Submitted' },
 { value: 'approved', label: 'Approved' },
 { value: 'rejected', label: 'Rejected' },
 { value: 'paid', label: 'Paid' }
 ],
 filterable: true,
 sortable: true
 },
 {
 key: 'expense_date',
 label: 'Expense Date',
 type: 'date',
 required: true,
 sortable: true,
 filterable: true
 },
 {
 key: 'receipt_url',
 label: 'Receipt URL',
 type: 'url',
 sortable: false,
 filterable: false
 },
 {
 key: 'budget_id',
 label: 'Budget',
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'project_id',
 label: 'Project',
 type: 'text',
 sortable: true,
 filterable: true
 }
 ];

 // ATLVS DataViews configuration
 const expensesConfig: DataViewConfig = {
 id: 'expenses-dataviews',
 name: 'Expense Management',
 viewType: 'grid',
 defaultView: 'grid',
 fields,
 data: filteredExpenses.map(expense => ({
 ...expense,
 record_type: 'expense'
 })),
 pagination: {
 page: 1,
 pageSize: 25,
 total: filteredExpenses.length
 },
 onSearch: (query: string) => {
 setSearchTerm(query);
 },
 onFilter: (filters: unknown) => {
 if (filters.status) setFilterStatus(filters.status);
 if (filters.category) setFilterCategory(filters.category);
 },
 onSort: (sorts: unknown) => {
 },
 onRefresh: () => {
 loadExpenses();
 },
 onExport: (data, format) => {
 },
 onImport: (data: unknown) => {
 },
 onRowAction: (action: string, record: DataRecord) => {
 const expense = record as Expense;
 switch (action) {
 case 'view':
 handleViewExpense(expense);
 break;
 case 'edit':
 handleEditExpense(expense);
 break;
 case 'delete':
 handleDeleteExpense(expense.id);
 break;
 case 'approve':
 handleApproveExpense(expense.id);
 break;
 case 'reject':
 const reason = prompt('Please provide a reason for rejection:');
 if (reason) handleRejectExpense(expense.id, reason);
 break;
 }
 }
 };

 const configWithData = {
 ...expensesConfig,
 data: filteredExpenses.map(expense => ({
 ...expense,
 record_type: 'expense'
 }))
 };

 if (loading) {
 return (
 <div className="space-y-md">
 <div className="flex justify-between items-center">
 <div>
 <Skeleton className="h-icon-lg w-container-xs" />
 <Skeleton className="h-icon-xs w-container-lg mt-2" />
 </div>
 <Skeleton className="h-icon-xl w-component-xl" />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {[...Array(6)].map((_, i) => (
 <Skeleton key={i} className="h-component-xl" />
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="h-full flex flex-col">
 {/* Header */}
 <div className="flex justify-between items-center mb-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
 <p className="text-gray-600">Track and manage your business expenses</p>
 </div>
 <Button onClick={handleCreateExpense} className="flex items-center gap-xs">
 <Plus className="h-icon-xs w-icon-xs" />
 New Expense
 </Button>
 </div>

 {/* Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-6">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">Total Expenses</p>
 <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
 </div>
 <Receipt className="h-icon-lg w-icon-lg text-blue-500" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">Total Amount</p>
 <p className="text-2xl font-bold text-gray-900">
 {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
 </p>
 </div>
 <DollarSign className="h-icon-lg w-icon-lg text-green-500" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">Pending Approval</p>
 <p className="text-2xl font-bold text-gray-900">
 {expenses.filter(e => e.status === 'submitted').length}
 </p>
 </div>
 <Clock className="h-icon-lg w-icon-lg text-yellow-500" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">Approved</p>
 <p className="text-2xl font-bold text-gray-900">
 {expenses.filter(e => e.status === 'approved').length}
 </p>
 </div>
 <Check className="h-icon-lg w-icon-lg text-green-500" />
 </div>
 </Card>
 </div>

 {/* Filters */}
 <div className="flex gap-md mb-6">
 <div className="flex-1">
 <Input
 placeholder="Search expenses..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 leftIcon={<Search className="h-icon-xs w-icon-xs" />}
 />
 </div>
 <Select value={filterStatus} onValueChange={setFilterStatus}>
 <SelectTrigger className="w-container-xs">
 <SelectValue placeholder="Filter by status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Statuses</SelectItem>
 <SelectItem value="draft">Draft</SelectItem>
 <SelectItem value="submitted">Submitted</SelectItem>
 <SelectItem value="approved">Approved</SelectItem>
 <SelectItem value="rejected">Rejected</SelectItem>
 <SelectItem value="paid">Paid</SelectItem>
 </SelectContent>
 </Select>
 <Select value={filterCategory} onValueChange={setFilterCategory}>
 <SelectTrigger className="w-container-xs">
 <SelectValue placeholder="Filter by category" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Categories</SelectItem>
 <SelectItem value="equipment">Equipment</SelectItem>
 <SelectItem value="construction">Construction</SelectItem>
 <SelectItem value="catering">Catering</SelectItem>
 <SelectItem value="travel">Travel</SelectItem>
 <SelectItem value="marketing">Marketing</SelectItem>
 <SelectItem value="operations">Operations</SelectItem>
 <SelectItem value="office">Office Supplies</SelectItem>
 <SelectItem value="professional">Professional Services</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* ATLVS DataViews */}
 <div className="flex-1">
 <DataViewProvider config={configWithData}>
 <StateManagerProvider>
 <div className="flex-1 space-y-md">
 {/* View Switcher and Actions */}
 <div className="flex justify-between items-center">
 <ViewSwitcher />
 <DataActions />
 </div>

 {/* Data Views */}
 <div className="flex-1">
 <DataGrid />
 <KanbanBoard 
 columns={[
 { id: 'draft', title: 'Draft' },
 { id: 'submitted', title: 'Submitted' },
 { id: 'approved', title: 'Approved' },
 { id: 'rejected', title: 'Rejected' },
 { id: 'paid', title: 'Paid' }
 ]}
 statusField="status"
 titleField="description"
 />
 <CalendarView 
 startDateField="expense_date"
 titleField="description"
 />
 <ListView titleField="description" />
 </div>
 </div>
 </StateManagerProvider>
 </DataViewProvider>
 </div>

 {/* Universal Drawer for CRUD operations */}
 <Drawer
 open={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 title={
 drawerMode === 'create' ? 'Create Expense' :
 drawerMode === 'edit' ? 'Edit Expense' : 'Expense Details'
 }
 mode={drawerMode}
 data={selectedExpense}
 fields={fields}
 onSave={handleSaveExpense}
 tabs={[
 {
 key: 'details',
 label: 'Expense Details',
 content: (
 <div className="space-y-md">
 {selectedExpense && (
 <>
 <div className="flex items-center gap-sm">
 {getExpenseStatusIcon(selectedExpense)}
 <div>
 <h3 className="font-semibold">{selectedExpense.description}</h3>
 <p className="text-sm text-gray-600">{selectedExpense.category}</p>
 </div>
 <Badge className={getExpenseStatusColor(selectedExpense)}>
 {selectedExpense.status}
 </Badge>
 </div>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium text-gray-700">Amount</label>
 <p className="text-lg font-semibold">{formatCurrency(selectedExpense.amount)}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-gray-700">Expense Date</label>
 <p className="text-sm">{formatDate(selectedExpense.expense_date)}</p>
 </div>
 </div>
 {selectedExpense.receipt_url && (
 <div>
 <label className="text-sm font-medium text-gray-700">Receipt</label>
 <a 
 href={selectedExpense.receipt_url as any as any} 
 target="_blank" 
 rel="noopener noreferrer"
 className="text-blue-600 hover:text-blue-800 text-sm"
 >
 View Receipt
 </a>
 </div>
 )}
 {selectedExpense.rejected_reason && (
 <div>
 <label className="text-sm font-medium text-gray-700">Rejection Reason</label>
 <p className="text-sm text-red-600">{selectedExpense.rejected_reason}</p>
 </div>
 )}
 {selectedExpense.status === 'submitted' && (
 <div className="flex gap-xs">
 <Button 
 onClick={() => handleApproveExpense(selectedExpense.id)}
 className="flex items-center gap-xs"
 size="sm"
 >
 <Check className="h-icon-xs w-icon-xs" />
 Approve
 </Button>
 <Button 
 onClick={() => {
 const reason = prompt('Please provide a reason for rejection:');
 if (reason) handleRejectExpense(selectedExpense.id, reason);
 }}
 variant="outline"
 className="flex items-center gap-xs"
 size="sm"
 >
 <X className="h-icon-xs w-icon-xs" />
 Reject
 </Button>
 </div>
 )}
 </>
 )}
 </div>
 )
 }
 ]}
 />
 </div>
 );
}
