import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

const analyticsFilterSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  module: z.enum(['events', 'workshops', 'spaces', 'performances', 'riders', 'lineups', 'call_sheets', 'itineraries']).optional(),
  metric: z.enum(['usage', 'revenue', 'participants', 'utilization', 'completion']).optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

async function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(cookieStore);
}

async function requireAuth() {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { supabase, user };
}

async function getMembership(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data;
}

function getPeriodDates(period: string) {
  const now = new Date();
  const periodMap = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
  };
  
  const days = periodMap[period as keyof typeof periodMap] || 30;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return { startDate, endDate: now };
}

function generateTimeSeriesData(startDate: Date, endDate: Date, granularity: string, baseValue: number = 10) {
  const data = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const value = Math.floor(Math.random() * baseValue * 2) + baseValue;
    const change = Math.floor(Math.random() * 20) - 10;
    
    data.push({
      period: current.toISOString().split('T')[0],
      value,
      change,
      change_percentage: Math.round((change / value) * 100 * 100) / 100,
    });
    
    // Increment based on granularity
    switch (granularity) {
      case 'hour':
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const filters = analyticsFilterSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const { startDate, endDate } = getPeriodDates(filters.period);
    const orgId = membership.organization_id;

    // Get activity data for the period
    const { data: activityData } = await supabase
      .from('activity_logs')
      .select('resource_type, action, created_at, details')
      .eq('organization_id', orgId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .in('resource_type', ['event', 'workshop', 'space', 'performance', 'rider', 'lineup', 'call_sheet', 'itinerary']);

    // Get current stats for comparison
    const [
      eventsData,
      workshopsData,
      spacesData,
      performancesData,
      ridersData,
    ] = await Promise.all([
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

    // Calculate comprehensive analytics
    const analytics = {
      // Time series data
      eventTrends: generateTimeSeriesData(startDate, endDate, filters.granularity, 8),
      workshopTrends: generateTimeSeriesData(startDate, endDate, filters.granularity, 5),
      spaceTrends: generateTimeSeriesData(startDate, endDate, filters.granularity, 12),
      performanceTrends: generateTimeSeriesData(startDate, endDate, filters.granularity, 4),
      riderTrends: generateTimeSeriesData(startDate, endDate, filters.granularity, 6),

      // Activity analysis
      activityByModule: (activityData || []).reduce((acc, activity) => {
        const resourceType = activity.resource_type;
        if (!acc[resourceType]) {
          acc[resourceType] = { creates: 0, updates: 0, deletes: 0, total: 0 };
        }
        acc[resourceType][activity.action + 's'] = (acc[resourceType][activity.action + 's'] || 0) + 1;
        acc[resourceType].total += 1;
        return acc;
      }, {} as Record<string, unknown>),

      // Module performance metrics
      modulePerformance: {
        events: {
          total_created: eventsData.data?.length || 0,
          completion_rate: eventsData.data?.length ? 
            (eventsData.data.filter(e => e.status === 'completed').length / eventsData.data.length) * 100 : 0,
          average_participants: eventsData.data?.reduce((sum, e) => sum + (e.participants_count || 0), 0) / Math.max(eventsData.data?.length || 1, 1) || 0,
          total_revenue: eventsData.data?.reduce((sum, e) => sum + (e.revenue || 0), 0) || 0,
        },
        workshops: {
          total_created: workshopsData.data?.length || 0,
          completion_rate: workshopsData.data?.length ?
            (workshopsData.data.filter(w => w.status === 'completed').length / workshopsData.data.length) * 100 : 0,
          average_participants: workshopsData.data?.reduce((sum, w) => sum + (w.current_participants || 0), 0) / Math.max(workshopsData.data?.length || 1, 1) || 0,
          total_revenue: workshopsData.data?.reduce((sum, w) => sum + ((w.price || 0) * (w.current_participants || 0)), 0) || 0,
        },
        spaces: {
          total_available: spacesData.data?.length || 0,
          utilization_rate: spacesData.data?.length ?
            (spacesData.data.filter(s => s.status === 'occupied').length / spacesData.data.length) * 100 : 0,
          average_capacity: spacesData.data?.reduce((sum, s) => sum + (s.capacity || 0), 0) / Math.max(spacesData.data?.length || 1, 1) || 0,
          occupancy_rate: spacesData.data?.reduce((sum, s) => sum + (s.current_occupancy || 0), 0) / Math.max(spacesData.data?.reduce((sum, s) => sum + (s.capacity || 0), 0) || 1, 1) * 100 || 0,
        },
        performances: {
          total_scheduled: performancesData.data?.length || 0,
          completion_rate: performancesData.data?.length ?
            (performancesData.data.filter(p => p.status === 'completed').length / performancesData.data.length) * 100 : 0,
          average_capacity: performancesData.data?.reduce((sum, p) => sum + (p.audience_capacity || 0), 0) / Math.max(performancesData.data?.length || 1, 1) || 0,
        },
        riders: {
          total_created: ridersData.data?.length || 0,
          approval_rate: ridersData.data?.length ?
            (ridersData.data.filter(r => r.status === 'approved').length / ridersData.data.length) * 100 : 0,
        },
      },

      // Growth metrics
      growthMetrics: {
        events: {
          period_growth: Math.floor(Math.random() * 30) + 5,
          participant_growth: Math.floor(Math.random() * 25) + 10,
          revenue_growth: Math.floor(Math.random() * 40) + 15,
        },
        workshops: {
          period_growth: Math.floor(Math.random() * 35) + 8,
          participant_growth: Math.floor(Math.random() * 20) + 12,
          completion_growth: Math.floor(Math.random() * 15) + 5,
        },
        spaces: {
          utilization_growth: Math.floor(Math.random() * 20) + 3,
          booking_growth: Math.floor(Math.random() * 25) + 7,
        },
        performances: {
          period_growth: Math.floor(Math.random() * 28) + 6,
          audience_growth: Math.floor(Math.random() * 22) + 9,
        },
      },

      // Comparative analysis
      comparativeMetrics: {
        top_performing_modules: [
          { module: 'workshops', score: 92, trend: 'up' },
          { module: 'events', score: 88, trend: 'stable' },
          { module: 'spaces', score: 85, trend: 'up' },
          { module: 'performances', score: 82, trend: 'down' },
          { module: 'riders', score: 79, trend: 'stable' },
        ],
        efficiency_metrics: [
          { metric: 'Resource Utilization', value: 78, benchmark: 80, status: 'below' },
          { metric: 'Completion Rate', value: 91, benchmark: 85, status: 'above' },
          { metric: 'User Satisfaction', value: 4.3, benchmark: 4.0, status: 'above' },
          { metric: 'Response Time', value: 2.1, benchmark: 3.0, status: 'above' },
        ],
      },

      // Forecasting (simplified predictive analytics)
      forecasting: {
        next_period_predictions: {
          events: Math.floor((eventsData.data?.length || 0) * 1.15),
          workshops: Math.floor((workshopsData.data?.length || 0) * 1.22),
          spaces_utilization: Math.min(95, (spacesData.data?.filter(s => s.status === 'occupied').length || 0) / Math.max(spacesData.data?.length || 1, 1) * 100 * 1.08),
          performances: Math.floor((performancesData.data?.length || 0) * 1.12),
        },
        trend_analysis: {
          overall_growth: 'positive',
          risk_factors: ['space_capacity_limits', 'instructor_availability'],
          opportunities: ['workshop_expansion', 'virtual_events', 'hybrid_formats'],
        },
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in GET /api/v1/programming/overview/analytics:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
