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
    setDomains((prev: any) => [optimistic, ...prev]);
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
      setDomains((prev: OrgDomain[]) => prev.filter((d: OrgDomain) => d.id !== optimistic.id));
    } finally {
      setLoading(false);
    }
  }

  async function removeDomain(id: string) {
    setLoading(true); setError(null);
    const prev = domains;
    setDomains((cur: OrgDomain[]) => cur.filter((d: OrgDomain) => d.id !== id));
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
      setDomains((prev: any) => prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="flex gap-2">
          <Button onClick={addDomain} disabled={loading || !newDomain}>Add</Button>
        </div>
      ) : (
        <div className="text-body-sm color-foreground/60">Only owners and admins can manage organization domains.</div>
      )}
      {error ? <div className="text-body-sm color-destructive">{error}</div> : null}
      <div className="rounded-md border">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="bg-secondary/40">
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
                    `inline-flex items-center rounded-full px-2 py-0.5 text-body-sm ` +
                    (d.status === 'active' ? 'bg-success/10 color-success' :
                     d.status === 'pending' ? 'bg-warning/10 color-warning' :
                     'bg-secondary/10 color-muted')
                  }>
                    {d.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button onClick={() => removeDomain(d.id)} disabled={loading || !canManage}>Remove</Button>
                </td>
              </tr>
            ))}
            {domains.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center color-foreground/60" colSpan={3}>No domains. Add your company email domain(s) to allow unlimited seats on Team plans.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
