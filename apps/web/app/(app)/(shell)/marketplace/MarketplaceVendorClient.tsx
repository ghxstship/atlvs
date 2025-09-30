'use client';

import { Edit3, FileText, Activity as ActivityIcon, MessageSquare } from "lucide-react";
import { useEffect, useState } from 'react';
import { Button } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { tryCatch, Result, reportError } from '@ghxstship/ui/utils/error-handling';
import { AppDrawer } from '@ghxstship/ui';

export default function OpenDeckVendorClient({ orgId, vendorId, open, onClose }: { orgId: string; vendorId: string | null; open: boolean; onClose: () => void }): JSX.Element | null {
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
 const resResult = await tryCatch(async () => fetch(`/api/v1/marketplace/vendors?limit=1&offset=0`, { headers: { 'x-org-id': orgId } }));
if (!resResult.success) {
 reportError(resResult.error);
 throw new Error(resResult.error.message);
}
const res = resResult.data;
 const json = await res.json();
 const found = (json.items || []).find((v: unknown) => v.id === vendorId) || null;
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
 const resResult = await tryCatch(async () => fetch('/api/v1/marketplace/vendors', {
 method: 'PATCH',
 headers: { 'content-type': 'application/json', 'x-org-id': orgId },
 body: JSON.stringify({ id: vendorId, ...form })
 }));
 
 if (!resResult.success) {
 reportError(resResult.error);
 throw new Error(resResult.error.message);
 }
 
 const res = resResult.data;
 if (!res.ok) throw new Error((await res.json())?.error || 'Update failed');
 setMsg(t('updated'));
 if (typeof window !== 'undefined' && (window as unknown).posthog) {
 (window as unknown).posthog.capture('vendor.updated', { organization_id: orgId, vendor_id: vendorId });
 }
 } catch (e) {
 setMsg((e as Error)?.message || 'Update failed');
 } finally {
 setSaving(false);
 }
 }

 // Comments & Activity
 const [comments, setComments] = useState<Array<{ id: string; body: string; created_at: string }>([]);
 const [activity, setActivity] = useState<Array<{ action: string; occurred_at: string }>([]);
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
 const resResult = await tryCatch(async () => fetch(`/api/audit/${orgId}/vendors/${vendorId}`));
 
 if (!resResult.success) {
 reportError(resResult.error);
 throw new Error(resResult.error.message);
 }
 
 const res = resResult.data;
 const json = await res.json();
 setActivity(json?.data ?? []);
 } catch { 
 setActivity([]); 
 }
 setLoadingActivity(false);
 })();
 }, [open, vendorId, orgId]);

 if (!open) return null;

 const tabs = [
 {
 key: 'details',
 label: (
 <span className="flex items-center gap-xs">
 <FileText className="h-4 w-4" />
 {t('drawer.details')}
 </span>
 ),
 content: vendor ? (
 <div className="brand-marketplace stack-sm text-body-sm">
 {msg ? <div role="alert" className="mb-sm text-body-sm">{msg}</div> : null}
 <div><span className="form-label">Name:</span> {vendor.name}</div>
 <div><span className="form-label">Website:</span> {vendor.website || '-'}</div>
 <div><span className="form-label">Email:</span> {vendor.contactEmail || '-'}</div>
 <div><span className="form-label">Status:</span> {vendor.status}</div>
 </div>
 ) : null
 },
 {
 key: 'edit',
 label: (
 <span className="flex items-center gap-xs">
 <Edit3 className="h-4 w-4" />
 {t('drawer.edit')}
 </span>
 ),
 content: vendor ? (
 <form className="stack-sm" onSubmit={(e: unknown) => { e.preventDefault(); saveEdit(); }} aria-live="polite">
 <div className="brand-marketplace grid gap-xs">
 <label htmlFor="name" className="text-body-sm">Name</label>
 <input className="rounded border px-md py-xs" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} />
 </div>
 <div className="brand-marketplace grid gap-xs">
 <label htmlFor="website" className="text-body-sm">Website</label>
 <input className="rounded border px-md py-xs" value={form.website} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, website: e.target.value })} />
 </div>
 <div className="brand-marketplace grid gap-xs">
 <label htmlFor="email" className="text-body-sm">Email</label>
 <input className="rounded border px-md py-xs" value={form.contactEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, contactEmail: e.target.value })} />
 </div>
 <div className="brand-marketplace grid gap-xs">
 <label htmlFor="status" className="text-body-sm">Status</label>
 <input className="rounded border px-md py-xs" value={form.status} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, status: e.target.value })} />
 </div>
 <div className="brand-marketplace flex items-center justify-end gap-sm pt-sm border-t">
 <Button variant="primary" disabled={saving}>{t('save')}</Button>
 </div>
 </form>
 ) : null
 },
 {
 key: 'comments',
 label: (
 <span className="flex items-center gap-xs">
 <MessageSquare className="h-4 w-4" />
 {t('drawer.comments')}
 </span>
 ),
 content: (
 <div className="brand-marketplace stack-sm text-body-sm">
 {loadingComments ? t('drawer.loading') : comments.length === 0 ? t('emptyComments') : (
 <ul className="stack-sm">
 {comments.map(c => (
 <li key={c.id} className="rounded border p-sm">
 <div className="brand-marketplace whitespace-pre-wrap">{c.body}</div>
 <div className="brand-marketplace text-body-sm opacity-60">{new Date(c.created_at).toLocaleString()}</div>
 </li>
 ))}
 </ul>
 )}
 </div>
 )
 },
 {
 key: 'activity',
 label: (
 <span className="flex items-center gap-xs">
 <ActivityIcon className="h-4 w-4" />
 {t('drawer.activity')}
 </span>
 ),
 content: (
 <div className="brand-marketplace stack-sm text-body-sm">
 {loadingActivity ? t('drawer.loading') : (
 <ul className="stack-xs">
 {activity.map((a, i) => (
 <li key={i} className="flex items-center justify-between gap-md">
 <div className="brand-marketplace font-mono text-body-sm opacity-70">{new Date(a.occurred_at).toLocaleString()}</div>
 <div className="brand-marketplace flex-1">{a.action}</div>
 </li>
 ))}
 </ul>
 )}
 </div>
 )
 }
 ];

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 record={vendor}
 mode="view"
 title={vendor?.name || 'Vendor'}
 fields={[]}
 tabs={tabs}
 />
 );
}
