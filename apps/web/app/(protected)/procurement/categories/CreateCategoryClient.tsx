'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { Tag, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  type: z.enum(['product', 'service', 'both']).default('both'),
  parent_category_id: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  sort_order: z.number().min(0).optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CreateCategoryClientProps {
  orgId: string;
  onCategoryCreated?: () => void;
}

export default function CreateCategoryClient({ orgId, onCategoryCreated }: CreateCategoryClientProps) {
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
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: {
      type: 'both',
      status: 'active',
    }
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/v1/procurement/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': orgId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      const result = await response.json();

      // Track category creation
      posthog?.capture('procurement_category_created', {
        category_id: result.data.id,
        category_name: data.name,
        category_type: data.type,
        organization_id: orgId,
        status: data.status,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'category',
        resource_id: result.data.id,
        details: {
          category_name: data.name,
          category_type: data.type,
          status: data.status,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onCategoryCreated?.();

    } catch (error) {
      console.error('Error creating category:', error);
      posthog?.capture('procurement_category_creation_failed', {
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

  const colorOptions = [
    { value: '#ef4444', label: 'Red' },
    { value: '#f97316', label: 'Orange' },
    { value: '#eab308', label: 'Yellow' },
    { value: '#22c55e', label: 'Green' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#6b7280', label: 'Gray' },
  ];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        Add Category
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add New Category"
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
              form="category-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Category Information</h3>
              <p className="text-sm text-foreground/70">
                Create a new category for organizing products and services
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Category Name *
              </label>
              <Input
                {...register('name')}
                placeholder="Enter category name"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="both">Products & Services</option>
                <option value="product">Products Only</option>
                <option value="service">Services Only</option>
              </select>
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
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Color
              </label>
              <select
                {...register('color')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select color</option>
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Sort Order
              </label>
              <Input
                {...register('sort_order', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Category Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Categories help organize products and services for easier management</li>
              <li>• Choose descriptive names that clearly identify the category purpose</li>
              <li>• Use colors to visually distinguish categories in lists and reports</li>
              <li>• Sort order determines the display sequence (lower numbers appear first)</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
