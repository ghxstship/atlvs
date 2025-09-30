/**
 * Companies Create Page
 * Create form handler with schema-driven form generation
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateCompanyClient from './CreateCompanyClient';

export const metadata = {
  title: 'Create Company - Management',
  description: 'Create a new company profile with comprehensive information.',
};

export default async function CreateCompanyPage() {
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
  const userRole = profile.memberships[0].role;

  return (
    <CreateCompanyClient
      user={session.user}
      orgId={orgId}
      userRole={userRole}
      translations={{
        title: 'Create Company',
        subtitle: 'Add a new company to your organization with comprehensive profile information.',
        cancel: 'Cancel',
        create: 'Create Company',
      }}
    />
  );
}
