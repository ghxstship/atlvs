import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditRevenueClient from './EditRevenueClient';

interface EditRevenuePageProps {
 params: Promise<{ id: string }>;
}

export const metadata = {
 title: 'Edit Revenue - Finance',
 description: 'Edit revenue entry details.',
};

export default async function EditRevenuePage({ params }: EditRevenuePageProps) {
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

 // Fetch revenue data
 const { data: revenue, error: revenueError } = await supabase
 .from('revenue')
 .select('*')
 .eq('id', id)
 .eq('organization_id', orgId)
 .single();

 if (revenueError || !revenue) {
 redirect('/finance/revenue');
 }

 return (
 <EditRevenueClient
 revenue={revenue}
 user={session.user}
 orgId={orgId}
 />
 );
}
