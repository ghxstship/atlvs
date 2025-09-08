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

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().default('USD'),
  sku: z.string().optional(),
  supplier: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active')
});

type CreateProductFormData = z.infer<typeof createProductSchema>;

interface CreateProductClientProps {
  orgId: string;
  onProductCreated?: () => void;
}

export default function CreateProductClient({ orgId, onProductCreated }: CreateProductClientProps) {
  const t = useTranslations('procurement');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createBrowserClient();

  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: 0,
      currency: 'USD',
      sku: '',
      supplier: '',
      status: 'active'
    }
  });

  const onSubmit = async (data: CreateProductFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const productData = {
        ...data,
        organization_id: orgId,
        price: Number(data.price)
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'product',
        resource_id: data.name,
        details: `Created product: ${data.name}`
      });

      // Reset form and close drawer
      form.reset();
      setOpen(false);
      onProductCreated?.();

      // PostHog telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('product_created', {
          organization_id: orgId,
          product_name: data.name,
          category: data.category,
          price: data.price,
          currency: data.currency,
          status: data.status
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
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
        form="create-product-form"
        disabled={isSubmitting}
        className="flex items-center gap-2"
      >
        {isSubmitting ? (
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isSubmitting ? 'Creating...' : 'Create Product'}
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
        Add Product
      </Button>
      
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add New Product"
        footer={drawerFooter}
        width="lg"
      >
        <form id="create-product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name *</label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter product name"
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
                placeholder="Enter product description"
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
                  <option value="audio">Audio Equipment</option>
                  <option value="lighting">Lighting</option>
                  <option value="staging">Staging</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price *</label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={form.formState.errors.price ? 'border-red-500' : ''}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                )}
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
                <Input
                  id="sku"
                  {...form.register('sku')}
                  placeholder="Enter SKU"
                />
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
