'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Alert } from '@ghxstship/ui';
import { ArrowLeft, FileText } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import CreateInvoiceDrawer from '../drawers/CreateInvoiceDrawer';
import { InvoiceService } from '../lib/invoices-service';

interface CreateInvoiceClientProps {
 user: User;
 orgId: string;
}

export default function CreateInvoiceClient({ user, orgId }: CreateInvoiceClientProps) {
 const router = useRouter();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 const handleSubmit = async (data: unknown) => {
 setIsSubmitting(true);
 setError(null);

 try {
 const invoiceService = new InvoiceService();
 await invoiceService.createInvoice({
 ...data,
 organization_id: orgId,
 created_by: user.id,
 updated_by: user.id,
 });

 setSuccess(true);
 setTimeout(() => {
 router.push('/finance/invoices');
 }, 1500);
 } catch (err) {
 console.error('Failed to create invoice:', err);
 setError(err instanceof Error ? err.message : 'Failed to create invoice');
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
 <ArrowLeft className="h-icon-xs w-icon-xs mr-xs" />
 Back
 </Button>
 <div>
 <h1 className="text-3xl font-bold">Create Invoice</h1>
 <p className="text-gray-600">Add a new invoice to track billing and payments.</p>
 </div>
 </div>

 {/* Success Message */}
 {success && (
 <Alert className="mb-lg border-green-200 bg-green-50">
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
 <span className="font-medium text-green-800">Success!</span>
 </div>
 <p className="text-green-700 mt-xs">Invoice created successfully. Redirecting...</p>
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
 <FileText className="h-icon-md w-icon-md text-blue-600" />
 </div>
 <div>
 <h3 className="font-semibold mb-sm">Invoice Entry Guidelines</h3>
 <ul className="text-sm text-gray-600 space-y-xs">
 <li>• Generate unique invoice numbers for proper tracking</li>
 <li>• Associate with correct clients and projects</li>
 <li>• Include accurate line items and pricing</li>
 <li>• Set appropriate payment terms and due dates</li>
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Create Form */}
 <Card>
 <CardHeader>
 <CardTitle>Add Invoice Entry</CardTitle>
 </CardHeader>
 <CardContent>
 <CreateInvoiceDrawer
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
