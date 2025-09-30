'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Alert, Badge, Progress } from '@ghxstship/ui';
import { ArrowLeft, Edit, DollarSign, TrendingUp, Receipt, Building } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import ViewBudgetDrawer from '../drawers/ViewBudgetDrawer';
import EditBudgetDrawer from '../drawers/EditBudgetDrawer';
import { BudgetService } from '../lib/budgets-service';

interface BudgetDetailClientProps {
 budget: unknown;
 user: User;
 orgId: string;
}

export default function BudgetDetailClient({ budget, user, orgId }: BudgetDetailClientProps) {
 const router = useRouter();
 const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
 const [isUpdating, setIsUpdating] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 const handleUpdate = async (data: unknown) => {
 setIsUpdating(true);
 setError(null);

 try {
 const budgetService = new BudgetService();
 await budgetService.updateBudget(budget.id, {
 ...data,
 updated_by: user.id,
 });

 setSuccess(true);
 setIsEditDrawerOpen(false);
 setTimeout(() => {
 window.location.reload();
 }, 1500);
 } catch (err) {
 console.error('Failed to update budget:', err);
 setError(err instanceof Error ? err.message : 'Failed to update budget');
 } finally {
 setIsUpdating(false);
 }
 };

 // Calculate budget metrics
 const totalExpenses = budget.expenses?.reduce((sum: number, exp: unknown) => sum + (exp.amount || 0), 0) || 0;
 const utilizationPercentage = budget.amount > 0 ? (totalExpenses / budget.amount) * 100 : 0;
 const remainingBudget = budget.amount - totalExpenses;

 return (
 <div className="max-w-4xl mx-auto p-lg">
 {/* Header */}
 <div className="flex items-center gap-md mb-lg">
 <Button
 variant="outline"
 size="sm"
 onClick={() => router.back()}
 >
 <ArrowLeft className="h-4 w-4 mr-xs" />
 Back to Budgets
 </Button>
 <div>
 <h1 className="text-3xl font-bold">{budget.name}</h1>
 <p className="text-gray-600">Budget details and expense tracking.</p>
 </div>
 </div>

 {/* Success Message */}
 {success && (
 <Alert className="mb-lg border-green-200 bg-green-50">
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
 <span className="font-medium text-green-800">Success!</span>
 </div>
 <p className="text-green-700 mt-xs">Budget updated successfully. Refreshing...</p>
 </Alert>
 )}

 {/* Error Message */}
 {error && (
 <Alert className="mb-lg border-red-200 bg-red-50">
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 bg-red-500 rounded-full"></div>
 <span className="font-medium text-red-800">Error</span>
 </div>
 <p className="text-red-700 mt-xs">{error}</p>
 </Alert>
 )}

 {/* Budget Overview Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
 <Card>
 <CardContent className="pt-lg">
 <div className="flex items-center gap-xs mb-sm">
 <DollarSign className="h-5 w-5 text-green-600" />
 <span className="text-sm text-gray-600">Total Budget</span>
 </div>
 <div className="text-2xl font-bold">${budget.amount?.toLocaleString() || '0'}</div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="pt-lg">
 <div className="flex items-center gap-xs mb-sm">
 <Receipt className="h-5 w-5 text-red-600" />
 <span className="text-sm text-gray-600">Total Expenses</span>
 </div>
 <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="pt-lg">
 <div className="flex items-center gap-xs mb-sm">
 <TrendingUp className="h-5 w-5 text-blue-600" />
 <span className="text-sm text-gray-600">Remaining</span>
 </div>
 <div className="text-2xl font-bold">${remainingBudget.toLocaleString()}</div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="pt-lg">
 <div className="flex items-center gap-xs mb-sm">
 <div className="w-2 h-2 rounded-full bg-gray-400"></div>
 <span className="text-sm text-gray-600">Utilization</span>
 </div>
 <div className="text-2xl font-bold">{utilizationPercentage.toFixed(1)}%</div>
 </CardContent>
 </Card>
 </div>

 {/* Utilization Progress */}
 <Card className="mb-lg">
 <CardContent className="pt-lg">
 <h3 className="font-semibold mb-md">Budget Utilization</h3>
 <div className="space-y-sm">
 <Progress value={utilizationPercentage} className="h-3" />
 <div className="flex justify-between text-sm text-gray-600">
 <span>Spent: ${totalExpenses.toLocaleString()}</span>
 <span>Budget: ${budget.amount?.toLocaleString() || '0'}</span>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Quick Actions */}
 <Card className="mb-lg">
 <CardContent className="pt-lg">
 <div className="flex items-center gap-md">
 <Button onClick={() => setIsEditDrawerOpen(true)}>
 <Edit className="h-4 w-4 mr-xs" />
 Edit Budget
 </Button>
 <Button variant="outline" onClick={() => router.push('/finance/budgets')}>
 <DollarSign className="h-4 w-4 mr-xs" />
 View All Budgets
 </Button>
 </div>
 </CardContent>
 </Card>

 {/* Budget Details Drawer (Always Open) */}
 <ViewBudgetDrawer
 isOpen={true}
 onClose={() => router.back()}
 onEdit={() => setIsEditDrawerOpen(true)}
 budget={budget}
/>

 {/* Edit Drawer */}
 <EditBudgetDrawer
 isOpen={isEditDrawerOpen}
 onClose={() => setIsEditDrawerOpen(false)}
 onSubmit={handleUpdate}
 budget={budget}
 isLoading={isUpdating}
/>
 </div>
 );
}
