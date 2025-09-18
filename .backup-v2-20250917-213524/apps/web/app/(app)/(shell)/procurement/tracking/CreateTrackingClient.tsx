'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { Truck, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const trackingUpdateSchema = z.object({
  order_id: z.string().min(1, 'Order selection is required'),
  tracking_number: z.string().min(1, 'Tracking number is required'),
  shipping_carrier: z.string().min(1, 'Shipping carrier is required'),
  status: z.enum(['ordered', 'shipped', 'delivered']).default('shipped'),
  expected_delivery: z.string().optional(),
  actual_delivery: z.string().optional(),
  shipping_notes: z.string().optional(),
  delivery_address: z.string().optional(),
});

type TrackingUpdateFormData = z.infer<typeof trackingUpdateSchema>;

interface Order {
  id: string;
  order_number: string;
  vendor_name: string;
  status: string;
}

interface CreateTrackingClientProps {
  orgId: string;
  onTrackingCreated?: () => void;
}

export default function CreateTrackingClient({ orgId, onTrackingCreated }: CreateTrackingClientProps) {
  const t = useTranslations('procurement');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<TrackingUpdateFormData>({
    resolver: zodResolver(trackingUpdateSchema),
    mode: 'onChange',
    defaultValues: {
      status: 'shipped',
    }
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    if (isOpen) {
      loadAvailableOrders();
    }
  }, [isOpen, orgId]);

  const loadAvailableOrders = async () => {
    try {
      const { data: orders } = await sb
        .from('procurement_orders')
        .select('id, order_number, vendor_name, status')
        .eq('organization_id', orgId)
        .in('status', ['approved', 'ordered', 'shipped'])
        .order('created_at', { ascending: false });

      setAvailableOrders(orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const onSubmit = async (data: TrackingUpdateFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update the order with tracking information
      const { error } = await sb
        .from('procurement_orders')
        .update({
          tracking_number: data.tracking_number,
          shipping_carrier: data.shipping_carrier,
          status: data.status,
          expected_delivery: data.expected_delivery || null,
          actual_delivery: data.actual_delivery || null,
          shipping_notes: data.shipping_notes || null,
          delivery_address: data.delivery_address || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.order_id)
        .eq('organization_id', orgId);

      if (error) throw error;

      // Track tracking update
      posthog?.capture('procurement_tracking_updated', {
        order_id: data.order_id,
        tracking_number: data.tracking_number,
        carrier: data.shipping_carrier,
        status: data.status,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'update',
        resource_type: 'tracking',
        resource_id: data.order_id,
        details: {
          tracking_number: data.tracking_number,
          carrier: data.shipping_carrier,
          status: data.status,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onTrackingCreated?.();

    } catch (error) {
      console.error('Error updating tracking:', error);
      posthog?.capture('procurement_tracking_update_failed', {
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
        <Plus className="h-4 w-4" />
        Update Tracking
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Update Order Tracking"
       
        footer={
          <div className="flex justify-end gap-sm">
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
              form="tracking-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Tracking'}
            </Button>
          </div>
        }
      >
        <form id="tracking-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="flex items-center gap-sm mb-6">
            <div className="p-sm bg-primary/10 rounded-lg">
              <Truck className="h-5 w-5 color-primary" />
            </div>
            <div>
              <h3 className="form-label">Tracking Information</h3>
              <p className="text-body-sm color-foreground/70">
                Add or update shipping and delivery details
              </p>
            </div>
          </div>

          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-2">
                Select Order *
              </label>
              <select
                {...register('order_id')}
                className="w-full px-sm py-sm border border-input rounded-md bg-background"
              >
                <option value="">Choose an order...</option>
                {availableOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.order_number} - {order.vendor_name} ({order.status})
                  </option>
                ))}
              </select>
              {errors.order_id && (
                <p className="text-body-sm color-destructive mt-1">{errors.order_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-2">
                  Tracking Number *
                </label>
                <Input
                  {...register('tracking_number')}
                  placeholder="1Z999AA1234567890"
                  error={errors.tracking_number?.message}
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-2">
                  Shipping Carrier *
                </label>
                <Input
                  {...register('shipping_carrier')}
                  placeholder="UPS, FedEx, DHL, etc."
                  error={errors.shipping_carrier?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-2">
                Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-sm py-sm border border-input rounded-md bg-background"
              >
                <option value="ordered">Ordered</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-2">
                  Expected Delivery
                </label>
                <Input
                  {...register('expected_delivery')}
                  type="date"
                />
              </div>

              {selectedStatus === 'delivered' && (
                <div>
                  <label className="block text-body-sm form-label mb-2">
                    Actual Delivery
                  </label>
                  <Input
                    {...register('actual_delivery')}
                    type="date"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-body-sm form-label mb-2">
                Delivery Address
              </label>
              <Textarea
                {...register('delivery_address')}
                placeholder="Full delivery address"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-2">
                Shipping Notes
              </label>
              <Textarea
                {...register('shipping_notes')}
                placeholder="Special delivery instructions, delays, etc."
                rows={3}
              />
            </div>
          </div>

          <div className="bg-primary/10 p-md rounded-lg">
            <h4 className="form-label color-primary-foreground mb-2">Tracking Guidelines</h4>
            <ul className="text-body-sm color-primary/80 stack-xs">
              <li>• Enter accurate tracking numbers for shipment monitoring</li>
              <li>• Update status as packages move through delivery process</li>
              <li>• Include delivery address for accurate routing</li>
              <li>• Add notes for special instructions or delays</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
