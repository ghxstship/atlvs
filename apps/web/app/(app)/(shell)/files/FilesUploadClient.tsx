'use client';


import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

function sanitizeFilename(name: string) {
 return name
 .normalize('NFKD')
 .replace(/[\u0300-\u036f]/g, '')
 .replace(/[^a-zA-Z0-9._-]/g, '_')
 .replace(/_{2,}/g, '_')
 .slice(0, 120);
}

export default function FilesUploadClient({ orgId }: { orgId: string }) {
 const t = useTranslations('files');
 const router = useRouter();
 const supabase = useMemo(() => createBrowserClient(), []);
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const inputRef = useRef<HTMLInputElement | null>(null);

 const handleFileChange = useCallback(
 async (event: ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (!file) {
 return;
 }

 if (file.size > 25 * 1024 * 1024) {
 setError(t('upload.tooLarge'));
 event.target.value = '';
 return;
 }

 const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
 if (!allowed.includes(file.type)) {
 setError(t('upload.unsupported'));
 event.target.value = '';
 return;
 }

 setUploading(true);
 setError(null);

 try {
 const clean = sanitizeFilename(file.name);
 const path = `${orgId}/${Date.now()}_${clean}`;

 const { error: uploadError } = await supabase.storage
 .from('attachments')
 .upload(path, file, { upsert: false, cacheControl: '3600' });

 if (uploadError) {
 throw uploadError;
 }

 const { data: inserted, error: insertError } = await supabase
 .from('files')
 .insert({
 organization_id: orgId,
 name: clean,
 path,
 mime_type: file.type,
 size: file.size,
 })
 .select('id')
 .maybeSingle();

 if (insertError) {
 throw insertError;
 }

 if (typeof window !== 'undefined' && (window as unknown).posthog) {
 (window as unknown).posthog.capture('file.uploaded', {
 organization_id: orgId,
 file_id: inserted?.id,
 path,
 mime: file.type,
 size: file.size,
 });
 }

 await supabase.from('user_notifications').insert({
 organization_id: orgId,
 title: t('upload.cta'),
 body: `${clean} uploaded successfully`,
 href: '/projects/files',
 });

 if (inputRef.current) {
 inputRef.current.value = '';
 }

 router.refresh();
 } catch (uploadException) {
 const message = uploadException instanceof Error ? uploadException.message : t('upload.error');
 setError(message);
 } finally {
 setUploading(false);
 }
 },
 [orgId, router, supabase, t]
 );

 return (
 <div className="flex flex-col items-end gap-sm">
 <label className="inline-flex items-center gap-sm rounded-md border px-md py-sm text-body-sm hover:bg-accent cursor-pointer">
 <span>{uploading ? t('upload.uploading') : t('upload.cta')}</span>
 <input
 ref={inputRef}
 type="file"
 onChange={handleFileChange}
 accept="image/jpeg,image/png,image/webp,application/pdf"
 className="hidden"
 aria-label={t('upload.cta')}
 title={t('upload.cta')}
 disabled={uploading}
 />
 </label>
 {error ? (
 <div role="alert" className="text-body-sm color-destructive">
 {error}
 </div>
 ) : null}
 </div>
 );
}
