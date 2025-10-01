'use client';

import { DollarSign, Calendar, Tag, FileText } from "lucide-react";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 AppDrawer,
 Button,
 Input,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Label,
 Card
} from '@ghxstship/ui';
import type { CreateBudgetData, Budget } from '../types';

const CreateBudgetSchema = z.object({
 name: z.string().min(1, 'Budget name is required'),
 description: z.string().optional(),
 amount: z.number().positive('Amount must be positive'),
 currency: z.string().default('USD'),
 category: z.string().optional(),
 period_start: z.string().optional(),
 period_end: z.string().optional(),
 project_id: z.string().optional(),
 status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft')
});

interface CreateBudgetDrawerProps {
 open: boolean;
 onClose: () => void;
 onSave: (data: CreateBudgetData) => Promise<void>;
 initialData?: Partial<Budget>;
 mode?: 'create' | 'edit';
}

export default function CreateBudgetDrawer({
 open,
 onClose,
 onSave,
 initialData,
 mode = 'create'
}: CreateBudgetDrawerProps) {
 const [loading, setLoading] = useState(false);

 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 setValue,
 watch
 } = useForm<CreateBudgetData>({
 resolver: zodResolver(CreateBudgetSchema),
 defaultValues: {
 name: initialData?.name || '',
 description: initialData?.description || '',
 amount: initialData?.amount || 0,
 currency: initialData?.currency || 'USD',
 category: initialData?.category || '',
 period_start: initialData?.period_start || '',
 period_end: initialData?.period_end || '',
 project_id: initialData?.project_id || '',
 status: initialData?.status || 'draft'
 }
 });

 const handleSave = async (data: CreateBudgetData) => {
 try {
 setLoading(true);
 await onSave(data);
 reset();
 onClose();
 } catch (error) {
 console.error('Error saving budget:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleClose = () => {
 reset();
 onClose();
 };

 return (
 <AppDrawer
 open={open}
 onClose={handleClose}
 title={mode === 'create' ? 'Create Budget' : 'Edit Budget'}
 description={mode === 'create' ? 'Create a new budget for your organization' : 'Update budget details'}
 >
 <form onSubmit={handleSubmit(handleSave)} className="stack-lg">
 {/* Basic Information */}
 <Card className="p-lg">
 <div className="flex items-center cluster-sm mb-md">
 <FileText className="h-icon-sm w-icon-sm color-accent" />
 <h3 className="text-heading-4 color-foreground">Basic Information</h3>
 </div>
 
 <div className="stack-md">
 <div>
 <Label htmlFor="name">Budget Name *</Label>
 <Input
 
 {...register('name')}
 placeholder="Enter budget name"
 />
 </div>

 <div>
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 {...register('description')}
 placeholder="Enter budget description"
 rows={3}
 />
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="category">Category</Label>
 <Select onValueChange={(value) => setValue('category', value)}>
 <SelectTrigger>
 <SelectValue placeholder="Select category" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="operations">Operations</SelectItem>
 <SelectItem value="marketing">Marketing</SelectItem>
 <SelectItem value="technology">Technology</SelectItem>
 <SelectItem value="travel">Travel</SelectItem>
 <SelectItem value="equipment">Equipment</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div>
 <Label htmlFor="status">Status</Label>
 <Select onValueChange={(value) => setValue('status', value as unknown)}>
 <SelectTrigger>
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="draft">Draft</SelectItem>
 <SelectItem value="active">Active</SelectItem>
 <SelectItem value="completed">Completed</SelectItem>
 <SelectItem value="cancelled">Cancelled</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>
 </Card>

 {/* Financial Details */}
 <Card className="p-lg">
 <div className="flex items-center cluster-sm mb-md">
 <DollarSign className="h-icon-sm w-icon-sm color-success" />
 <h3 className="text-heading-4 color-foreground">Financial Details</h3>
 </div>
 
 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="amount">Budget Amount *</Label>
 <Input
 
 type="number"
 step="0.01"
 min="0"
 {...register('amount', { valueAsNumber: true })}
 placeholder="0.00"
 />
 </div>

 <div>
 <Label htmlFor="currency">Currency</Label>
 <Select onValueChange={(value) => setValue('currency', value)}>
 <SelectTrigger>
 <SelectValue placeholder="Select currency" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="USD">USD - US Dollar</SelectItem>
 <SelectItem value="EUR">EUR - Euro</SelectItem>
 <SelectItem value="GBP">GBP - British Pound</SelectItem>
 <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </Card>

 {/* Period */}
 <Card className="p-lg">
 <div className="flex items-center cluster-sm mb-md">
 <Calendar className="h-icon-sm w-icon-sm color-accent" />
 <h3 className="text-heading-4 color-foreground">Budget Period</h3>
 </div>
 
 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="period_start">Start Date</Label>
 <Input
 
 type="date"
 {...register('period_start')}
 />
 </div>

 <div>
 <Label htmlFor="period_end">End Date</Label>
 <Input
 
 type="date"
 {...register('period_end')}
 />
 </div>
 </div>
 </Card>

 {/* Actions */}
 <div className="flex justify-end cluster-sm pt-md border-t border-border">
 <Button
 type="button"
 variant="outline"
 onClick={handleClose}
 disabled={loading}
 >
 Cancel
 </Button>
 <Button
 type="submit"
 loading={loading}
 >
 {mode === 'create' ? 'Create Budget' : 'Update Budget'}
 </Button>
 </div>
 </form>
 </AppDrawer>
 );
}
