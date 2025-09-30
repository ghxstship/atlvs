'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Alert } from '@ghxstship/ui';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import CreateForecastDrawer from '../drawers/CreateForecastDrawer';
import { ForecastService } from '../lib/forecasts-service';

interface CreateForecastClientProps {
 user: User;
 orgId: string;
}

export default function CreateForecastClient({ user, orgId }: CreateForecastClientProps) {
 const router = useRouter();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 const handleSubmit = async (data: unknown) => {
 setIsSubmitting(true);
 setError(null);

 try {
 const forecastService = new ForecastService();
 await forecastService.createForecast({
 ...data,
 organization_id: orgId,
 created_by: user.id,
 updated_by: user.id,
 });

 setSuccess(true);
 setTimeout(() => {
 router.push('/finance/forecasts');
 }, 1500);
 } catch (err) {
 console.error('Failed to create forecast:', err);
 setError(err instanceof Error ? err.message : 'Failed to create forecast');
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
 <h1 className="text-3xl font-bold">Create Forecast</h1>
 <p className="text-gray-600">Add a new financial forecast for planning and analysis.</p>
 </div>
 </div>

 {/* Success Message */}
 {success && (
 <Alert className="mb-lg border-green-200 bg-green-50">
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
 <span className="font-medium text-green-800">Success!</span>
 </div>
 <p className="text-green-700 mt-xs">Forecast created successfully. Redirecting...</p>
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
 <TrendingUp className="h-6 w-6 text-blue-600" />
 </div>
 <div>
 <h3 className="font-semibold mb-sm">Forecast Creation Guidelines</h3>
 <ul className="text-sm text-gray-600 space-y-xs">
 <li>• Define clear forecast titles and categories</li>
 <li>• Set realistic forecasted amounts and confidence levels</li>
 <li>• Associate with relevant projects when applicable</li>
 <li>• Include detailed assumptions and scenarios</li>
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Create Form */}
 <Card>
 <CardHeader>
 <CardTitle>Add Forecast Entry</CardTitle>
 </CardHeader>
 <CardContent>
 <CreateForecastDrawer
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
