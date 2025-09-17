'use client';

import { useMemo, useState } from 'react';
import { Drawer, Button } from '@ghxstship/ui';
import { Plus } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  status: z.string().min(2).default('todo'),
  due_at: z.string().nullable().optional(),
});

type Values = z.infer<typeof schema>;

export default function CreateTaskClient({ orgId }: { orgId: string }) {
  const t = useTranslations('tasks');
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', status: 'todo', due_at: null },
    mode: 'onChange',
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
          is_demo: false,
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
      form.reset({ title: '', status: 'todo', due_at: null });
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-label={t('create.newTitle')} title={t('create.newTitle')}>
        <Plus className="mr-1 h-4 w-4" /> {t('create.newTitle')}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title={t('create.newTitle')} description={submitting ? t('drawer.saving') : undefined}>
        {error ? <div role="alert" className="mb-2 text-body-sm color-destructive">{error}</div> : null}
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSubmit(form.getValues()); }} aria-live="polite">
          <div className="grid gap-1">
            <label htmlFor="title" className="text-body-sm">{t('grid.title')}</label>
            <input id="title" className="rounded border px-2 py-1" value={form.getValues('title') || ''} onChange={(e) => form.setValue('title', e.target.value, { shouldDirty: true })} aria-invalid={!!form.formState.errors.title} />
            <div className="text-body-sm opacity-70">{t('create.titleHelp')}</div>
            {form.formState.errors.title ? <div className="text-body-sm color-destructive">{String(form.formState.errors.title.message)}</div> : null}
          </div>
          <div className="grid gap-1">
            <label htmlFor="status" className="text-body-sm">{t('grid.status')}</label>
            <input id="status" className="rounded border px-2 py-1" value={form.getValues('status') || ''} onChange={(e) => form.setValue('status', e.target.value, { shouldDirty: true })} />
            <div className="text-body-sm opacity-70">{t('create.statusHelp')}</div>
          </div>
          <div className="grid gap-1">
            <label htmlFor="due_at" className="text-body-sm">{t('grid.dueAt')}</label>
            <input id="due_at" type="date" className="rounded border px-2 py-1" value={form.getValues('due_at')?.slice(0,10) || ''} onChange={(e) => form.setValue('due_at', e.target.value || null, { shouldDirty: true })} />
            <div className="text-body-sm opacity-70">{t('create.dueAtHelp')}</div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t('create.cancel')}</Button>
            <Button type="submit" variant="primary" disabled={submitting || !form.formState.isDirty}>{t('create.create')}</Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
