import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OverviewTemplate from '../../dashboard/components/OverviewTemplate';
import { getModuleConfig } from '../../dashboard/lib/module-configs';

export const metadata = {
 title: 'Settings - Overview',
 description: 'Organization settings, security, integrations, and system configuration.',
};

export default async function SettingsOverviewPage() {
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
 const config = getModuleConfig('settings');

 return (
 <OverviewTemplate
 orgId={orgId}
 userId={session.user.id}
 userEmail={session.user.email || ''}
 module="settings"
 config={config}
 />
 );
}
