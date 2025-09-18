'use client';

import { useEffect, useState } from 'react';
import { Drawer, Button } from '@ghxstship/ui';
import { Edit3, FileText, Activity as ActivityIcon, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

export default function OpenDeckVendorClient({ orgId, vendorId, open, onClose }: { orgId: string; vendorId: string | null; open: boolean; onClose: () => void }) {
  const t = useTranslations('opendeck');
  const sb = createBrowserClient();
  const [vendor, setVendor] = useState<any | null>(null);
  const [tab, setTab] = useState<'details' | 'edit' | 'comments' | 'activity'>('details');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; website?: string; contactEmail?: string; status: string }>({ name: '', website: '', contactEmail: '', status: 'active' });

  useEffect(() => {
    if (!open || !vendorId) return;
    (async () => {
      const res = await fetch(`/api/v1/marketplace/vendors?limit=1&offset=0`, { headers: { 'x-org-id': orgId } });
      const json = await res.json();
      const found = (json.items || []).find((v: any) => v.id === vendorId) || null;
      if (found) {
        setVendor(found);
        setForm({ name: found.name, website: found.website ?? '', contactEmail: found.contactEmail ?? '', status: found.status ?? 'active' });
      } else {
        setVendor(null);
      }
    })();
  }, [open, vendorId, orgId]);

  async function saveEdit() {
    if (!vendorId) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/v1/marketplace/vendors', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', 'x-org-id': orgId },
        body: JSON.stringify({ id: vendorId, ...form })
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Update failed');
      setMsg(t('updated'));
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('vendor.updated', { organization_id: orgId, vendor_id: vendorId });
      }
    } catch (e: any) {
      setMsg(e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  // Comments & Activity
  const [comments, setComments] = useState<Array<{ id: string; body: string; created_at: string }>>([]);
  const [activity, setActivity] = useState<Array<{ action: string; occurred_at: string }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (!open || !vendorId) return;
    (async () => {
      setLoadingComments(true);
      try {
        const { data } = await sb
          .from('comments')
          .select('id,body,created_at')
          .eq('organization_id', orgId)
          .eq('entity_type', 'vendor')
          .eq('entity_id', vendorId)
          .order('created_at', { ascending: false })
          .limit(50);
        setComments(data ?? []);
      } catch { setComments([]); }
      setLoadingComments(false);
    })();
  }, [open, vendorId, orgId, sb]);

  useEffect(() => {
    if (!open || !vendorId) return;
    (async () => {
      setLoadingActivity(true);
      try {
        const res = await fetch(`/api/audit/${orgId}/vendors/${vendorId}`);
        const json = await res.json();
        setActivity(json?.data ?? []);
      } catch { setActivity([]); }
      setLoadingActivity(false);
    })();
  }, [open, vendorId, orgId]);

  return (
    <Drawer open={open} onClose={onClose} title={vendor?.name || 'Vendor'} description={saving ? t('drawer.saving') : undefined} width="xl">
      {msg ? <div role="alert" className="mb-sm text-body-sm">{msg}</div> : null}
      <div className="flex items-center gap-sm border-b pb-sm mb-sm" role="tablist" aria-label={vendor?.name || 'Vendor'}>
        <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='details'?'bg-accent':''}`} onClick={() => setTab('details')} role="tab" aria-selected={tab==='details'}><FileText className="h-4 w-4" /> {t('drawer.details')}</button>
        <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='edit'?'bg-accent':''}`} onClick={() => setTab('edit')} role="tab" aria-selected={tab==='edit'}><Edit3 className="h-4 w-4" /> {t('drawer.edit')}</button>
        <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='comments'?'bg-accent':''}`} onClick={() => setTab('comments')} role="tab" aria-selected={tab==='comments'}><MessageSquare className="h-4 w-4" /> {t('drawer.comments')}</button>
        <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='activity'?'bg-accent':''}`} onClick={() => setTab('activity')} role="tab" aria-selected={tab==='activity'}><ActivityIcon className="h-4 w-4" /> {t('drawer.activity')}</button>
      </div>

      {tab === 'details' && vendor && (
        <div className="stack-sm text-body-sm">
          <div><span className="form-label">Name:</span> {vendor.name}</div>
          <div><span className="form-label">Website:</span> {vendor.website || '-'}</div>
          <div><span className="form-label">Email:</span> {vendor.contactEmail || '-'}</div>
          <div><span className="form-label">Status:</span> {vendor.status}</div>
        </div>
      )}

      {tab === 'edit' && vendor && (
        <form className="stack-sm" onSubmit={(e) => { e.preventDefault(); saveEdit(); }} aria-live="polite">
          <div className="grid gap-xs">
            <label htmlFor="name" className="text-body-sm">Name</label>
            <input id="name" className="rounded border px-sm py-xs" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-xs">
            <label htmlFor="website" className="text-body-sm">Website</label>
            <input id="website" className="rounded border px-sm py-xs" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div className="grid gap-xs">
            <label htmlFor="email" className="text-body-sm">Email</label>
            <input id="email" className="rounded border px-sm py-xs" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div className="grid gap-xs">
            <label htmlFor="status" className="text-body-sm">Status</label>
            <input id="status" className="rounded border px-sm py-xs" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          </div>
          <div className="flex items-center justify-end gap-sm pt-sm border-t">
            <Button variant="primary" disabled={saving}>{t('save')}</Button>
          </div>
        </form>
      )}

      {tab === 'comments' && (
        <div className="stack-sm text-body-sm">
          {loadingComments ? t('drawer.loading') : comments.length === 0 ? t('emptyComments') : (
            <ul className="stack-sm">
              {comments.map(c => (
                <li key={c.id} className="rounded border p-sm">
                  <div className="whitespace-pre-wrap">{c.body}</div>
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
  );
}
