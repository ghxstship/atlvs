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
  job_title: z.string().min(2, 'Job title is required'),
  department: z.string().min(2, 'Department is required'),
  employee_id: z.string().optional(),
  hire_date: z.string().optional(),
  skills: z.string().optional(),
  bio: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  career_goals: z.string().optional(),
  mentorship_interests: z.string().optional(),
  performance_rating: z.number().min(1).max(5).optional(),
});

type Values = z.infer<typeof schema>;

export default function CreateProfessionalClient({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      job_title: '',
      department: '',
      employee_id: '',
      hire_date: '',
      skills: '',
      bio: '',
      linkedin_url: '',
      website_url: '',
      career_goals: '',
      mentorship_interests: '',
      performance_rating: undefined,
    },
    mode: 'onChange',
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      // Insert professional profile data
      const { error: insErr } = await sb
        .from('user_profiles')
        .upsert({
          user_id: userId,
          organization_id: orgId,
          job_title: values.job_title,
          department: values.department,
          employee_id: values.employee_id || null,
          hire_date: values.hire_date || null,
          skills: values.skills ? values.skills.split(',').map(s => s.trim()) : [],
          bio: values.bio || null,
          linkedin_url: values.linkedin_url || null,
          website_url: values.website_url || null,
          career_goals: values.career_goals || null,
          mentorship_interests: values.mentorship_interests || null,
          performance_rating: values.performance_rating || null,
        });
      
      if (insErr) throw insErr;

      // Log activity
      await sb.from('user_profile_activity').insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'profile_updated',
        description: 'Professional information created',
        metadata: { section: 'professional' }
      });

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('profile.professional.created', { 
          organization_id: orgId, 
          user_id: userId 
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
        aria-label="Add Professional Info" 
        title="Add Professional Info"
      >
        <Plus className="mr-1 h-4 w-4" /> Add Professional Info
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Add Professional Information" 
        description={submitting ? 'Saving…' : undefined} 
       
      >
        {error ? <div role="alert" className="mb-2 text-body-sm color-destructive">{error}</div> : null}
        <form 
          className="space-y-3" 
          onSubmit={(e) => { e.preventDefault(); onSubmit(form.getValues()); }} 
          aria-live="polite"
        >
          <div className="grid gap-1">
            <label htmlFor="job_title" className="text-body-sm form-label">Job Title *</label>
            <input 
              id="job_title" 
              className="rounded border px-2 py-1" 
              value={form.getValues('job_title') || ''} 
              onChange={(e) => form.setValue('job_title', e.target.value, { shouldDirty: true })} 
              aria-invalid={!!form.formState.errors.job_title} 
            />
            {form.formState.errors.job_title ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.job_title.message)}</div> : null}
          </div>

          <div className="grid gap-1">
            <label htmlFor="department" className="text-body-sm form-label">Department *</label>
            <input 
              id="department" 
              className="rounded border px-2 py-1" 
              value={form.getValues('department') || ''} 
              onChange={(e) => form.setValue('department', e.target.value, { shouldDirty: true })} 
              aria-invalid={!!form.formState.errors.department} 
            />
            {form.formState.errors.department ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.department.message)}</div> : null}
          </div>

          <div className="grid gap-1">
            <label htmlFor="employee_id" className="text-body-sm form-label">Employee ID</label>
            <input 
              id="employee_id" 
              className="rounded border px-2 py-1" 
              value={form.getValues('employee_id') || ''} 
              onChange={(e) => form.setValue('employee_id', e.target.value, { shouldDirty: true })} 
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="hire_date" className="text-body-sm form-label">Hire Date</label>
            <input 
              id="hire_date" 
              type="date" 
              className="rounded border px-2 py-1" 
              value={form.getValues('hire_date') || ''} 
              onChange={(e) => form.setValue('hire_date', e.target.value, { shouldDirty: true })} 
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="skills" className="text-body-sm form-label">Skills (comma-separated)</label>
            <textarea 
              id="skills" 
              className="rounded border px-2 py-1 min-h-[60px]" 
              value={form.getValues('skills') || ''} 
              onChange={(e) => form.setValue('skills', e.target.value, { shouldDirty: true })} 
              placeholder="e.g. JavaScript, React, Node.js"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="bio" className="text-body-sm form-label">Professional Bio</label>
            <textarea 
              id="bio" 
              className="rounded border px-2 py-1 min-h-[80px]" 
              value={form.getValues('bio') || ''} 
              onChange={(e) => form.setValue('bio', e.target.value, { shouldDirty: true })} 
              placeholder="Brief professional summary..."
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="linkedin_url" className="text-body-sm form-label">LinkedIn URL</label>
            <input 
              id="linkedin_url" 
              type="url" 
              className="rounded border px-2 py-1" 
              value={form.getValues('linkedin_url') || ''} 
              onChange={(e) => form.setValue('linkedin_url', e.target.value, { shouldDirty: true })} 
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="website_url" className="text-body-sm form-label">Website URL</label>
            <input 
              id="website_url" 
              type="url" 
              className="rounded border px-2 py-1" 
              value={form.getValues('website_url') || ''} 
              onChange={(e) => form.setValue('website_url', e.target.value, { shouldDirty: true })} 
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="career_goals" className="text-body-sm form-label">Career Goals</label>
            <textarea 
              id="career_goals" 
              className="rounded border px-2 py-1 min-h-[60px]" 
              value={form.getValues('career_goals') || ''} 
              onChange={(e) => form.setValue('career_goals', e.target.value, { shouldDirty: true })} 
              placeholder="Your professional aspirations..."
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="mentorship_interests" className="text-body-sm form-label">Mentorship Interests</label>
            <textarea 
              id="mentorship_interests" 
              className="rounded border px-2 py-1 min-h-[60px]" 
              value={form.getValues('mentorship_interests') || ''} 
              onChange={(e) => form.setValue('mentorship_interests', e.target.value, { shouldDirty: true })} 
              placeholder="Areas where you'd like mentorship or can provide mentorship..."
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="performance_rating" className="text-body-sm form-label">Performance Rating (1-5)</label>
            <select 
              id="performance_rating" 
              className="rounded border px-2 py-1" 
              value={form.getValues('performance_rating') || ''} 
              onChange={(e) => form.setValue('performance_rating', e.target.value ? Number(e.target.value) : undefined, { shouldDirty: true })}
            >
              <option value="">Select rating...</option>
              <option value="1">1 - Needs Improvement</option>
              <option value="2">2 - Below Expectations</option>
              <option value="3">3 - Meets Expectations</option>
              <option value="4">4 - Exceeds Expectations</option>
              <option value="5">5 - Outstanding</option>
            </select>
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
