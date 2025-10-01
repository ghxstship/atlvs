import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AllProcurementClient from './AllProcurementClient';

export const dynamic = 'force-dynamic';


export const metadata = { 
 title: 'All Procurement Items',
 description: 'Comprehensive view of all procurement items including orders, requests, vendors, and catalog items.'
};

export default async function AllProcurementPage() {
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
 <AllProcurementClient
 orgId={orgId}
 userId={session.user.id}
 userEmail={session.user.email || ''}
 />
 );
}
