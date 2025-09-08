"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@ghxstship/ui';

type OrgDomain = { id: string; domain: string; status: string; created_at: string };

export default function DomainsClient({ orgId, role, suggest }: { orgId: string; role?: string; suggest?: string }) {
  const [domains, setDomains] = useState<OrgDomain[]>([]);
  const [newDomain, setNewDomain] = useState(suggest ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canManage = role === 'owner' || role === 'admin';
  const router = useRouter();
  const searchParams = useSearchParams();

  async function fetchDomains() {
    setError(null);
    const res = await fetch(`/api/organizations/${orgId}/domains`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) return setError(data?.error || 'Failed to load domains');
    setDomains(data.domains || []);
  }

  useEffect(() => { fetchDomains(); }, [orgId]);

  async function addDomain() {
    if (!newDomain) return;
    setLoading(true); setError(null);
    const optimistic: OrgDomain = { id: `tmp-${Date.now()}`, domain: newDomain, status: 'pending', created_at: new Date().toISOString() };
    setDomains((prev) => [optimistic, ...prev]);
    try {
      const res = await fetch(`/api/organizations/${orgId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to add');
      setNewDomain('');
      await fetchDomains();
      // If this add came from a suggest param, clear it from the URL to avoid repeated focus/prefill
      if (searchParams.get('suggest')) {
        router.replace('/settings/organization/domains');
      }
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
      setDomains((prev) => prev.filter((d) => d.id !== optimistic.id));
    } finally {
      setLoading(false);
    }
  }

  async function removeDomain(id: string) {
    setLoading(true); setError(null);
    const prev = domains;
    setDomains((cur) => cur.filter((d) => d.id !== id));
    try {
      const res = await fetch(`/api/organizations/${orgId}/domains`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to delete');
      // success: no-op, optimistic state already removed
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
      setDomains(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="flex gap-2">
          <input value={newDomain} onChange={(e: any) => setNewDomain(e.target.value)} placeholder="company.com" autoFocus={Boolean(suggest)} className="w-full h-10 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          <Button onClick={addDomain} disabled={loading || !newDomain}>Add</Button>
        </div>
      ) : (
        <div className="text-xs text-foreground/60">Only owners and admins can manage organization domains.</div>
      )}
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="px-3 py-2 text-left">Domain</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-3 py-2">{d.domain}</td>
                <td className="px-3 py-2">
                  <span className={
                    `inline-flex items-center rounded-full px-2 py-0.5 text-xs ` +
                    (d.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                     d.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                     'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300')
                  }>
                    {d.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button variant="outline" size="sm" onClick={() => removeDomain(d.id)} disabled={loading || !canManage}>Remove</Button>
                </td>
              </tr>
            ))}
            {domains.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-foreground/60" colSpan={3}>No domains. Add your company email domain(s) to allow unlimited seats on Team plans.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
