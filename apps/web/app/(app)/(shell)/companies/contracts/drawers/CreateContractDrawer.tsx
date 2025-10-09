'use client';
import { Activity, Award, Button, Calendar, Clock, FileText, Input, Label, Play, Plus, Search, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Settings, Switch, Textarea, Trash2, TrendingUp, User, useToastContext } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
  Button,
  Drawer,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch
} from "@ghxstship/ui";

const contractSchema = z.object({
 company_id: z.string().min(1, 'Company is required'),
 title: z.string().min(1, 'Title is required'),
 description: z.string().optional(),
 type: z.enum(['msa', 'sow', 'nda', 'service_agreement', 'purchase_order', 'other']),
 value: z.number().min(0).optional(),
 currency: z.string().default('USD'),
 start_date: z.string().optional(),
 end_date: z.string().optional(),
 renewal_date: z.string().optional(),
 auto_renew: z.boolean().default(false),
 renewal_notice_days: z.number().min(1).max(365).optional(),
 document_url: z.string().url().optional().or(z.literal('')),
 notes: z.string().optional()
});

type ContractFormData = z.infer<typeof contractSchema>;

interface CreateContractDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (data: ContractFormData) => Promise<void>;
 companies: Array<{ id: string; name: string }>;
}

export default function CreateContractDrawer({
 isOpen,
 onClose,
 onSubmit,
 companies
}: CreateContractDrawerProps) {
 const { showToast } = useToastContext();
 const [isSubmitting, setIsSubmitting] = useState(false);

 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 watch,
 setValue
 } = useForm<ContractFormData>({
 resolver: zodResolver(contractSchema),
 defaultValues: {
 currency: 'USD',
 auto_renew: false
 }
 });

 const watchAutoRenew = watch('auto_renew');

 const handleFormSubmit = async (data: ContractFormData) => {
 try {
 setIsSubmitting(true);
 await onSubmit(data);
 reset();
 onClose();
 showToast({
 title: 'Success',
 description: 'Contract created successfully',
 variant: 'default'
 });
 } catch (error) {
 console.error('Error creating contract:', error);
 showToast({
 title: 'Error',
 description: error instanceof Error ? error.message : 'Failed to create contract',
 variant: 'destructive'
 });
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleClose = () => {
 reset();
 onClose();
 };

 return (
 <Drawer
 isOpen={isOpen}
 onClose={handleClose}
 title="Create Contract"
 description="Add a new contract for a company"
 size="lg"
 >
 <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-md">
 {/* Company Selection */}
 <div className="space-y-sm">
 <Label htmlFor="company_id">Company *</Label>
 <Select onChange={(e) => setValue('company_id', value)}>
 <SelectTrigger>
 <SelectValue placeholder="Select a company" />
 </SelectTrigger>
 <SelectContent>
 {companies.map((company) => (
 <SelectItem key={company.id} value={company.id}>
 {company.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.company_id && (
 <p className="text-sm text-destructive">{errors.company_id.message}</p>
 )}
 </div>

 {/* Title */}
 <div className="space-y-sm">
 <Label htmlFor="title">Contract Title *</Label>
 <Input
 
 {...register('title')}
 placeholder="Enter contract title"
 />
 {errors.title && (
 <p className="text-sm text-destructive">{errors.title.message}</p>
 )}
 </div>

 {/* Description */}
 <div className="space-y-sm">
 <Label htmlFor="description">Description</Label>
 <textarea
 
 {...register('description')}
 placeholder="Enter contract description"
 rows={3}
 />
 </div>

 {/* Type */}
 <div className="space-y-sm">
 <Label htmlFor="type">Contract Type *</Label>
 <Select onChange={(e) => setValue('type', e.target.value as unknown)}>
 <SelectTrigger>
 <SelectValue placeholder="Select contract type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="msa">Master Service Agreement</SelectItem>
 <SelectItem value="sow">Statement of Work</SelectItem>
 <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
 <SelectItem value="service_agreement">Service Agreement</SelectItem>
 <SelectItem value="purchase_order">Purchase Order</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>
 {errors.type && (
 <p className="text-sm text-destructive">{errors.type.message}</p>
 )}
 </div>

 {/* Value and Currency */}
 <div className="grid grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="value">Contract Value</Label>
 <Input
 
 type="number"
 step="0.01"
 {...register('value', { valueAsNumber: true })}
 placeholder="0.00"
 />
 {errors.value && (
 <p className="text-sm text-destructive">{errors.value.message}</p>
 )}
 </div>

 <div className="space-y-sm">
 <Label htmlFor="currency">Currency</Label>
 <Select onChange={(e) => setValue('currency', value)}>
 <SelectTrigger>
 <SelectValue placeholder="USD" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="USD">USD</SelectItem>
 <SelectItem value="EUR">EUR</SelectItem>
 <SelectItem value="GBP">GBP</SelectItem>
 <SelectItem value="CAD">CAD</SelectItem>
 <SelectItem value="AUD">AUD</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 {/* Dates */}
 <div className="grid grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="start_date">Start Date</Label>
 <Input
 
 type="date"
 {...register('start_date')}
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="end_date">End Date</Label>
 <Input
 
 type="date"
 {...register('end_date')}
 />
 </div>
 </div>

 {/* Auto Renewal */}
 <div className="flex items-center space-x-sm">
 <Switch
 
 checked={watchAutoRenew}
 onCheckedChange={(checked) => setValue('auto_renew', checked)}
 />
 <Label htmlFor="auto_renew">Enable auto-renewal</Label>
 </div>

 {/* Renewal Settings */}
 {watchAutoRenew && (
 <div className="grid grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="renewal_date">Renewal Date</Label>
 <Input
 
 type="date"
 {...register('renewal_date')}
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="renewal_notice_days">Notice Days</Label>
 <Input
 
 type="number"
 {...register('renewal_notice_days', { valueAsNumber: true })}
 placeholder="30"
 />
 {errors.renewal_notice_days && (
 <p className="text-sm text-destructive">{errors.renewal_notice_days.message}</p>
 )}
 </div>
 </div>
 )}

 {/* Document URL */}
 <div className="space-y-sm">
 <Label htmlFor="document_url">Document URL</Label>
 <Input
 
 type="url"
 {...register('document_url')}
 placeholder="https://example.com/contract.pdf"
 />
 {errors.document_url && (
 <p className="text-sm text-destructive">{errors.document_url.message}</p>
 )}
 </div>

 {/* Notes */}
 <div className="space-y-sm">
 <Label htmlFor="notes">Notes</Label>
 <textarea
 
 {...register('notes')}
 placeholder="Additional notes about this contract"
 rows={3}
 />
 </div>

 {/* Actions */}
 <div className="flex justify-end gap-sm pt-md">
 <Button
 type="button"
 variant="outline"
 onClick={handleClose}
 disabled={isSubmitting}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting ? 'Creating...' : 'Create Contract'}
 </Button>
 </div>
 </form>
 </Drawer>
 );
}
