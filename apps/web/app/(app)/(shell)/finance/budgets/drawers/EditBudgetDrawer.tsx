'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
 Drawer,
 Button,
 Input,
 Select,
 Textarea,
 FormField,
 FormItem,
 FormLabel,
 FormControl,
 FormMessage,
 Card,
 CardHeader,
 CardTitle,
 CardContent
} from '@ghxstship/ui';
import { DollarSign, Calendar, Building } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

const editBudgetSchema = z.object({
 name: z.string().min(1, 'Budget name is required').max(100, 'Name too long'),
 category: z.enum(['operations', 'marketing', 'development', 'production', 'other']),
 amount: z.number().positive('Amount must be positive').max(10000000, 'Amount too large'),
 currency: z.string().default('USD'),
 period: z.enum(['monthly', 'quarterly', 'yearly']),
 fiscal_year: z.number().int().min(2020).max(2030),
 status: z.enum(['active', 'inactive', 'exceeded']).default('active'),
 notes: z.string().max(500).optional(),
 project_id: z.string().uuid().optional(),
});

type EditBudgetForm = z.infer<typeof editBudgetSchema>;

interface EditBudgetDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (data: EditBudgetForm) => Promise<void>;
 budget?: DataRecord | null;
 isLoading?: boolean;
}

export default function EditBudgetDrawer({
 isOpen,
 onClose,
 onSubmit,
 budget,
 isLoading = false
}: EditBudgetDrawerProps) {
 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 setValue
 } = useForm<EditBudgetForm>({
 resolver: zodResolver(editBudgetSchema),
 });

 useEffect(() => {
 if (budget && isOpen) {
 reset({
 name: budget.name || '',
 category: budget.category || 'operations',
 amount: budget.amount || 0,
 currency: budget.currency || 'USD',
 period: budget.period || 'monthly',
 fiscal_year: budget.fiscal_year || new Date().getFullYear(),
 status: budget.status || 'active',
 notes: budget.notes || '',
 project_id: budget.project_id || '',
 });
 }
 }, [budget, isOpen, reset]);

 const handleFormSubmit = async (data: EditBudgetForm) => {
 try {
 await onSubmit(data);
 onClose();
 } catch (error) {
 console.error('Failed to update budget:', error);
 }
 };

 const handleClose = () => {
 reset();
 onClose();
 };

 return (
 <Drawer isOpen={isOpen} onClose={handleClose} title="Edit Budget">
 <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 {/* Basic Information */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <DollarSign className="h-5 w-5" />
 Budget Details
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-md">
 <FormField>
 <FormItem>
 <FormLabel>Name *</FormLabel>
 <FormControl>
 <Input
 {...register('name')}
 placeholder="e.g., Marketing Q1 Budget"
 />
 </FormControl>
 <FormMessage>{errors.name?.message}</FormMessage>
 </FormItem>
 </FormField>

 <FormField>
 <FormItem>
 <FormLabel>Amount *</FormLabel>
 <FormControl>
 <Input
 {...register('amount', { valueAsNumber: true })}
 type="number"
 step="0.01"
 placeholder="0.00"
 />
 </FormControl>
 <FormMessage>{errors.amount?.message}</FormMessage>
 </FormItem>
 </FormField>

 <FormField>
 <FormItem>
 <FormLabel>Category *</FormLabel>
 <FormControl>
 <Select {...register('category')}>
 <option value="operations">Operations</option>
 <option value="marketing">Marketing</option>
 <option value="development">Development</option>
 <option value="production">Production</option>
 <option value="other">Other</option>
 </Select>
 </FormControl>
 <FormMessage>{errors.category?.message}</FormMessage>
 </FormItem>
 </FormField>

 <FormField>
 <FormItem>
 <FormLabel>Status *</FormLabel>
 <FormControl>
 <Select {...register('status')}>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 <option value="exceeded">Exceeded</option>
 </Select>
 </FormControl>
 <FormMessage>{errors.status?.message}</FormMessage>
 </FormItem>
 </FormField>
 </CardContent>
 </Card>

 {/* Additional Information */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Calendar className="h-5 w-5" />
 Budget Period & Project
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-md">
 <FormField>
 <FormItem>
 <FormLabel>Period *</FormLabel>
 <FormControl>
 <Select {...register('period')}>
 <option value="monthly">Monthly</option>
 <option value="quarterly">Quarterly</option>
 <option value="yearly">Yearly</option>
 </Select>
 </FormControl>
 <FormMessage>{errors.period?.message}</FormMessage>
 </FormItem>
 </FormField>

 <FormField>
 <FormItem>
 <FormLabel>Fiscal Year *</FormLabel>
 <FormControl>
 <Select {...register('fiscal_year', { valueAsNumber: true })}>
 {Array.from({ length: 11 }, (_, i) => {
 const year = 2020 + i;
 return <option key={year} value={year}>{year}</option>;
 })}
 </Select>
 </FormControl>
 <FormMessage>{errors.fiscal_year?.message}</FormMessage>
 </FormItem>
 </FormField>

 <FormField>
 <FormItem>
 <FormLabel className="flex items-center gap-xs">
 <Building className="h-4 w-4" />
 Project
 </FormLabel>
 <FormControl>
 <Select {...register('project_id')}>
 <option value="">Select a project (optional)</option>
 {/* This would be populated with actual projects */}
 <option value="project-1">Website Redesign</option>
 <option value="project-2">Mobile App Development</option>
 </Select>
 </FormControl>
 <FormMessage>{errors.project_id?.message}</FormMessage>
 </FormItem>
 </FormField>
 </CardContent>
 </Card>
 </div>

 {/* Notes */}
 <Card>
 <CardHeader>
 <CardTitle>Additional Notes</CardTitle>
 </CardHeader>
 <CardContent>
 <FormField>
 <FormItem>
 <FormControl>
 <Textarea
 {...register('notes')}
 placeholder="Any additional notes or details..."
 rows={3}
 />
 </FormControl>
 <FormMessage>{errors.notes?.message}</FormMessage>
 </FormItem>
 </FormField>
 </CardContent>
 </Card>

 {/* Actions */}
 <div className="flex items-center justify-end gap-md pt-lg border-t">
 <Button type="button" variant="outline" onClick={handleClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={isLoading}>
 {isLoading ? 'Updating...' : 'Update Budget'}
 </Button>
 </div>
 </form>
 </Drawer>
 );
}
