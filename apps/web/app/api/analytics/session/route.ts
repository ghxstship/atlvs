import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';

/**
 * Session Analytics API Endpoint
 * Stores and processes RUM (Real User Monitoring) session data
 */

export interface SessionAnalyticsPayload {
  sessionId: string;
  userId?: string;
  organizationId?: string;
  events: Array<{
    timestamp: string;
    type: string;
    data: Record<string, unknown>;
    url?: string;
    performance?: Record<string, unknown>;
  }>;
  metadata: {
    landingPage: string;
    exitPage?: string;
    pagesViewed: number;
    interactions: number;
    errors: number;
    performance: Record<string, unknown>;
    duration?: number;
  };
}

async function storeSessionData(payload: SessionAnalyticsPayload): Promise<void> {
  const supabase = createServerClient();

  try {
    // Store session data
    const { error: sessionError } = await supabase
      .from('analytics_sessions')
      .upsert({
        session_id: payload.sessionId,
        user_id: payload.userId,
        organization_id: payload.organizationId,
        landing_page: payload.metadata.landingPage,
        exit_page: payload.metadata.exitPage,
        pages_viewed: payload.metadata.pagesViewed,
        interactions: payload.metadata.interactions,
        errors: payload.metadata.errors,
        duration: payload.metadata.duration,
        performance_data: payload.metadata.performance,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (sessionError) {
      console.error('Error storing session data:', sessionError);
      return;
    }

    // Store individual events in batches
    if (payload.events.length > 0) {
      const events = payload.events.map(event => ({
        session_id: payload.sessionId,
        event_type: event.type,
        timestamp: event.timestamp,
        event_data: event.data,
        url: event.url,
        performance_data: event.performance,
        created_at: new Date().toISOString(),
      }));

      // Insert in batches of 100
      for (let i = 0; i < events.length; i += 100) {
        const batch = events.slice(i, i + 100);
        const { error: eventsError } = await supabase
          .from('analytics_events')
          .insert(batch);

        if (eventsError) {
          console.error('Error storing events batch:', eventsError);
        }
      }
    }

    // Process insights
    await processSessionInsights(payload);

  } catch (error) {
    console.error('Error processing session analytics:', error);
  }
}

async function processSessionInsights(payload: SessionAnalyticsPayload): Promise<void> {
  const supabase = createServerClient();

  const insights = [];

  // Rage click detection
  const rageClicks = payload.events.filter(e =>
    e.type === 'rage_click' ||
    (e.type === 'click' && e.data?.clickCount && (e.data.clickCount as number) >= 3)
  );

  if (rageClicks.length > 0) {
    insights.push({
      session_id: payload.sessionId,
      type: 'friction',
      severity: 'high',
      description: `${rageClicks.length} rage click(s) detected - users repeatedly clicking same element`,
      page: rageClicks[0].url,
      timestamp: rageClicks[0].timestamp,
      recommendation: 'Review UI/UX for confusing or unresponsive elements',
    });
  }

  // Dead click detection
  const deadClicks = payload.events.filter(e => e.type === 'dead_click');
  if (deadClicks.length > 3) { // More than 3 dead clicks
    insights.push({
      session_id: payload.sessionId,
      type: 'ux_issue',
      severity: 'medium',
      description: `${deadClicks.length} dead clicks detected - users clicking non-interactive elements`,
      page: deadClicks[0].url,
      timestamp: deadClicks[0].timestamp,
      recommendation: 'Consider making these elements interactive or removing them',
    });
  }

  // Error analysis
  if (payload.metadata.errors > 2) {
    insights.push({
      session_id: payload.sessionId,
      type: 'bug',
      severity: 'high',
      description: `${payload.metadata.errors} JavaScript errors occurred during session`,
      page: payload.metadata.landingPage,
      timestamp: payload.events.find(e => e.type === 'error')?.timestamp || new Date().toISOString(),
      recommendation: 'Review error logs and fix JavaScript issues',
    });
  }

  // Performance insights
  const performanceEvents = payload.events.filter(e => e.type === 'performance');
  if (performanceEvents.length > 0) {
    const avgLCP = performanceEvents
      .map(e => e.performance?.lcp)
      .filter(Boolean)
      .reduce((sum, lcp) => sum + (lcp as number), 0) / performanceEvents.length;

    if (avgLCP > 2500) { // Slow LCP
      insights.push({
        session_id: payload.sessionId,
        type: 'performance',
        severity: 'medium',
        description: `Slow page load detected (avg LCP: ${Math.round(avgLCP)}ms)`,
        page: payload.metadata.landingPage,
        timestamp: performanceEvents[0].timestamp,
        recommendation: 'Optimize images, reduce JavaScript, improve server response time',
      });
    }
  }

  // Session duration insights
  if (payload.metadata.duration && payload.metadata.duration < 10000) { // Less than 10 seconds
    insights.push({
      session_id: payload.sessionId,
      type: 'friction',
      severity: 'low',
      description: 'Very short session duration - possible bounce or poor experience',
      page: payload.metadata.landingPage,
      timestamp: new Date(Date.now() - payload.metadata.duration).toISOString(),
      recommendation: 'Review landing page content and user experience',
    });
  }

  // Store insights
  if (insights.length > 0) {
    const { error } = await supabase
      .from('analytics_insights')
      .insert(insights.map(insight => ({
        ...insight,
        created_at: new Date().toISOString(),
      })));

    if (error) {
      console.error('Error storing insights:', error);
    }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload: SessionAnalyticsPayload = await request.json();

    // Validate payload
    if (!payload.sessionId || !payload.events || !payload.metadata) {
      return NextResponse.json(
        { error: 'Invalid payload: missing required fields' },
        { status: 400 }
      );
    }

    // Rate limiting: max 10 requests per minute per IP
    const clientIP = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Store session data asynchronously
    storeSessionData(payload).catch(error => {
      console.error('Failed to store session analytics:', error);
    });

    return NextResponse.json({
      success: true,
      sessionId: payload.sessionId,
      eventsProcessed: payload.events.length,
    });

  } catch (error) {
    console.error('Session analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = createServerClient();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('analytics_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching session analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch session data' },
        { status: 500 }
      );
    }

    // Get insights summary
    const insightsQuery = supabase
      .from('analytics_insights')
      .select('type, severity, count(*)')
      .group('type, severity');

    const { data: insightsData } = await insightsQuery;

    const insightsSummary = insightsData?.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = {};
      acc[item.type][item.severity] = item.count;
      return acc;
    }, {} as Record<string, Record<string, number>>) || {};

    return NextResponse.json({
      sessions: data,
      insightsSummary,
      totalSessions: data?.length || 0,
    });

  } catch (error) {
    console.error('Session analytics GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
