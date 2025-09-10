import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import ResourcesClient from './ResourcesClient';

export const metadata = {
  title: 'Resources',
  description: 'Manage organizational resources including policies, guides, training materials, templates, and procedures'
};

export default async function ResourcesPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
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

  return <ResourcesClient />;
}
