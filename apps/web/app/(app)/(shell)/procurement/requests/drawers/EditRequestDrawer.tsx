'use client';

import { Button, Input, Label, Save, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Textarea, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppDrawer, Button, Input, Label, Select, Separator } from '@ghxstship/ui';
import { CreateProcurementRequestSchema, type CreateProcurementRequest } from '../types';
import type { ProcurementRequest } from '../types';

interface EditRequestDrawerProps {
 request: ProcurementRequest | null;
 open: boolean;
 onClose: () => void;
 onSave: (data: CreateProcurementRequest) => Promise<void>;
 loading?: boolean;
}

export default function EditRequestDrawer({
 request,
 open,
 onClose,
 onSave,
 loading = false
}: EditRequestDrawerProps) {
 const [saving, setSaving] = useState(false);

 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 setValue,
 watch
 } = useForm<CreateProcurementRequest>({
 resolver: zodResolver(CreateProcurementRequestSchema)
 });

 // Reset form when request changes
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 if (request && open) {
 reset({
 organization_id: request.organization_id,
 project_id: request.project_id || undefined,
 requester_id: request.requester_id,
 title: request.title,
 description: request.description || '',
 business_justification: request.business_justification,
 category: request.category as unknown,
 priority: request.priority as unknown,
 estimated_total: request.estimated_total,
 currency: request.currency || 'USD',
 requested_delivery_date: request.requested_delivery_date || undefined,
 budget_code: request.budget_code || '',
 department: request.department || '',
 items: request.items || []
 });
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [request, open, reset]);

 const onSubmit = async (data: CreateProcurementRequest) => {
 try {
 setSaving(true);
 await onSave(data);
 onClose();
 } catch (error) {
 console.error('Error saving request:', error);
 } finally {
 setSaving(false);
 }
 };

 if (!request) return null;

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 title="Edit Request"
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
 {/* Basic Information */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Basic Information</h3>
 
 <div className="space-y-sm">
 <Label htmlFor="title">Request Title *</Label>
 <Input
 
 {...register('title')}
 placeholder="Enter request title"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="description">Description</Label>
 <textarea
 
 {...register('description')}
 placeholder="Enter request description"
 rows={3}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="category">Category *</Label>
 <Select
 value={watch('category')}
 onValueChange={(value) => setValue('category', value as unknown)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select category" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="equipment">Equipment</SelectItem>
 <SelectItem value="supplies">Supplies</SelectItem>
 <SelectItem value="services">Services</SelectItem>
 <SelectItem value="materials">Materials</SelectItem>
 <SelectItem value="software">Software</SelectItem>
 <SelectItem value="maintenance">Maintenance</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>
 {errors.category && (
 <p className="text-sm text-destructive">{errors.category.message}</p>
 )}
 </div>

 <div className="space-y-sm">
 <Label htmlFor="priority">Priority *</Label>
 <Select
 value={watch('priority')}
 onValueChange={(value) => setValue('priority', value as unknown)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select priority" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="low">Low</SelectItem>
 <SelectItem value="medium">Medium</SelectItem>
 <SelectItem value="high">High</SelectItem>
 <SelectItem value="urgent">Urgent</SelectItem>
 </SelectContent>
 </Select>
 {errors.priority && (
 <p className="text-sm text-destructive">{errors.priority.message}</p>
 )}
 </div>
 </div>
 </div>

 <Separator />

 {/* Financial Information */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Financial Information</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="estimated_total">Estimated Total *</Label>
 <Input
 
 type="number"
 step="0.01"
 {...register('estimated_total', { valueAsNumber: true })}
 placeholder="0.00"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="currency">Currency</Label>
 <Select
 value={watch('currency')}
 onValueChange={(value) => setValue('currency', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select currency" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="USD">USD</SelectItem>
 <SelectItem value="EUR">EUR</SelectItem>
 <SelectItem value="GBP">GBP</SelectItem>
 <SelectItem value="CAD">CAD</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="budget_code">Budget Code</Label>
 <Input
 
 {...register('budget_code')}
 placeholder="Enter budget code"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="department">Department</Label>
 <Input
 
 {...register('department')}
 placeholder="Enter department"
 />
 </div>
 </div>
 </div>

 <Separator />

 {/* Delivery Information */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Delivery Information</h3>
 
 <div className="space-y-sm">
 <Label htmlFor="requested_delivery_date">Requested Delivery Date</Label>
 <Input
 
 type="date"
 {...register('requested_delivery_date')}
 />
 </div>
 </div>

 <Separator />

 {/* Business Justification */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Business Justification</h3>
 
 <div className="space-y-sm">
 <Label htmlFor="business_justification">Justification *</Label>
 <textarea
 
 {...register('business_justification')}
 placeholder="Provide detailed business justification for this request"
 rows={4}
 />
 <p className="text-xs text-muted-foreground">
 Minimum 10 characters required
 </p>
 </div>
 </div>

 {/* Actions */}
 <Separator />
 <div className="flex gap-sm">
 <Button
 type="submit"
 disabled={saving || loading}
 loading={saving}
 >
 <Save className="h-icon-xs w-icon-xs mr-sm" />
 Save Changes
 </Button>
 <Button
 type="button"
 variant="outline"
 onClick={onClose}
 disabled={saving}
 >
 <X className="h-icon-xs w-icon-xs mr-sm" />
 Cancel
 </Button>
 </div>
 </form>
 </AppDrawer>
 );
}
