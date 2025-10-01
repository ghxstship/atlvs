import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import OverviewClient from './OverviewClient';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Companies Overview',
};

export default async function CompaniesOverview() {
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

  const translations = {
    title: 'Companies Overview',
    subtitle: 'Dashboard and analytics for your company directory'
  };

  return (
    <OverviewClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
