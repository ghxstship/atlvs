import { Card } from '@ghxstship/ui';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import RevenueClient from './RevenueClient';

export const metadata = {
  title: 'Revenue',
};

export default async function FinanceRevenuePage() {
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
    title: 'Revenue',
    subtitle: 'Track and manage your revenue with recognition workflows'
  };

  return (
    <RevenueClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
