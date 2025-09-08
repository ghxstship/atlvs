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
  next_review_date: z.string().optional(),
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
      next_review_date: '',
    },
    mode: 'onChange',
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
          adaptability: values.adaptability,
        },
        strengths: values.strengths.split(',').map(s => s.trim()),
        improvement_areas: values.improvement_areas.split(',').map(s => s.trim()),
        goals_achieved: values.goals_achieved ? values.goals_achieved.split(',').map(s => s.trim()) : [],
        future_goals: values.future_goals ? values.future_goals.split(',').map(s => s.trim()) : [],
        review_date: values.review_date,
        next_review_date: values.next_review_date || null,
        created_at: new Date().toISOString(),
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
        aria-label="Add Performance Review" 
        title="Add Performance Review"
      >
        <Plus className="mr-1 h-4 w-4" /> Add Performance Review
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        title="Add Performance Review" 
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
            <label htmlFor="review_period" className="text-sm font-medium">Review Period *</label>
            <input 
              id="review_period" 
              className="rounded border px-2 py-1" 
              value={form.getValues('review_period') || ''} 
              onChange={(e) => form.setValue('review_period', e.target.value, { shouldDirty: true })} 
              placeholder="e.g. Q1 2024, Annual 2023"
              aria-invalid={!!form.formState.errors.review_period} 
            />
            {form.formState.errors.review_period ? 
              <div className="text-xs text-red-600">{String(form.formState.errors.review_period.message)}</div> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label htmlFor="reviewer_name" className="text-sm font-medium">Reviewer Name *</label>
              <input 
                id="reviewer_name" 
                className="rounded border px-2 py-1" 
                value={form.getValues('reviewer_name') || ''} 
                onChange={(e) => form.setValue('reviewer_name', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.reviewer_name} 
              />
              {form.formState.errors.reviewer_name ? 
                <div className="text-xs text-red-600">{String(form.formState.errors.reviewer_name.message)}</div> : null}
            </div>

            <div className="grid gap-1">
              <label htmlFor="reviewer_title" className="text-sm font-medium">Reviewer Title *</label>
              <input 
                id="reviewer_title" 
                className="rounded border px-2 py-1" 
                value={form.getValues('reviewer_title') || ''} 
                onChange={(e) => form.setValue('reviewer_title', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.reviewer_title} 
              />
              {form.formState.errors.reviewer_title ? 
                <div className="text-xs text-red-600">{String(form.formState.errors.reviewer_title.message)}</div> : null}
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="overall_rating" className="text-sm font-medium">Overall Rating (1-5) *</label>
            <select 
              id="overall_rating" 
              className="rounded border px-2 py-1" 
              value={form.getValues('overall_rating') || 3} 
              onChange={(e) => form.setValue('overall_rating', Number(e.target.value), { shouldDirty: true })}
            >
              <option value="1">1 - Needs Improvement</option>
              <option value="2">2 - Below Expectations</option>
              <option value="3">3 - Meets Expectations</option>
              <option value="4">4 - Exceeds Expectations</option>
              <option value="5">5 - Outstanding</option>
            </select>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Performance Areas (1-5 rating each)</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <label htmlFor="technical_skills" className="text-xs">Technical Skills</label>
                <select 
                  id="technical_skills" 
                  className="rounded border px-2 py-1 text-sm" 
                  value={form.getValues('technical_skills') || 3} 
                  onChange={(e) => form.setValue('technical_skills', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label htmlFor="communication" className="text-xs">Communication</label>
                <select 
                  id="communication" 
                  className="rounded border px-2 py-1 text-sm" 
                  value={form.getValues('communication') || 3} 
                  onChange={(e) => form.setValue('communication', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label htmlFor="teamwork" className="text-xs">Teamwork</label>
                <select 
                  id="teamwork" 
                  className="rounded border px-2 py-1 text-sm" 
                  value={form.getValues('teamwork') || 3} 
                  onChange={(e) => form.setValue('teamwork', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label htmlFor="leadership" className="text-xs">Leadership</label>
                <select 
                  id="leadership" 
                  className="rounded border px-2 py-1 text-sm" 
                  value={form.getValues('leadership') || 3} 
                  onChange={(e) => form.setValue('leadership', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label htmlFor="problem_solving" className="text-xs">Problem Solving</label>
                <select 
                  id="problem_solving" 
                  className="rounded border px-2 py-1 text-sm" 
                  value={form.getValues('problem_solving') || 3} 
                  onChange={(e) => form.setValue('problem_solving', Number(e.target.value), { shouldDirty: true })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label htmlFor="adaptability" className="text-xs">Adaptability</label>
                <select 
                  id="adaptability" 
                  className="rounded border px-2 py-1 text-sm" 
                  value={form.getValues('adaptability') || 3} 
                  onChange={(e) => form.setValue('adaptability', Number(e.target.value), { shouldDirty: true })}
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

          <div className="grid gap-1">
            <label htmlFor="strengths" className="text-sm font-medium">Key Strengths *</label>
            <textarea 
              id="strengths" 
              className="rounded border px-2 py-1 min-h-[80px]" 
              value={form.getValues('strengths') || ''} 
              onChange={(e) => form.setValue('strengths', e.target.value, { shouldDirty: true })} 
              placeholder="List key strengths and positive contributions..."
              aria-invalid={!!form.formState.errors.strengths} 
            />
            {form.formState.errors.strengths ? 
              <div className="text-xs text-red-600">{String(form.formState.errors.strengths.message)}</div> : null}
          </div>

          <div className="grid gap-1">
            <label htmlFor="improvement_areas" className="text-sm font-medium">Areas for Improvement *</label>
            <textarea 
              id="improvement_areas" 
              className="rounded border px-2 py-1 min-h-[80px]" 
              value={form.getValues('improvement_areas') || ''} 
              onChange={(e) => form.setValue('improvement_areas', e.target.value, { shouldDirty: true })} 
              placeholder="Areas where growth and development are needed..."
              aria-invalid={!!form.formState.errors.improvement_areas} 
            />
            {form.formState.errors.improvement_areas ? 
              <div className="text-xs text-red-600">{String(form.formState.errors.improvement_areas.message)}</div> : null}
          </div>

          <div className="grid gap-1">
            <label htmlFor="goals_achieved" className="text-sm font-medium">Goals Achieved</label>
            <textarea 
              id="goals_achieved" 
              className="rounded border px-2 py-1 min-h-[60px]" 
              value={form.getValues('goals_achieved') || ''} 
              onChange={(e) => form.setValue('goals_achieved', e.target.value, { shouldDirty: true })} 
              placeholder="Goals that were successfully completed..."
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="future_goals" className="text-sm font-medium">Future Goals</label>
            <textarea 
              id="future_goals" 
              className="rounded border px-2 py-1 min-h-[60px]" 
              value={form.getValues('future_goals') || ''} 
              onChange={(e) => form.setValue('future_goals', e.target.value, { shouldDirty: true })} 
              placeholder="Goals for the next review period..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label htmlFor="review_date" className="text-sm font-medium">Review Date *</label>
              <input 
                id="review_date" 
                type="date" 
                className="rounded border px-2 py-1" 
                value={form.getValues('review_date') || ''} 
                onChange={(e) => form.setValue('review_date', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.review_date} 
              />
              {form.formState.errors.review_date ? 
                <div className="text-xs text-red-600">{String(form.formState.errors.review_date.message)}</div> : null}
            </div>

            <div className="grid gap-1">
              <label htmlFor="next_review_date" className="text-sm font-medium">Next Review Date</label>
              <input 
                id="next_review_date" 
                type="date" 
                className="rounded border px-2 py-1" 
                value={form.getValues('next_review_date') || ''} 
                onChange={(e) => form.setValue('next_review_date', e.target.value, { shouldDirty: true })} 
              />
            </div>
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
