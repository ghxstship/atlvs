'use client';

import { Receipt, Upload, X, Plus } from "lucide-react";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Drawer,
 Button,
 UnifiedInput,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Textarea,
 Label,
 Badge,
 Card
} from '@ghxstship/ui';
import { ExpensesService } from '../lib/expenses-service';
import type { ExpenseDrawerProps, CreateExpenseData } from '../types';

const createExpenseSchema = z.object({
 title: z.string().min(1, 'Title is required'),
 description: z.string().optional(),
 amount: z.number().min(0.01, 'Amount must be greater than 0'),
 currency: z.string().default('USD'),
 category: z.string().min(1, 'Category is required'),
 receipt_url: z.string().url().optional().or(z.literal('')),
 due_date: z.string().optional(),
 project_id: z.string().optional(),
 vendor: z.string().optional(),
 tags: z.array(z.string()).optional(),
 notes: z.string().optional(),
});

type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

const EXPENSE_CATEGORIES = [
 'Travel',
 'Meals & Entertainment',
 'Office Supplies',
 'Software & Subscriptions',
 'Marketing',
 'Professional Services',
 'Equipment',
 'Utilities',
 'Insurance',
 'Training & Education',
 'Other'
];

const CURRENCIES = [
 { value: 'USD', label: 'USD ($)' },
 { value: 'EUR', label: 'EUR (€)' },
 { value: 'GBP', label: 'GBP (£)' },
 { value: 'CAD', label: 'CAD (C$)' },
 { value: 'AUD', label: 'AUD (A$)' },
];

export default function CreateExpenseDrawer({ 
 expense, 
 mode, 
 onSave, 
 onCancel, 
 user, 
 orgId 
}: ExpenseDrawerProps) {
 const [loading, setLoading] = useState(false);
 const [tagInput, setTagInput] = useState('');
 const expensesService = new ExpensesService();

 const {
 register,
 handleSubmit,
 formState: { errors },
 setValue,
 watch,
 reset
 } = useForm<CreateExpenseFormData>({
 resolver: zodResolver(createExpenseSchema),
 defaultValues: expense ? {
 title: expense.title,
 description: expense.description || '',
 amount: expense.amount,
 currency: expense.currency,
 category: expense.category,
 receipt_url: expense.receipt_url || '',
 due_date: expense.due_date || '',
 project_id: expense.project_id || '',
 vendor: expense.vendor || '',
 tags: expense.tags || [],
 notes: expense.notes || '',
 } : {
 currency: 'USD',
 tags: [],
 }
 });

 const watchedTags = watch('tags') || [];

 const onSubmit = async (data: CreateExpenseFormData) => {
 try {
 setLoading(true);
 
 const expenseData: CreateExpenseData = {
 ...data,
 amount: Number(data.amount),
 tags: watchedTags,
 };

 let result;
 if (mode === 'edit' && expense) {
 result = await expensesService.updateExpense(orgId, expense.id, expenseData);
 } else {
 result = await expensesService.createExpense(orgId, expenseData, user.id);
 }

 onSave?.(result);
 reset();
 } catch (error) {
 console.error('Error saving expense:', error);
 } finally {
 setLoading(false);
 }
 };

 const addTag = () => {
 if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
 const newTags = [...watchedTags, tagInput.trim()];
 setValue('tags', newTags);
 setTagInput('');
 }
 };

 const removeTag = (tagToRemove: string) => {
 const newTags = watchedTags.filter(tag => tag !== tagToRemove);
 setValue('tags', newTags);
 };

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 addTag();
 }
 };

 return (
 <Drawer
 open={true}
 onClose={onCancel}
 title={mode === 'edit' ? 'Edit Expense' : mode === 'view' ? 'Expense Details' : 'Create New Expense'}
 description={mode === 'view' ? 'View expense details' : 'Fill in the expense information'}
 size="lg"
 >
 <form onSubmit={handleSubmit(onSubmit)} className="stack-lg">
 {/* Basic Information */}
 <Card className="p-lg">
 <h3 className="text-heading-4 color-foreground mb-md">Basic Information</h3>
 
 <div className="stack-md">
 <div>
 <Label htmlFor="title">Expense Title *</Label>
 <UnifiedInput
 
 {...register('title')}
 placeholder="Enter expense title"
 disabled={mode === 'view'}
 />
 </div>

 <div>
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 {...register('description')}
 placeholder="Enter expense description"
 disabled={mode === 'view'}
 rows={3}
 />
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="amount">Amount *</Label>
 <UnifiedInput
 
 type="number"
 step="0.01"
 {...register('amount', { valueAsNumber: true })}
 placeholder="0.00"
 disabled={mode === 'view'}
 />
 </div>

 <div>
 <Label htmlFor="currency">Currency</Label>
 <Select
 value={watch('currency')}
 onValueChange={(value) => setValue('currency', value)}
 disabled={mode === 'view'}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select currency" />
 </SelectTrigger>
 <SelectContent>
 {CURRENCIES.map((currency) => (
 <SelectItem key={currency.value} value={currency.value}>
 {currency.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 <div>
 <Label htmlFor="category">Category *</Label>
 <Select
 value={watch('category')}
 onValueChange={(value) => setValue('category', value)}
 disabled={mode === 'view'}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select category" />
 </SelectTrigger>
 <SelectContent>
 {EXPENSE_CATEGORIES.map((category) => (
 <SelectItem key={category} value={category}>
 {category}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.category && (
 <p className="text-body-sm color-destructive mt-xs">{errors.category.message}</p>
 )}
 </div>
 </div>
 </Card>

 {/* Additional Details */}
 <Card className="p-lg">
 <h3 className="text-heading-4 color-foreground mb-md">Additional Details</h3>
 
 <div className="stack-md">
 <div>
 <Label htmlFor="vendor">Vendor/Supplier</Label>
 <UnifiedInput
 
 {...register('vendor')}
 placeholder="Enter vendor name"
 disabled={mode === 'view'}
 />
 </div>

 <div>
 <Label htmlFor="due_date">Due Date</Label>
 <UnifiedInput
 
 type="date"
 {...register('due_date')}
 disabled={mode === 'view'}
 />
 </div>

 <div>
 <Label htmlFor="receipt_url">Receipt URL</Label>
 <UnifiedInput
 
 type="url"
 {...register('receipt_url')}
 placeholder="https://example.com/receipt.pdf"
 disabled={mode === 'view'}
 />
 </div>

 <div>
 <Label htmlFor="project_id">Project ID</Label>
 <UnifiedInput
 
 {...register('project_id')}
 placeholder="Enter project ID (optional)"
 disabled={mode === 'view'}
 />
 </div>

 {/* Tags */}
 <div>
 <Label>Tags</Label>
 {mode !== 'view' && (
 <div className="flex gap-sm mb-sm">
 <UnifiedInput
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 onKeyPress={handleKeyPress}
 placeholder="Add a tag"
 className="flex-1"
 />
 <Button type="button" onClick={addTag} variant="outline" size="sm">
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 )}
 
 <div className="flex flex-wrap gap-xs">
 {watchedTags.map((tag) => (
 <Badge key={tag} variant="secondary" className="flex items-center gap-xs">
 {tag}
 {mode !== 'view' && (
 <button
 type="button"
 onClick={() => removeTag(tag)}
 className="ml-xs hover:color-destructive"
 >
 <X className="h-3 w-3" />
 </button>
 )}
 </Badge>
 ))}
 </div>
 </div>

 <div>
 <Label htmlFor="notes">Notes</Label>
 <Textarea
 
 {...register('notes')}
 placeholder="Additional notes or comments"
 disabled={mode === 'view'}
 rows={4}
 />
 </div>
 </div>
 </Card>

 {/* Actions */}
 {mode !== 'view' && (
 <div className="flex justify-end gap-sm pt-md border-t">
 <Button type="button" variant="outline" onClick={onCancel}>
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 <Receipt className="h-4 w-4 mr-sm" />
 {loading ? 'Saving...' : mode === 'edit' ? 'Update Expense' : 'Create Expense'}
 </Button>
 </div>
 )}
 </form>
 </Drawer>
 );
}
