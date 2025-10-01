/**
 * PEOPLE MODULE - CREATE PERSON PAGE
 * Dedicated create form page for new person records
 * Full-page form with validation and navigation
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PeopleCreateClient from './PeopleCreateClient';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Create Person - People',
  description: 'Add a new team member to your organization',
};

export default async function CreatePersonPage() {
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
  const userRole = profile.memberships[0].role;

  return (
    <PeopleCreateClient
      orgId={orgId}
      userId={session.user.id}
      userEmail={session.user.email || ''}
      userRole={userRole}
    />
  );
}
