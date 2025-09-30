import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateInvoiceClient from './CreateInvoiceClient';

export const metadata = {
 title: 'Create Invoice - Finance',
 description: 'Add new invoice to the financial system.',
};

export default async function CreateInvoicePage() {
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

 return (
 <CreateInvoiceClient
 user={session.user}
 orgId={orgId}
 />
 );
}
