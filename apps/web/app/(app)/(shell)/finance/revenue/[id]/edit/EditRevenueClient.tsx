'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Alert } from '@ghxstship/ui';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import EditRevenueDrawer from '../drawers/EditRevenueDrawer';
import { RevenueService } from '../lib/revenue-service';

interface EditRevenueClientProps {
 revenue: unknown;
 user: User;
 orgId: string;
}

export default function EditRevenueClient({ revenue, user, orgId }: EditRevenueClientProps) {
 const router = useRouter();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 const handleSubmit = async (data: unknown) => {
 setIsSubmitting(true);
 setError(null);

 try {
 // // const revenueService = new RevenueService();
 await revenueService.updateRevenue(revenue.id, {
 ...data,
 updated_by: user.id,
 });

 setSuccess(true);
 setTimeout(() => {
 router.push(`/finance/revenue/${revenue.id}`);
 }, 1500);
 } catch (err) {
 console.error('Failed to update revenue:', err);
 setError(err instanceof Error ? err.message : 'Failed to update revenue');
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
 <h1 className="text-3xl font-bold">Edit Revenue</h1>
 <p className="text-gray-600">Update revenue entry details.</p>
 </div>
 </div>

 {/* Success Message */}
 {success && (
 <Alert className="mb-lg border-green-200 bg-green-50">
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
 <span className="font-medium text-green-800">Success!</span>
 </div>
 <p className="text-green-700 mt-xs">Revenue updated successfully. Redirecting...</p>
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
 <h3 className="font-semibold mb-sm">Revenue Update Guidelines</h3>
 <ul className="text-sm text-gray-600 space-y-xs">
 <li>• Ensure all financial data is accurate and up-to-date</li>
 <li>• Update recognition dates when revenue status changes</li>
 <li>• Maintain proper associations with clients and projects</li>
 <li>• Include updated invoice information when applicable</li>
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Update Revenue Entry</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="p-4 text-center text-gray-500">
 Revenue editing temporarily disabled
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
