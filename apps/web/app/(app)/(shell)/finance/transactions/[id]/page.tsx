import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TransactionDetailClient from './TransactionDetailClient';

interface TransactionDetailPageProps {
 params: Promise<{ id: string }>;
}

export const metadata = {
 title: 'Transaction Details - Finance',
 description: 'View and manage transaction details.',
};

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
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

 // Fetch transaction data
 const { data: transaction, error: transactionError } = await supabase
 .from('transactions')
 .select('*')
 .eq('id', id)
 .eq('organization_id', orgId)
 .single();

 if (transactionError || !transaction) {
 redirect('/finance/transactions');
 }

 return (
 <TransactionDetailClient
 transaction={transaction}
 user={session.user}
 orgId={orgId}
 />
 );
}
