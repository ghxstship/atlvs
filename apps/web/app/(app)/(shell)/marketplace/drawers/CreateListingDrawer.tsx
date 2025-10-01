"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
 AppDrawer,
 Button,
 Checkbox,
 Input,
 Textarea,
 Select,
 SelectTrigger,
 SelectValue,
 SelectContent,
 SelectItem,
 Badge,
} from '@ghxstship/ui';
import type { UpsertListingDto } from '../types';
import { Check, Tag } from 'lucide-react';

const listingSchema = z.object({
 title: z.string().min(3, 'Title is required'),
 description: z.string().min(10, 'Description is required'),
 type: z.enum(['offer', 'request', 'exchange']),
 category: z.enum(['equipment', 'services', 'talent', 'locations', 'materials', 'other']),
 subcategory: z.string().optional(),
 amount: z
 .union([z.string(), z.number()])
 .transform((value) => (value === '' ? null : Number(value)))
 .refine((value) => value === null || (!Number.isNaN(value) && value >= 0), 'Invalid amount')
 .nullable(),
 currency: z.string().default('USD'),
 negotiable: z.boolean().default(true),
 paymentTerms: z.string().optional(),
 city: z.string().optional(),
 state: z.string().optional(),
 country: z.string().optional(),
 isRemote: z.boolean().default(false),
 startDate: z.string().optional(),
 endDate: z.string().optional(),
 flexible: z.boolean().default(true),
 immediateAvailable: z.boolean().default(false),
 requirements: z.string().optional(),
 tags: z.string().optional(),
 featured: z.boolean().default(false),
 expiresAt: z.string().optional(),
 contactEmail: z.string().email('Invalid email').optional(),
 contactPhone: z.string().optional(),
 preferredContactMethod: z.enum(['email', 'phone', 'platform']).default('platform'),
});

type ListingFormValues = z.infer<typeof listingSchema>;

const typeOptions: Array<{ label: string; value: UpsertListingDto['type'] }> = [
 { label: 'Offer', value: 'offer' },
 { label: 'Request', value: 'request' },
 { label: 'Exchange', value: 'exchange' },
];

const categoryOptions: Array<{ label: string; value: UpsertListingDto['category'] }> = [
 { label: 'Equipment', value: 'equipment' },
 { label: 'Services', value: 'services' },
 { label: 'Talent', value: 'talent' },
 { label: 'Locations', value: 'locations' },
 { label: 'Materials', value: 'materials' },
 { label: 'Other', value: 'other' },
];

const contactMethodOptions: Array<{ label: string; value: 'email' | 'phone' | 'platform' }> = [
 { label: 'Email', value: 'email' },
 { label: 'Phone', value: 'phone' },
 { label: 'Platform Messaging', value: 'platform' },
];

interface CreateListingDrawerProps {
 open: boolean;
 loading: boolean;
 onClose: () => void;
 onSubmit: (dto: UpsertListingDto) => Promise<void> | void;
}

function CreateListingDrawer({ open, loading, onClose, onSubmit }: CreateListingDrawerProps) {
 const {
 register,
 control,
 handleSubmit,
 reset,
 setValue,
 formState: { errors },
 } = useForm<ListingFormValues>({
 resolver: zodResolver(listingSchema),
 defaultValues: {
 title: '',
 description: '',
 type: 'offer',
 category: 'services',
 currency: 'USD',
 negotiable: true,
 flexible: true,
 tags: '',
 preferredContactMethod: 'platform',
 },
 });

 useEffect(() => {
 if (!open) {
 reset();
 }
 }, [open, reset]);

 const submitHandler = (values: ListingFormValues) => {
 const dto: UpsertListingDto = {
 title: values.title,
 description: values.description,
 type: values.type,
 category: values.category,
 subcategory: values.subcategory || undefined,
 status: 'active',
 amount: values.amount ?? null,
 currency: values.currency,
 negotiable: values.negotiable,
 paymentTerms: values.paymentTerms || undefined,
 city: values.city || undefined,
 state: values.state || undefined,
 country: values.country || undefined,
 isRemote: values.isRemote,
 startDate: values.startDate || undefined,
 endDate: values.endDate || undefined,
 flexible: values.flexible,
 immediateAvailable: values.immediateAvailable,
 requirements: values.requirements ? values.requirements.split('\n').map((line) => line.trim()).filter(Boolean) : undefined,
 tags: values.tags ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined,
 featured: values.featured,
 expiresAt: values.expiresAt || undefined,
 contactEmail: values.contactEmail || undefined,
 contactPhone: values.contactPhone || undefined,
 preferredContactMethod: values.preferredContactMethod,
 };

 void onSubmit(dto);
 };

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 title="Create Marketplace Listing"
 mode="create"
 loading={loading}
 tabs={[
 {
 key: 'details',
 label: 'Listing Details',
 content: (
 <form onSubmit={handleSubmit(submitHandler)} className="stack-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <div className="stack-sm">
 <label className="form-label">Title</label>
 <Input {...register('title')} placeholder="Give your listing a headline" />
 {errors.title && <p className="text-body-xs color-destructive">{errors.title.message}</p>}
 </div>

 <div className="stack-sm">
 <label className="form-label">Listing Type</label>
 <Select
 value={control._formValues.type}
 onValueChange={(value) => setValue('type', value as ListingFormValues['type'])}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select type" />
 </SelectTrigger>
 <SelectContent>
 {typeOptions.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="stack-sm md:col-span-2">
 <label className="form-label">Description</label>
 <Textarea
 {...register('description')}
 rows={4}
 placeholder="Describe the offer, requirements, and what makes it unique"
 />
 {errors.description && <p className="text-body-xs color-destructive">{errors.description.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <div className="stack-sm">
 <label className="form-label">Category</label>
 <Select
 value={control._formValues.category}
 onValueChange={(value) => setValue('category', value as ListingFormValues['category'])}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select category" />
 </SelectTrigger>
 <SelectContent>
 {categoryOptions.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="stack-sm">
 <label className="form-label">Subcategory</label>
 <Input {...register('subcategory')} placeholder="Optional subcategory" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
 <div className="stack-sm">
 <label className="form-label">Amount</label>
 <Input {...register('amount')} type="number" min="0" step="0.01" placeholder="e.g. 2500" />
 <p className="text-body-2xs color-muted">Leave blank for negotiable pricing.</p>
 </div>
 <div className="stack-sm">
 <label className="form-label">Currency</label>
 <Input {...register('currency')} placeholder="USD" />
 </div>
 <div className="stack-sm">
 <label className="form-label">Payment Terms</label>
 <Input {...register('paymentTerms')} placeholder="e.g. 50% upfront, net 30" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
 <div className="stack-sm">
 <label className="form-label">City</label>
 <Input {...register('city')} placeholder="City" />
 </div>
 <div className="stack-sm">
 <label className="form-label">State / Region</label>
 <Input {...register('state')} placeholder="State or region" />
 </div>
 <div className="stack-sm">
 <label className="form-label">Country</label>
 <Input {...register('country')} placeholder="Country" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <div className="stack-sm">
 <label className="form-label">Availability Window</label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <Input {...register('startDate')} type="date" />
 <Input {...register('endDate')} type="date" />
 </div>
 </div>
 <div className="stack-sm">
 <label className="form-label">Tags</label>
 <Input {...register('tags')} placeholder="Comma separated e.g. lighting, festival" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <div className="stack-sm">
 <label className="form-label">Preferred Contact Method</label>
 <Select
 value={control._formValues.preferredContactMethod}
 onValueChange={(value) => setValue('preferredContactMethod', value as ListingFormValues['preferredContactMethod'])}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select method" />
 </SelectTrigger>
 <SelectContent>
 {contactMethodOptions.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="stack-xs">
 <label className="form-label">Contact Email</label>
 <Input {...register('contactEmail')} placeholder="name@company.com" />
 {errors.contactEmail && (
 <p className="text-body-xs color-destructive">{errors.contactEmail.message}</p>
 )}
 </div>
 <div className="stack-xs">
 <label className="form-label">Contact Phone</label>
 <Input {...register('contactPhone')} placeholder="+1 415 555 1234" />
 </div>
 </div>
 </div>

 <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <legend className="sr-only">Options</legend>
 <label className="flex items-center gap-sm">
 <Checkbox {...register('negotiable')} defaultChecked />
 <span className="text-body-sm">Pricing negotiable</span>
 </label>
 <label className="flex items-center gap-sm">
 <Checkbox {...register('isRemote')} />
 <span className="text-body-sm">Remote friendly</span>
 </label>
 <label className="flex items-center gap-sm">
 <Checkbox {...register('flexible')} defaultChecked />
 <span className="text-body-sm">Flexible availability</span>
 </label>
 <label className="flex items-center gap-sm">
 <Checkbox {...register('immediateAvailable')} />
 <span className="text-body-sm">Immediate availability</span>
 </label>
 <label className="flex items-center gap-sm">
 <Checkbox {...register('featured')} />
 <span className="text-body-sm">Feature this listing</span>
 </label>
 </fieldset>

 <div className="stack-sm">
 <label className="form-label">Key Requirements</label>
 <Textarea
 {...register('requirements')}
 rows={3}
 placeholder="List top requirements (one per line)"
 />
 </div>

 <div className="flex items-center justify-between">
 <Badge variant="secondary">Live Supabase Data</Badge>
 <div className="flex items-center gap-sm">
 <Button variant="outline" type="button" onClick={onClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 Create Listing
 </Button>
 </div>
 </div>
 </form>
 ),
 },
 ]}
 />
);

export default CreateListingDrawer;
