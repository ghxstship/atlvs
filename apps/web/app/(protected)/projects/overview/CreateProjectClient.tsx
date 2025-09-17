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
  name: z.string().min(2, 'Name is required'),
  status: z.string().min(2).default('planning'),
  starts_at: z.string().nullable().optional(),
});

type Values = z.infer<typeof schema>;

export default function CreateProjectClient({ orgId }: { orgId: string }) {
  const t = useTranslations('projects');
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', status: 'planning', starts_at: null },
    mode: 'onChange',
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: insErr } = await sb
        .from('projects')
        .insert({
          organization_id: orgId,
          name: values.name,
          status: values.status,
          starts_at: values.starts_at || null,
          is_demo: false,
        })
        .select('id')
        .maybeSingle();
      if (insErr) throw insErr;

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('project.created', { organization_id: orgId, project_id: data?.id });
      }
      // Notification
      await sb.from('user_notifications').insert({
        organization_id: orgId,
        title: 'Project created',
        body: `${values.name} created successfully`,
        href: '/projects/overview'
      });

      setOpen(false);
      form.reset({ name: '', status: 'planning', starts_at: null });
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-label="Create Project" title="Create Project">
        <Plus className="mr-1 h-4 w-4" /> New Project
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="New Project" description={submitting ? 'Saving…' : undefined}>
        {error ? <div role="alert" className="mb-2 text-body-sm color-destructive">{error}</div> : null}
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSubmit(form.getValues()); }} aria-live="polite">
          <div className="grid gap-1">
            <label htmlFor="name" className="text-body-sm">{t('grid.name')}</label>
            <input id="name" className="rounded border px-2 py-1" value={form.getValues('name') || ''} onChange={(e) => form.setValue('name', e.target.value, { shouldDirty: true })} aria-invalid={!!form.formState.errors.name} />
            {form.formState.errors.name ? <div className="text-body-sm color-destructive">{String(form.formState.errors.name.message)}</div> : null}
          </div>
          <div className="grid gap-1">
            <label htmlFor="status" className="text-body-sm">{t('grid.status')}</label>
            <input id="status" className="rounded border px-2 py-1" value={form.getValues('status') || ''} onChange={(e) => form.setValue('status', e.target.value, { shouldDirty: true })} />
          </div>
          <div className="grid gap-1">
            <label htmlFor="starts_at" className="text-body-sm">{t('grid.startsAt')}</label>
            <input id="starts_at" type="date" className="rounded border px-2 py-1" value={form.getValues('starts_at')?.slice(0,10) || ''} onChange={(e) => form.setValue('starts_at', e.target.value || null, { shouldDirty: true })} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting || !form.formState.isDirty}>Create</Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
