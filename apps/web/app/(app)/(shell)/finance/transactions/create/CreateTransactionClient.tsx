'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Alert } from '@ghxstship/ui';
import { ArrowLeft, ArrowUpDown } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import CreateTransactionDrawer from '../drawers/CreateTransactionDrawer';
import { TransactionService } from '../lib/transactions-service';

interface CreateTransactionClientProps {
 user: User;
 orgId: string;
}

export default function CreateTransactionClient({ user, orgId }: CreateTransactionClientProps) {
 const router = useRouter();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 const handleSubmit = async (data: unknown) => {
 setIsSubmitting(true);
 setError(null);

 try {
 const transactionService = new TransactionService();
 await transactionService.createTransaction({
 ...data,
 organization_id: orgId,
 created_by: user.id,
 updated_by: user.id,
 });

 setSuccess(true);
 setTimeout(() => {
 router.push('/finance/transactions');
 }, 1500);
 } catch (err) {
 console.error('Failed to create transaction:', err);
 setError(err instanceof Error ? err.message : 'Failed to create transaction');
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
 <h1 className="text-3xl font-bold">Create Transaction</h1>
 <p className="text-gray-600">Add a new transaction to track financial activity.</p>
 </div>
 </div>

 {/* Success Message */}
 {success && (
 <Alert className="mb-lg border-green-200 bg-green-50">
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
 <span className="font-medium text-green-800">Success!</span>
 </div>
 <p className="text-green-700 mt-xs">Transaction created successfully. Redirecting...</p>
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
 <ArrowUpDown className="h-6 w-6 text-blue-600" />
 </div>
 <div>
 <h3 className="font-semibold mb-sm">Transaction Entry Guidelines</h3>
 <ul className="text-sm text-gray-600 space-y-xs">
 <li>• Select the correct transaction type (credit/debit)</li>
 <li>• Associate with the appropriate account</li>
 <li>• Use accurate amounts and dates</li>
 <li>• Include reference numbers when available</li>
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Create Form */}
 <Card>
 <CardHeader>
 <CardTitle>Add Transaction Entry</CardTitle>
 </CardHeader>
 <CardContent>
 <CreateTransactionDrawer
 isOpen={true}
 onClose={() => router.back()}
 onSubmit={handleSubmit}
 isLoading={isSubmitting}
/>
 </CardContent>
 </Card>
 </div>
 );
}
