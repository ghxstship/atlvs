'use client';




import { useEffect, useMemo, useState } from 'react';
import { Drawer, Button } from '@ghxstship/ui';
import { Edit3, FileText, Activity as ActivityIcon, MessageSquare, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import OpenDeckVendorClient from './OpenDeckVendorClient';
import { createBrowserClient } from '@ghxstship/auth';

export default function OpenDeckClient({ orgId }: { orgId: string }) {
  const t = useTranslations('opendeck');
  const [rows, setRows] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<'details' | 'edit' | 'comments' | 'activity'>('details');
  const current = rows.find(r => r.id === openId) || null;

  const [form, setForm] = useState<{ title: string; description?: string; price: number; currency: string; status: string; vendorId?: string }>({ title: '', description: '', price: 0, currency: 'USD', status: 'draft', vendorId: undefined });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([]);
  const [vendorDrawerOpen, setVendorDrawerOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/marketplace/listings?limit=50`, { headers: { 'x-org-id': orgId } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load');
      setRows(json.items ?? []);
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [orgId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/v1/marketplace/vendors?limit=100`, { headers: { 'x-org-id': orgId } });
        const json = await res.json();
        setVendors(json.items ?? []);
      } catch {}
    })();
  }, [orgId]);

  function openVendorDrawer(vendorId: string) {
    setSelectedVendorId(vendorId);
    setVendorDrawerOpen(true);
  }

  function onOpen(id: string) {
    setOpenId(id);
    const r = rows.find(x => x.id === id);
    if (r) setForm({ title: r.title, description: r.description ?? '', price: Number(r.price), currency: r.currency ?? 'USD', status: r.status ?? 'draft', vendorId: r.vendorId ?? r.vendor_id ?? undefined });
  }

  async function saveEdit() {
    if (!openId) return;
    setSaving(true);
    setMsg(null);
    try {
      // optimistic update
      const prev = rows.slice();
      const idx = rows.findIndex(r => r.id === openId);
      if (idx >= 0) {
        const updated = { ...rows[idx], ...form };
        setRows([...rows.slice(0, idx), updated, ...rows.slice(idx + 1)]);
      }
      const res = await fetch('/api/v1/marketplace/listings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', 'x-org-id': orgId },
        body: JSON.stringify({ id: openId, ...form })
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Update failed');
      setMsg(t('updated'));
    } catch (e) {
      setMsg(e?.message || 'Update failed');
      // reload to rollback
      load();
    } finally {
      setSaving(false);
    }
  }

  async function createNew() {
    setBusy(true);
    setMsg(null);
    try {
      const payload = { title: t('demo.title'), description: t('demo.description'), price: 1500, currency: 'USD', status: 'active' };
      const res = await fetch('/api/v1/marketplace/listings', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-org-id': orgId },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Create failed');
      setRows([json.listing, ...rows]);
      setOpenId(json.listing.id);
      setTab('details');
    } catch (e) {
      setMsg(e?.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  // Comments & Activity
  const [comments, setComments] = useState<Array<{ id: string; body: string; created_at: string }>>([]);
  const [activity, setActivity] = useState<Array<{ action: string; occurred_at: string }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (!openId) return;
    const sb = createBrowserClient();
    (async () => {
      setLoadingComments(true);
      try {
        const { data } = await sb
          .from('comments')
          .select('id,body,created_at')
          .eq('organization_id', orgId)
          .eq('entity_type', 'listing')
          .eq('entity_id', openId)
          .order('created_at', { ascending: false })
          .limit(50);
        setComments(data ?? []);
      } catch {
        setComments([]);
      }
      setLoadingComments(false);
    })();
  }, [openId, orgId]);

  useEffect(() => {
    if (!openId) return;
    (async () => {
      setLoadingActivity(true);
      try {
        const res = await fetch(`/api/audit/${orgId}/listings/${openId}`);
        const json = await res.json();
        setActivity(json?.data ?? []);
      } catch { setActivity([]); }
      setLoadingActivity(false);
    })();
  }, [openId, orgId]);

  const hasData = rows.length > 0;

  return (
    <div className="brand-opendeck stack-sm">
      <div className="brand-opendeck flex items-center justify-between">
        <div className="brand-opendeck text-body-sm opacity-70">
          {loading ? t('loading') : error ? <span className="color-destructive">{error}</span> : ''}
        </div>
        <div className="brand-opendeck flex items-center gap-sm">
          <Button onClick={createNew} disabled={busy} aria-label={t('create')} title={t('create')}>
            <Plus className="mr-xs h-4 w-4" /> {t('create')}
          </Button>
          <Button onClick={load}>{t('refresh')}</Button>
        </div>
      </div>

      <div className="brand-opendeck overflow-x-auto">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="sticky top-0">
              <th className="border-b p-sm text-left">{t('grid.title')}</th>
              <th className="border-b p-sm text-left">{t('grid.price')}</th>
              <th className="border-b p-sm text-left">{t('grid.status')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="hover:bg-accent/20 cursor-pointer" onClick={() => onOpen(r.id)}>
                <td className="border-b p-sm">{r.title}</td>
                <td className="border-b p-sm">{r.display?.priceFormatted || `${r.price} ${r.currency}`}</td>
                <td className="border-b p-sm capitalize">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!openId}
        onClose={() => setOpenId(null)}
        title={current?.title || t('title')}
        description={saving ? t('drawer.saving') : undefined}
        width="xl"
      >
        {msg ? <div role="alert" className="mb-sm text-body-sm">{msg}</div> : null}
        <div className="flex items-center gap-sm border-b pb-sm mb-sm" role="tablist" aria-label={t('title')}>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='details'?'bg-accent':''}`} onClick={() => setTab('details')} role="tab" aria-selected={tab==='details'}><FileText className="h-4 w-4" /> {t('drawer.details')}</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='edit'?'bg-accent':''}`} onClick={() => setTab('edit')} role="tab" aria-selected={tab==='edit'}><Edit3 className="h-4 w-4" /> {t('drawer.edit')}</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='comments'?'bg-accent':''}`} onClick={() => setTab('comments')} role="tab" aria-selected={tab==='comments'}><MessageSquare className="h-4 w-4" /> {t('drawer.comments')}</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='activity'?'bg-accent':''}`} onClick={() => setTab('activity')} role="tab" aria-selected={tab==='activity'}><ActivityIcon className="h-4 w-4" /> {t('drawer.activity')}</button>
        </div>

        {tab === 'details' && current && (
          <div className="brand-opendeck stack-sm text-body-sm">
            <div><span className="form-label">{t('grid.title')}:</span> {current.title}</div>
            <div><span className="form-label">{t('grid.price')}:</span> {current.display?.priceFormatted || `${current.price} ${current.currency}`}</div>
            <div><span className="form-label">{t('grid.status')}:</span> {current.status}</div>
            <div>
              <span className="form-label">{t('grid.vendor')}:</span> 
              {(() => {
                const vendorId = current.vendorId ?? current.vendor_id;
                const vendor = vendors.find(v => v.id === vendorId);
                return vendor ? (
                  <button 
                    className="ml-xs color-accent hover:underline" 
                    onClick={() => openVendorDrawer(vendor.id)}
                    aria-label={`View vendor ${vendor.name}`}
                  >
                    {vendor.name}
                  </button>
                ) : t('noVendor');
              })()}
            </div>
            {current.description ? <div className="brand-opendeck mt-sm whitespace-pre-wrap">{current.description}</div> : null}
          </div>
        )}

        {tab === 'edit' && current && (
          <form className="stack-sm" onSubmit={(e: any) => { e.preventDefault(); saveEdit(); }} aria-live="polite">
            <div className="brand-opendeck grid gap-xs">
              <label htmlFor="title" className="text-body-sm">{t('grid.title')}</label>
              <input id="title" className="rounded border  px-md py-xs" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="brand-opendeck grid gap-xs">
              <label htmlFor="price" className="text-body-sm">{t('grid.price')}</label>
              <input id="price" type="number" step="0.01" className="rounded border  px-md py-xs" value={form.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="brand-opendeck grid gap-xs">
              <label htmlFor="status" className="text-body-sm">{t('grid.status')}</label>
              <input id="status" className="rounded border  px-md py-xs" value={form.status} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, status: e.target.value })} />
            </div>
            <div className="brand-opendeck grid gap-xs">
              <label htmlFor="vendor" className="text-body-sm">{t('grid.vendor')}</label>
              <select id="vendor" className="rounded border  px-md py-xs" value={form.vendorId || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, vendorId: e.target.value || undefined })}>
                <option value="">{t('noVendor')}</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="brand-opendeck grid gap-xs">
              <label htmlFor="description" className="text-body-sm">{t('grid.description')}</label>
              <textarea id="description" className="min-h-24 rounded border p-sm" value={form.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="brand-opendeck flex items-center justify-end gap-sm pt-sm border-t">
              <Button type="submit" variant="default" disabled={saving}>{t('save')}</Button>
            </div>
          </form>
        )}

        {tab === 'comments' && (
          <div className="brand-opendeck stack-sm text-body-sm">
            {loadingComments ? t('drawer.loading') : comments.length === 0 ? t('emptyComments') : (
              <ul className="stack-sm">
                {comments.map(c => (
                  <li key={c.id} className="rounded border p-sm">
                    <div className="brand-opendeck whitespace-pre-wrap">{c.body}</div>
                    <div className="brand-opendeck text-body-sm opacity-60">{new Date(c.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="brand-opendeck stack-sm text-body-sm">
            {loadingActivity ? t('drawer.loading') : (
              <ul className="stack-xs">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-md">
                    <div className="brand-opendeck font-mono text-body-sm opacity-70">{new Date(a.occurred_at).toLocaleString()}</div>
                    <div className="brand-opendeck flex-1">{a.action}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Drawer>

      <OpenDeckVendorClient 
        orgId={orgId} 
        vendorId={selectedVendorId} 
        open={vendorDrawerOpen} 
        onClose={() => setVendorDrawerOpen(false)} 
      />
    </div>
  );
}
