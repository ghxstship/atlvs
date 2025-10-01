'use client';

import { Edit3, FileText, Activity as ActivityIcon, MessageSquare } from "lucide-react";
import { useEffect, useState } from 'react';
import { Button } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { tryCatch, reportError } from '@ghxstship/ui/utils/error-handling';
import { AppDrawer } from '@ghxstship/ui';

interface VendorProfileDrawerProps {
 orgId: string;
 vendorId: string | null;
 open: boolean;
 onClose: () => void;
}

export function VendorProfileDrawer({ orgId, vendorId, open, onClose }: VendorProfileDrawerProps) {
 const t = useTranslations('marketplace');
 const supabase = createBrowserClient();

 const [vendor, setVendor] = useState<any | null>(null);
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState<string | null>(null);
 const [form, setForm] = useState({
 name: '',
 website: '',
 contactEmail: '',
 status: 'active',
 });

 const [tabState, setTabState] = useState<'details' | 'edit' | 'comments' | 'activity'>('details');

 useEffect(() => {
 if (!open || !vendorId) return;

 (async () => {
 const responseResult = await tryCatch(async () =>
 fetch('/api/v1/vendors?limit=100', {
 headers: { 'x-org-id': orgId },
 })
 );

 if (!responseResult.success) {
 reportError(responseResult.error);
 setVendor(null);
 return;
 }

 const response = responseResult.data;
 const payload = await response.json();
 const found = (payload.vendors || []).find((entry: unknown) => entry.id === vendorId) ?? null;

 if (found) {
 setVendor(found);
 setForm({
 name: found.display_name ?? found.business_name ?? '',
 website: found.website ?? '',
 contactEmail: found.email ?? '',
 status: found.status ?? 'active',
 });
 } else {
 setVendor(null);
 }
 })();
 }, [open, vendorId, orgId]);

 async function handleSave() {
 if (!vendorId) return;

 setSaving(true);
 setMessage(null);

 try {
 const responseResult = await tryCatch(async () =>
 fetch('/api/v1/vendors', {
 method: 'PUT',
 headers: {
 'content-type': 'application/json',
 'x-org-id': orgId,
 },
 body: JSON.stringify({
 id: vendorId,
 display_name: form.name,
 website: form.website || null,
 email: form.contactEmail || null,
 status: form.status,
 }),
 })
 );

 if (!responseResult.success) {
 reportError(responseResult.error);
 throw responseResult.error;
 }

 const response = responseResult.data;
 if (!response.ok) {
 const payload = await response.json();
 throw new Error(payload?.error ?? 'Update failed');
 }

 setMessage(t('vendor.updated'));
 } catch (error) {
 setMessage(error instanceof Error ? error.message : 'Update failed');
 } finally {
 setSaving(false);
 }
 }

 const [comments, setComments] = useState<Array<{ id: string; body: string; created_at: string }>([]);
 const [activity, setActivity] = useState<Array<{ action: string; occurred_at: string }>([]);
 const [loadingComments, setLoadingComments] = useState(false);
 const [loadingActivity, setLoadingActivity] = useState(false);

 useEffect(() => {
 if (!open || !vendorId) return;

 (async () => {
 setLoadingComments(true);
 try {
 const { data } = await supabase
 .from('comments')
 .select('id, body, created_at')
 .eq('organization_id', orgId)
 .eq('entity_type', 'vendor')
 .eq('entity_id', vendorId)
 .order('created_at', { ascending: false })
 .limit(50);

 setComments(data ?? []);
 } catch {
 setComments([]);
 }
 setLoadingComments(false);
 })();
 }, [open, vendorId, orgId, supabase]);

 useEffect(() => {
 if (!open || !vendorId) return;

 (async () => {
 setLoadingActivity(true);
 try {
 const responseResult = await tryCatch(async () => fetch(`/api/audit/${orgId}/vendors/${vendorId}`));

 if (!responseResult.success) {
 reportError(responseResult.error);
 throw responseResult.error;
 }

 const response = responseResult.data;
 const payload = await response.json();
 setActivity(payload?.data ?? []);
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
 <FileText className="h-icon-xs w-icon-xs" />
 {t('vendor.drawer.details')}
 </span>
 ),
 content: vendor ? (
 <div className="stack-sm text-body-sm">
 {message ? (
 <div role="alert" className="mb-sm text-body-sm">
 {message}
 </div>
 ) : null}
 <div>
 <span className="form-label">{t('vendor.name')}:</span> {vendor.display_name || vendor.business_name}
 </div>
 <div>
 <span className="form-label">{t('vendor.website')}:</span> {vendor.website || '—'}
 </div>
 <div>
 <span className="form-label">{t('vendor.email')}:</span> {vendor.email || '—'}
 </div>
 <div>
 <span className="form-label">{t('vendor.status')}:</span> {vendor.status}
 </div>
 <div>
 <span className="form-label">{t('vendor.primaryCategory')}:</span> {vendor.primary_category || '—'}
 </div>
 </div>
 ) : null,
 },
 {
 key: 'edit',
 label: (
 <span className="flex items-center gap-xs">
 <Edit3 className="h-icon-xs w-icon-xs" />
 {t('vendor.drawer.edit')}
 </span>
 ),
 content: vendor ? (
 <form
 className="stack-sm"
 onSubmit={(event) => {
 event.preventDefault();
 void handleSave();
 }}
 >
 <div className="grid gap-xs">
 <label htmlFor="vendor-name" className="text-body-sm">
 {t('vendor.name')}
 </label>
 <input
 
 className="rounded border px-md py-xs"
 value={form.name}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, name: event.target.value }))}
 />
 </div>
 <div className="grid gap-xs">
 <label htmlFor="vendor-website" className="text-body-sm">
 {t('vendor.website')}
 </label>
 <input
 
 className="rounded border px-md py-xs"
 value={form.website}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, website: event.target.value }))}
 />
 </div>
 <div className="grid gap-xs">
 <label htmlFor="vendor-email" className="text-body-sm">
 {t('vendor.email')}
 </label>
 <input
 
 className="rounded border px-md py-xs"
 value={form.contactEmail}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, contactEmail: event.target.value }))}
 />
 </div>
 <div className="grid gap-xs">
 <label htmlFor="vendor-status" className="text-body-sm">
 {t('vendor.status')}
 </label>
 <select
 
 className="rounded border px-md py-xs"
 value={form.status}
 onChange={(event) => setForm((prev: unknown) => ({ ...prev, status: event.target.value }))}
 >
 <option value="active">{t('vendor.statusActive')}</option>
 <option value="pending">{t('vendor.statusPending')}</option>
 <option value="inactive">{t('vendor.statusInactive')}</option>
 </select>
 </div>
 <div className="flex items-center justify-end gap-sm pt-sm border-t">
 <Button variant="primary" disabled={saving} type="submit">
 {t('actions.save')}
 </Button>
 </div>
 </form>
 ) : null,
 },
 {
 key: 'comments',
 label: (
 <span className="flex items-center gap-xs">
 <MessageSquare className="h-icon-xs w-icon-xs" />
 {t('vendor.drawer.comments')}
 </span>
 ),
 content: (
 <div className="stack-sm text-body-sm">
 {loadingComments
 ? t('vendor.drawer.loading')
 : comments.length === 0
 ? t('vendor.drawer.emptyComments')
 : (
 <ul className="stack-sm">
 {comments.map((comment) => (
 <li key={comment.id} className="rounded border p-sm">
 <div className="whitespace-pre-wrap">{comment.body}</div>
 <div className="text-body-sm opacity-60">
 {new Date(comment.created_at).toLocaleString()}
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 ),
 },
 {
 key: 'activity',
 label: (
 <span className="flex items-center gap-xs">
 <ActivityIcon className="h-icon-xs w-icon-xs" />
 {t('vendor.drawer.activity')}
 </span>
 ),
 content: (
 <div className="stack-sm text-body-sm">
 {loadingActivity ? (
 t('vendor.drawer.loading')
 ) : (
 <ul className="stack-xs">
 {activity.map((entry, index) => (
 <li key={`${entry.action}-${index}`} className="flex items-center justify-between gap-md">
 <div className="font-mono text-body-sm opacity-70">
 {new Date(entry.occurred_at).toLocaleString()}
 </div>
 <div className="flex-1">{entry.action}</div>
 </li>
 ))}
 </ul>
 )}
 </div>
 ),
 },
 ];

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 record={vendor}
 mode="view"
 title={vendor?.display_name || vendor?.business_name || t('vendor.drawer.title')}
 fields={[]}
 tabs={tabs}
 activeTab={tabState}
 onTabChange={(key) => setTabState(key as typeof tabState)}
 />
 );
}
