'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Button, 
  Drawer,
  Input,
  Select,
  Textarea
} from '@ghxstship/ui';
import { Plus, Save, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';

const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  rate: z.number().min(0, 'Rate must be non-negative'),
  currency: z.string().default('USD'),
  unit: z.string().default('hour'),
  supplier: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active')
});

type CreateServiceFormData = z.infer<typeof createServiceSchema>;

interface CreateServiceClientProps {
  orgId: string;
  onServiceCreated?: () => void;
}

export default function CreateServiceClient({ orgId, onServiceCreated }: CreateServiceClientProps) {
  const t = useTranslations('procurement');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createBrowserClient();

  const form = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      rate: 0,
      currency: 'USD',
      unit: 'hour',
      supplier: '',
      status: 'active'
    }
  });

  const onSubmit = async (data: CreateServiceFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const serviceData = {
        ...data,
        organization_id: orgId,
        rate: Number(data.rate)
      };

      const { error } = await supabase
        .from('services')
        .insert(serviceData);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'service',
        resource_id: data.name,
        details: `Created service: ${data.name}`
      });

      // Reset form and close drawer
      form.reset();
      setOpen(false);
      onServiceCreated?.();

      // PostHog telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('service_created', {
          organization_id: orgId,
          service_name: data.name,
          category: data.category,
          rate: data.rate,
          currency: data.currency,
          unit: data.unit,
          status: data.status
        });
      }
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const drawerFooter = (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(false)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="create-service-form"
        disabled={isSubmitting}
        className="flex items-center gap-2"
      >
        {isSubmitting ? (
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isSubmitting ? 'Creating...' : 'Create Service'}
      </Button>
    </div>
  );

  return (
    <>
      <Button 
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add Service
      </Button>
      
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add New Service"
        footer={drawerFooter}
       
      >
        <form id="create-service-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Service Name *</label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter service name"
                className={form.formState.errors.name ? 'border-red-500' : ''}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Enter service description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <Select
                  {...form.register('category')}
                  defaultValue=""
                >
                  <option value="">Select category</option>
                  <option value="audio">Audio Services</option>
                  <option value="lighting">Lighting</option>
                  <option value="staging">Staging</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Rate *</label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  {...form.register('rate', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={form.formState.errors.rate ? 'border-red-500' : ''}
                />
                {form.formState.errors.rate && (
                  <p className="text-sm text-red-500">{form.formState.errors.rate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
              <Select
                {...form.register('unit')}
                defaultValue="hour"
              >
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="week">Per Week</option>
                <option value="month">Per Month</option>
                <option value="project">Per Project</option>
                <option value="fixed">Fixed Price</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                <Select
                  {...form.register('currency')}
                  defaultValue="USD"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier</label>
                <Input
                  id="supplier"
                  {...form.register('supplier')}
                  placeholder="Enter supplier name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <Select
                {...form.register('status')}
                defaultValue="active"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </Select>
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
}
