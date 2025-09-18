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
import { Plus, Save, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

const createOrderSchema = z.object({
  order_number: z.string().min(1, 'Order number is required'),
  vendor_name: z.string().min(1, 'Vendor name is required'),
  description: z.string().min(1, 'Description is required'),
  total_amount: z.number().min(0, 'Total amount must be non-negative'),
  currency: z.string().default('USD'),
  status: z.enum(['draft', 'pending', 'approved', 'ordered', 'shipped', 'delivered', 'cancelled']).default('draft'),
  order_date: z.string(),
  expected_delivery: z.string().optional(),
  project_id: z.string().optional(),
  notes: z.string().optional()
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface CreateOrderClientProps {
  orgId: string;
  onOrderCreated?: () => void;
}

export default function CreateOrderClient({ orgId, onOrderCreated }: CreateOrderClientProps) {
  const t = useTranslations('procurement');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createBrowserClient();

  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      order_number: '',
      vendor_name: '',
      description: '',
      total_amount: 0,
      currency: 'USD',
      status: 'draft',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: '',
      project_id: '',
      notes: ''
    }
  });

  const onSubmit = async (data: CreateOrderFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const orderData = {
        ...data,
        organization_id: orgId,
        created_by: user.id,
        total_amount: Number(data.total_amount),
        expected_delivery: data.expected_delivery || null,
        project_id: data.project_id || null,
        notes: data.notes || null
      };

      const { error } = await supabase
        .from('procurement_orders')
        .insert(orderData);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'procurement_order',
        resource_id: data.order_number,
        details: `Created procurement order: ${data.order_number}`
      });

      // Reset form and close drawer
      form.reset();
      setOpen(false);
      onOrderCreated?.();

      // PostHog telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('procurement_order_created', {
          organization_id: orgId,
          order_number: data.order_number,
          vendor_name: data.vendor_name,
          total_amount: data.total_amount,
          currency: data.currency,
          status: data.status
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Order
      </Button>

      <Drawer
        open={open}
        onClose={handleClose}
        title="Create New Purchase Order"
        width="xl"
        footer={
          <div className="flex gap-sm">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        }
      >
        <form className="stack-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="stack-sm">
              <label htmlFor="order_number" className="text-body-sm form-label">Order Number *</label>
              <Input
                id="order_number"
                {...form.register('order_number')}
                placeholder="PO-2024-001"
              />
              {form.formState.errors.order_number && (
                <p className="text-body-sm color-destructive">{form.formState.errors.order_number.message}</p>
              )}
            </div>

            <div className="stack-sm">
              <label htmlFor="vendor_name" className="text-body-sm form-label">Vendor Name *</label>
              <Input
                id="vendor_name"
                {...form.register('vendor_name')}
                placeholder="Vendor company name"
              />
              {form.formState.errors.vendor_name && (
                <p className="text-body-sm color-destructive">{form.formState.errors.vendor_name.message}</p>
              )}
            </div>

            <div className="stack-sm md:col-span-2">
              <label htmlFor="description" className="text-body-sm form-label">Description *</label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Order description and details"
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-body-sm color-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="stack-sm">
              <label htmlFor="total_amount" className="text-body-sm form-label">Total Amount *</label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                {...form.register('total_amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.total_amount && (
                <p className="text-body-sm color-destructive">{form.formState.errors.total_amount.message}</p>
              )}
            </div>

            <div className="stack-sm">
              <label htmlFor="currency" className="text-body-sm form-label">Currency</label>
              <Select 
                {...form.register('currency')}
                defaultValue="USD"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>

            <div className="stack-sm">
              <label htmlFor="status" className="text-body-sm form-label">Status</label>
              <Select 
                {...form.register('status')}
                defaultValue="draft"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="ordered">Ordered</option>
              </Select>
            </div>

            <div className="stack-sm">
              <label htmlFor="order_date" className="text-body-sm form-label">Order Date</label>
              <Input
                id="order_date"
                type="date"
                {...form.register('order_date')}
              />
            </div>

            <div className="stack-sm">
              <label htmlFor="expected_delivery" className="text-body-sm form-label">Expected Delivery</label>
              <Input
                id="expected_delivery"
                type="date"
                {...form.register('expected_delivery')}
              />
            </div>

            <div className="stack-sm">
              <label htmlFor="project_id" className="text-body-sm form-label">Project ID</label>
              <Input
                id="project_id"
                {...form.register('project_id')}
                placeholder="Optional project reference"
              />
            </div>

            <div className="stack-sm md:col-span-2">
              <label htmlFor="notes" className="text-body-sm form-label">Notes</label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Additional notes or requirements"
                rows={2}
              />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
}
