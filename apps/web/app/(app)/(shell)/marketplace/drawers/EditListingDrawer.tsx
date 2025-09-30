"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 AppDrawer,
 Button,
 Checkbox,
 Input,
 Textarea,
 Select,
 SelectTrigger,
 SelectContent,
 SelectItem,
 SelectValue,
} from '@ghxstship/ui';
import type { MarketplaceListing, UpsertListingDto } from '../types';
import { Check, Edit, Tag } from 'lucide-react';

const editSchema = z.object({
 id: z.string(),
 title: z.string().min(3, 'Title is required'),
 description: z.string().min(10, 'Description is required'),
 type: z.enum(['offer', 'request', 'exchange']),
 category: z.enum(['equipment', 'services', 'talent', 'locations', 'materials', 'other']),
 subcategory: z.string().optional(),
 status: z.enum(['draft', 'active', 'archived']).default('active'),
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

type ListingEditValues = z.infer<typeof editSchema>;

interface EditListingDrawerProps {
 open: boolean;
 listing: MarketplaceListing | null;
 loading: boolean;
 onClose: () => void;
 onSubmit: (dto: UpsertListingDto) => Promise<void> | void;
}

export function EditListingDrawer({ open, listing, loading, onClose, onSubmit }: EditListingDrawerProps) {
 const {
 register,
 control,
 reset,
 setValue,
 handleSubmit,
 formState: { errors },
 } = useForm<ListingEditValues>({
 resolver: zodResolver(editSchema),
 defaultValues: {
 id: '',
 title: '',
 description: '',
 type: 'offer',
 category: 'services',
 status: 'active',
 currency: 'USD',
 negotiable: true,
 flexible: true,
 preferredContactMethod: 'platform',
 },
 });

 useEffect(() => {
 if (listing && open) {
 reset({
 id: listing.id,
 title: listing.title,
 description: listing.description,
 type: listing.type,
 category: listing.category,
 subcategory: listing.subcategory ?? undefined,
 status: listing.status ?? 'active',
 amount: listing.pricing?.amount ?? null,
 currency: listing.pricing?.currency ?? 'USD',
 negotiable: listing.pricing?.negotiable ?? true,
 paymentTerms: listing.pricing?.paymentTerms ?? '',
 city: listing.location?.city ?? '',
 state: listing.location?.state ?? '',
 country: listing.location?.country ?? '',
 isRemote: listing.location?.isRemote ?? false,
 startDate: listing.availability?.startDate ?? '',
 endDate: listing.availability?.endDate ?? '',
 flexible: listing.availability?.flexible ?? true,
 immediateAvailable: listing.availability?.immediateAvailable ?? false,
 requirements: listing.requirements?.join('\n') ?? '',
 tags: listing.tags?.join(', ') ?? '',
 featured: listing.featured,
 expiresAt: listing.expires_at ?? '',
 contactEmail: listing.contactInfo?.email ?? '',
 contactPhone: listing.contactInfo?.phone ?? '',
 preferredContactMethod: listing.contactInfo?.preferredMethod ?? 'platform',
 });
 }
 }, [listing, open, reset]);

 useEffect(() => {
 if (!open) {
 reset();
 }
 }, [open, reset]);

 const submitHandler = (values: ListingEditValues) => {
 const dto: UpsertListingDto = {
 id: values.id,
 title: values.title,
 description: values.description,
 type: values.type,
 category: values.category,
 subcategory: values.subcategory || undefined,
 status: values.status,
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
 mode="edit"
 title={listing ? `Edit ${listing.title}` : 'Edit Listing'}
 loading={loading}
 tabs={[
 {
 key: 'details',
 label: 'Listing Details',
 content: (
 <form onSubmit={handleSubmit(submitHandler)} className="stack-lg">
 <input type="hidden" {...register('id')} />
 <div className="stack-sm">
 <label className="form-label">Title</label>
 <Input {...register('title')} placeholder="Listing title" />
 {errors.title && <p className="text-body-xs color-destructive">{errors.title.message}</p>}
 </div>

 <div className="stack-sm">
 <label className="form-label">Description</label>
 <Textarea {...register('description')} rows={4} placeholder="Describe the listing" />
 {errors.description && (
 <p className="text-body-xs color-destructive">{errors.description.message}</p>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <div className="stack-sm">
 <label className="form-label">Type</label>
 <Select
 value={control._formValues.type}
 onValueChange={(value) => setValue('type', value as ListingEditValues['type'])}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="offer">Offer</SelectItem>
 <SelectItem value="request">Request</SelectItem>
 <SelectItem value="exchange">Exchange</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="stack-sm">
 <label className="form-label">Category</label>
 <Select
 value={control._formValues.category}
 onValueChange={(value) => setValue('category', value as ListingEditValues['category'])}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select category" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="equipment">Equipment</SelectItem>
 <SelectItem value="services">Services</SelectItem>
 <SelectItem value="talent">Talent</SelectItem>
 <SelectItem value="locations">Locations</SelectItem>
 <SelectItem value="materials">Materials</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
 <div className="stack-sm">
 <label className="form-label">Status</label>
 <Select
 value={control._formValues.status}
 onValueChange={(value) => setValue('status', value as ListingEditValues['status'])}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="draft">Draft</SelectItem>
 <SelectItem value="active">Active</SelectItem>
 <SelectItem value="archived">Archived</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="stack-sm">
 <label className="form-label">Amount</label>
 <Input {...register('amount')} type="number" min="0" step="0.01" placeholder="Negotiable" />
 </div>
 <div className="stack-sm">
 <label className="form-label">Currency</label>
 <Input {...register('currency')} placeholder="USD" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
 <div className="stack-sm">
 <label className="form-label">City</label>
 <Input {...register('city')} placeholder="City" />
 </div>
 <div className="stack-sm">
 <label className="form-label">State / Region</label>
 <Input {...register('state')} placeholder="State" />
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
 <Input {...register('tags')} placeholder="Comma separated tags" />
 </div>
 </div>

 <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <legend className="sr-only">Additional options</legend>
 <label className="flex items-center gap-sm">
 <Checkbox {...register('negotiable')} />
 <span className="text-body-sm">Pricing negotiable</span>
 </label>
 <label className="flex items-center gap-sm">
 <Checkbox {...register('isRemote')} />
 <span className="text-body-sm">Remote friendly</span>
 </label>
 <label className="flex items-center gap-sm">
 <Checkbox {...register('flexible')} />
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
 <label className="form-label">Requirements</label>
 <Textarea {...register('requirements')} rows={3} placeholder="One per line" />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <div className="stack-sm">
 <label className="form-label">Preferred Contact Method</label>
 <Select
 value={control._formValues.preferredContactMethod}
 onValueChange={(value) =>
 setValue('preferredContactMethod', value as ListingEditValues['preferredContactMethod'])
 }
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="email">Email</SelectItem>
 <SelectItem value="phone">Phone</SelectItem>
 <SelectItem value="platform">Platform Messaging</SelectItem>
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

 <div className="flex items-center justify-between gap-md">
 <Button variant="outline" type="button" onClick={onClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 Save Changes
 </Button>
 </div>
 </form>
 ),
 },
 ]}
 />
 );
}
