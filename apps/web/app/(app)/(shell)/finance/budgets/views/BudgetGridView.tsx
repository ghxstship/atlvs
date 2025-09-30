'use client';

import { DollarSign, TrendingUp, TrendingDown, Edit, Trash2, Eye, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Badge, Button, Card } from '@ghxstship/ui';
import type { Budget } from '../types';

interface BudgetGridViewProps {
 budgets: Budget[];
 onEdit: (budget: Budget) => void;
 onDelete: (budgetId: string) => void;
 onView: (budget: Budget) => void;
 loading?: boolean;
}

export default function BudgetGridView({ 
 budgets, 
 onEdit, 
 onDelete, 
 onView, 
 loading = false 
}: BudgetGridViewProps) {
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

 const getUtilizationStatus = (utilization: number) => {
 if (utilization >= 100) {
 return { icon: AlertTriangle, color: 'color-destructive', label: 'Over Budget' };
 } else if (utilization >= 80) {
 return { icon: AlertTriangle, color: 'color-warning', label: 'Near Limit' };
 } else if (utilization >= 50) {
 return { icon: TrendingUp, color: 'color-accent', label: 'On Track' };
 } else {
 return { icon: CheckCircle, color: 'color-success', label: 'Under Budget' };
 }
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {Array.from({ length: 6 }).map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="animate-pulse">
 <div className="h-4 bg-muted rounded w-3/4 mb-sm"></div>
 <div className="h-6 bg-muted rounded w-1/2 mb-md"></div>
 <div className="space-y-sm">
 <div className="h-3 bg-muted rounded"></div>
 <div className="h-3 bg-muted rounded w-5/6"></div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (budgets.length === 0) {
 return (
 <Card className="p-xl text-center">
 <DollarSign className="h-12 w-12 mx-auto mb-md color-muted/50" />
 <h3 className="text-heading-4 color-foreground mb-sm">No budgets found</h3>
 <p className="text-body-sm color-muted">Create your first budget to get started with financial planning.</p>
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {budgets.map((budget) => {
 const utilization = budget.utilization || 0;
 const utilizationStatus = getUtilizationStatus(utilization);
 const UtilizationIcon = utilizationStatus.icon;

 return (
 <Card key={budget.id} className="p-lg hover:shadow-md transition-shadow">
 {/* Header */}
 <div className="flex items-start justify-between mb-md">
 <div className="flex-1">
 <h3 className="text-heading-4 color-foreground mb-xs">{budget.name}</h3>
 {budget.description && (
 <p className="text-body-sm color-muted line-clamp-2">{budget.description}</p>
 )}
 </div>
 {getStatusBadge(budget.status)}
 </div>

 {/* Financial Overview */}
 <div className="stack-sm mb-md">
 <div className="flex items-center justify-between">
 <span className="text-body-sm color-muted">Budget Amount</span>
 <span className="text-body-sm form-label color-foreground">
 {formatCurrency(budget.amount, budget.currency)}
 </span>
 </div>

 <div className="flex items-center justify-between">
 <span className="text-body-sm color-muted">Spent</span>
 <span className="text-body-sm form-label color-destructive">
 {formatCurrency(budget.spent || 0, budget.currency)}
 </span>
 </div>

 <div className="flex items-center justify-between">
 <span className="text-body-sm color-muted">Remaining</span>
 <span className="text-body-sm form-label color-success">
 {formatCurrency(budget.remaining || 0, budget.currency)}
 </span>
 </div>
 </div>

 {/* Utilization Progress */}
 <div className="mb-md">
 <div className="flex items-center justify-between mb-xs">
 <span className="text-body-sm color-muted">Utilization</span>
 <div className="flex items-center cluster-xs">
 <UtilizationIcon className={`h-3 w-3 ${utilizationStatus.color}`} />
 <span className="text-body-sm form-label">{utilization.toFixed(1)}%</span>
 </div>
 </div>
 
 <div className="w-full bg-muted rounded-full h-2">
 <div
 className={`h-2 rounded-full transition-all ${
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

 {/* Category and Period */}
 <div className="stack-xs mb-md text-body-sm color-muted">
 {budget.category && (
 <div className="flex items-center cluster-xs">
 <span>Category:</span>
 <Badge variant="outline" className="text-xs">
 {budget.category}
 </Badge>
 </div>
 )}
 
 {budget.period_start && budget.period_end && (
 <div className="flex items-center cluster-xs">
 <Clock className="h-3 w-3" />
 <span>
 {new Date(budget.period_start).toLocaleDateString()} - {new Date(budget.period_end).toLocaleDateString()}
 </span>
 </div>
 )}
 </div>

 {/* Actions */}
 <div className="flex items-center justify-end cluster-xs pt-sm border-t border-border">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(budget)}
 >
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(budget)}
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(budget.id)}
 className="color-destructive hover:bg-destructive/10"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </Card>
 );
 })}
 </div>
 );
}
