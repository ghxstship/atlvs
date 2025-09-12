import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from '../DashboardClient';

export const metadata = {
  title: 'Dashboard Overview',
};

export default async function DashboardOverview() {
  const supabase = await createClient();

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    redirect('/login');
  }

  // Get user profile and organization membership
  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      memberships!inner(
        organization_id,
        role,
        status,
        organization:organizations(
          id,
          name,
          slug
        )
      )
    `)
    .eq('auth_id', session.user.id)
    .single();

  if (!profile || !profile.memberships?.[0]) {
    redirect('/auth/onboarding');
  }

  const orgId = profile.memberships[0].organization_id;

  return (
    <DashboardClient orgId={orgId} />
  );
}
