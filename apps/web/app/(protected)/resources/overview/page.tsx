import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ResourcesOverviewClient from './ResourcesOverviewClient';

export const metadata = {
  title: 'Resources Overview',
  description: 'Overview of organizational resources and knowledge base'
};

export default async function ResourcesOverview() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  // Check organization membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', session.user.id)
    .single();

  if (!membership) {
    redirect('/onboarding');
  }

  return <ResourcesOverviewClient />;
}
