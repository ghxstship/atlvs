import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateBidClient from '../CreateBidClient';

export const metadata = {
  title: 'Create Bid - Jobs',
  description: 'Submit a new bid for a job opportunity',
};

export default async function CreateBidPage() {
  const supabase = await createClient();

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    redirect('/auth/signin');
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
    <CreateBidClient
      user={session.user}
      orgId={orgId}
    />
  );
}
