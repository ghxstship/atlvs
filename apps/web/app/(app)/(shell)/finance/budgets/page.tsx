import { Card } from '@ghxstship/ui';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import BudgetsClient from './BudgetsClient';
import CreateBudgetClient from './CreateBudgetClient';

export const metadata = { title: 'Finance · Budgets' };

export default async function FinanceBudgetsPage() {
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
    title: 'Budgets',
    subtitle: 'Manage project budgets and financial planning'
  };

  return (
    <BudgetsClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
