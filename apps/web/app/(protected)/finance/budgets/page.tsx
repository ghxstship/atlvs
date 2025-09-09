import { Card } from '@ghxstship/ui';
import { createServerClient } from '@ghxstship/auth/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import BudgetsClient from './BudgetsClient';
import CreateBudgetClient from './CreateBudgetClient';

export const metadata = { title: 'Finance · Budgets' };

export default async function FinanceBudgetsPage() {
  const supabase = await createServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get organization ID from user metadata or session
  const orgId = user.user_metadata?.organization_id || user.app_metadata?.organization_id;
  
  if (!orgId) {
    redirect('/onboarding');
  }

  const translations = {
    title: 'Budgets',
    subtitle: 'Manage your budgets and track spending'
  };

  return (
    <BudgetsClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
