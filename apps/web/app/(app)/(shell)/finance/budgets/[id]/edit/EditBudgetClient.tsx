'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Alert } from '@ghxstship/ui';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import EditBudgetDrawer from '../../drawers/EditBudgetDrawer';
import { BudgetsService } from '../../lib/budgets-service';
import type { Budget } from '../../types';
import type { UpdateBudgetData } from '../../../types';

interface EditBudgetClientProps {
  budget: Budget;
  user: User;
  orgId: string;
}

interface EditBudgetFormValues {
  name: string;
  category: string;
  amount: number;
  currency: string;
  period: string;
  fiscal_year: number;
  status: string;
  notes?: string;
  project_id?: string;
}

const STATUS_MAP: Record<string, UpdateBudgetData['status']> = {
  draft: 'draft',
  active: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
  inactive: 'draft',
  exceeded: 'active',
  on_hold: 'draft',
};

export default function EditBudgetClient({
  budget,
  user: _user,
  orgId: _orgId,
}: EditBudgetClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: EditBudgetFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const budgetsService = new BudgetsService();

      const payload: UpdateBudgetData = {
        id: budget.id,
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        status: STATUS_MAP[data.status] ?? 'active',
        description: data.notes,
        project_id: data.project_id,
      };

      await budgetsService.updateBudget(payload);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/finance/budgets/${budget.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to update budget:', err);
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Budget</h1>
          <p className="text-gray-600">Update budget details.</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-lg border-green-200 bg-green-50">
          <div className="flex items-center gap-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium text-green-800">Success!</span>
          </div>
          <p className="text-green-700 mt-xs">Budget updated successfully. Redirecting...</p>
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

      {/* Instructions */}
      <Card className="mb-lg">
        <CardContent className="pt-lg">
          <div className="flex items-start gap-md">
            <div className="p-sm bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-sm">Budget Update Guidelines</h3>
              <ul className="text-sm text-gray-600 space-y-xs">
                <li>• Ensure budget amounts are accurate and realistic</li>
                <li>• Update fiscal year and period information as needed</li>
                <li>• Maintain proper project associations</li>
                <li>• Include updated notes for budget changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Budget Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <EditBudgetDrawer
            isOpen
            onClose={() => router.back()}
            onSubmit={handleSubmit}
            budget={budget}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
