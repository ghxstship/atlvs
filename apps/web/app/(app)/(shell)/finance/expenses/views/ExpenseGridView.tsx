'use client';

import { Receipt, MoreHorizontal, Edit, Trash2, Eye, Check, X, Clock, DollarSign, Calendar, User, ExternalLink } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button,
 Dropdown
} from '@ghxstship/ui';
import { ExpensesService } from '../lib/expenses-service';
import type { Expense } from '../types';

interface ExpenseGridViewProps {
 expenses: Expense[];
 onEdit: (expense: Expense) => void;
 onView: (expense: Expense) => void;
 onDelete: (expense: Expense) => void;
 onRefresh: () => void;
 loading?: boolean;
 user: unknown;
 orgId: string;
}

export default function ExpenseGridView({
 expenses,
 onEdit,
 onView,
 onDelete,
 onRefresh,
 loading = false,
 user,
 orgId
}: ExpenseGridViewProps) {
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

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {Array.from({ length: 6 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="h-4 bg-muted rounded mb-sm"></div>
 <div className="h-6 bg-muted rounded mb-sm"></div>
 <div className="h-4 bg-muted rounded w-2/3"></div>
 </Card>
 ))}
 </div>
 );
 }

 if (expenses.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Receipt className="h-12 w-12 color-muted mx-auto mb-md" />
 <h3 className="text-heading-4 color-foreground mb-sm">No expenses found</h3>
 <p className="text-body-sm color-muted">Create your first expense to get started.</p>
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {expenses.map((expense) => (
 <Card key={expense.id} className="p-lg hover:shadow-md transition-shadow">
 <div className="stack-sm">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <h3 className="text-heading-5 color-foreground truncate" title={expense.title}>
 {expense.title}
 </h3>
 {expense.description && (
 <p className="text-body-sm color-muted line-clamp-2 mt-xs">
 {expense.description}
 </p>
 )}
 </div>
 
 <div className="flex items-center gap-xs">
 <Button variant="ghost" size="sm" onClick={() => onView(expense)}>
 <Eye className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="sm" onClick={() => onEdit(expense)}>
 <Edit className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="sm" onClick={() => onDelete(expense)}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>

 {/* Amount and Status */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <DollarSign className="h-4 w-4 color-success" />
 <span className="text-heading-5 color-success">
 {expensesService.formatCurrency(expense.amount, expense.currency)}
 </span>
 </div>
 
 <Badge variant={getStatusColor(expense.status)} className="flex items-center gap-xs">
 {getStatusIcon(expense.status)}
 {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
 </Badge>
 </div>

 {/* Category and Vendor */}
 <div className="flex items-center justify-between text-body-sm color-muted">
 <span className="flex items-center gap-xs">
 <Receipt className="h-3 w-3" />
 {expense.category}
 </span>
 {expense.vendor && (
 <span className="truncate ml-sm" title={expense.vendor}>
 {expense.vendor}
 </span>
 )}
 </div>

 {/* Date and Submitter */}
 <div className="flex items-center justify-between text-body-sm color-muted">
 <span className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 {expensesService.formatDate(expense.created_at)}
 </span>
 <span className="flex items-center gap-xs">
 <User className="h-3 w-3" />
 {expense.submitted_by === user.id ? 'You' : 'Other'}
 </span>
 </div>

 {/* Tags */}
 {expense.tags && expense.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {expense.tags.slice(0, 3).map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {expense.tags.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{expense.tags.length - 3} more
 </Badge>
 )}
 </div>
 )}

 {/* Due Date Alert */}
 {expense.due_date && expense.status !== 'paid' && (
 <div className="flex items-center gap-xs text-body-sm color-warning">
 <Calendar className="h-3 w-3" />
 Due: {expensesService.formatDate(expense.due_date)}
 </div>
 )}
 </div>
 </Card>
 ))}
 </div>
 );
}
