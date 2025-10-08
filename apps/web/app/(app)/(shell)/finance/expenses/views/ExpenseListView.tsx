'use client';

import { Badge, Building, Button, Calendar, Card, Check, Checkbox, Clock, DollarSign, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Edit, ExternalEye, ExternalLink, Eye, MoreHorizontal, Receipt, Trash2, User, X } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ghxstship/ui';
import { ExpensesService } from '../lib/expenses-service';
import type { Expense } from '../types';

interface ExpenseListViewProps {
 expenses: Expense[];
 onEdit: (expense: Expense) => void;
 onView: (expense: Expense) => void;
 onDelete: (expense: Expense) => void;
 onRefresh: () => void;
 onSelectionChange?: (selectedIds: string[]) => void;
 selectedIds?: string[];
 loading?: boolean;
 user: unknown;
 orgId: string;
}

export default function ExpenseListView({
 expenses,
 onEdit,
 onView,
 onDelete,
 onRefresh,
 onSelectionChange,
 selectedIds = [],
 loading = false,
 user,
 orgId
}: ExpenseListViewProps) {
 const [actionLoading, setActionLoading] = useState<string | null>(null);
 const expensesService = new ExpensesService();

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'draft': return 'secondary';
 case 'submitted': return 'warning';
 case 'approved': return 'success';
 case 'rejected': return 'destructive';
 case 'paid': return 'success';
 default: return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'draft': return <Edit className="h-3 w-3" />;
 case 'submitted': return <Clock className="h-3 w-3" />;
 case 'approved': return <Check className="h-3 w-3" />;
 case 'rejected': return <X className="h-3 w-3" />;
 case 'paid': return <Check className="h-3 w-3" />;
 default: return <Clock className="h-3 w-3" />;
 }
 };

 const handleWorkflowAction = async (action: string, expense: Expense) => {
 try {
 setActionLoading(expense.id);
 
 switch (action) {
 case 'submit':
 await expensesService.submit(expense.id);
 break;
 case 'approve':
 await expensesService.approve(expense.id, user.id);
 break;
 case 'reject':
 await expensesService.reject(expense.id);
 break;
 case 'markPaid':
 await expensesService.markPaid(expense.id);
 break;
 }
 
 onRefresh();
 } catch (error) {
 console.error('Error performing workflow action:', error);
 } finally {
 setActionLoading(null);
 }
 };

 const canPerformAction = (action: string, expense: Expense) => {
 switch (action) {
 case 'submit':
 return expense.status === 'draft' && expense.submitted_by === user.id;
 case 'approve':
 case 'reject':
 return expense.status === 'submitted' && expense.submitted_by !== user.id;
 case 'markPaid':
 return expense.status === 'approved';
 default:
 return false;
 }
 };

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelectionChange?.(expenses.map(e => e.id));
 } else {
 onSelectionChange?.([]);
 }
 };

 const handleSelectExpense = (expenseId: string, checked: boolean) => {
 if (checked) {
 onSelectionChange?.([...selectedIds, expenseId]);
 } else {
 onSelectionChange?.(selectedIds.filter(id => id !== expenseId));
 }
 };

 const isAllSelected = expenses.length > 0 && selectedIds.length === expenses.length;
 const isIndeterminate = selectedIds.length > 0 && selectedIds.length < expenses.length;

 if (loading) {
 return (
 <Card className="p-0">
 <div className="p-lg animate-pulse">
 <div className="h-icon-xs bg-muted rounded mb-md"></div>
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="h-component-md bg-muted rounded mb-sm"></div>
 ))}
 </div>
 </Card>
 );
 }

 if (expenses.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Receipt className="h-icon-2xl w-icon-2xl color-muted mx-auto mb-md" />
 <h3 className="text-heading-4 color-foreground mb-sm">No expenses found</h3>
 <p className="text-body-sm color-muted">Create your first expense to get started.</p>
 </Card>
 );
 }

 return (
 <Card className="p-0">
 {/* Header */}
 <div className="p-lg border-b">
 <div className="flex items-center gap-md">
 {onSelectionChange && (
 <Checkbox
 checked={isAllSelected}
 indeterminate={isIndeterminate}
 onCheckedChange={handleSelectAll}
 />
 )}
 <div className="grid grid-cols-12 gap-md flex-1 text-body-sm color-muted font-medium">
 <div className="col-span-4">Expense</div>
 <div className="col-span-2">Amount</div>
 <div className="col-span-2">Category</div>
 <div className="col-span-2">Status</div>
 <div className="col-span-1">Date</div>
 <div className="col-span-1">Actions</div>
 </div>
 </div>
 </div>

 {/* Expense List */}
 <div className="divide-y">
 {expenses.map((expense) => (
 <div key={expense.id} className="p-lg hover:bg-muted/50 transition-colors">
 <div className="flex items-center gap-md">
 {onSelectionChange && (
 <Checkbox
 checked={selectedIds.includes(expense.id)}
 onCheckedChange={(checked) => handleSelectExpense(expense.id, checked as boolean)}
 />
 )}
 
 <div className="grid grid-cols-12 gap-md flex-1 items-center">
 {/* Expense Info */}
 <div className="col-span-4">
 <div className="stack-xs">
 <h4 className="text-body-md color-foreground font-medium truncate" title={expense.title}>
 {expense.title}
 </h4>
 {expense.description && (
 <p className="text-body-sm color-muted line-clamp-xs" title={expense.description}>
 {expense.description}
 </p>
 )}
 {expense.vendor && (
 <div className="flex items-center gap-xs text-body-sm color-muted">
 <Building className="h-3 w-3" />
 <span className="truncate" title={expense.vendor}>{expense.vendor}</span>
 </div>
 )}
 </div>
 </div>

 {/* Amount */}
 <div className="col-span-2">
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs color-success" />
 <span className="text-body-md color-success font-medium">
 {expensesService.formatCurrency(expense.amount, expense.currency)}
 </span>
 </div>
 </div>

 {/* Category */}
 <div className="col-span-2">
 <div className="flex items-center gap-xs">
 <Receipt className="h-3 w-3 color-muted" />
 <span className="text-body-sm color-foreground">{expense.category}</span>
 </div>
 </div>

 {/* Status */}
 <div className="col-span-2">
 <Badge variant={getStatusColor(expense.status)} className="flex items-center gap-xs w-fit">
 {getStatusIcon(expense.status)}
 {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
 </Badge>
 </div>

 {/* Date */}
 <div className="col-span-1">
 <div className="flex items-center gap-xs text-body-sm color-muted">
 <Calendar className="h-3 w-3" />
 <span>{expensesService.formatDate(expense.created_at)}</span>
 </div>
 </div>

 {/* Actions */}
 <div className="col-span-1 flex justify-end">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="sm">
 <MoreHorizontal className="h-icon-xs w-icon-xs" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onView(expense)}>
 <Eye className="h-icon-xs w-icon-xs mr-sm" />
 View Details
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(expense)}>
 <Edit className="h-icon-xs w-icon-xs mr-sm" />
 Edit
 </DropdownMenuItem>
 
 {expense.receipt_url && (
 <DropdownMenuItem asChild>
 <a href={expense.receipt_url as any as any} target="_blank" rel="noopener noreferrer">
 <ExternalLink className="h-icon-xs w-icon-xs mr-sm" />
 View Receipt
 </a>
 </DropdownMenuItem>
 )}
 
 <DropdownMenuSeparator />
 
 {/* Workflow Actions */}
 {canPerformAction('submit', expense) && (
 <DropdownMenuItem 
 onClick={() => handleWorkflowAction('submit', expense)}
 disabled={actionLoading === expense.id}
 >
 <Clock className="h-icon-xs w-icon-xs mr-sm" />
 Submit for Approval
 </DropdownMenuItem>
 )}
 
 {canPerformAction('approve', expense) && (
 <DropdownMenuItem 
 onClick={() => handleWorkflowAction('approve', expense)}
 disabled={actionLoading === expense.id}
 >
 <Check className="h-icon-xs w-icon-xs mr-sm" />
 Approve
 </DropdownMenuItem>
 )}
 
 {canPerformAction('reject', expense) && (
 <DropdownMenuItem 
 onClick={() => handleWorkflowAction('reject', expense)}
 disabled={actionLoading === expense.id}
 >
 <X className="h-icon-xs w-icon-xs mr-sm" />
 Reject
 </DropdownMenuItem>
 )}
 
 {canPerformAction('markPaid', expense) && (
 <DropdownMenuItem 
 onClick={() => handleWorkflowAction('markPaid', expense)}
 disabled={actionLoading === expense.id}
 >
 <DollarSign className="h-icon-xs w-icon-xs mr-sm" />
 Mark as Paid
 </DropdownMenuItem>
 )}
 
 <DropdownMenuSeparator />
 <DropdownMenuItem 
 onClick={() => onDelete(expense)}
 className="color-destructive focus:color-destructive"
 >
 <Trash2 className="h-icon-xs w-icon-xs mr-sm" />
 Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>
 </div>

 {/* Additional Info Row */}
 <div className="mt-sm ml-8 flex items-center justify-between text-body-sm color-muted">
 <div className="flex items-center gap-md">
 <span className="flex items-center gap-xs">
 <User className="h-3 w-3" />
 {expense.submitted_by === user.id ? 'You' : 'Other'}
 </span>
 
 {expense.due_date && expense.status !== 'paid' && (
 <span className="flex items-center gap-xs color-warning">
 <Calendar className="h-3 w-3" />
 Due: {expensesService.formatDate(expense.due_date)}
 </span>
 )}
 </div>

 {/* Tags */}
 {expense.tags && expense.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {expense.tags.slice(0, 2).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 {expense.tags.length > 2 && (
 <Badge variant="secondary" className="text-xs">
 +{expense.tags.length - 2}
 </Badge>
 )}
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </Card>
 );
}
