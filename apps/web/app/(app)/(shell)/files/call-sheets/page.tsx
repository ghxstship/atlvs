import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import CallSheetsClient from './CallSheetsClient';

export const metadata = {
 title: 'Files · Call Sheets',
 description: 'Manage call sheets and production documents',
};

export default async function CallSheetsPage() {
 const cookieStore = cookies();
 const supabase = createServerClient(cookieStore);

 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 return (
 <div className="flex min-h-[60vh] items-center justify-center">
 <Card className="p-lg">
 <div className="space-y-sm text-center">
 <h2 className="text-heading-4">Authentication required</h2>
 <p className="text-body-sm text-muted-foreground">Please sign in to manage call sheets.</p>
 </div>
 </Card>
 </div>
 );
 }

 const { data: membership } = await supabase
 .from('memberships')
 .select('organization_id')
 .eq('user_id', user.id)
 .eq('status', 'active')
 .order('created_at', { ascending: true })
 .maybeSingle();

 const orgId = membership?.organization_id;

 if (!orgId) {
 return (
 <div className="flex min-h-[60vh] items-center justify-center">
 <Card className="p-lg">
 <div className="space-y-sm text-center">
 <h2 className="text-heading-4">No organization</h2>
 <p className="text-body-sm text-muted-foreground">Join or create an organization to manage call sheets.</p>
 </div>
 </Card>
 </div>
 );
 }

 const { data: callSheets } = await supabase
 .from('call_sheets')
 .select(`
 id,
 name,
 description,
 call_type,
 status,
 event_date,
 call_time,
 location,
 notes,
 weather_info,
 contact_info,
 schedule,
 crew_assignments,
 equipment_list,
 safety_notes,
 distribution_list,
 tags,
 metadata,
 project:projects(id, name, status),
 event:programming_events(id, title, start_at, end_at, location)
 `)
 .eq('organization_id', orgId)
 .order('event_date', { ascending: false })
 .limit(200);

 const { data: projects } = await supabase
 .from('projects')
 .select('id, name, status')
 .eq('organization_id', orgId)
 .in('status', ['planning', 'active'])
 .order('name');

 const { data: events } = await supabase
 .from('programming_events')
 .select('id, title, start_at, end_at, location')
 .eq('organization_id', orgId)
 .order('start_at', { ascending: true })
 .limit(100);

 const { data: membershipRows } = await supabase
 .from('memberships')
 .select('user_id')
 .eq('organization_id', orgId)
 .eq('status', 'active');

 const userIds = membershipRows?.map((row) => row.user_id) ?? [];

 const { data: users } = userIds.length
 ? await supabase
 .from('users')
 .select('id, email, full_name, avatar_url')
 .in('id', userIds)
 : { data: [] };

 return (
 <div className="stack-md">
 <Card title="Programming Call Sheets">
 <CallSheetsClient
 orgId={orgId}
 currentUserId={user.id}
 initialCallSheets={callSheets ?? []}
 projects={projects ?? []}
 events={events ?? []}
 users={users ?? []}
 />
 </Card>
 </div>
 );
}
