import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { createServerClient } from '@ghxstship/auth';
import { Card } from '@ghxstship/ui';

export type FeatureKey = 'atlvs' | 'opendeck' | 'ghxstship';

export default async function FeatureGate({ feature, children }: { feature: FeatureKey; children: ReactNode }) {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { user } } = await supabase.auth.getUser();
  let orgId: string | null = null;
  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .maybeSingle();
    orgId = membership?.organization_id ?? null;
  }

  let orgEnt: any = null;
  if (orgId) {
    const { data } = await supabase
      .from('organization_entitlements')
      .select('*')
      .eq('organization_id', orgId)
      .maybeSingle();
    orgEnt = data || null;
  }

  let userEnt: any = null;
  if (user) {
    const { data } = await supabase
      .from('user_entitlements')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    userEnt = data || null;
  }

  const featureFlags = {
    atlvs: (orgEnt?.feature_atlvs ?? false) || (userEnt?.feature_atlvs ?? false),
    opendeck: (orgEnt?.feature_opendeck ?? false) || (userEnt?.feature_opendeck ?? false),
    ghxstship: (orgEnt?.feature_ghxstship ?? false) || (userEnt?.feature_ghxstship ?? false),
  } as const;

  const allowed = featureFlags[feature];
  if (allowed) return <>{children}</>;

  // Upsell card when feature is disabled
  return (
    <div className="stack-md">
      <Card title="Upgrade required">
        <div className="stack-sm text-body-sm color-foreground/80">
          <p>
            This area requires the {feature.toUpperCase()} feature. Visit Billing to upgrade your plan
            or add your organization email domain(s) for Team unlimited seats.
          </p>
          <div className="flex flex-wrap gap-sm">
            <Link href="/settings/billing" className="btn btn-primary">Go to Billing</Link>
            <Link href="/settings/organization/domains" className="btn border border-border bg-transparent hover:bg-accent">Manage Domains</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
