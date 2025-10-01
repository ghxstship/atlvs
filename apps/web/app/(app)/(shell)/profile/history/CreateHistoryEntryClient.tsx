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
  entry_type: z.enum(['employment', 'education', 'project', 'achievement', 'certification']),
  title: z.string().min(2, 'Title is required'),
  organization: z.string().min(2, 'Organization is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  location: z.string().optional(),
  skills_gained: z.string().optional(),
  achievements: z.string().optional(),
  references: z.string().optional(),
  is_current: z.boolean().default(false),
});

type Values = z.infer<typeof schema>;

export default function CreateHistoryEntryClient({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      entry_type: 'employment',
      title: '',
      organization: '',
      description: '',
      start_date: '',
      end_date: '',
      location: '',
      skills_gained: '',
      achievements: '',
      references: '',
      is_current: false,
    },
    mode: 'onChange',
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      // Create mock history entry data structure
      const historyEntryData = {
        id: crypto.randomUUID(),
        user_id: userId,
        organization_id: orgId,
        entry_type: values.entry_type,
        title: values.title,
        organization: values.organization,
        description: values.description || null,
        start_date: values.start_date,
        end_date: values.is_current ? null : values.end_date || null,
        location: values.location || null,
        skills_gained: values.skills_gained ? values.skills_gained.split(',').map(s => s.trim()) : [],
        achievements: values.achievements ? values.achievements.split(',').map(s => s.trim()) : [],
        references: values.references || null,
        is_current: values.is_current,
        created_at: new Date().toISOString(),
      };

      // Log activity
      await sb.from('user_profile_activity').insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'history_entry_added',
        description: `Added ${values.entry_type} entry: ${values.title} at ${values.organization}`,
        metadata: { entry_type: values.entry_type, title: values.title, organization: values.organization }
      });

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('profile.history.created', { 
          organization_id: orgId, 
          user_id: userId,
          entry_type: values.entry_type
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
        aria-label="Add History Entry" 
        title="Add History Entry"
      >
        <Plus className="mr-xs h-icon-xs w-icon-xs" /> Add History Entry
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Add Professional History Entry" 
        description={submitting ? 'Saving…' : undefined} 
       
      >
        {error ? <div role="alert" className="mb-sm text-body-sm color-destructive">{error}</div> : null}
        <form 
          className="stack-sm" 
          onSubmit={(e: any) => { e.preventDefault(); onSubmit(form.getValues()); }} 
          aria-live="polite"
        >
          <div className="grid gap-xs">
            <label htmlFor="entry_type" className="text-body-sm form-label">Entry Type *</label>
            <select 
              id="entry_type" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('entry_type') || 'employment'} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('entry_type', e.target.value as any, { shouldDirty: true })}
            >
              <option value="employment">Employment</option>
              <option value="education">Education</option>
              <option value="project">Project</option>
              <option value="achievement">Achievement</option>
              <option value="certification">Certification</option>
            </select>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="title" className="text-body-sm form-label">Title/Position *</label>
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
            <label htmlFor="organization" className="text-body-sm form-label">Organization/Company *</label>
            <input 
              id="organization" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('organization') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('organization', e.target.value, { shouldDirty: true })} 
              aria-invalid={!!form.formState.errors.organization} 
            />
            {form.formState.errors.organization ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.organization.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="description" className="text-body-sm form-label">Description</label>
            <textarea 
              id="description" 
              className="rounded border  px-md py-xs min-h-header-sm" 
              value={form.getValues('description') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('description', e.target.value, { shouldDirty: true })} 
              placeholder="Describe your role, responsibilities, or what this entry involved..."
            />
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="grid gap-xs">
              <label htmlFor="start_date" className="text-body-sm form-label">Start Date *</label>
              <input 
                id="start_date" 
                type="date" 
                className="rounded border  px-md py-xs" 
                value={form.getValues('start_date') || ''} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('start_date', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.start_date} 
              />
              {form.formState.errors.start_date ? 
                <div className="text-body-sm color-destructive">{String(form.formState.errors.start_date.message)}</div> : null}
            </div>

            <div className="grid gap-xs">
              <label htmlFor="end_date" className="text-body-sm form-label">End Date</label>
              <input 
                id="end_date" 
                type="date" 
                className="rounded border  px-md py-xs" 
                value={form.getValues('end_date') || ''} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('end_date', e.target.value, { shouldDirty: true })} 
                disabled={form.getValues('is_current')}
              />
            </div>
          </div>

          <div className="flex items-center gap-sm">
            <input 
              id="is_current" 
              type="checkbox" 
              checked={form.getValues('is_current')} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                form.setValue('is_current', e.target.checked, { shouldDirty: true });
                if (e.target.checked) {
                  form.setValue('end_date', '', { shouldDirty: true });
                }
              }} 
            />
            <label htmlFor="is_current" className="text-body-sm form-label">This is my current position</label>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="location" className="text-body-sm form-label">Location</label>
            <input 
              id="location" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('location') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('location', e.target.value, { shouldDirty: true })} 
              placeholder="City, State/Country"
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="skills_gained" className="text-body-sm form-label">Skills Gained (comma-separated)</label>
            <textarea 
              id="skills_gained" 
              className="rounded border  px-md py-xs min-h-toolbar" 
              value={form.getValues('skills_gained') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('skills_gained', e.target.value, { shouldDirty: true })} 
              placeholder="e.g. Project Management, Leadership, Python, React"
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="achievements" className="text-body-sm form-label">Key Achievements (comma-separated)</label>
            <textarea 
              id="achievements" 
              className="rounded border  px-md py-xs min-h-toolbar" 
              value={form.getValues('achievements') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('achievements', e.target.value, { shouldDirty: true })} 
              placeholder="e.g. Increased sales by 25%, Led team of 10, Launched new product"
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="references" className="text-body-sm form-label">References</label>
            <textarea 
              id="references" 
              className="rounded border  px-md py-xs min-h-toolbar" 
              value={form.getValues('references') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('references', e.target.value, { shouldDirty: true })} 
              placeholder="Contact information for references..."
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
