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
    <div className="flex justify-end gap-sm pt-md border-t">
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
        className="flex items-center gap-sm"
      >
        {isSubmitting ? (
          <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
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
        className="flex items-center gap-sm"
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
       
      >
        <form id="create-product-form" onSubmit={form.handleSubmit(onSubmit)} className="stack-lg p-lg">
          <div className="stack-md">
            <div className="stack-sm">
              <label htmlFor="name" className="block text-body-sm form-label color-foreground">Product Name *</label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter product name"
                className={form.formState.errors.name ? 'border-destructive' : ''}
              />
              {form.formState.errors.name && (
                <p className="text-body-sm color-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="stack-sm">
              <label htmlFor="description" className="block text-body-sm form-label color-foreground">Description</label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div className="stack-sm">
                <label htmlFor="category" className="block text-body-sm form-label color-foreground">Category</label>
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

              <div className="stack-sm">
                <label htmlFor="price" className="block text-body-sm form-label color-foreground">Price *</label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={form.formState.errors.price ? 'border-destructive' : ''}
                />
                {form.formState.errors.price && (
                  <p className="text-body-sm color-destructive">{form.formState.errors.price.message}</p>
                )}
              </div>
            </div>

            <div className="stack-sm">
              <label htmlFor="currency" className="block text-body-sm form-label color-foreground">Currency</label>
              <Select
                {...form.register('currency')}
                defaultValue="USD"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div className="stack-sm">
                <label htmlFor="sku" className="block text-body-sm form-label color-foreground">SKU</label>
                <Input
                  id="sku"
                  {...form.register('sku')}
                  placeholder="Enter SKU"
                />
              </div>

              <div className="stack-sm">
                <label htmlFor="supplier" className="block text-body-sm form-label color-foreground">Supplier</label>
                <Input
                  id="supplier"
                  {...form.register('supplier')}
                  placeholder="Enter supplier name"
                />
              </div>
            </div>

            <div className="stack-sm">
              <label htmlFor="status" className="block text-body-sm form-label color-foreground">Status</label>
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
