import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateAssignmentClient from '../CreateAssignmentClient';

export const metadata = {
  title: 'Create Assignment - Jobs',
  description: 'Create a new job assignment',
};

export default async function CreateAssignmentPage() {
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
    <CreateAssignmentClient
      user={session.user}
      orgId={orgId}
    />
  );
}
