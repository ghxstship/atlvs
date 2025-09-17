'use client';

import { useEffect, useMemo, useState } from 'react';
import { Drawer, Button } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, FileText, Activity as ActivityIcon, MessageSquare } from 'lucide-react';

export type TaskRow = { id: string; title: string; status: string; due_at: string | null; project_id: string | null };

type Labels = { title: string; status: string; dueAt: string };

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  status: z.string().min(2),
  due_at: z.string().nullable().optional(),
});

export default function TasksTableClient({ rows, orgId }: { rows: TaskRow[]; orgId: string }) {
  const t = useTranslations('tasks');
  const sb = useMemo(() => createBrowserClient(), []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<'details' | 'edit' | 'comments' | 'activity'>('details');
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; body: string; created_at: string }>>([]);
  const [activity, setActivity] = useState<Array<{ action: string; occurred_at: string }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = rows.find(r => r.id === openId) || null;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: current ? { title: current.title, status: current.status || 'pending', due_at: current.due_at ?? null } : { title: '', status: 'pending', due_at: null },
    mode: 'onChange'
  });

  // Load comments
  useEffect(() => {
    if (!openId) return;
    (async () => {
      setLoadingComments(true);
      const { data: cs } = await sb
        .from('comments')
        .select('id,body,created_at')
        .eq('organization_id', orgId)
        .eq('entity_type', 'task')
        .eq('entity_id', openId)
        .order('created_at', { ascending: false })
        .limit(50);
      setComments(cs ?? []);
      setLoadingComments(false);
    })();
  }, [openId, sb, orgId]);

  // Load activity
  useEffect(() => {
    if (!openId) return;
    (async () => {
      setLoadingActivity(true);
      try {
        const res = await fetch(`/api/audit/${orgId}/tasks/${openId}`);
        const json = await res.json();
        setActivity(json?.data ?? []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load activity');
      } finally {
        setLoadingActivity(false);
      }
    })();
  }, [openId, orgId]);

  // Autosave
  useEffect(() => {
    if (!openId) return;
    const sub = form.watch(async (values, info) => {
      if (!info.name) return;
      setSaving(true);
      setError(null);
      try {
        const patch: any = {};
        if (info.name === 'title') patch.title = values.title;
        if (info.name === 'status') patch.status = values.status;
        if (info.name === 'due_at') patch.due_at = values.due_at;
        const { error: upErr } = await sb.from('tasks').update(patch).eq('id', openId).eq('organization_id', orgId);
        if (upErr) throw upErr;
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture('task.updated', { organization_id: orgId, task_id: openId, keys: Object.keys(patch) });
        }
      } catch (e: any) {
        setError(e?.message || 'Save failed');
      } finally {
        setSaving(false);
      }
    });
    return () => sub?.unsubscribe?.();
  }, [openId, form, sb, orgId]);

  async function addComment(formData: FormData) {
    const body = String(formData.get('body') || '').trim();
    if (!body || !openId) return;
    const { data, error: insErr } = await sb.from('comments').insert({ organization_id: orgId, entity_type: 'task', entity_id: openId, body }).select('id,body,created_at').maybeSingle();
    if (!insErr && data) setComments((prev: any) => [data, ...prev]);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="sticky top-0">
            <th className="border-b p-sm text-left">{t('grid.title')}</th>
            <th className="border-b p-sm text-left">{t('grid.status')}</th>
            <th className="border-b p-sm text-left">{t('grid.dueAt')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-accent/20 cursor-pointer" onClick={() => { setOpenId(r.id); setTab('details'); }}>
              <td className="border-b p-sm">{r.title}</td>
              <td className="border-b p-sm capitalize">{r.status}</td>
              <td className="border-b p-sm">{r.due_at ? new Date(r.due_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Drawer
        open={!!openId}
        onClose={() => setOpenId(null)}
        title={current?.title || t('title')}
        description={saving ? t('drawer.saving') : undefined}
        width="xl"
      >
        <div className="flex items-center gap-sm border-b pb-2 mb-3" role="tablist" aria-label={t('title')}>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='details'?'bg-accent':''}`} onClick={() => setTab('details')} role="tab" aria-selected={tab==='details'}><FileText className="h-4 w-4" /> {t('drawer.details')}</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='edit'?'bg-accent':''}`} onClick={() => setTab('edit')} role="tab" aria-selected={tab==='edit'}><Edit3 className="h-4 w-4" /> {t('drawer.edit')}</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='comments'?'bg-accent':''}`} onClick={() => setTab('comments')} role="tab" aria-selected={tab==='comments'}><MessageSquare className="h-4 w-4" /> {t('drawer.comments')}</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='activity'?'bg-accent':''}`} onClick={() => setTab('activity')} role="tab" aria-selected={tab==='activity'}><ActivityIcon className="h-4 w-4" /> {t('drawer.activity')}</button>
        </div>

        {error ? <div role="alert" className="mb-2 text-body-sm color-destructive">{error}</div> : null}

        {tab === 'details' && (
          <div className="stack-sm text-body-sm">
            <div><span className="form-label">{t('grid.title')}:</span> {current?.title}</div>
            <div><span className="form-label">{t('grid.status')}:</span> {current?.status}</div>
            <div><span className="form-label">{t('grid.dueAt')}:</span> {current?.due_at ? new Date(current.due_at).toLocaleString() : '-'}</div>
          </div>
        )}

        {tab === 'edit' && current && (
          <form className="stack-sm" onSubmit={(e) => e.preventDefault()} aria-live="polite">
            <div className="grid gap-xs">
              <label htmlFor="title" className="text-body-sm">{t('grid.title')}</label>
              <input id="title" name="title" className="rounded border px-sm py-xs" value={form.getValues('title') || ''} onChange={(e) => form.setValue('title', e.target.value, { shouldDirty: true })} aria-invalid={!!form.formState.errors.title} />
              {form.formState.errors.title ? <div className="text-body-sm color-destructive">{String(form.formState.errors.title.message)}</div> : null}
            </div>
            <div className="grid gap-xs">
              <label htmlFor="status" className="text-body-sm">{t('grid.status')}</label>
              <input id="status" name="status" className="rounded border px-sm py-xs" value={form.getValues('status') || ''} onChange={(e) => form.setValue('status', e.target.value, { shouldDirty: true })} />
            </div>
            <div className="grid gap-xs">
              <label htmlFor="due_at" className="text-body-sm">{t('grid.dueAt')}</label>
              <input id="due_at" name="due_at" type="date" className="rounded border px-sm py-xs" value={form.getValues('due_at')?.slice(0,10) || ''} onChange={(e) => form.setValue('due_at', e.target.value || null, { shouldDirty: true })} />
            </div>
            <div className="text-body-sm opacity-70">{form.formState.isDirty ? t('drawer.unsaved') : t('drawer.allSaved')}</div>
          </form>
        )}

        {tab === 'comments' && (
          <div className="stack-sm">
            <form action={addComment} className="flex items-start gap-sm" aria-label={t('drawer.comments')}>
              <textarea name="body" className="min-h-16 w-full rounded border p-sm" placeholder={t('drawer.comments')} />
              <Button variant="primary">{t('drawer.post')}</Button>
            </form>
            {loadingComments ? <div className="text-body-sm opacity-70">{t('drawer.loading')}</div> : (
              <ul className="stack-sm">
                {comments.map(c => (
                  <li key={c.id} className="rounded border p-sm">
                    <div className="text-body-sm whitespace-pre-wrap">{c.body}</div>
                    <div className="text-body-sm opacity-60">{new Date(c.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="stack-sm text-body-sm">
            {loadingActivity ? t('drawer.loading') : (
              <ul className="stack-xs">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-md">
                    <div className="font-mono text-body-sm opacity-70">{new Date(a.occurred_at).toLocaleString()}</div>
                    <div className="flex-1">{a.action}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
