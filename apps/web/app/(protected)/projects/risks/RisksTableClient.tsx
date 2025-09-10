'use client';

import { useEffect, useMemo, useState } from 'react';
import { Drawer, Button, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, FileText, Activity as ActivityIcon, MessageSquare, AlertTriangle } from 'lucide-react';

export type RiskRow = { 
  id: string; 
  title: string; 
  category: string; 
  impact: string; 
  probability: string; 
  status: string; 
  project_id: string | null;
  project?: { name: string };
};

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  impact: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  probability: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  status: z.enum(['identified', 'assessed', 'mitigated', 'accepted', 'closed']),
  description: z.string().optional(),
  mitigation: z.string().optional(),
});

export default function RisksTableClient({ rows, orgId }: { rows: RiskRow[]; orgId: string }) {
  const t = useTranslations('risks');
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
    values: current ? { 
      title: current.title, 
      category: current.category,
      impact: current.impact as any,
      probability: current.probability as any,
      status: current.status as any,
      description: '',
      mitigation: ''
    } : { 
      title: '', 
      category: '',
      impact: 'medium' as any,
      probability: 'medium' as any,
      status: 'identified' as any,
      description: '',
      mitigation: ''
    },
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
        .eq('entity_type', 'risk')
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
        const res = await fetch(`/api/audit/${orgId}/risks/${openId}`);
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
        if (info.name === 'category') patch.category = values.category;
        if (info.name === 'impact') patch.impact = values.impact;
        if (info.name === 'probability') patch.probability = values.probability;
        if (info.name === 'status') patch.status = values.status;
        if (info.name === 'description') patch.description = values.description;
        if (info.name === 'mitigation') patch.mitigation = values.mitigation;
        
        const { error: upErr } = await sb.from('risks').update(patch).eq('id', openId).eq('organization_id', orgId);
        if (upErr) throw upErr;
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture('risk.updated', { organization_id: orgId, risk_id: openId, keys: Object.keys(patch) });
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
    const { data, error: insErr } = await sb.from('comments').insert({ 
      organization_id: orgId, 
      entity_type: 'risk', 
      entity_id: openId, 
      body 
    }).select('id,body,created_at').maybeSingle();
    if (!insErr && data) setComments((prev: any) => [data, ...prev]);
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'very_high': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'very_low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'bg-red-100 text-red-800';
      case 'assessed': return 'bg-yellow-100 text-yellow-800';
      case 'mitigated': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="sticky top-0">
            <th className="border-b p-2 text-left">Risk</th>
            <th className="border-b p-2 text-left">Category</th>
            <th className="border-b p-2 text-left">Impact</th>
            <th className="border-b p-2 text-left">Probability</th>
            <th className="border-b p-2 text-left">Status</th>
            <th className="border-b p-2 text-left">Project</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-accent/20 cursor-pointer" onClick={() => { setOpenId(r.id); setTab('details'); }}>
              <td className="border-b p-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  {r.title}
                </div>
              </td>
              <td className="border-b p-2 capitalize">{r.category}</td>
              <td className="border-b p-2">
                <Badge className={getImpactColor(r.impact)}>
                  {r.impact.replace('_', ' ')}
                </Badge>
              </td>
              <td className="border-b p-2">
                <Badge className={getImpactColor(r.probability)}>
                  {r.probability.replace('_', ' ')}
                </Badge>
              </td>
              <td className="border-b p-2">
                <Badge className={getStatusColor(r.status)}>
                  {r.status}
                </Badge>
              </td>
              <td className="border-b p-2">{r.project?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Drawer
        open={!!openId}
        onClose={() => setOpenId(null)}
        title={current?.title || 'Risk Details'}
        description={saving ? 'Saving changes...' : undefined}
        width="xl"
      >
        <div className="flex items-center gap-2 border-b pb-2 mb-3" role="tablist">
          <button className={`inline-flex items-center gap-2 rounded px-2 py-1 text-sm ${tab==='details'?'bg-accent':''}`} onClick={() => setTab('details')} role="tab" aria-selected={tab==='details'}><FileText className="h-4 w-4" /> Details</button>
          <button className={`inline-flex items-center gap-2 rounded px-2 py-1 text-sm ${tab==='edit'?'bg-accent':''}`} onClick={() => setTab('edit')} role="tab" aria-selected={tab==='edit'}><Edit3 className="h-4 w-4" /> Edit</button>
          <button className={`inline-flex items-center gap-2 rounded px-2 py-1 text-sm ${tab==='comments'?'bg-accent':''}`} onClick={() => setTab('comments')} role="tab" aria-selected={tab==='comments'}><MessageSquare className="h-4 w-4" /> Comments</button>
          <button className={`inline-flex items-center gap-2 rounded px-2 py-1 text-sm ${tab==='activity'?'bg-accent':''}`} onClick={() => setTab('activity')} role="tab" aria-selected={tab==='activity'}><ActivityIcon className="h-4 w-4" /> Activity</button>
        </div>

        {error ? <div role="alert" className="mb-2 text-sm text-red-600">{error}</div> : null}

        {tab === 'details' && (
          <div className="space-y-3 text-sm">
            <div><span className="font-medium">Risk:</span> {current?.title}</div>
            <div><span className="font-medium">Category:</span> {current?.category}</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Impact:</span>
                <Badge className={getImpactColor(current?.impact || '')}>
                  {current?.impact?.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Probability:</span>
                <Badge className={getImpactColor(current?.probability || '')}>
                  {current?.probability?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge className={getStatusColor(current?.status || '')}>
                {current?.status}
              </Badge>
            </div>
            <div><span className="font-medium">Project:</span> {current?.project?.name || 'No project assigned'}</div>
          </div>
        )}

        {tab === 'edit' && current && (
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()} aria-live="polite">
            <div className="grid gap-1">
              <label htmlFor="title" className="text-sm font-medium">Risk Title</label>
              <input 
                id="title" 
                name="title" 
                className="rounded border px-2 py-1" 
                value={form.getValues('title') || ''} 
                onChange={(e) => form.setValue('title', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.title} 
              />
              {form.formState.errors.title ? <div className="text-xs text-red-600">{String(form.formState.errors.title.message)}</div> : null}
            </div>
            
            <div className="grid gap-1">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <select 
                id="category" 
                name="category" 
                className="rounded border px-2 py-1" 
                value={form.getValues('category') || ''} 
                onChange={(e) => form.setValue('category', e.target.value, { shouldDirty: true })}
              >
                <option value="">Select category</option>
                <option value="technical">Technical</option>
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
                <option value="strategic">Strategic</option>
                <option value="compliance">Compliance</option>
                <option value="security">Security</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <label htmlFor="impact" className="text-sm font-medium">Impact</label>
                <select 
                  id="impact" 
                  name="impact" 
                  className="rounded border px-2 py-1" 
                  value={form.getValues('impact') || ''} 
                  onChange={(e) => form.setValue('impact', e.target.value as any, { shouldDirty: true })}
                >
                  <option value="very_low">Very Low</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="very_high">Very High</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label htmlFor="probability" className="text-sm font-medium">Probability</label>
                <select 
                  id="probability" 
                  name="probability" 
                  className="rounded border px-2 py-1" 
                  value={form.getValues('probability') || ''} 
                  onChange={(e) => form.setValue('probability', e.target.value as any, { shouldDirty: true })}
                >
                  <option value="very_low">Very Low</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="very_high">Very High</option>
                </select>
              </div>
            </div>

            <div className="grid gap-1">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select 
                id="status" 
                name="status" 
                className="rounded border px-2 py-1" 
                value={form.getValues('status') || ''} 
                onChange={(e) => form.setValue('status', e.target.value as any, { shouldDirty: true })}
              >
                <option value="identified">Identified</option>
                <option value="assessed">Assessed</option>
                <option value="mitigated">Mitigated</option>
                <option value="accepted">Accepted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="text-xs opacity-70">{form.formState.isDirty ? 'Unsaved changes' : 'All changes saved'}</div>
          </form>
        )}

        {tab === 'comments' && (
          <div className="space-y-3">
            <form action={addComment} className="flex items-start gap-2">
              <textarea name="body" className="min-h-16 w-full rounded border p-2" placeholder="Add a comment..." />
              <Button type="submit" variant="primary">Post</Button>
            </form>
            {loadingComments ? <div className="text-sm opacity-70">Loading comments...</div> : (
              <ul className="space-y-2">
                {comments.map(c => (
                  <li key={c.id} className="rounded border p-2">
                    <div className="text-sm whitespace-pre-wrap">{c.body}</div>
                    <div className="text-xs opacity-60">{new Date(c.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="space-y-2 text-sm">
            {loadingActivity ? 'Loading activity...' : (
              <ul className="space-y-1">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-4">
                    <div className="font-mono text-xs opacity-70">{new Date(a.occurred_at).toLocaleString()}</div>
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
