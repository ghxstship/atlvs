'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Alert } from '@ghxstship/ui';
import { ArrowLeft, ArrowUpDown } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import EditTransactionDrawer from '../../drawers/EditTransactionDrawer';
import { TransactionsService } from '../../lib/transactions-service';
import type { Transaction, UpdateTransactionData } from '../../types';

interface EditTransactionClientProps {
  transaction: Transaction;
  user: User;
  orgId: string;
}

export default function EditTransactionClient({ transaction, user, orgId }: EditTransactionClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: UpdateTransactionData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const transactionService = new TransactionsService();
      await transactionService.updateTransaction(orgId, transaction.id, formData);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/finance/transactions/${transaction.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to update transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-lg">
      {/* Header */}
      <div className="flex items-center gap-md mb-lg">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-icon-xs w-icon-xs mr-xs" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Transaction</h1>
          <p className="text-gray-600">Update transaction details.</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-lg border-green-200 bg-green-50">
          <div className="flex items-center gap-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-medium text-green-800">Success!</span>
          </div>
          <p className="text-green-700 mt-xs">Transaction updated successfully. Redirecting...</p>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="mb-lg border-red-200 bg-red-50">
          <div className="flex items-center gap-xs">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
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
              <ArrowUpDown className="h-icon-md w-icon-md text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-sm">Transaction Update Guidelines</h3>
              <ul className="text-sm text-gray-600 space-y-xs">
                <li>• Ensure all financial data remains accurate</li>
                <li>• Update transaction dates only when necessary</li>
                <li>• Maintain proper account and project associations</li>
                <li>• Include updated reference information when applicable</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Transaction Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <EditTransactionDrawer
            isOpen
            onClose={() => router.back()}
            onSubmit={handleSubmit}
            transaction={transaction}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
