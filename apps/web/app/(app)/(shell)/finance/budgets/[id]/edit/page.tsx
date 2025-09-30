import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditBudgetClient from './EditBudgetClient';

interface EditBudgetPageProps {
 params: Promise<{ id: string }>;
}

export const metadata = {
 title: 'Edit Budget - Finance',
 description: 'Edit budget details.',
};

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
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

 // Fetch budget data
 const { data: budget, error: budgetError } = await supabase
 .from('budgets')
 .select('*')
 .eq('id', id)
 .eq('organization_id', orgId)
 .single();

 if (budgetError || !budget) {
 redirect('/finance/budgets');
 }

 return (
 <EditBudgetClient
 budget={budget}
 user={session.user}
 orgId={orgId}
 />
 );
}
