import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import OverviewClient from './OverviewClient';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Finance Overview',
};

export default async function FinanceOverviewPage() {
  const cookieStore = await cookies();
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
    title: 'Finance Overview',
    subtitle: 'View your financial dashboard and key metrics'
  };

  return (
    <OverviewClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
