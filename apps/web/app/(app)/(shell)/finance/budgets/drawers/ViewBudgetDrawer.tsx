'use client';

import React from 'react';
import {
 Drawer,
 Button,
 Badge,
 Card,
 CardHeader,
 CardTitle,
 CardContent,
 Progress
} from '@ghxstship/ui';
import { DollarSign, Calendar, Building, FileText, Edit, Receipt, TrendingUp } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface ViewBudgetDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 onEdit?: () => void;
 budget?: DataRecord | null;
}

export default function ViewBudgetDrawer({
 isOpen,
 onClose,
 onEdit,
 budget
}: ViewBudgetDrawerProps) {
 if (!budget) return null;

 // Calculate metrics
 const totalExpenses = budget.expenses?.reduce((sum: number, exp: unknown) => sum + (exp.amount || 0), 0) || 0;
 const utilizationPercentage = budget.amount > 0 ? (totalExpenses / budget.amount) * 100 : 0;
 const remainingBudget = budget.amount - totalExpenses;

 return (
 <Drawer isOpen={isOpen} onClose={onClose} title="Budget Details">
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-2xl font-bold">{budget.name}</h2>
 <Badge variant={
 budget.status === 'active' ? 'success' :
 budget.status === 'exceeded' ? 'destructive' : 'secondary'
 } className="mt-sm">
 {budget.status}
 </Badge>
 </div>
 {onEdit && (
 <Button onClick={onEdit} variant="outline">
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit
 </Button>
 )}
 </div>

 {/* Budget Overview */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <Card>
 <CardContent className="pt-lg">
 <div className="flex items-center gap-xs mb-sm">
 <DollarSign className="h-icon-sm w-icon-sm text-green-600" />
 <span className="text-sm text-gray-600">Budget Amount</span>
 </div>
 <div className="font-semibold text-lg">${budget.amount?.toLocaleString() || '0'}</div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="pt-lg">
 <div className="flex items-center gap-xs mb-sm">
 <Receipt className="h-icon-sm w-icon-sm text-red-600" />
 <span className="text-sm text-gray-600">Spent</span>
 </div>
 <div className="font-semibold text-lg">${totalExpenses.toLocaleString()}</div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="pt-lg">
 <div className="flex items-center gap-xs mb-sm">
 <TrendingUp className="h-icon-sm w-icon-sm text-blue-600" />
 <span className="text-sm text-gray-600">Remaining</span>
 </div>
 <div className="font-semibold text-lg">${remainingBudget.toLocaleString()}</div>
 </CardContent>
 </Card>
 </div>

 {/* Utilization Progress */}
 <Card>
 <CardHeader>
 <CardTitle>Budget Utilization</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 <Progress value={Math.min(utilizationPercentage, 100)} className="h-icon-xs" />
 <div className="flex justify-between text-sm">
 <span>{utilizationPercentage.toFixed(1)}% utilized</span>
 <span>${totalExpenses.toLocaleString()} of ${budget.amount?.toLocaleString() || '0'}</span>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Budget Information */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <Card>
 <CardHeader>
 <CardTitle>Budget Details</CardTitle>
 </CardHeader>
 <CardContent className="space-y-md">
 <div className="flex justify-between">
 <span className="text-gray-600">Category</span>
 <Badge variant="outline">{budget.category}</Badge>
 </div>

 <div className="flex justify-between">
 <span className="text-gray-600">Period</span>
 <span>{budget.period}</span>
 </div>

 <div className="flex justify-between">
 <span className="text-gray-600">Fiscal Year</span>
 <span>{budget.fiscal_year}</span>
 </div>

 <div className="flex justify-between">
 <span className="text-gray-600">Status</span>
 <Badge variant={
 budget.status === 'active' ? 'success' :
 budget.status === 'exceeded' ? 'destructive' : 'secondary'
 }>
 {budget.status}
 </Badge>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Associations</CardTitle>
 </CardHeader>
 <CardContent className="space-y-md">
 {budget.projects && (
 <div className="flex items-center gap-sm">
 <Building className="h-icon-xs w-icon-xs text-blue-600" />
 <div>
 <div className="text-sm text-gray-600">Project</div>
 <div className="font-medium">{budget.projects.name}</div>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 {/* Recent Expenses */}
 {budget.expenses && budget.expenses.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Recent Expenses</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {budget.expenses.slice(0, 5).map((expense: unknown) => (
 <div key={expense.id} className="flex items-center justify-between p-sm bg-gray-50 rounded">
 <div>
 <div className="font-medium">{expense.description}</div>
 <div className="text-sm text-gray-600">{expense.category}</div>
 </div>
 <div className="text-right">
 <div className="font-medium">${expense.amount?.toLocaleString() || '0'}</div>
 <div className="text-sm text-gray-600">
 {new Date(expense.expense_date).toLocaleDateString()}
 </div>
 </div>
 </div>
 ))}
 {budget.expenses.length > 5 && (
 <div className="text-center text-gray-600 text-sm">
 And {budget.expenses.length - 5} more expenses...
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 )}

 {/* Notes */}
 {budget.notes && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <FileText className="h-icon-sm w-icon-sm" />
 Notes
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-gray-700 whitespace-pre-wrap">{budget.notes}</p>
 </CardContent>
 </Card>
 )}

 {/* Metadata */}
 <Card>
 <CardHeader>
 <CardTitle>Record Information</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 <div>
 <span className="text-gray-600">Created</span>
 <div className="font-medium">
 {budget.created_at ? new Date(budget.created_at).toLocaleString() : 'N/A'}
 </div>
 </div>
 <div>
 <span className="text-gray-600">Last Updated</span>
 <div className="font-medium">
 {budget.updated_at ? new Date(budget.updated_at).toLocaleString() : 'N/A'}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Actions */}
 <div className="flex items-center justify-end gap-md pt-lg border-t">
 <Button onClick={onClose} variant="outline">
 Close
 </Button>
 {onEdit && (
 <Button onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit Budget
 </Button>
 )}
 </div>
 </div>
 </Drawer>
 );
}
