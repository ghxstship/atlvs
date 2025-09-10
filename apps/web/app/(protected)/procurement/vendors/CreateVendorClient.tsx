'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { Building2, Plus, Save, X } from 'lucide-react';
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
        className="flex items-center gap-2"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        Add Vendor
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add New Vendor"
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="vendor-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Vendor'}
            </Button>
          </div>
        }
      >
        <form id="vendor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Vendor Information</h3>
              <p className="text-sm text-foreground/70">
                Add a new vendor to your procurement system
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Vendor Name *
              </label>
              <Input
                {...register('name')}
                placeholder="Enter vendor name"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Person
              </label>
              <Input
                {...register('contact_person')}
                placeholder="Primary contact name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="vendor@example.com"
                error={errors.email?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone
              </label>
              <Input
                {...register('phone')}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Website
              </label>
              <Input
                {...register('website')}
                placeholder="https://vendor.com"
                error={errors.website?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tax ID
              </label>
              <Input
                {...register('tax_id')}
                placeholder="Tax identification number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Terms
              </label>
              <Input
                {...register('payment_terms')}
                placeholder="Net 30, COD, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rating (1-5)
              </label>
              <select
                {...register('rating', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
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
              <label className="block text-sm font-medium mb-2">
                Address
              </label>
              <Textarea
                {...register('address')}
                placeholder="Full business address"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Brief description of vendor services"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
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
