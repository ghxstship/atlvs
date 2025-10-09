'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Badge, Button, Card, CardBody, CardContent, CardHeader,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from "@ghxstship/ui";
import { ArrowLeft, Edit, ArrowUpDown, Calendar, CreditCard, Building, FileText , CardBody} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import ViewTransactionDrawer from '../drawers/ViewTransactionDrawer';
import EditTransactionDrawer from '../drawers/EditTransactionDrawer';
import { TransactionService } from '../lib/transactions-service';

interface TransactionDetailClientProps {
 transaction: unknown;
 user: User;
 orgId: string;
}

export default function TransactionDetailClient({ transaction, user, orgId }: TransactionDetailClientProps) {
 const router = useRouter();
 const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
 const [isUpdating, setIsUpdating] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 const handleUpdate = async (data: unknown) => {
 setIsUpdating(true);
 setError(null);

 try {
 const transactionService = new TransactionService();
 await transactionService.updateTransaction(transaction.id, {
 ...data,
 updated_by: user.id
 });

 setSuccess(true);
 setIsEditDrawerOpen(false);
 setTimeout(() => {
 window.location.reload();
 }, 1500);
 } catch (err) {
 console.error('Failed to update transaction:', err);
 setError(err instanceof Error ? err.message : 'Failed to update transaction');
 } finally {
 setIsUpdating(false);
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
 <ArrowLeft className="h-icon-xs w-icon-xs mr-xs" />
 Back to Transactions
 </Button>
 <div>
 <h1 className="text-3xl font-bold">{transaction.description}</h1>
 <p className="text-gray-600">Transaction details and management.</p>
 </div>
 </div>

 {/* Success Message */}
 {success && (
 <Alert className="mb-lg border-green-200 bg-green-50">
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
 <span className="font-medium text-green-800">Success!</span>
 </div>
 <p className="text-green-700 mt-xs">Transaction updated successfully. Refreshing...</p>
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

 {/* Quick Actions */}
 <Card className="mb-lg">
 <CardContent className="pt-lg">
 <div className="flex items-center gap-md">
 <Button onClick={() => setIsEditDrawerOpen(true)}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit Transaction
 </Button>
 <Button variant="outline" onClick={() => router.push('/finance/transactions')}>
 <ArrowUpDown className="h-icon-xs w-icon-xs mr-xs" />
 View All Transactions
 </Button>
 </div>
 </CardContent>
 </Card>

 {/* Transaction Details Drawer (Always Open) */}
 <ViewTransactionDrawer
 isOpen={true}
 onClose={() => router.back()}
 onEdit={() => setIsEditDrawerOpen(true)}
 transaction={transaction}
/>

 {/* Edit Drawer */}
 <EditTransactionDrawer
 isOpen={isEditDrawerOpen}
 onClose={() => setIsEditDrawerOpen(false)}
 onSubmit={handleUpdate}
 transaction={transaction}
 isLoading={isUpdating}
/>
 </div>
 );
}
