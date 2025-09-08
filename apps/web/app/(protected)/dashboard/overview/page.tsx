import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import DashboardClient from '../DashboardClient';
import FeatureGate from '../../../components/FeatureGate';

export const metadata = {
  title: 'Dashboard Overview',
};

export default async function DashboardOverview() {
  const t = await getTranslations('dashboard');
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

  return (
    <FeatureGate feature="atlvs">
      {orgId ? <DashboardClient orgId={orgId} /> : null}
    </FeatureGate>
  );
}
