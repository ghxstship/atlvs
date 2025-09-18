'use client';

import { useEffect, useMemo, useState } from 'react';
import { Drawer, Button } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, FileText, Activity as ActivityIcon, MessageSquare } from 'lucide-react';

export type ProjectRow = { id: string; name: string; status: string; starts_at: string | null };

type Labels = { name: string; status: string; startsAt: string };

const projectSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  status: z.string().min(2),
  starts_at: z.string().nullable().optional(),
});

export default function ProjectsTableClient({ rows, orgId, labels }: { rows: ProjectRow[]; orgId: string; labels: Labels }) {
  const t = useTranslations('projects');
  const sb = useMemo(() => createBrowserClient(), []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<'details' | 'edit' | 'comments' | 'activity'>('details');
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; body: string; created_at: string }>>([]);
  const [activity, setActivity] = useState<Array<{ id: string; action: string; occurred_at: string; meta?: any }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = rows.find(r => r.id === openId) || null;

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    values: current ? { name: current.name, status: current.status || 'planning', starts_at: current.starts_at ?? null } : { name: '', status: 'planning', starts_at: null },
    mode: 'onChange'
  });

  // Load comments and activity when opening
  useEffect(() => {
    if (!openId) return;
    (async () => {
      setLoadingComments(true);
      const { data: cs } = await sb
        .from('comments')
        .select('id,body,created_at')
        .eq('organization_id', orgId)
        .eq('entity_type', 'project')
        .eq('entity_id', openId)
        .order('created_at', { ascending: false })
        .limit(50);
      setComments(cs ?? []);
      setLoadingComments(false);
    })();
  }, [openId, sb, orgId]);

  useEffect(() => {
    if (!openId) return;
    (async () => {
      setLoadingActivity(true);
      try {
        const res = await fetch(`/api/audit/${orgId}/projects/${openId}`);
        const json = await res.json();
        setActivity(json?.data ?? []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load activity');
      } finally {
        setLoadingActivity(false);
      }
    })();
  }, [openId, orgId]);

  // Autosave on change
  useEffect(() => {
    if (!openId) return;
    const sub = form.watch(async (values, info) => {
      if (!info.name) return;
      setSaving(true);
      setError(null);
      try {
        const patch: any = {};
        if (info.name === 'name') patch.name = values.name;
        if (info.name === 'status') patch.status = values.status;
        if (info.name === 'starts_at') patch.starts_at = values.starts_at;
        const { error: upErr } = await sb.from('projects').update(patch).eq('id', openId).eq('organization_id', orgId);
        if (upErr) throw upErr;
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture('project.updated', { organization_id: orgId, project_id: openId, keys: Object.keys(patch) });
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
    const { data, error: insErr } = await sb.from('comments').insert({ organization_id: orgId, entity_type: 'project', entity_id: openId, body }).select('id,body,created_at').maybeSingle();
    if (!insErr && data) setComments((prev: any) => [data, ...prev]);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="sticky top-0">
            <th className="border-b p-sm text-left form-label">{labels.name}</th>
            <th className="border-b p-sm text-left form-label">{labels.status}</th>
            <th className="border-b p-sm text-left form-label">{labels.startsAt}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-accent/20 cursor-pointer" onClick={() => { setOpenId(r.id); setTab('details'); }}>
              <td className="border-b p-sm">{r.name}</td>
              <td className="border-b p-sm capitalize">{r.status}</td>
              <td className="border-b p-sm">{r.starts_at ? new Date(r.starts_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Drawer
        open={!!openId}
        onClose={() => setOpenId(null)}
        title={current?.name || t('title')}
        description={saving ? 'Saving…' : undefined}
        width="xl"
      >
        <div className="flex items-center gap-sm border-b pb-sm mb-sm" role="tablist" aria-label="Project tabs">
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='details'?'bg-accent':''}`} onClick={() => setTab('details')} role="tab" aria-selected={tab==='details'}><FileText className="h-4 w-4" /> Details</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='edit'?'bg-accent':''}`} onClick={() => setTab('edit')} role="tab" aria-selected={tab==='edit'}><Edit3 className="h-4 w-4" /> Edit</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='comments'?'bg-accent':''}`} onClick={() => setTab('comments')} role="tab" aria-selected={tab==='comments'}><MessageSquare className="h-4 w-4" /> Comments</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='activity'?'bg-accent':''}`} onClick={() => setTab('activity')} role="tab" aria-selected={tab==='activity'}><ActivityIcon className="h-4 w-4" /> Activity</button>
        </div>

        {error ? <div role="alert" className="mb-sm text-body-sm color-destructive">{error}</div> : null}

        {tab === 'details' && (
          <div className="stack-sm text-body-sm">
            <div><span className="form-label">{labels.name}:</span> {current?.name}</div>
            <div><span className="form-label">{labels.status}:</span> {current?.status}</div>
            <div><span className="form-label">{labels.startsAt}:</span> {current?.starts_at ? new Date(current.starts_at).toLocaleString() : '-'}</div>
          </div>
        )}

        {tab === 'edit' && current && (
          <form className="stack-sm" onSubmit={(e) => e.preventDefault()} aria-live="polite">
            <div className="grid gap-xs">
              <label htmlFor="name" className="form-label">{labels.name}</label>
              <input id="name" name="name" className="rounded border px-sm py-xs" value={form.getValues('name') || ''} onChange={(e) => form.setValue('name', e.target.value, { shouldDirty: true })} aria-invalid={!!form.formState.errors.name} />
              {form.formState.errors.name ? <div className="form-error">{String(form.formState.errors.name.message)}</div> : null}
            </div>
            <div className="grid gap-xs">
              <label htmlFor="status" className="form-label">{labels.status}</label>
              <input id="status" name="status" className="rounded border px-sm py-xs" value={form.getValues('status') || ''} onChange={(e) => form.setValue('status', e.target.value, { shouldDirty: true })} />
            </div>
            <div className="grid gap-xs">
              <label htmlFor="starts_at" className="form-label">{labels.startsAt}</label>
              <input id="starts_at" name="starts_at" type="date" className="rounded border px-sm py-xs" value={form.getValues('starts_at')?.slice(0,10) || ''} onChange={(e) => form.setValue('starts_at', e.target.value || null, { shouldDirty: true })} />
            </div>
            <div className="form-helper">{form.formState.isDirty ? 'Unsaved changes will autosave…' : 'All changes saved'}</div>
          </form>
        )}

        {tab === 'comments' && (
          <div className="stack-sm">
            <form action={addComment} className="flex items-start gap-sm" aria-label="Add comment">
              <textarea name="body" className="min-h-16 w-full rounded border p-sm" placeholder="Write a comment…" />
              <Button variant="primary">Post</Button>
            </form>
            {loadingComments ? <div className="text-body-sm color-muted">Loading…</div> : (
              <ul className="stack-sm">
                {comments.map(c => (
                  <li key={c.id} className="rounded border p-sm">
                    <div className="text-body-sm whitespace-pre-wrap">{c.body}</div>
                    <div className="form-helper">{new Date(c.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="stack-sm text-body-sm">
            {loadingActivity ? 'Loading…' : (
              <ul className="stack-xs">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-md">
                    <div className="text-code form-helper">{new Date(a.occurred_at).toLocaleString()}</div>
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
