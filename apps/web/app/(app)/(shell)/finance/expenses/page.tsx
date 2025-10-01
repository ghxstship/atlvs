import { Card } from '@ghxstship/ui';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import ExpensesClient from './ExpensesClient';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Expenses',
};

export default async function FinanceExpensesPage() {
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
    title: 'Expenses',
    subtitle: 'Track and manage your expenses with approval workflows'
  };

  return (
    <ExpensesClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
