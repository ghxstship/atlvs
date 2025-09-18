'use client';

import { useEffect, useState } from 'react';

export default function AutoSeedOnFirstRun({ orgId }: { orgId: string }) {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');

  useEffect(() => {
    // Auto-seed once per browser if org is empty; guard with localStorage
    const key = `atlvs_demo_seeded_once_${orgId}`;
    if (localStorage.getItem(key)) return;
    let cancelled = false;
    (async () => {
      try {
        setStatus('running');
        const res = await fetch(`/api/organizations/${orgId}/demo`, { method: 'POST' });
        if (!res.ok) throw new Error('seed failed');
        if (!cancelled) {
          localStorage.setItem(key, '1');
          setStatus('done');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  return (
    <div aria-live="polite" className="sr-only">
      {status === 'running' ? 'Seeding demo data…' : status === 'done' ? 'Demo data ready.' : ''}
    </div>
  );
}
