'use client';

import { useMemo, useState, useEffect } from 'react';
import { Drawer, Button, Select, Textarea, Badge, UnifiedInput } from '@ghxstship/ui';
import { Plus, Calendar, User, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_at: z.string().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  project_id: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  estimated_hours: z.number().min(0).max(1000).nullable().optional()
});

type Values = z.infer<typeof schema>;

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-muted0' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-info-500' },
  { value: 'completed', label: 'Completed', color: 'bg-success-500' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-400' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-success-500' },
  { value: 'medium', label: 'Medium', color: 'bg-warning-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Critical', color: 'bg-red-500' },
];

export default function CreateTaskClient({ orgId }: { orgId: string }) {
  const t = useTranslations('tasks');
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', status: 'pending', due_at: null },
    mode: 'onChange'
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: insErr } = await sb
        .from('tasks')
        .insert({
          organization_id: orgId,
          title: values.title,
          status: values.status,
          due_at: values.due_at || null,
          is_demo: false
        })
        .select('id')
        .maybeSingle();
      if (insErr) throw insErr;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('task.created', { organization_id: orgId, task_id: data?.id });
      }
      await sb.from('user_notifications').insert({
        organization_id: orgId,
        title: 'Task created',
        body: `${values.title} created successfully`,
        href: '/projects/tasks'
      });

      setOpen(false);
      form.reset({ title: '', status: 'pending', due_at: null });
      router.refresh();
    } catch (e) {
      setError(e?.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-label={t('create.newTitle')} title={t('create.newTitle')}>
        <Plus className="mr-xs h-icon-xs w-icon-xs" /> {t('create.newTitle')}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title={t('create.newTitle')} description={submitting ? t('drawer.saving') : undefined}>
        {error ? <div role="alert" className="mb-sm text-body-sm color-destructive">{error}</div> : null}
        <form className="stack-sm" onSubmit={(e: any) => { e.preventDefault(); onSubmit(form.getValues()); }} aria-live="polite">
          <UnifiedInput
            id="title"
            label={t('grid.title')}
            description={t('create.titleHelp')}
            value={form.getValues('title') || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('title', e.target.value, { shouldDirty: true })}
            error={form.formState.errors.title?.message}
            required
          />
          <div className="grid gap-xs">
            <label htmlFor="status" className="text-body-sm">{t('grid.status')}</label>
            <select 
              id="status" 
              className="rounded border  px-md py-xs" 
              value={form.getValues('status') || 'pending'} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('status', e.target.value as 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled', { shouldDirty: true })}
            >
              {statusOptions.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-body-sm opacity-70">{t('create.statusHelp')}</div>
          </div>
          <div className="grid gap-xs">
            <label htmlFor="due_at" className="text-body-sm">{t('grid.dueAt')}</label>
            <input id="due_at" type="date" className="rounded border  px-md py-xs" value={form.getValues('due_at')?.slice(0,10) || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('due_at', e.target.value || null, { shouldDirty: true })} />
            <div className="text-body-sm opacity-70">{t('create.dueAtHelp')}</div>
          </div>
          <div className="flex items-center justify-end gap-sm pt-sm border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t('create.cancel')}</Button>
            <Button type="submit" variant="default" disabled={submitting || !form.formState.isDirty}>{submitting ? t('drawer.saving') : t('create.submit')}</Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
