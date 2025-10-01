'use client';

import { DollarSign, Edit, Trash2, Eye, AlertTriangle, CheckCircle, TrendingUp, Calendar, Tag } from "lucide-react";
import { Badge, Button, Card } from '@ghxstship/ui';
import type { Budget } from '../types';

interface BudgetListViewProps {
 budgets: Budget[];
 onEdit: (budget: Budget) => void;
 onDelete: (budgetId: string) => void;
 onView: (budget: Budget) => void;
 loading?: boolean;
}

export default function BudgetListView({ 
 budgets, 
 onEdit, 
 onDelete, 
 onView, 
 loading = false 
}: BudgetListViewProps) {
 const formatCurrency = (amount: number, currency = 'USD') => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: currency,
 }).format(amount);
 };

 const getStatusBadge = (status: string) => {
 const statusConfig = {
 draft: { variant: 'secondary' as const, label: 'Draft' },
 active: { variant: 'success' as const, label: 'Active' },
 completed: { variant: 'default' as const, label: 'Completed' },
 cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
 };

 const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
 return <Badge variant={config.variant}>{config.label}</Badge>;
 };

 const getUtilizationColor = (utilization: number) => {
 if (utilization >= 100) return 'color-destructive';
 if (utilization >= 80) return 'color-warning';
 return 'color-success';
 };

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="stack-md">
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="flex items-center justify-between p-md border border-border rounded-lg">
 <div className="flex-1 animate-pulse">
 <div className="h-icon-xs bg-muted rounded w-1/3 mb-sm"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </div>
 <div className="animate-pulse">
 <div className="h-icon-lg bg-muted rounded w-component-lg"></div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 );
 }

 if (budgets.length === 0) {
 return (
 <Card className="p-xl text-center">
 <DollarSign className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted/50" />
 <h3 className="text-heading-4 color-foreground mb-sm">No budgets found</h3>
 <p className="text-body-sm color-muted">Create your first budget to get started with financial planning.</p>
 </Card>
 );
 }

 return (
 <Card className="p-lg">
 <div className="stack-sm">
 {budgets.map((budget) => {
 const utilization = budget.utilization || 0;
 
 return (
 <div 
 key={budget.id} 
 className="flex items-center justify-between p-md border border-border rounded-lg hover:bg-muted/50 transition-colors"
 >
 {/* Budget Info */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center cluster-sm mb-xs">
 <h4 className="text-body form-label color-foreground truncate">{budget.name}</h4>
 {getStatusBadge(budget.status)}
 {budget.category && (
 <Badge variant="outline" size="sm">
 <Tag className="h-3 w-3 mr-xs" />
 {budget.category}
 </Badge>
 )}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md text-body-sm">
 <div>
 <span className="color-muted">Budget: </span>
 <span className="form-label color-foreground">
 {formatCurrency(budget.amount, budget.currency)}
 </span>
 </div>
 
 <div>
 <span className="color-muted">Spent: </span>
 <span className="form-label color-destructive">
 {formatCurrency(budget.spent || 0, budget.currency)}
 </span>
 </div>
 
 <div>
 <span className="color-muted">Remaining: </span>
 <span className="form-label color-success">
 {formatCurrency(budget.remaining || 0, budget.currency)}
 </span>
 </div>
 
 <div className="flex items-center cluster-xs">
 <span className="color-muted">Utilization: </span>
 <span className={`form-label ${getUtilizationColor(utilization)}`}>
 {utilization.toFixed(1)}%
 </span>
 {utilization >= 90 && (
 <AlertTriangle className="h-3 w-3 color-warning" />
 )}
 </div>
 </div>

 {/* Progress Bar */}
 <div className="mt-sm">
 <div className="w-full bg-muted rounded-full h-1.5">
 <div
 className={`h-1.5 rounded-full transition-all ${
 utilization >= 100 
 ? 'bg-destructive' 
 : utilization >= 80 
 ? 'bg-warning' 
 : 'bg-success'
 }`}
 style={{ width: `${Math.min(utilization, 100)}%` }}
 />
 </div>
 </div>

 {/* Period */}
 {budget.period_start && budget.period_end && (
 <div className="flex items-center cluster-xs mt-xs text-body-sm color-muted">
 <Calendar className="h-3 w-3" />
 <span>
 {new Date(budget.period_start).toLocaleDateString()} - {new Date(budget.period_end).toLocaleDateString()}
 </span>
 </div>
 )}

 {/* Description */}
 {budget.description && (
 <p className="text-body-sm color-muted mt-xs line-clamp-xs">
 {budget.description}
 </p>
 )}
 </div>

 {/* Actions */}
 <div className="flex items-center cluster-xs ml-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(budget)}
 title="View Details"
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(budget)}
 title="Edit Budget"
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(budget.id)}
 className="color-destructive hover:bg-destructive/10"
 title="Delete Budget"
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 );
}
