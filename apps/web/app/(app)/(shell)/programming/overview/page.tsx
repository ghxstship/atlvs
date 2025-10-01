import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import ProgrammingOverviewClient from './ProgrammingOverviewClient';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Programming Overview',
};

export default async function ProgrammingOverview() {
  const t = await getTranslations('programming');
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  let orgId: string | null = null;
  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .maybeSingle();
    orgId = membership?.organization_id ?? null;
  }

  // Load programming data for overview
  let stats = {
    totalEvents: 0,
    upcomingEvents: 0,
    totalSpaces: 0,
    activeLineups: 0,
  };

  let recentEvents: Array<{
    id: string;
    name: string;
    kind: string;
    starts_at: string | null;
    project: { name: string } | null;
  }> = [];

  let upcomingEvents: Array<{
    id: string;
    name: string;
    kind: string;
    starts_at: string | null;
    project: { name: string } | null;
  }> = [];

  if (orgId) {
    // Get stats
    const [eventsCount, spacesCount, lineupsCount] = await Promise.all([
      supabase
        .from('events')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId),
      supabase
        .from('spaces')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId),
      supabase
        .from('lineups')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId)
    ]);

    stats.totalEvents = eventsCount.count || 0;
    stats.totalSpaces = spacesCount.count || 0;
    stats.activeLineups = lineupsCount.count || 0;

    // Get recent events
    const { data: recentEventsData } = await supabase
      .from('events')
      .select(`
        id,
        name,
        kind,
        starts_at,
        project:projects(name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5);

    recentEvents = (recentEventsData || []).map(event => ({
      ...event,
      project: event.project ? { name: (event.project as any).name } : null
    }));

    // Get upcoming events
    const { data: upcomingEventsData } = await supabase
      .from('events')
      .select(`
        id,
        name,
        kind,
        starts_at,
        project:projects(name)
      `)
      .eq('organization_id', orgId)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(5);

    upcomingEvents = (upcomingEventsData || []).map(event => ({
      ...event,
      project: event.project ? { name: (event.project as any).name } : null
    }));

    stats.upcomingEvents = upcomingEvents.length;
  }

  return (
    <div className="stack-md">
      <Card>
        <div className="flex items-center justify-between gap-md mb-lg">
          <div>
            <h1 className="text-heading-3 text-heading-3">Programming Overview</h1>
            <p className="text-body-sm color-muted">
              Manage events, performances, and programming schedules
            </p>
          </div>
        </div>
        
        {orgId ? (
          <ProgrammingOverviewClient 
            orgId={orgId} 
            stats={stats}
            recentEvents={recentEvents}
            upcomingEvents={upcomingEvents}
          />
        ) : (
          <div className="text-center py-xl color-muted">
            Please join an organization to view programming overview.
          </div>
        )}
      </Card>
    </div>
  );
}
