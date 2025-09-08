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
  record_type: z.enum(['medical', 'vaccination', 'allergy', 'medication', 'condition', 'emergency']),
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  provider: z.string().optional(),
  date_recorded: z.string().optional(),
  expiry_date: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['active', 'inactive', 'resolved']).default('active'),
  document_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function CreateHealthRecordClient({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      record_type: 'medical',
      title: '',
      description: '',
      provider: '',
      date_recorded: new Date().toISOString().split('T')[0],
      expiry_date: '',
      severity: undefined,
      status: 'active',
      document_url: '',
      notes: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      // Create mock health record data structure
      const healthRecordData = {
        id: crypto.randomUUID(),
        user_id: userId,
        organization_id: orgId,
        record_type: values.record_type,
        title: values.title,
        description: values.description || null,
        provider: values.provider || null,
        date_recorded: values.date_recorded || new Date().toISOString().split('T')[0],
        expiry_date: values.expiry_date || null,
        severity: values.severity || null,
        status: values.status,
        document_url: values.document_url || null,
        notes: values.notes || null,
        created_at: new Date().toISOString(),
      };

      // Log activity
      await sb.from('user_profile_activity').insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'health_record_added',
        description: `Added ${values.record_type} record: ${values.title}`,
        metadata: { record_type: values.record_type, title: values.title }
      });

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('profile.health.created', { 
          organization_id: orgId, 
          user_id: userId,
          record_type: values.record_type
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
        aria-label="Add Health Record" 
        title="Add Health Record"
      >
        <Plus className="mr-1 h-4 w-4" /> Add Health Record
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Add Health Record" 
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
            <label htmlFor="record_type" className="text-sm font-medium">Record Type *</label>
            <select 
              id="record_type" 
              className="rounded border px-2 py-1" 
              value={form.getValues('record_type') || 'medical'} 
              onChange={(e) => form.setValue('record_type', e.target.value as any, { shouldDirty: true })}
            >
              <option value="medical">Medical</option>
              <option value="vaccination">Vaccination</option>
              <option value="allergy">Allergy</option>
              <option value="medication">Medication</option>
              <option value="condition">Condition</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label htmlFor="title" className="text-sm font-medium">Title *</label>
            <input 
              id="title" 
              className="rounded border px-2 py-1" 
              value={form.getValues('title') || ''} 
              onChange={(e) => form.setValue('title', e.target.value, { shouldDirty: true })} 
              aria-invalid={!!form.formState.errors.title} 
            />
            {form.formState.errors.title ? 
              <div className="text-xs text-red-600">{String(form.formState.errors.title.message)}</div> : null}
          </div>

          <div className="grid gap-1">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea 
              id="description" 
              className="rounded border px-2 py-1 min-h-[60px]" 
              value={form.getValues('description') || ''} 
              onChange={(e) => form.setValue('description', e.target.value, { shouldDirty: true })} 
              placeholder="Additional details about this health record..."
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="provider" className="text-sm font-medium">Healthcare Provider</label>
            <input 
              id="provider" 
              className="rounded border px-2 py-1" 
              value={form.getValues('provider') || ''} 
              onChange={(e) => form.setValue('provider', e.target.value, { shouldDirty: true })} 
              placeholder="Doctor, clinic, or hospital name"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="date_recorded" className="text-sm font-medium">Date Recorded</label>
            <input 
              id="date_recorded" 
              type="date" 
              className="rounded border px-2 py-1" 
              value={form.getValues('date_recorded') || ''} 
              onChange={(e) => form.setValue('date_recorded', e.target.value, { shouldDirty: true })} 
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="expiry_date" className="text-sm font-medium">Expiry Date</label>
            <input 
              id="expiry_date" 
              type="date" 
              className="rounded border px-2 py-1" 
              value={form.getValues('expiry_date') || ''} 
              onChange={(e) => form.setValue('expiry_date', e.target.value, { shouldDirty: true })} 
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="severity" className="text-sm font-medium">Severity</label>
            <select 
              id="severity" 
              className="rounded border px-2 py-1" 
              value={form.getValues('severity') || ''} 
              onChange={(e) => form.setValue('severity', e.target.value as any || undefined, { shouldDirty: true })}
            >
              <option value="">Select severity...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select 
              id="status" 
              className="rounded border px-2 py-1" 
              value={form.getValues('status') || 'active'} 
              onChange={(e) => form.setValue('status', e.target.value as any, { shouldDirty: true })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label htmlFor="document_url" className="text-sm font-medium">Document URL</label>
            <input 
              id="document_url" 
              type="url" 
              className="rounded border px-2 py-1" 
              value={form.getValues('document_url') || ''} 
              onChange={(e) => form.setValue('document_url', e.target.value, { shouldDirty: true })} 
              placeholder="https://example.com/document.pdf"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <textarea 
              id="notes" 
              className="rounded border px-2 py-1 min-h-[60px]" 
              value={form.getValues('notes') || ''} 
              onChange={(e) => form.setValue('notes', e.target.value, { shouldDirty: true })} 
              placeholder="Additional notes or instructions..."
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
