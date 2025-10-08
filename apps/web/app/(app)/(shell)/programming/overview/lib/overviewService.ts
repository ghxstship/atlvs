import { z } from 'zod';
import type {
  ProgrammingOverviewData,
  OverviewAnalytics,
  EventSummary,
  WorkshopSummary,
  SpaceSummary,
  PerformanceSummary,
  RiderSummary
} from '../types';
import { createEmptyProgrammingOverviewData } from '../types';

export const overviewFilterSchema = z.object({
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  module: z.enum(['events', 'workshops', 'spaces', 'performances', 'riders', 'lineups', 'call_sheets', 'itineraries']).optional(),
  status: z.string().optional(),
  project_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  search: z.string().optional()
});

export const analyticsFilterSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  module: z.enum(['events', 'workshops', 'spaces', 'performances', 'riders', 'lineups', 'call_sheets', 'itineraries']).optional(),
  metric: z.enum(['usage', 'revenue', 'participants', 'utilization', 'completion']).optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day')
});

type SupabaseClient = ReturnType<typeof import('@ghxstship/auth').createServerClient>;

export function getPeriodDates(period: string) {
  const now = new Date();
  const periodMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };

  const days = periodMap[period] ?? 30;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate, endDate: now };
}

export function generateTimeSeriesData(
  startDate: Date,
  endDate: Date,
  granularity: string,
  baseValue = 10
) {
  const data: { period: string; value: number; change: number; change_percentage: number }[] = [];
  const current = new Date(startDate);

  const addStep = (date: Date) => {
    switch (granularity) {
      case 'hour':
        date.setHours(date.getHours() + 1);
        break;
      case 'week':
        date.setDate(date.getDate() + 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'day':
      default:
        date.setDate(date.getDate() + 1);
        break;
    }
  };

  while (current <= endDate) {
    const value = Math.max(0, Math.floor(Math.random() * baseValue * 2) + baseValue);
    const change = Math.floor(Math.random() * 20) - 10;
    const change_percentage = value === 0 ? 0 : Math.round((change / value) * 10000) / 100;

    data.push({
      period: current.toISOString().split('T')[0],
      value,
      change,
      change_percentage
    });

    addStep(current);
  }

  return data;
}

export async function fetchProgrammingOverviewData(
  supabase: SupabaseClient,
  orgId: string,
  filters: z.infer<typeof overviewFilterSchema>
): Promise<ProgrammingOverviewData> {
  const [
    eventsStats,
    workshopsStats,
    spacesStats,
    performancesStats,
    ridersStats,
    lineupsStats,
    callSheetsStats,
    itinerariesStats,
    recentActivity,
    upcomingEvents,
    activeWorkshops,
    availableSpaces,
    scheduledPerformances,
    pendingRiders,
  ] = await Promise.all([
    supabase
      .from('programming_events')
      .select('id, title, kind, status, start_at, end_at, location, venue, project:projects(id, name), participants_count, spaces_count, revenue')
      .eq('organization_id', orgId),
    supabase
      .from('programming_workshops')
      .select('id, title, category, status, start_date, current_participants, max_participants, price, primary_instructor:users(full_name, email)')
      .eq('organization_id', orgId),
    supabase
      .from('programming_spaces')
      .select('id, name, kind, status, capacity, current_occupancy, building, floor')
      .eq('organization_id', orgId),
    supabase
      .from('programming_performances')
      .select('id, title, type, status, scheduled_at, venue, duration_minutes, audience_capacity')
      .eq('organization_id', orgId),
    supabase
      .from('programming_riders')
      .select('id, title, kind, status, priority, created_at, event:programming_events(id, title)')
      .eq('organization_id', orgId),
    supabase
      .from('programming_lineups')
      .select('id, status, performers_count')
      .eq('organization_id', orgId),
    supabase
      .from('programming_call_sheets')
      .select('id, status, date')
      .eq('organization_id', orgId),
    supabase
      .from('programming_itineraries')
      .select('id, status, start_date, end_date')
      .eq('organization_id', orgId),
    supabase
      .from('activity_logs')
      .select('id, resource_type, action, details, created_at, user:users(full_name, email)')
      .eq('organization_id', orgId)
      .in('resource_type', ['event', 'workshop', 'space', 'performance', 'rider', 'lineup', 'call_sheet', 'itinerary'])
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('programming_events')
      .select('id, title, kind, status, start_at, end_at, location, venue, project:projects(id, name), participants_count, spaces_count')
      .eq('organization_id', orgId)
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(20),
    supabase
      .from('programming_workshops')
      .select('id, title, category, status, start_date, current_participants, max_participants, price, primary_instructor:users(full_name, email)')
      .eq('organization_id', orgId)
      .in('status', ['open_registration', 'registration_closed', 'in_progress'])
      .order('start_date', { ascending: true })
      .limit(20),
    supabase
      .from('programming_spaces')
      .select('id, name, kind, status, capacity, current_occupancy, building, floor')
      .eq('organization_id', orgId)
      .eq('status', 'available')
      .order('name')
      .limit(20),
    supabase
      .from('programming_performances')
      .select('id, title, type, status, scheduled_at, venue, duration_minutes, audience_capacity')
      .eq('organization_id', orgId)
      .in('status', ['scheduled', 'in_progress'])
      .order('scheduled_at', { ascending: true })
      .limit(20),
    supabase
      .from('programming_riders')
      .select('id, title, kind, status, priority, created_at, event:programming_events(id, title)')
      .eq('organization_id', orgId)
      .in('status', ['pending', 'in_review'])
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const eventsList = eventsStats.data ?? [];
  const workshopsList = workshopsStats.data ?? [];
  const spacesList = spacesStats.data ?? [];
  const performancesList = performancesStats.data ?? [];
  const ridersList = ridersStats.data ?? [];
  const lineupsList = lineupsStats.data ?? [];
  const callSheetsList = callSheetsStats.data ?? [];
  const itinerariesList = itinerariesStats.data ?? [];

  const now = new Date();

  const stats = {
    totalEvents: eventsList.length,
    upcomingEvents: eventsList.filter(event => event.start_at && new Date(event.start_at) > now).length,
    completedEvents: eventsList.filter(event => event.status === 'completed').length,
    cancelledEvents: eventsList.filter(event => event.status === 'cancelled').length,
    totalSpaces: spacesList.length,
    availableSpaces: spacesList.filter(space => space.status === 'available').length,
    occupiedSpaces: spacesList.filter(space => space.status === 'occupied').length,
    totalWorkshops: workshopsList.length,
    activeWorkshops: workshopsList.filter(workshop => ['open_registration', 'registration_closed', 'in_progress'].includes(workshop.status)).length,
    completedWorkshops: workshopsList.filter(workshop => workshop.status === 'completed').length,
    totalRiders: ridersList.length,
    pendingRiders: ridersList.filter(rider => ['pending', 'in_review'].includes(rider.status)).length,
    approvedRiders: ridersList.filter(rider => rider.status === 'approved').length,
    totalPerformances: performancesList.length,
    scheduledPerformances: performancesList.filter(performance => ['scheduled', 'in_progress'].includes(performance.status)).length,
    completedPerformances: performancesList.filter(performance => performance.status === 'completed').length,
    totalLineups: lineupsList.length,
    activeLineups: lineupsList.filter(lineup => lineup.status === 'active').length,
    totalCallSheets: callSheetsList.length,
    activeCallSheets: callSheetsList.filter(callSheet => callSheet.status === 'active').length,
    totalItineraries: itinerariesList.length,
    activeItineraries: itinerariesList.filter(itinerary => itinerary.status === 'active').length,
    totalParticipants:
      workshopsList.reduce((sum, workshop) => sum + (workshop.current_participants || 0), 0) +
      eventsList.reduce((sum, event) => sum + (event.participants_count || 0), 0),
    totalRevenue:
      workshopsList.reduce((sum, workshop) => sum + ((workshop.price || 0) * (workshop.current_participants || 0)), 0) +
      eventsList.reduce((sum, event) => sum + (event.revenue || 0), 0),
    averageEventDuration:
      eventsList.filter(event => event.start_at && event.end_at).length > 0
        ? eventsList
            .filter(event => event.start_at && event.end_at)
            .reduce((sum, event) => {
              const start = new Date(event.start_at!).getTime();
              const end = new Date(event.end_at!).getTime();
              return sum + (end - start) / (1000 * 60 * 60);
            }, 0) /
          eventsList.filter(event => event.start_at && event.end_at).length
        : 0,
    spaceUtilizationRate: spacesList.length
      ? (spacesList.filter(space => space.status === 'occupied').length / spacesList.length) * 100
      : 0,
    workshopCompletionRate: workshopsList.length
      ? (workshopsList.filter(workshop => workshop.status === 'completed').length / workshopsList.length) * 100
      : 0,
    riderApprovalRate: ridersList.length
      ? (ridersList.filter(rider => rider.status === 'approved').length / ridersList.length) * 100
      : 0
  };

  const moduleMetrics = {
    events: {
      total: stats.totalEvents,
      active: stats.upcomingEvents,
      growth_rate: 0,
      completion_rate: stats.totalEvents > 0 ? (stats.completedEvents / stats.totalEvents) * 100 : 0
    },
    workshops: {
      total: stats.totalWorkshops,
      active: stats.activeWorkshops,
      completion_rate: stats.workshopCompletionRate,
      average_rating: 4.2
    },
    spaces: {
      total: stats.totalSpaces,
      utilization_rate: stats.spaceUtilizationRate,
      availability_rate: stats.totalSpaces > 0 ? (stats.availableSpaces / stats.totalSpaces) * 100 : 0,
      booking_rate: 75
    },
    performances: {
      total: stats.totalPerformances,
      scheduled: stats.scheduledPerformances,
      completion_rate: stats.totalPerformances > 0 ? (stats.completedPerformances / stats.totalPerformances) * 100 : 0,
      average_duration:
        performancesList.length > 0
          ? performancesList.reduce((sum, performance) => sum + (performance.duration_minutes || 0), 0) /
            performancesList.length
          : 0
    },
    riders: {
      total: stats.totalRiders,
      approval_rate: stats.riderApprovalRate,
      average_processing_time: 2.5,
      fulfillment_rate: 85
    }
  };

  const transformedActivity = (recentActivity.data ?? []).map(activity => ({
    id: activity.id,
    type: activity.resource_type,
    action: activity.action,
    title: activity.details?.title || activity.details?.name || 'Unknown',
    description: activity.details?.description,
    user_name: (activity.user as unknown)?.full_name || (activity.user as unknown)?.email || 'Unknown User',
    timestamp: activity.created_at,
    metadata: activity.details
  }));

  // Transform upcoming events
  const upcomingEventsList: EventSummary[] = (upcomingEvents.data ?? []).map(event => ({
    id: event.id,
    title: event.title || 'Untitled Event',
    kind: event.kind || 'general',
    status: event.status || 'pending',
    start_date: event.start_at || '',
    end_date: event.end_at,
    location: event.location,
    venue: event.venue,
    project: Array.isArray(event.project) && event.project[0] 
      ? { id: event.project[0].id, name: event.project[0].name } 
      : undefined,
    participants_count: event.participants_count,
    spaces_count: event.spaces_count
  }));

  // Transform active workshops
  const activeWorkshopsList: WorkshopSummary[] = (activeWorkshops.data ?? []).map(workshop => ({
    id: workshop.id,
    title: workshop.title || 'Untitled Workshop',
    category: workshop.category || 'general',
    status: workshop.status || 'planning',
    start_date: workshop.start_date || '',
    instructor: Array.isArray(workshop.primary_instructor) && workshop.primary_instructor[0]
      ? workshop.primary_instructor[0].full_name || workshop.primary_instructor[0].email
      : undefined,
    participants_count: workshop.current_participants || 0,
    max_participants: workshop.max_participants,
    price: workshop.price
  }));

  // Transform available spaces
  const availableSpacesList: SpaceSummary[] = (availableSpaces.data ?? []).map(space => ({
    id: space.id,
    name: space.name || 'Unnamed Space',
    kind: space.kind || 'space',
    status: space.status || 'available',
    capacity: space.capacity,
    current_occupancy: space.current_occupancy,
    building: space.building,
    floor: space.floor
  }));

  // Transform scheduled performances
  const scheduledPerformancesList: PerformanceSummary[] = (scheduledPerformances.data ?? []).map(performance => ({
    id: performance.id,
    title: performance.title || 'Untitled Performance',
    type: performance.type || 'performance',
    status: performance.status || 'scheduled',
    scheduled_at: performance.scheduled_at,
    venue: performance.venue,
    duration_minutes: performance.duration_minutes,
    audience_capacity: performance.audience_capacity
  }));

  // Transform pending riders
  const pendingRidersList: RiderSummary[] = (pendingRiders.data ?? []).map(rider => ({
    id: rider.id,
    title: rider.title || 'Untitled Rider',
    kind: rider.kind || 'technical',
    status: rider.status || 'pending',
    priority: rider.priority || 'medium',
    created_at: rider.created_at || new Date().toISOString(),
    event: Array.isArray(rider.event) && rider.event[0]
      ? { id: rider.event[0].id, title: rider.event[0].title }
      : undefined
  }));

  return {
    stats,
    recentActivity: transformedActivity,
    upcomingEvents: upcomingEventsList,
    activeWorkshops: activeWorkshopsList,
    availableSpaces: availableSpacesList,
    scheduledPerformances: scheduledPerformancesList,
    pendingRiders: pendingRidersList,
    moduleMetrics,
    analytics: createEmptyProgrammingOverviewData().analytics
  };
}

export async function fetchProgrammingOverviewAnalytics(
  supabase: SupabaseClient,
  orgId: string,
  filters: z.infer<typeof analyticsFilterSchema>
): Promise<OverviewAnalytics> {
  const { startDate, endDate } = getPeriodDates(filters.period);

  const [activityData, eventsData, workshopsData, spacesData, performancesData, ridersData] = await Promise.all([
    supabase
      .from('activity_logs')
      .select('resource_type, action, created_at, details')
      .eq('organization_id', orgId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .in('resource_type', ['event', 'workshop', 'space', 'performance', 'rider', 'lineup', 'call_sheet', 'itinerary']),
    supabase
      .from('programming_events')
      .select('id, status, start_at, participants_count, revenue, created_at')
      .eq('organization_id', orgId)
      .gte('created_at', startDate.toISOString()),
    supabase
      .from('programming_workshops')
      .select('id, status, start_date, current_participants, price, created_at')
      .eq('organization_id', orgId)
      .gte('created_at', startDate.toISOString()),
    supabase
      .from('programming_spaces')
      .select('id, status, capacity, current_occupancy, created_at')
      .eq('organization_id', orgId),
    supabase
      .from('programming_performances')
      .select('id, status, scheduled_at, audience_capacity, created_at')
      .eq('organization_id', orgId)
      .gte('created_at', startDate.toISOString()),
    supabase
      .from('programming_riders')
      .select('id, status, created_at')
      .eq('organization_id', orgId)
      .gte('created_at', startDate.toISOString()),
  ]);

  const activityList = activityData.data ?? [];
  const eventsList = eventsData.data ?? [];
  const workshopsList = workshopsData.data ?? [];
  const spacesList = spacesData.data ?? [];
  const performancesList = performancesData.data ?? [];
  const ridersList = ridersData.data ?? [];

  const totalRevenue = 
    eventsList.reduce((sum, event) => sum + (event.revenue || 0), 0) +
    workshopsList.reduce((sum, workshop) => sum + ((workshop.price || 0) * (workshop.current_participants || 0)), 0);

  const totalParticipants =
    eventsList.reduce((sum, event) => sum + (event.participants_count || 0), 0) +
    workshopsList.reduce((sum, workshop) => sum + (workshop.current_participants || 0), 0);

  return {
    eventTrends: generateTimeSeriesData(startDate, endDate, filters.granularity, 8),
    workshopTrends: generateTimeSeriesData(startDate, endDate, filters.granularity, 5),
    spaceTrends: generateTimeSeriesData(startDate, endDate, filters.granularity, 12),
    performanceTrends: generateTimeSeriesData(startDate, endDate, filters.granularity, 4),
    spaceUtilization: spacesList.slice(0, 10).map(space => ({
      resource: (space as unknown).name || 'Unknown Space',
      utilization: space.current_occupancy || 0,
      capacity: space.capacity || 0,
      efficiency: space.capacity ? ((space.current_occupancy || 0) / space.capacity) * 100 : 0
    })),
    performanceMetrics: [
      {
        metric: 'Event Success Rate',
        value: eventsList.length > 0 
          ? (eventsList.filter(e => e.status === 'completed').length / eventsList.length) * 100 
          : 0,
        target: 95,
        trend: 'up' as const
      },
      {
        metric: 'Space Utilization',
        value: spacesList.length > 0
          ? (spacesList.filter(s => s.status === 'occupied').length / spacesList.length) * 100
          : 0,
        target: 80,
        trend: 'stable' as const
      },
      {
        metric: 'Workshop Completion',
        value: workshopsList.length > 0
          ? (workshopsList.filter(w => w.status === 'completed').length / workshopsList.length) * 100
          : 0,
        target: 90,
        trend: 'up' as const
      },
      {
        metric: 'Rider Approval Rate',
        value: ridersList.length > 0
          ? (ridersList.filter(r => r.status === 'approved').length / ridersList.length) * 100
          : 0,
        target: 85,
        trend: 'stable' as const
      },
    ],
    moduleUsage: [
      { module: 'Events', usage_count: eventsList.length, active_users: 25, growth_rate: 15 },
      { module: 'Workshops', usage_count: workshopsList.length, active_users: 18, growth_rate: 22 },
      { module: 'Spaces', usage_count: spacesList.length, active_users: 12, growth_rate: 8 },
      { module: 'Performances', usage_count: performancesList.length, active_users: 15, growth_rate: 12 },
    ],
    revenueAnalytics: {
      total_revenue: totalRevenue,
      revenue_by_module: [
        { module: 'Events', revenue: eventsList.reduce((sum, e) => sum + (e.revenue || 0), 0) },
        { module: 'Workshops', revenue: workshopsList.reduce((sum, w) => sum + ((w.price || 0) * (w.current_participants || 0)), 0) },
        { module: 'Spaces', revenue: 0 },
      ],
      revenue_trends: generateTimeSeriesData(startDate, endDate, filters.granularity, 50)
    },
    participantAnalytics: {
      total_participants: totalParticipants,
      participants_by_module: [
        { module: 'Events', count: eventsList.reduce((sum, e) => sum + (e.participants_count || 0), 0) },
        { module: 'Workshops', count: workshopsList.reduce((sum, w) => sum + (w.current_participants || 0), 0) },
        { module: 'Performances', count: performancesList.reduce((sum, p) => sum + (p.audience_capacity || 0), 0) },
      ],
      engagement_metrics: [
        { metric: 'Average Session Duration', value: 45, trend: 'up' as const },
        { metric: 'Return Rate', value: 68, trend: 'stable' as const },
        { metric: 'Satisfaction Score', value: 4.3, trend: 'up' as const },
      ]
    }
  };
}
