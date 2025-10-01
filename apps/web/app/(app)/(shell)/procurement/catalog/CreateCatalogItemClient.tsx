'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { BookOpen, Plus, Save, X, Package, Wrench } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const catalogItemSchema = z.object({
  type: z.enum(['product', 'service']),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  rate: z.number().min(0, 'Rate must be positive').optional(),
  currency: z.string().default('USD'),
  unit: z.string().optional(),
  sku: z.string().optional(),
  supplier: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
  specifications: z.string().optional(),
  tags: z.string().optional(),
});

type CatalogItemFormData = z.infer<typeof catalogItemSchema>;

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface CreateCatalogItemClientProps {
  orgId: string;
  onItemCreated?: () => void;
}

export default function CreateCatalogItemClient({ orgId, onItemCreated }: CreateCatalogItemClientProps) {
  const t = useTranslations('procurement');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<CatalogItemFormData>({
    resolver: zodResolver(catalogItemSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'product',
      currency: 'USD',
      status: 'active',
    }
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadVendors();
    }
  }, [isOpen, orgId]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/v1/procurement/categories', {
        headers: { 'x-organization-id': orgId },
      });
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await fetch('/api/v1/procurement/vendors', {
        headers: { 'x-organization-id': orgId },
      });
      if (response.ok) {
        const result = await response.json();
        setVendors(result.data || []);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const onSubmit = async (data: CatalogItemFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare data based on type
      const itemData = {
        name: data.name,
        description: data.description,
        category: data.category,
        currency: data.currency,
        supplier: data.supplier,
        status: data.status,
        specifications: data.specifications,
        tags: data.tags,
      };

      let response;
      let endpoint;
      let trackingEvent;

      if (data.type === 'product') {
        endpoint = '/api/v1/procurement/products';
        trackingEvent = 'procurement_product_created';
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-organization-id': orgId,
          },
          body: JSON.stringify({
            ...itemData,
            price: data.price || 0,
            sku: data.sku,
          }),
        });
      } else {
        endpoint = '/api/v1/procurement/services';
        trackingEvent = 'procurement_service_created';
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-organization-id': orgId,
          },
          body: JSON.stringify({
            ...itemData,
            rate: data.rate || 0,
            unit: data.unit || 'hour',
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create ${data.type}`);
      }

      const result = await response.json();

      // Track item creation
      posthog?.capture(trackingEvent, {
        item_id: result.data.id,
        item_name: data.name,
        item_type: data.type,
        category: data.category,
        organization_id: orgId,
        status: data.status,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: data.type,
        resource_id: result.data.id,
        details: {
          item_name: data.name,
          item_type: data.type,
          category: data.category,
          status: data.status,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onItemCreated?.();

    } catch (error) {
      console.error('Error creating catalog item:', error);
      posthog?.capture('procurement_catalog_item_creation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        item_type: data.type,
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

  const filteredCategories = categories.filter(cat => 
    cat.type === 'both' || cat.type === selectedType
  );

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-sm"
       
      >
        <Plus className="h-icon-xs w-icon-xs" />
        Add Catalog Item
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Catalog Item"
        width="xl"
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
              form="catalog-item-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-icon-xs w-icon-xs mr-sm" />
              {isSubmitting ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        }
      >
        <form id="catalog-item-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="flex items-center gap-sm mb-lg">
            <div className="p-sm bg-success/10 rounded-lg">
              <BookOpen className="h-icon-sm w-icon-sm color-success" />
            </div>
            <div>
              <h3 className="form-label">Catalog Item Information</h3>
              <p className="text-body-sm color-foreground/70">
                Add a new product or service to your catalog
              </p>
            </div>
          </div>

          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-sm">
                Item Type *
              </label>
              <div className="flex gap-md">
                <label className="flex items-center gap-sm">
                  <input
                    type="radio"
                    {...register('type')}
                    value="product"
                    className="w-icon-xs h-icon-xs"
                  />
                  <Package className="h-icon-xs w-icon-xs" />
                  Product
                </label>
                <label className="flex items-center gap-sm">
                  <input
                    type="radio"
                    {...register('type')}
                    value="service"
                    className="w-icon-xs h-icon-xs"
                  />
                  <Wrench className="h-icon-xs w-icon-xs" />
                  Service
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div className="col-span-2">
                <label className="block text-body-sm form-label mb-sm">
                  Name *
                </label>
                <UnifiedInput                   {...register('name')}
                  placeholder={`Enter ${selectedType} name`}
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="">Select category</option>
                  {filteredCategories.map((category: any) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>

              {selectedType === 'product' ? (
                <>
                  <div>
                    <label className="block text-body-sm form-label mb-sm">
                      Price
                    </label>
                    <UnifiedInput                       {...register('price', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      error={errors.price?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm form-label mb-sm">
                      SKU
                    </label>
                    <UnifiedInput                       {...register('sku')}
                      placeholder="Product SKU"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-body-sm form-label mb-sm">
                      Rate
                    </label>
                    <UnifiedInput                       {...register('rate', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      error={errors.rate?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm form-label mb-sm">
                      Unit
                    </label>
                    <select
                      {...register('unit')}
                      className="w-full  px-md py-sm border border-input rounded-md bg-background"
                    >
                      <option value="hour">Hour</option>
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="project">Project</option>
                      <option value="fixed">Fixed Price</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Currency
                </label>
                <select
                  {...register('currency')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Supplier/Vendor
                </label>
                <select
                  {...register('supplier')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="">Select vendor</option>
                  {vendors.map((vendor: any) => (
                    <option key={vendor.id} value={vendor.name}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-body-sm form-label mb-sm">
                  Description
                </label>
                <Textarea
                  {...register('description')}
                  placeholder={`Brief description of this ${selectedType}`}
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-body-sm form-label mb-sm">
                  Specifications
                </label>
                <Textarea
                  {...register('specifications')}
                  placeholder="Technical specifications, requirements, or details"
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-body-sm form-label mb-sm">
                  Tags
                </label>
                <UnifiedInput                   {...register('tags')}
                  placeholder="Comma-separated tags for easier searching"
                />
              </div>
            </div>
          </div>

          <div className="bg-success/5 p-md rounded-lg">
            <h4 className="form-label color-success mb-sm">Catalog Guidelines</h4>
            <ul className="text-body-sm color-success/80 stack-xs">
              <li>• Choose descriptive names that clearly identify the item</li>
              <li>• Use categories to organize items for easier browsing</li>
              <li>• Include detailed specifications for technical requirements</li>
              <li>• Add relevant tags to improve search functionality</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
