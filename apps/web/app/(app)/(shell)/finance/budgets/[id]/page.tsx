import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BudgetDetailClient from './BudgetDetailClient';

interface BudgetDetailPageProps {
 params: Promise<{ id: string }>;
}

export const metadata = {
 title: 'Budget Details - Finance',
 description: 'View and manage budget details.',
};

export default async function BudgetDetailPage({ params }: BudgetDetailPageProps) {
 const { id } = await params;
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

 // Fetch budget data with related expenses
 const { data: budget, error: budgetError } = await supabase
 .from('budgets')
 .select(`
 *,
 expenses:expenses(*),
 projects:project_id(*)
 `)
 .eq('id', id)
 .eq('organization_id', orgId)
 .single();

 if (budgetError || !budget) {
 redirect('/finance/budgets');
 }

 return (
 <BudgetDetailClient
 budget={budget}
 user={session.user}
 orgId={orgId}
 />
 );
}
