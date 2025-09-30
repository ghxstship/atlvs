import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { redirect } from 'next/navigation';
import RidersClient from './RidersClient';
import type { ProgrammingRider, RiderProject, RiderEvent } from './types';

export const metadata = { title: 'Files · Riders', description: 'Manage technical riders and requirements' };

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

export default async function RidersPage() {
 const cookieStore = cookies();
 const supabase = createServerClient(cookieStore);

 // Get authenticated user
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 redirect('/auth/login');
 }

 // Get user's organization membership
 const { data: membership } = await supabase
 .from('memberships')
 .select('organization_id, role')
 .eq('user_id', user.id)
 .eq('status', 'active')
 .maybeSingle();

 if (!membership?.organization_id) {
 redirect('/onboarding');
 }

 const orgId = membership.organization_id;

 // Fetch initial data in parallel
 const [
 { data: riders = [] },
 { data: projects = [] },
 { data: events = [] },
 { data: users = [] },
 ] = await Promise.all([
 // Fetch riders
 supabase
 .from('programming_riders')
 .select(`
 *,
 event:programming_events(id, title, start_at, end_at, location, venue),
 project:projects(id, name, status)
 `)
 .eq('organization_id', orgId)
 .order('created_at', { ascending: false })
 .limit(50),

 // Fetch projects for dropdowns
 supabase
 .from('projects')
 .select('id, name, status')
 .eq('organization_id', orgId)
 .eq('status', 'active')
 .order('name'),

 // Fetch events for dropdowns
 supabase
 .from('programming_events')
 .select('id, title, start_at, end_at, location, venue')
 .eq('organization_id', orgId)
 .order('start_at', { ascending: true }),

 // Fetch users for display names
 supabase
 .from('memberships')
 .select(`
 user_id,
 users!inner(id, email, full_name, avatar_url)
 `)
 .eq('organization_id', orgId)
 .eq('status', 'active'),
 ]);

 // Transform users data
 const transformedUsers: User[] = (users || []).map((membership: unknown) => ({
 id: membership.users.id,
 email: membership.users.email,
 full_name: membership.users.full_name,
 avatar_url: membership.users.avatar_url,
 }));

 return (
 <div className="container mx-auto py-lg">
 <RidersClient
 orgId={orgId}
 currentUserId={user.id}
 initialRiders={riders as ProgrammingRider[]}
 projects={projects as RiderProject[]}
 events={events as RiderEvent[]}
 users={transformedUsers}
 />
 </div>
 );
}
