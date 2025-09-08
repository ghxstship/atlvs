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
  travel_type: z.enum(['business', 'personal', 'training', 'conference', 'relocation']),
  destination: z.string().min(2, 'Destination is required'),
  purpose: z.string().min(2, 'Purpose is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  accommodation: z.string().optional(),
  transportation: z.string().optional(),
  visa_required: z.boolean().default(false),
  visa_status: z.enum(['not_required', 'pending', 'approved', 'denied']).optional(),
  total_expense: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function CreateTravelRecordClient({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      travel_type: 'business',
      destination: '',
      purpose: '',
      start_date: '',
      end_date: '',
      accommodation: '',
      transportation: '',
      visa_required: false,
      visa_status: 'not_required',
      total_expense: undefined,
      currency: 'USD',
      notes: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      // Create mock travel record data structure
      const travelRecordData = {
        id: crypto.randomUUID(),
        user_id: userId,
        organization_id: orgId,
        travel_type: values.travel_type,
        destination: values.destination,
        purpose: values.purpose,
        start_date: values.start_date,
        end_date: values.end_date,
        accommodation: values.accommodation || null,
        transportation: values.transportation || null,
        visa_required: values.visa_required,
        visa_status: values.visa_status || 'not_required',
        total_expense: values.total_expense || null,
        currency: values.currency,
        notes: values.notes || null,
        created_at: new Date().toISOString(),
      };

      // Log activity
      await sb.from('user_profile_activity').insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'travel_record_added',
        description: `Added ${values.travel_type} travel to ${values.destination}`,
        metadata: { 
          travel_type: values.travel_type, 
          destination: values.destination,
          purpose: values.purpose 
        }
      });

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('profile.travel.created', { 
          organization_id: orgId, 
          user_id: userId,
          travel_type: values.travel_type
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
        variant="primary" 
        size="sm" 
        onClick={() => setOpen(true)} 
        aria-label="Add Travel Record" 
        title="Add Travel Record"
      >
        <Plus className="mr-1 h-4 w-4" /> Add Travel Record
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Add Travel Record" 
        description={submitting ? 'Saving…' : undefined} 
        width="lg"
      >
        {error ? <div role="alert" className="mb-2 text-sm text-red-600">{error}</div> : null}
        <form 
          className="space-y-3" 
          onSubmit={(e) => { e.preventDefault(); onSubmit(form.getValues()); }} 
          aria-live="polite"
        >
          <div className="grid gap-1">
            <label htmlFor="travel_type" className="text-sm font-medium">Travel Type *</label>
            <select 
              id="travel_type" 
              className="rounded border px-2 py-1" 
              value={form.getValues('travel_type') || 'business'} 
              onChange={(e) => form.setValue('travel_type', e.target.value as any, { shouldDirty: true })}
            >
              <option value="business">Business</option>
              <option value="personal">Personal</option>
              <option value="training">Training</option>
              <option value="conference">Conference</option>
              <option value="relocation">Relocation</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label htmlFor="destination" className="text-sm font-medium">Destination *</label>
            <input 
              id="destination" 
              className="rounded border px-2 py-1" 
              value={form.getValues('destination') || ''} 
              onChange={(e) => form.setValue('destination', e.target.value, { shouldDirty: true })} 
              placeholder="City, Country"
              aria-invalid={!!form.formState.errors.destination} 
            />
            {form.formState.errors.destination ? 
              <div className="text-xs text-red-600">{String(form.formState.errors.destination.message)}</div> : null}
          </div>

          <div className="grid gap-1">
            <label htmlFor="purpose" className="text-sm font-medium">Purpose *</label>
            <input 
              id="purpose" 
              className="rounded border px-2 py-1" 
              value={form.getValues('purpose') || ''} 
              onChange={(e) => form.setValue('purpose', e.target.value, { shouldDirty: true })} 
              placeholder="Brief description of travel purpose"
              aria-invalid={!!form.formState.errors.purpose} 
            />
            {form.formState.errors.purpose ? 
              <div className="text-xs text-red-600">{String(form.formState.errors.purpose.message)}</div> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label htmlFor="start_date" className="text-sm font-medium">Start Date *</label>
              <input 
                id="start_date" 
                type="date" 
                className="rounded border px-2 py-1" 
                value={form.getValues('start_date') || ''} 
                onChange={(e) => form.setValue('start_date', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.start_date} 
              />
              {form.formState.errors.start_date ? 
                <div className="text-xs text-red-600">{String(form.formState.errors.start_date.message)}</div> : null}
            </div>

            <div className="grid gap-1">
              <label htmlFor="end_date" className="text-sm font-medium">End Date *</label>
              <input 
                id="end_date" 
                type="date" 
                className="rounded border px-2 py-1" 
                value={form.getValues('end_date') || ''} 
                onChange={(e) => form.setValue('end_date', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.end_date} 
              />
              {form.formState.errors.end_date ? 
                <div className="text-xs text-red-600">{String(form.formState.errors.end_date.message)}</div> : null}
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="accommodation" className="text-sm font-medium">Accommodation</label>
            <input 
              id="accommodation" 
              className="rounded border px-2 py-1" 
              value={form.getValues('accommodation') || ''} 
              onChange={(e) => form.setValue('accommodation', e.target.value, { shouldDirty: true })} 
              placeholder="Hotel name, address, or other accommodation details"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="transportation" className="text-sm font-medium">Transportation</label>
            <input 
              id="transportation" 
              className="rounded border px-2 py-1" 
              value={form.getValues('transportation') || ''} 
              onChange={(e) => form.setValue('transportation', e.target.value, { shouldDirty: true })} 
              placeholder="Flight, train, car rental, etc."
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              id="visa_required" 
              type="checkbox" 
              checked={form.getValues('visa_required')} 
              onChange={(e) => {
                form.setValue('visa_required', e.target.checked, { shouldDirty: true });
                if (!e.target.checked) {
                  form.setValue('visa_status', 'not_required', { shouldDirty: true });
                }
              }} 
            />
            <label htmlFor="visa_required" className="text-sm font-medium">Visa required for this travel</label>
          </div>

          {form.getValues('visa_required') && (
            <div className="grid gap-1">
              <label htmlFor="visa_status" className="text-sm font-medium">Visa Status</label>
              <select 
                id="visa_status" 
                className="rounded border px-2 py-1" 
                value={form.getValues('visa_status') || 'pending'} 
                onChange={(e) => form.setValue('visa_status', e.target.value as any, { shouldDirty: true })}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label htmlFor="total_expense" className="text-sm font-medium">Total Expense</label>
              <input 
                id="total_expense" 
                type="number" 
                step="0.01" 
                min="0" 
                className="rounded border px-2 py-1" 
                value={form.getValues('total_expense') || ''} 
                onChange={(e) => form.setValue('total_expense', e.target.value ? Number(e.target.value) : undefined, { shouldDirty: true })} 
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="currency" className="text-sm font-medium">Currency</label>
              <select 
                id="currency" 
                className="rounded border px-2 py-1" 
                value={form.getValues('currency') || 'USD'} 
                onChange={(e) => form.setValue('currency', e.target.value, { shouldDirty: true })}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <textarea 
              id="notes" 
              className="rounded border px-2 py-1 min-h-[80px]" 
              value={form.getValues('notes') || ''} 
              onChange={(e) => form.setValue('notes', e.target.value, { shouldDirty: true })} 
              placeholder="Additional notes about this travel..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting || !form.formState.isDirty}>
              Create
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
