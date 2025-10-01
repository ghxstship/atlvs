'use client';


import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Building, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  description: z.string().optional(),
  contact_person: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  tax_id: z.string().optional(),
  payment_terms: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface CreateVendorClientProps {
  orgId: string;
  onVendorCreated?: () => void;
}

export default function CreateVendorClient({ orgId, onVendorCreated }: CreateVendorClientProps) {
  const t = useTranslations('procurement');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    mode: 'onChange',
    defaultValues: {
      status: 'active',
    }
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/v1/procurement/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': orgId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vendor');
      }

      const result = await response.json();

      // Track vendor creation
      posthog?.capture('procurement_vendor_created', {
        vendor_id: result.data.id,
        vendor_name: data.name,
        organization_id: orgId,
        status: data.status,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'vendor',
        resource_id: result.data.id,
        details: {
          vendor_name: data.name,
          status: data.status,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onVendorCreated?.();

    } catch (error) {
      console.error('Error creating vendor:', error);
      posthog?.capture('procurement_vendor_creation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        organization_id: orgId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-sm"
       
      >
        <Plus className="h-icon-xs w-icon-xs" />
        Add Vendor
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add New Vendor"
        width="md"
        footer={
          <div className="flex justify-end gap-sm">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-icon-xs w-icon-xs mr-sm" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="vendor-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-icon-xs w-icon-xs mr-sm" />
              {isSubmitting ? 'Creating...' : 'Create Vendor'}
            </Button>
          </div>
        }
      >
        <form id="vendor-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="flex items-center gap-sm mb-lg">
            <div className="p-sm bg-accent/10 rounded-lg">
              <Building className="h-icon-sm w-icon-sm color-accent" />
            </div>
            <div>
              <h3 className="form-label">Vendor Information</h3>
              <p className="text-body-sm color-foreground/70">
                Add a new vendor to your procurement system
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="col-span-2">
              <label className="block text-body-sm form-label mb-sm">
                Vendor Name *
              </label>
              <UnifiedInput                 {...register('name')}
                placeholder="Enter vendor name"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Contact Person
              </label>
              <UnifiedInput                 {...register('contact_person')}
                placeholder="Primary contact name"
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full  px-md py-sm border border-input rounded-md bg-background"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Email
              </label>
              <UnifiedInput                 {...register('email')}
                type="email"
                placeholder="vendor@example.com"
                error={errors.email?.message}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Phone
              </label>
              <UnifiedInput                 {...register('phone')}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Website
              </label>
              <UnifiedInput                 {...register('website')}
                placeholder="https://vendor.com"
                error={errors.website?.message}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Tax ID
              </label>
              <UnifiedInput                 {...register('tax_id')}
                placeholder="Tax identification number"
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Payment Terms
              </label>
              <UnifiedInput                 {...register('payment_terms')}
                placeholder="Net 30, COD, etc."
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Rating (1-5)
              </label>
              <select
                {...register('rating', { valueAsNumber: true })}
                className="w-full  px-md py-sm border border-input rounded-md bg-background"
              >
                <option value="">Select rating</option>
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Fair</option>
                <option value={3}>3 - Good</option>
                <option value={4}>4 - Very Good</option>
                <option value={5}>5 - Excellent</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-body-sm form-label mb-sm">
                Address
              </label>
              <Textarea
                {...register('address')}
                placeholder="Full business address"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-body-sm form-label mb-sm">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Brief description of vendor services"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-body-sm form-label mb-sm">
                Notes
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Internal notes about this vendor"
                rows={3}
              />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
}
