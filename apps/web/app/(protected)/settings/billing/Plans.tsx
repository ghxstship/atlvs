"use client";

import { useState } from 'react';

export default function Plans() {
  const INDIVIDUAL_PRICE = process.env.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL;
  const PRO_PRICE = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  const TEAM_PRICE = process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM;
  const ENTERPRISE_CONTACT_URL = process.env.NEXT_PUBLIC_ENTERPRISE_CONTACT_URL || 'mailto:sales@ghxstship.com';

  const [orgId, setOrgId] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckoutUser(priceId?: string | null) {
    if (!priceId) return setError('Price ID not set');
    setError(null); setLoading('user');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode: 'subscription', userId: 'me' /* server resolves from session */ })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Checkout failed');
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(null);
    }
  }

  async function startCheckoutOrg(priceId?: string | null) {
    if (!priceId) return setError('Price ID not set');
    if (!orgId) return setError('Enter organizationId');
    setError(null); setLoading('org');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode: 'subscription', organizationId: orgId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Checkout failed');
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Individual</h3>
          <p className="text-sm text-foreground/70">OPENDECK only</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">
            <li>Access OPENDECK marketplace</li>
          </ul>
          <button
            onClick={() => startCheckoutUser(INDIVIDUAL_PRICE)}
            disabled={!INDIVIDUAL_PRICE || loading !== null}
            className="mt-4 rounded-md bg-foreground px-3 py-2 text-sm text-background disabled:opacity-50"
          >
            {loading === 'user' ? 'Starting...' : 'Choose Individual'}
          </button>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Pro (Individuals)</h3>
          <p className="text-sm text-foreground/70">OPENDECK + ATLVS</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">
            <li>Everything in Individual</li>
            <li>ATLVS tools for solo operators</li>
          </ul>
          <button
            onClick={() => startCheckoutUser(PRO_PRICE)}
            disabled={!PRO_PRICE || loading !== null}
            className="mt-4 rounded-md bg-foreground px-3 py-2 text-sm text-background disabled:opacity-50"
          >
            {loading === 'user' ? 'Starting...' : 'Choose Pro'}
          </button>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Team (Unlimited seats)</h3>
          <p className="text-sm text-foreground/70">OPENDECK + ATLVS</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">
            <li>Unlimited seats by company email domain</li>
            <li>All ATLVS features for teams</li>
          </ul>
          <div className="mt-2 flex gap-2">
            <input value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="organizationId" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <button
            onClick={() => startCheckoutOrg(TEAM_PRICE)}
            disabled={!TEAM_PRICE || !orgId || loading !== null}
            className="mt-4 rounded-md bg-foreground px-3 py-2 text-sm text-background disabled:opacity-50"
          >
            {loading === 'org' ? 'Starting...' : 'Choose Team'}
          </button>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Enterprise</h3>
          <p className="text-sm text-foreground/70">OPENDECK + ATLVS + GHXSTSHIP</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">
            <li>Custom pricing and onboarding</li>
            <li>GHXSTSHIP professional services</li>
          </ul>
          <a href={ENTERPRISE_CONTACT_URL} className="mt-4 inline-block rounded-md border px-3 py-2 text-sm">
            Contact Sales
          </a>
        </div>
      </div>
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
