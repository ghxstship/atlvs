import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OverviewTemplate from '../../dashboard/components/OverviewTemplate';
import { getModuleConfig } from '../../dashboard/lib/module-configs';

export const dynamic = 'force-dynamic';


export const metadata = {
 title: 'Files - Overview',
 description: 'Unified digital asset management with organization, sharing, and collaboration features.',
};

export default async function FilesOverviewPage() {
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
 const config = getModuleConfig('files');

 return (
 <OverviewTemplate
 orgId={orgId}
 userId={session.user.id}
 userEmail={session.user.email || ''}
 module="files"
 config={config}
 />
 );
}
