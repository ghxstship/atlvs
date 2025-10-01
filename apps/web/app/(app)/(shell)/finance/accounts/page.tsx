import { Card } from '@ghxstship/ui';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import AccountsClient from './AccountsClient';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Accounts',
};

export default async function FinanceAccountsPage() {
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
    title: 'Accounts',
    subtitle: 'Manage your financial accounts with reconciliation features'
  };

  return (
    <AccountsClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
