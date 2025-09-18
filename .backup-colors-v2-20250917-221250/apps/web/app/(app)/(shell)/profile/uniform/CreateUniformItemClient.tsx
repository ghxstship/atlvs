'use client';

import { useMemo, useState } from 'react';
import { Drawer, Button } from '@ghxstship/ui';
import { Plus } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  item_type: z.enum(['shirt', 'pants', 'jacket', 'hat', 'shoes', 'safety_gear', 'accessories', 'equipment']),
  item_name: z.string().min(2, 'Item name is required'),
  size: z.string().optional(),
  color: z.string().optional(),
  condition: z.enum(['new', 'good', 'fair', 'poor', 'needs_replacement']),
  purchase_date: z.string().optional(),
  purchase_price: z.number().min(0).optional(),
  supplier: z.string().optional(),
  care_instructions: z.string().optional(),
  replacement_due: z.string().optional(),
  is_required: z.boolean().default(true),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function CreateUniformItemClient({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      item_type: 'shirt',
      item_name: '',
      size: '',
      color: '',
      condition: 'new',
      purchase_date: '',
      purchase_price: undefined,
      supplier: '',
      care_instructions: '',
      replacement_due: '',
      is_required: true,
      notes: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      // Create mock uniform item data structure
      const uniformItemData = {
        id: crypto.randomUUID(),
        user_id: userId,
        organization_id: orgId,
        item_type: values.item_type,
        item_name: values.item_name,
        size: values.size || null,
        color: values.color || null,
        condition: values.condition,
        purchase_date: values.purchase_date || null,
        purchase_price: values.purchase_price || null,
        supplier: values.supplier || null,
        care_instructions: values.care_instructions || null,
        replacement_due: values.replacement_due || null,
        is_required: values.is_required,
        notes: values.notes || null,
        created_at: new Date().toISOString(),
      };

      // Log activity
      await sb.from('user_profile_activity').insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'uniform_item_added',
        description: `Added ${values.item_type}: ${values.item_name}`,
        metadata: { 
          item_type: values.item_type, 
          item_name: values.item_name,
          condition: values.condition 
        }
      });

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('profile.uniform.created', { 
          organization_id: orgId, 
          user_id: userId,
          item_type: values.item_type
        });
      }

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button 
        variant="default" 
        
        onClick={() => setOpen(true)} 
        aria-label="Add Uniform Item" 
        title="Add Uniform Item"
      >
        <Plus className="mr-xs h-4 w-4" /> Add Uniform Item
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Add Uniform Item" 
        description={submitting ? 'Saving…' : undefined} 
       
      >
        {error ? <div role="alert" className="mb-sm text-body-sm color-destructive">{error}</div> : null}
        <form 
          className="stack-sm" 
          onSubmit={(e) => { e.preventDefault(); onSubmit(form.getValues()); }} 
          aria-live="polite"
        >
          <div className="grid gap-xs">
            <label htmlFor="item_type" className="text-body-sm form-label">Item Type *</label>
            <select 
              id="item_type" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('item_type') || 'shirt'} 
              onChange={(e) => form.setValue('item_type', e.target.value as any, { shouldDirty: true })}
            >
              <option value="shirt">Shirt</option>
              <option value="pants">Pants</option>
              <option value="jacket">Jacket</option>
              <option value="hat">Hat</option>
              <option value="shoes">Shoes</option>
              <option value="safety_gear">Safety Gear</option>
              <option value="accessories">Accessories</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="item_name" className="text-body-sm form-label">Item Name *</label>
            <input 
              id="item_name" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('item_name') || ''} 
              onChange={(e) => form.setValue('item_name', e.target.value, { shouldDirty: true })} 
              placeholder="e.g. Navy Blue Polo Shirt, Safety Helmet"
              aria-invalid={!!form.formState.errors.item_name} 
            />
            {form.formState.errors.item_name ? <div className="text-body-sm color-destructive">{String(form.formState.errors.item_name.message)}</div> : null}
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="grid gap-xs">
              <label htmlFor="size" className="text-body-sm form-label">Size</label>
              <input 
                id="size" 
                className="rounded border px-sm py-xs" 
                value={form.getValues('size') || ''} 
                onChange={(e) => form.setValue('size', e.target.value, { shouldDirty: true })} 
                placeholder="S, M, L, XL, 32, 10.5, etc."
              />
            </div>

            <div className="grid gap-xs">
              <label htmlFor="color" className="text-body-sm form-label">Color</label>
              <input 
                id="color" 
                className="rounded border px-sm py-xs" 
                value={form.getValues('color') || ''} 
                onChange={(e) => form.setValue('color', e.target.value, { shouldDirty: true })} 
                placeholder="Navy, Black, White, etc."
              />
            </div>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="condition" className="text-body-sm form-label">Condition *</label>
            <select 
              id="condition" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('condition') || 'new'} 
              onChange={(e) => form.setValue('condition', e.target.value as any, { shouldDirty: true })}
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="needs_replacement">Needs Replacement</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="grid gap-xs">
              <label htmlFor="purchase_date" className="text-body-sm form-label">Purchase Date</label>
              <input 
                id="purchase_date" 
                type="date" 
                className="rounded border px-sm py-xs" 
                value={form.getValues('purchase_date') || ''} 
                onChange={(e) => form.setValue('purchase_date', e.target.value, { shouldDirty: true })} 
              />
            </div>

            <div className="grid gap-xs">
              <label htmlFor="purchase_price" className="text-body-sm form-label">Purchase Price ($)</label>
              <input 
                id="purchase_price" 
                type="number" 
                step="0.01" 
                min="0" 
                className="rounded border px-sm py-xs" 
                value={form.getValues('purchase_price') || ''} 
                onChange={(e) => form.setValue('purchase_price', e.target.value ? Number(e.target.value) : undefined, { shouldDirty: true })} 
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="supplier" className="text-body-sm form-label">Supplier/Brand</label>
            <input 
              id="supplier" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('supplier') || ''} 
              onChange={(e) => form.setValue('supplier', e.target.value, { shouldDirty: true })} 
              placeholder="Company or brand name"
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="care_instructions" className="text-body-sm form-label">Care Instructions</label>
            <textarea 
              id="care_instructions" 
              className="rounded border px-sm py-xs min-h-[60px]" 
              value={form.getValues('care_instructions') || ''} 
              onChange={(e) => form.setValue('care_instructions', e.target.value, { shouldDirty: true })} 
              placeholder="Washing, maintenance, or storage instructions..."
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="replacement_due" className="text-body-sm form-label">Replacement Due Date</label>
            <input 
              id="replacement_due" 
              type="date" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('replacement_due') || ''} 
              onChange={(e) => form.setValue('replacement_due', e.target.value, { shouldDirty: true })} 
            />
          </div>

          <div className="flex items-center gap-sm">
            <input 
              id="is_required" 
              type="checkbox" 
              checked={form.getValues('is_required')} 
              onChange={(e) => form.setValue('is_required', e.target.checked, { shouldDirty: true })} 
            />
            <label htmlFor="is_required" className="text-body-sm form-label">This is a required uniform item</label>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="notes" className="text-body-sm form-label">Notes</label>
            <textarea 
              id="notes" 
              className="rounded border px-sm py-xs min-h-[60px]" 
              value={form.getValues('notes') || ''} 
              onChange={(e) => form.setValue('notes', e.target.value, { shouldDirty: true })} 
              placeholder="Additional notes about this item..."
            />
          </div>

          <div className="flex items-center justify-end gap-sm pt-sm border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={submitting || !form.formState.isDirty}>
              Create
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
