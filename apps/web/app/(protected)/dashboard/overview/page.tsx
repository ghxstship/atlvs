import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import DashboardClient from '../DashboardClient';
import FeatureGate from '../../../components/FeatureGate';

export const metadata = {
  title: 'Dashboard Overview',
};

export default async function DashboardOverview() {
  const t = await getTranslations('dashboard');
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get organization ID from user metadata or session
  const orgId = user.user_metadata?.organization_id || user.app_metadata?.organization_id;
  
  if (!orgId) {
    redirect('/onboarding');
  }

  return (
    <DashboardClient orgId={orgId} />
  );
}
