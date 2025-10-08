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
  notes: z.string().optional()
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
      notes: ''
    },
    mode: 'onChange'
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
        created_at: new Date().toISOString()
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
    } catch (e) {
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
        aria-label="Add Health Record" 
        title="Add Health Record"
      >
        <Plus className="mr-xs h-icon-xs w-icon-xs" /> Add Health Record
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Add Health Record" 
        description={submitting ? 'Saving…' : undefined} 
       
      >
        {error ? <div role="alert" className="mb-sm text-body-sm color-destructive">{error}</div> : null}
        <form 
          className="stack-sm" 
          onSubmit={(e: any) => { e.preventDefault(); onSubmit(form.getValues()); }} 
          aria-live="polite"
        >
          <div className="grid gap-xs">
            <label htmlFor="record_type" className="text-body-sm form-label">Record Type *</label>
            <select 
              id="record_type" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('record_type') || 'medical'} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('record_type', e.target.value as any, { shouldDirty: true })}
            >
              <option value="medical">Medical</option>
              <option value="vaccination">Vaccination</option>
              <option value="allergy">Allergy</option>
              <option value="medication">Medication</option>
              <option value="condition">Condition</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="title" className="text-body-sm form-label">Title *</label>
            <input 
              id="title" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('title') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('title', e.target.value, { shouldDirty: true })} 
              aria-invalid={!!form.formState.errors.title} 
            />
            {form.formState.errors.title ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.title.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="description" className="text-body-sm form-label">Description</label>
            <textarea 
              id="description" 
              className="rounded border  px-md py-xs min-h-toolbar" 
              value={form.getValues('description') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('description', e.target.value, { shouldDirty: true })} 
              placeholder="Additional details about this health record..."
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="provider" className="text-body-sm form-label">Healthcare Provider</label>
            <input 
              id="provider" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('provider') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('provider', e.target.value, { shouldDirty: true })} 
              placeholder="Doctor, clinic, or hospital name"
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="date_recorded" className="text-body-sm form-label">Date Recorded</label>
            <input 
              id="date_recorded" 
              type="date" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('date_recorded') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('date_recorded', e.target.value, { shouldDirty: true })} 
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="expiry_date" className="text-body-sm form-label">Expiry Date</label>
            <input 
              id="expiry_date" 
              type="date" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('expiry_date') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('expiry_date', e.target.value, { shouldDirty: true })} 
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="severity" className="text-body-sm form-label">Severity</label>
            <select 
              id="severity" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('severity') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('severity', e.target.value as any || undefined, { shouldDirty: true })}
            >
              <option value="">Select severity...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="status" className="text-body-sm form-label">Status</label>
            <select 
              id="status" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('status') || 'active'} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('status', e.target.value as any, { shouldDirty: true })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="document_url" className="text-body-sm form-label">Document URL</label>
            <input 
              id="document_url" 
              type="url" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('document_url') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('document_url', e.target.value, { shouldDirty: true })} 
              placeholder="https://example.com/document.pdf"
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="notes" className="text-body-sm form-label">Notes</label>
            <textarea 
              id="notes" 
              className="rounded border  px-md py-xs min-h-toolbar" 
              value={form.getValues('notes') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('notes', e.target.value, { shouldDirty: true })} 
              placeholder="Additional notes or instructions..."
            />
          </div>

          <div className="flex items-center justify-end gap-sm pt-sm border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="default" disabled={submitting || !form.formState.isDirty}>
              Create
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
