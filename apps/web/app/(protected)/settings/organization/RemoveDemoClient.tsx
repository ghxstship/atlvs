'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function RemoveDemoClient({ orgId }: { orgId: string }) {
  const t = useTranslations('settingsOrg');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRemoveDemo() {
    if (!confirm(t('remove.confirm'))) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/demo/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Request failed');
      router.refresh();
    } catch (e: any) {
      setError(e?.message || t('remove.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onRemoveDemo}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md border border-red-300 text-red-700 px-3 py-2 text-sm hover:bg-red-50 disabled:opacity-50"
        aria-busy={loading}
        aria-live="polite"
        aria-label={t('remove.cta')}
        title={t('remove.cta')}
      >
        {loading ? t('remove.loading') : t('remove.cta')}
      </button>
      {error ? (
        <div role="alert" className="text-sm text-red-600">
          {error}
        </div>
      ) : null}
    </div>
  );
}
