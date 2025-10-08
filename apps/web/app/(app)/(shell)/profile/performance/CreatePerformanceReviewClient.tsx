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
  review_period: z.string().min(2, 'Review period is required'),
  reviewer_name: z.string().min(2, 'Reviewer name is required'),
  reviewer_title: z.string().min(2, 'Reviewer title is required'),
  overall_rating: z.number().min(1).max(5),
  technical_skills: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  teamwork: z.number().min(1).max(5),
  leadership: z.number().min(1).max(5),
  problem_solving: z.number().min(1).max(5),
  adaptability: z.number().min(1).max(5),
  strengths: z.string().min(10, 'Strengths are required'),
  improvement_areas: z.string().min(10, 'Improvement areas are required'),
  goals_achieved: z.string().optional(),
  future_goals: z.string().optional(),
  review_date: z.string().min(1, 'Review date is required'),
  next_review_date: z.string().optional()
});

type Values = z.infer<typeof schema>;

export default function CreatePerformanceReviewClient({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      review_period: '',
      reviewer_name: '',
      reviewer_title: '',
      overall_rating: 3,
      technical_skills: 3,
      communication: 3,
      teamwork: 3,
      leadership: 3,
      problem_solving: 3,
      adaptability: 3,
      strengths: '',
      improvement_areas: '',
      goals_achieved: '',
      future_goals: '',
      review_date: new Date().toISOString().split('T')[0],
      next_review_date: ''
    },
    mode: 'onChange'
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      // Create mock performance review data structure
      const performanceReviewData = {
        id: crypto.randomUUID(),
        user_id: userId,
        organization_id: orgId,
        review_period: values.review_period,
        reviewer_name: values.reviewer_name,
        reviewer_title: values.reviewer_title,
        overall_rating: values.overall_rating,
        performance_areas: {
          technical_skills: values.technical_skills,
          communication: values.communication,
          teamwork: values.teamwork,
          leadership: values.leadership,
          problem_solving: values.problem_solving,
          adaptability: values.adaptability
        },
        strengths: values.strengths.split(',').map(s => s.trim()),
        improvement_areas: values.improvement_areas.split(',').map(s => s.trim()),
        goals_achieved: values.goals_achieved ? values.goals_achieved.split(',').map(s => s.trim()) : [],
        future_goals: values.future_goals ? values.future_goals.split(',').map(s => s.trim()) : [],
        review_date: values.review_date,
        next_review_date: values.next_review_date || null,
        created_at: new Date().toISOString()
      };

      // Log activity
      await sb.from('user_profile_activity').insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'performance_review_added',
        description: `Added performance review for ${values.review_period}`,
        metadata: { 
          review_period: values.review_period, 
          overall_rating: values.overall_rating,
          reviewer: values.reviewer_name 
        }
      });

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('profile.performance.created', { 
          organization_id: orgId, 
          user_id: userId,
          overall_rating: values.overall_rating
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
        aria-label="Add Performance Review" 
        title="Add Performance Review"
      >
        <Plus className="mr-xs h-icon-xs w-icon-xs" /> Add Performance Review
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Add Performance Review" 
        description={submitting ? 'Saving…' : undefined}
      >
        {error ? <div role="alert" className="mb-sm text-body-sm color-destructive">{error}</div> : null}
        <form 
          className="stack-sm" 
          onSubmit={(e: any) => { e.preventDefault(); onSubmit(form.getValues()); }} 
          aria-live="polite"
        >
          <div className="grid gap-xs">
            <label htmlFor="review_period" className="text-body-sm form-label">Review Period *</label>
            <input 
              id="review_period" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('review_period') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('review_period', e.target.value, { shouldDirty: true })} 
              placeholder="e.g. Q1 2024, Annual 2023"
              aria-invalid={!!form.formState.errors.review_period} 
            />
            {form.formState.errors.review_period ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.review_period.message)}</div> : null}
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="grid gap-xs">
              <label htmlFor="reviewer_name" className="text-body-sm form-label">Reviewer Name *</label>
              <input 
                id="reviewer_name" 
                className="rounded border  px-md py-xs" 
                value={form.getValues('reviewer_name') || ''} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('reviewer_name', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.reviewer_name} 
              />
              {form.formState.errors.reviewer_name ? 
                <div className="text-body-sm color-destructive">{String(form.formState.errors.reviewer_name.message)}</div> : null}
            </div>

            <div className="grid gap-xs">
              <label htmlFor="reviewer_title" className="text-body-sm form-label">Reviewer Title *</label>
              <input 
                id="reviewer_title" 
                className="rounded border  px-md py-xs" 
                value={form.getValues('reviewer_title') || ''} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('reviewer_title', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.reviewer_title} 
              />
              {form.formState.errors.reviewer_title ? 
                <div className="text-body-sm color-destructive">{String(form.formState.errors.reviewer_title.message)}</div> : null}
            </div>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="overall_rating" className="text-body-sm form-label">Overall Rating (1-5) *</label>
            <select 
              id="overall_rating" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('overall_rating') || 3} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('overall_rating', Number(e.target.value), { shouldDirty: true })}
            >
              <option value="1">1 - Needs Improvement</option>
              <option value="2">2 - Below Expectations</option>
              <option value="3">3 - Meets Expectations</option>
              <option value="4">4 - Exceeds Expectations</option>
              <option value="5">5 - Outstanding</option>
            </select>
          </div>

          <div className="stack-sm">
            <h4 className="text-body-sm form-label">Performance Areas (1-5 rating each)</h4>
            
            <div className="grid grid-cols-2 gap-sm">
              <div className="grid gap-xs">
                <label htmlFor="technical_skills" className="text-body-sm">Technical Skills</label>
                <select 
                  id="technical_skills" 
                  className="rounded border  px-md py-xs text-body-sm" 
                  value={form.getValues('technical_skills') || 3} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('technical_skills', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-xs">
                <label htmlFor="communication" className="text-body-sm">Communication</label>
                <select 
                  id="communication" 
                  className="rounded border  px-md py-xs text-body-sm" 
                  value={form.getValues('communication') || 3} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('communication', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-xs">
                <label htmlFor="teamwork" className="text-body-sm">Teamwork</label>
                <select 
                  id="teamwork" 
                  className="rounded border  px-md py-xs text-body-sm" 
                  value={form.getValues('teamwork') || 3} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('teamwork', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-xs">
                <label htmlFor="leadership" className="text-body-sm">Leadership</label>
                <select 
                  id="leadership" 
                  className="rounded border  px-md py-xs text-body-sm" 
                  value={form.getValues('leadership') || 3} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('leadership', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-xs">
                <label htmlFor="problem_solving" className="text-body-sm">Problem Solving</label>
                <select 
                  id="problem_solving" 
                  className="rounded border  px-md py-xs text-body-sm" 
                  value={form.getValues('problem_solving') || 3} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('problem_solving', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-xs">
                <label htmlFor="adaptability" className="text-body-sm">Adaptability</label>
                <select 
                  id="adaptability" 
                  className="rounded border  px-md py-xs text-body-sm" 
                  value={form.getValues('adaptability') || 3} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('adaptability', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-xs">
            <label htmlFor="strengths" className="text-body-sm form-label">Key Strengths *</label>
            <textarea 
              id="strengths" 
              className="rounded border  px-md py-xs min-h-header-sm" 
              value={form.getValues('strengths') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('strengths', e.target.value, { shouldDirty: true })} 
              placeholder="List key strengths and positive contributions..."
              aria-invalid={!!form.formState.errors.strengths} 
            />
            {form.formState.errors.strengths ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.strengths.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="improvement_areas" className="text-body-sm form-label">Areas for Improvement *</label>
            <textarea 
              id="improvement_areas" 
              className="rounded border  px-md py-xs min-h-header-sm" 
              value={form.getValues('improvement_areas') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('improvement_areas', e.target.value, { shouldDirty: true })} 
              placeholder="Areas where growth and development are needed..."
              aria-invalid={!!form.formState.errors.improvement_areas} 
            />
            {form.formState.errors.improvement_areas ? 
              <div className="text-body-sm color-destructive">{String(form.formState.errors.improvement_areas.message)}</div> : null}
          </div>

          <div className="grid gap-xs">
            <label htmlFor="goals_achieved" className="text-body-sm form-label">Goals Achieved</label>
            <textarea 
              id="goals_achieved" 
              className="rounded border  px-md py-xs min-h-toolbar" 
              value={form.getValues('goals_achieved') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('goals_achieved', e.target.value, { shouldDirty: true })} 
              placeholder="Goals that were successfully completed..."
            />
          </div>

          <div className="grid gap-xs">
            <label htmlFor="future_goals" className="text-body-sm form-label">Future Goals</label>
            <textarea 
              id="future_goals" 
              className="rounded border  px-md py-xs min-h-toolbar" 
              value={form.getValues('future_goals') || ''} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('future_goals', e.target.value, { shouldDirty: true })} 
              placeholder="Goals for the next review period..."
            />
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="grid gap-xs">
              <label htmlFor="review_date" className="text-body-sm form-label">Review Date *</label>
              <input 
                id="review_date" 
                type="date" 
                className="rounded border  px-md py-xs" 
                value={form.getValues('review_date') || ''} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('review_date', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.review_date} 
              />
              {form.formState.errors.review_date ? 
                <div className="text-body-sm color-destructive">{String(form.formState.errors.review_date.message)}</div> : null}
            </div>

            <div className="grid gap-xs">
              <label htmlFor="next_review_date" className="text-body-sm form-label">Next Review Date</label>
              <input 
                id="next_review_date" 
                type="date" 
                className="rounded border  px-md py-xs" 
                value={form.getValues('next_review_date') || ''} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('next_review_date', e.target.value, { shouldDirty: true })} 
              />
            </div>
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
