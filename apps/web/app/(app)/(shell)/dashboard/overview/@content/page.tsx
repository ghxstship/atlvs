import { createClient } from '@/lib/supabase/server';
import DashboardClient from '../../DashboardClient';

export const dynamic = 'force-dynamic';


export default async function DashboardContent() {
  const supabase = await createClient();

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    return <div>Please sign in to view dashboard content.</div>;
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
    return <div>Please complete your profile setup.</div>;
  }

  const orgId = profile.memberships[0].organization_id;

  return <DashboardClient orgId={orgId} />;
}
