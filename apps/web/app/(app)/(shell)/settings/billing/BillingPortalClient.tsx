"use client";

import { useState } from 'react';
import { createBrowserClient } from '@ghxstship/auth';

export default function BillingPortalClient() {
  const supabase = createBrowserClient();
  const [organizationId, setOrganizationId] = useState("");
  const [priceId, setPriceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortalForUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create portal session");
      if (data?.url) {
        window.location.href = data.url as string;
      }
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const openPortalForOrg = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!organizationId) throw new Error("Enter organizationId");
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create portal session");
      if (data?.url) {
        window.location.href = data.url as string;
      }
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async (scope: 'user' | 'org') => {
    setLoading(true);
    setError(null);
    try {
      if (!priceId) throw new Error("Enter a Stripe priceId");
      let body = { priceId, mode: 'subscription' };
      if (scope === 'user') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not signed in");
        body.userId = user.id;
      } else {
        if (!organizationId) throw new Error("Enter organizationId");
        body.organizationId = organizationId;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create checkout session");
      if (data?.url) window.location.href = data.url as string;
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack-sm">
      <div className="text-body-sm color-foreground/70">Open Stripe Customer Portal as current user or for an organization. Create a Checkout session for a plan price ID.</div>
      <div className="flex flex-col gap-sm">
        <div className="flex gap-sm">
          <button onClick={openPortalForUser} disabled={loading} className="rounded-md bg-foreground  px-md py-sm text-body-sm text-background">Open Portal (User)</button>
          <input value={organizationId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrganizationId(e.target.value)} placeholder="organizationId" className="w-full rounded-md border bg-background  px-md py-sm text-body-sm" />
          <button onClick={openPortalForOrg} disabled={!organizationId || loading} className="rounded-md border  px-md py-sm text-body-sm">Open Portal (Org)</button>
        </div>
        <div className="flex gap-sm">
          <input value={priceId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceId(e.target.value)} placeholder="price_..." className="w-full rounded-md border bg-background  px-md py-sm text-body-sm" />
          <button onClick={() => startCheckout('user')} disabled={!priceId || loading} className="rounded-md border  px-md py-sm text-body-sm">Checkout (User)</button>
          <button onClick={() => startCheckout('org')} disabled={!priceId || !organizationId || loading} className="rounded-md border  px-md py-sm text-body-sm">Checkout (Org)</button>
        </div>
      </div>
      {error ? <div className="text-body-sm color-destructive">{error}</div> : null}
    </div>
  );
}
