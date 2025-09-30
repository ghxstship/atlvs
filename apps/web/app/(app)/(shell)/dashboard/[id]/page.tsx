/**
 * Individual Dashboard View Page
 * Enterprise-grade dashboard viewer with real-time updates
 * Provides full dashboard functionality with sharing and collaboration
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { DashboardClient } from '../DashboardClient';

// Metadata generation
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient();

  try {
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('name, description')
      .eq('id', params.id)
      .single();

    if (!dashboard) {
      return {
        title: 'Dashboard Not Found - GHXSTSHIP'
      };
    }

    return {
      title: `${dashboard.name} - GHXSTSHIP`,
      description: dashboard.description || `View and interact with the ${dashboard.name} dashboard.`,
    };
  } catch {
    return {
      title: 'Dashboard - GHXSTSHIP'
    };
  }
}

// Loading component
function DashboardViewLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span>Loading dashboard...</span>
      </div>
    </div>
  );
}

// Page component
export default async function DashboardViewPage({
  params
}: {
  params: { id: string }
}) {
  const dashboardId = params.id;

  // Server-side authentication
  const supabase = await createClient();

  const { data: { session }, error: authError } = await supabase.auth.getSession();

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
  const userRole = profile.memberships[0].role;

  // Fetch dashboard with access control
  const { data: dashboard, error: dashboardError } = await supabase
    .from('dashboards')
    .select(`
      *,
      widgets:dashboard_widgets(*),
      created_by_user:users!dashboards_created_by_fkey(
        id,
        email,
        full_name
      )
    `)
    .eq('id', dashboardId)
    .eq('organization_id', orgId)
    .single();

  if (dashboardError || !dashboard) {
    notFound();
  }

  // Check access permissions
  const hasAccess = await checkDashboardAccess(dashboard, session.user.id, userRole, supabase);

  if (!hasAccess) {
    redirect('/dashboard');
  }

  // Get real-time data for widgets
  const widgetIds = dashboard.widgets?.map((w: unknown) => w.id) || [];
  let widgetData: Record<string, any> = {};

  if (widgetIds.length > 0) {
    try {
      const { data: dataResult } = await supabase
        .rpc('get_dashboard_widget_data', {
          dashboard_id: dashboardId,
          widget_ids: widgetIds
        });

      widgetData = dataResult || {};
    } catch (error) {
      console.error('Error fetching widget data:', error);
    }
  }

  // Get user preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('preferences')
    .eq('user_id', session.user.id)
    .eq('preference_type', 'dashboard')
    .eq('resource_id', dashboardId)
    .single();

  return (
    <Suspense fallback={<DashboardViewLoading />}>
      <DashboardClient
        dashboard={dashboard}
        widgetData={widgetData}
        user={session.user}
        orgId={orgId}
        userRole={userRole}
        preferences={preferences?.preferences}
        isViewMode={true}
      />
    </Suspense>
  );
}

// Access control function
async function checkDashboardAccess(
  dashboard: unknown,
  userId: string,
  userRole: string,
  supabase: unknown
): Promise<boolean> {
  // Public dashboards
  if (dashboard.access_level === 'public') {
    return true;
  }

  // Organization-level access
  if (dashboard.access_level === 'organization') {
    return true; // Already filtered by organization_id
  }

  // Team access - check user roles
  if (dashboard.access_level === 'team') {
    if (dashboard.allowed_roles?.includes(userRole)) {
      return true;
    }
  }

  // Private access - check explicit user permissions
  if (dashboard.access_level === 'private') {
    if (dashboard.allowed_users?.includes(userId)) {
      return true;
    }

    // Check if user created the dashboard
    if (dashboard.created_by === userId) {
      return true;
    }
  }

  // Owner/admin always have access
  if (['owner', 'admin'].includes(userRole)) {
    return true;
  }

  return false;
}

// Generate static params for static generation (optional)
export async function generateStaticParams() {
  // In a real implementation, you might pre-generate popular dashboards
  return [];
}
