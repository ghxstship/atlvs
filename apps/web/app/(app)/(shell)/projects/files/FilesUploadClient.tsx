'use client';

import { useState, useRef } from 'react';
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 25MB) and basic mime
    if (file.size > 25 * 1024 * 1024) {
      setError(t('upload.tooLarge'));
      e.target.value = '';
      return;
    }
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowed.includes(file.type)) {
      setError(t('upload.unsupported'));
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const sb = createBrowserClient();
      const clean = sanitizeFilename(file.name);
      const path = `${orgId}/${Date.now()}_${clean}`;

      const { error: upErr } = await sb.storage
        .from('attachments')
        .upload(path, file, { upsert: false, cacheControl: '3600' });
      if (upErr) throw upErr;

      // Insert linkage row
      const { data: inserted, error: insErr } = await sb.from('files').insert({
        organization_id: orgId,
        name: clean,
        path,
        mime_type: file.type,
        size: file.size,
      }).select('id').maybeSingle();
      if (insErr) throw insErr;

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('file.uploaded', {
          organization_id: orgId,
          file_id: inserted?.id,
          path,
          mime: file.type,
          size: file.size
        });
      }

      // Notification for the current user
      await sb.from('user_notifications').insert({
        organization_id: orgId,
        title: t('upload.cta'),
        body: `${clean} uploaded successfully`,
        href: '/projects/files'
      });

      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } catch (e: any) {
      setError(e?.message || t('upload.error'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-sm">
      <label className="inline-flex items-center gap-sm rounded-md border px-sm py-sm text-body-sm hover:bg-accent cursor-pointer">
        <span>{uploading ? t('upload.uploading') : t('upload.cta')}</span>
        <input
          ref={inputRef}
          type="file"
          onChange={onChange}
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
