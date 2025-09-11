"use client";

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@ghxstship/ui';
import Link from 'next/link';

const ROLES = ['viewer', 'contributor', 'manager', 'admin'] as const;

type Invite = { id: string; email: string; role: string; status: string; created_at: string };

type Props = { orgId: string; role?: string };

export default function InviteMemberClient({ orgId, role }: Props) {
  const canManage = role === 'owner' || role === 'admin';
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<typeof ROLES[number]>('contributor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [usage, setUsage] = useState<{ seat_policy: string; seats_limit: number | null; active_count: number } | null>(null);
  const [domains, setDomains] = useState<Array<{ id: string; domain: string; status: string }>>([]);
  const [bulkText, setBulkText] = useState('');
  const [bulkRole, setBulkRole] = useState<typeof ROLES[number]>('contributor');

  const validEmail = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const emailDomain = useMemo(() => {
    const m = email.toLowerCase().match(/@([a-z0-9.-]+\.[a-z]{2,})$/i);
    return m ? m[1] : '';
  }, [email]);
  const domainRecord = useMemo(() => domains.find((d) => d.domain === emailDomain), [domains, emailDomain]);

  async function fetchInvites() {
    setError(null);
    const res = await fetch(`/api/organizations/${orgId}/invites`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) return setError(data?.error || 'Failed to load invites');
    setInvites(data.invites || []);
  }

  async function fetchUsage() {
    const res = await fetch(`/api/organizations/${orgId}/memberships/usage`, { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) setUsage(data);
  }

  async function fetchDomains() {
    const res = await fetch(`/api/organizations/${orgId}/domains`, { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) setDomains(data.domains || []);
  }

  useEffect(() => {
    fetchInvites();
    fetchUsage();
    fetchDomains();
  }, [orgId]);

  async function submit(mode: 'invite' | 'addExisting') {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: inviteRole, mode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setResult(mode === 'invite' ? `Invite sent to ${data?.email || email}` : 'Member added');
      setEmail('');
      await Promise.all([fetchInvites(), fetchUsage()]);
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function resendInvite(id: string) {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'resend' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to resend');
      setResult('Invite resent');
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function revokeInvite(id: string) {
    setLoading(true); setError(null); setResult(null);
    const prev = invites;
    setInvites(prev.map((i) => (i.id === id ? { ...i, status: 'revoked' } : i)));
    try {
      const res = await fetch(`/api/organizations/${orgId}/invites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to revoke');
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
      setInvites((prev: any) => prev);
    } finally {
      setLoading(false);
    }
  }

  function parseBulk(text: string): string[] {
    return Array.from(new Set(
      text
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter((s) => /.+@.+\..+/.test(s))
    ));
  }

  async function submitBulk() {
    const emails = parseBulk(bulkText);
    if (emails.length === 0) return;
    setLoading(true); setError(null); setResult(null);
    let success = 0; let failed = 0;
    for (const e of emails) {
      try {
        const res = await fetch(`/api/organizations/${orgId}/memberships`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: e, role: bulkRole, mode: 'invite' })
        });
        if (!res.ok) failed++; else success++;
      } catch {
        failed++;
      }
    }
    await Promise.all([fetchInvites(), fetchUsage()]);
    setLoading(false);
    setResult(`Bulk invites complete: ${success} sent, ${failed} failed`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-muted/30 p-3 text-sm">
        {usage ? (
          usage.seat_policy === 'domain-unlimited' ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Seat policy:</span> Domain-unlimited
              </div>
              <div className="text-foreground/70">Active members: {usage.active_count}</div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Seat policy:</span> Per-user
              </div>
              <div className="text-foreground/70">
                Active members: {usage.active_count}{usage.seats_limit != null ? ` / ${usage.seats_limit}` : ''}
              </div>
            </div>
          )
        ) : (
          <div className="text-foreground/60">Loading seat usage…</div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm text-foreground/70">
          Invite teammates by email. Team plan supports unlimited seats for emails matching your active organization domains.
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
          />
          <select
            value={inviteRole}
            onChange={(e: any) => setInviteRole(e.target.value)}
            className="h-10 rounded-md border bg-background px-2 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {canManage ? (
            <div className="flex gap-2">
              <Button onClick={() => submit('invite')} disabled={loading || !validEmail}>Invite</Button>
              <Button variant="outline" onClick={() => submit('addExisting')} disabled={loading || !validEmail}>Add Existing</Button>
            </div>
          ) : (
            <div className="text-xs text-foreground/60">Only owners and admins can send invites.</div>
          )}
        </div>
        {emailDomain ? (
          <div className="text-xs flex items-center gap-2">
            {domainRecord && domainRecord.status === 'active' ? (
              <span className="text-success">Domain matches active organization domain — seat not counted.</span>
            ) : domainRecord && domainRecord.status === 'pending' ? (
              <span className="text-warning">Domain is pending verification — may not count toward domain-unlimited yet.</span>
            ) : (
              <>
                <span className="text-foreground/60">External domain — will count against seat limit if enforced.</span>
                <Link
                  href={{ pathname: '/settings/organization/domains', query: emailDomain ? { suggest: emailDomain  as any} : {} }}
                  title="Add your organization email domain(s). When seat policy is domain-unlimited, invites matching active domains do not consume seats."
                  className="inline-flex items-center rounded-md border px-2 py-1 text-[11px] hover:bg-muted/50"
                >
                  Manage domains
                </Link>
              </>
            )}
          </div>
        ) : null}
        {error ? <div className="text-xs text-destructive">{error}</div> : null}
        {result ? <div className="text-xs text-success">{result}</div> : null}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Bulk invites</div>
        <div className="text-xs text-foreground/70">Paste a list of emails (comma, space, or newline separated).</div>
        <textarea
          value={bulkText}
          onChange={(e: any) => setBulkText(e.target.value)}
          rows={4}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="user1@company.com, user2@company.com\nuser3@other.com"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/60">Role for all:</span>
          <select
            value={bulkRole}
            onChange={(e: any) => setBulkRole(e.target.value)}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <Button onClick={submitBulk} disabled={loading || parseBulk(bulkText).length === 0 || !canManage}>Invite All</Button>
          <div className="text-xs text-foreground/60">Detected: {parseBulk(bulkText).length} email(s)</div>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="px-3 py-2">{inv.email}</td>
                <td className="px-3 py-2">{inv.role}</td>
                <td className="px-3 py-2">
                  <span className={
                    `inline-flex items-center rounded-full px-2 py-0.5 text-xs ` +
                    (inv.status === 'pending' ? 'bg-warning/10 text-warning' :
                     inv.status === 'accepted' ? 'bg-success/10 text-success' :
                     inv.status === 'revoked' ? 'bg-muted/10 text-muted-foreground' :
                     'bg-muted/10 text-muted-foreground')
                  }>
                    {inv.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <Button onClick={() => resendInvite(inv.id)} disabled={loading || !canManage || inv.status !== 'pending'}>
                    Resend
                  </Button>
                  <Button onClick={() => revokeInvite(inv.id)} disabled={loading || !canManage || inv.status !== 'pending'}>
                    Revoke
                  </Button>
                </td>
              </tr>
            ))}
            {invites.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-foreground/60" colSpan={4}>No invites yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
