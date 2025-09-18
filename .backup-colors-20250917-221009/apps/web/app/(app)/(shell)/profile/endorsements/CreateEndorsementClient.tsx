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
  endorser_name: z.string().min(2, 'Endorser name is required'),
  endorser_title: z.string().min(2, 'Endorser title is required'),
  endorser_company: z.string().min(2, 'Company is required'),
  relationship: z.string().min(2, 'Relationship is required'),
  skills_endorsed: z.string().min(2, 'Skills endorsed is required'),
  endorsement_text: z.string().min(10, 'Endorsement text is required'),
  rating: z.number().min(1).max(5),
  is_public: z.boolean().default(true),
  date_received: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function CreateEndorsementClient({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      endorser_name: '',
      endorser_title: '',
      endorser_company: '',
      relationship: '',
      skills_endorsed: '',
      endorsement_text: '',
      rating: 5,
      is_public: true,
      date_received: new Date().toISOString().split('T')[0],
    },
    mode: 'onChange',
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      // Create mock endorsement data structure
      const endorsementData = {
        id: crypto.randomUUID(),
        user_id: userId,
        organization_id: orgId,
        endorser_name: values.endorser_name,
        endorser_title: values.endorser_title,
        endorser_company: values.endorser_company,
        relationship: values.relationship,
        skills_endorsed: values.skills_endorsed.split(',').map(s => s.trim()),
        endorsement_text: values.endorsement_text,
        rating: values.rating,
        is_public: values.is_public,
        date_received: values.date_received || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };

      // Log activity
      await sb.from('user_profile_activity').insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'endorsement_added',
        description: `Added endorsement from ${values.endorser_name}`,
        metadata: { endorser: values.endorser_name, skills: values.skills_endorsed }
      });

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('profile.endorsement.created', { 
          organization_id: orgId, 
          user_id: userId,
          rating: values.rating
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
        
        onClick={() => setOpen(true)} 
        aria-label="Add Endorsement" 
        title="Add Endorsement"
      >
        <Plus className="mr-xs h-4 w-4" /> Add Endorsement
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Add Professional Endorsement" 
        description={submitting ? 'Saving…' : undefined} 
       
      >
        {error ? <div role="alert" className="mb-sm text-body-sm color-destructive">{error}</div> : null}
        <form 
          className="stack-sm" 
          onSubmit={(e) => { e.preventDefault(); onSubmit(form.getValues()); }} 
          aria-live="polite"
        >
          <div className="grid gap-xs">
            <label htmlFor="endorser_name" className="text-body-sm form-label">Endorser Name *</label>
            <input 
              id="endorser_name" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('endorser_name') || ''} 
              onChange={(e) => form.setValue('endorser_name', e.target.value, { shouldDirty: true })} 
              aria-invalid={!!form.formState.errors.endorser_name} 
            />
            {form.formState.errors.endorser_name ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.endorser_name.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="endorser_title" className="text-body-sm form-label">Endorser Title *</label>
            <input 
              id="endorser_title" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('endorser_title') || ''} 
              onChange={(e) => form.setValue('endorser_title', e.target.value, { shouldDirty: true })} 
              aria-invalid={!!form.formState.errors.endorser_title} 
            />
            {form.formState.errors.endorser_title ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.endorser_title.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="endorser_company" className="text-body-sm form-label">Company *</label>
            <input 
              id="endorser_company" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('endorser_company') || ''} 
              onChange={(e) => form.setValue('endorser_company', e.target.value, { shouldDirty: true })} 
              aria-invalid={!!form.formState.errors.endorser_company} 
            />
            {form.formState.errors.endorser_company ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.endorser_company.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="relationship" className="text-body-sm form-label">Relationship *</label>
            <select 
              id="relationship" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('relationship') || ''} 
              onChange={(e) => form.setValue('relationship', e.target.value, { shouldDirty: true })}
            >
              <option value="">Select relationship...</option>
              <option value="manager">Manager</option>
              <option value="colleague">Colleague</option>
              <option value="direct_report">Direct Report</option>
              <option value="client">Client</option>
              <option value="vendor">Vendor</option>
              <option value="mentor">Mentor</option>
              <option value="other">Other</option>
            </select>
            {form.formState.errors.relationship ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.relationship.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="skills_endorsed" className="text-body-sm form-label">Skills Endorsed *</label>
            <input 
              id="skills_endorsed" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('skills_endorsed') || ''} 
              onChange={(e) => form.setValue('skills_endorsed', e.target.value, { shouldDirty: true })} 
              placeholder="e.g. Leadership, Project Management, Communication"
              aria-invalid={!!form.formState.errors.skills_endorsed} 
            />
            {form.formState.errors.skills_endorsed ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.skills_endorsed.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="endorsement_text" className="text-body-sm form-label">Endorsement Text *</label>
            <textarea 
              id="endorsement_text" 
              className="rounded border px-sm py-xs min-h-[100px]" 
              value={form.getValues('endorsement_text') || ''} 
              onChange={(e) => form.setValue('endorsement_text', e.target.value, { shouldDirty: true })} 
              placeholder="The endorsement text..."
              aria-invalid={!!form.formState.errors.endorsement_text} 
            />
            {form.formState.errors.endorsement_text ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.endorsement_text.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="rating" className="text-body-sm form-label">Rating (1-5 stars) *</label>
            <select 
              id="rating" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('rating') || 5} 
              onChange={(e) => form.setValue('rating', Number(e.target.value), { shouldDirty: true })}
            >
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="date_received" className="text-body-sm form-label">Date Received</label>
            <input 
              id="date_received" 
              type="date" 
              className="rounded border px-sm py-xs" 
              value={form.getValues('date_received') || ''} 
              onChange={(e) => form.setValue('date_received', e.target.value, { shouldDirty: true })} 
            />
          </div>

          <div className="flex items-center gap-sm">
            <input 
              id="is_public" 
              type="checkbox" 
              checked={form.getValues('is_public')} 
              onChange={(e) => form.setValue('is_public', e.target.checked, { shouldDirty: true })} 
            />
            <label htmlFor="is_public" className="text-body-sm form-label">Make this endorsement public</label>
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
