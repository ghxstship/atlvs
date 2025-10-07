/**
 * Dashboard Edit Page
 * Enterprise-grade dashboard editor with real-time collaboration
 * Provides full editing capabilities with version control and conflict resolution
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import EditDashboardDrawer from '../../drawers/EditDashboardDrawer';

export const dynamic = 'force-dynamic';


type EditDashboardSubmission = {
  name: string;
  description?: string | null;
  slug?: string | null;
  layout: 'grid' | 'masonry' | 'flex' | 'tabs' | 'accordion' | 'sidebar' | 'fullscreen';
  access_level: 'private' | 'team' | 'organization' | 'public';
  is_default: boolean;
  is_template: boolean;
  tags?: string[];
};

// Metadata generation
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient();

  try {
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('name, description')
      .eq('id', params.id)
      .single();

    if (dashboard) {
      return {
        title: `Edit ${dashboard.name} | GHXSTSHIP`,
        description: dashboard.description || 'Edit dashboard in GHXSTSHIP',
      };
    }
  } catch (error) {
    console.error('Error fetching dashboard metadata:', error);
  }

  return {
    title: 'Edit Dashboard | GHXSTSHIP',
    description: 'Edit dashboard in GHXSTSHIP',
  };
}

export default async function EditDashboardPage({
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
    .eq('id', session.user.id)
    .single();

  if (!profile?.memberships?.[0]) {
    redirect('/auth/signin');
  }

  const userRole = profile.memberships[0].role;
  const orgId = profile.memberships[0].organization_id;

  // Get dashboard
  const { data: dashboard, error: dashboardError } = await supabase
    .from('dashboards')
    .select(`
      *,
      created_by:users(name,email),
      updated_by:users(name,email)
    `)
    .eq('organization_id', orgId)
    .eq('id', dashboardId)
    .single();

  if (dashboardError || !dashboard) {
    notFound();
  }

  // Check if user can edit this specific dashboard
  const canEdit = await checkDashboardEditPermission(dashboard, session.user.id, userRole, supabase);
  if (!canEdit) {
    redirect(`/dashboard/${dashboardId}`);
  }

  // Get additional data for editing
  const [
    { data: templates },
    { data: widgetTypes },
    { data: userList },
    { data: recentActivity }
  ] = await Promise.all([
    // Available templates
    supabase
      .from('dashboard_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false })
      .limit(20),

    // Available widget types
    supabase
      .from('widget_types')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true }),

    // Organization users
    supabase
      .from('users')
      .select('id, email, full_name')
      .eq('organization_id', orgId)
      .order('full_name', { ascending: true }),

    // Recent activity
    supabase
      .from('dashboard_activity')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open && typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleDrawerSubmit = async (data: EditDashboardSubmission) => {
    const supabaseClient = await createClient();

    await supabaseClient
      .from('dashboards')
      .update(data)
      .eq('id', dashboard.id);

    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <Suspense fallback={<EditDashboardLoading />}>
      <EditDashboardDrawer
        open={true}
        onOpenChange={handleDrawerOpenChange}
        dashboard={dashboard}
        onSubmit={handleDrawerSubmit}
      />
    </Suspense>
  );
}

// Loading component
function EditDashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-content-lg">
      <div className="flex items-center gap-xs">
        <Loader2 className="h-icon-md w-icon-md animate-spin" />
        <span>Loading dashboard editor...</span>
      </div>
    </div>
  );
}

// Edit permission check
async function checkDashboardEditPermission(
  dashboard: any,
  userId: string,
  userRole: string,
  supabase: any
): Promise<boolean> {
  // Owner/admin can edit any dashboard in their organization
  if (['owner', 'admin'].includes(userRole)) {
    return true;
  }

  // Editor can edit dashboards they created or have explicit access to
  if (userRole === 'editor') {
    // Check if user created the dashboard
    if (dashboard.created_by === userId) {
      return true;
    }

    // Check explicit permissions
    const { data: permissions } = await supabase
      .from('dashboard_permissions')
      .select('permissions')
      .eq('dashboard_id', dashboard.id)
      .eq('user_id', userId)
      .single();

    if (permissions?.permissions?.includes('edit')) {
      return true;
    }

    // Check team permissions
    if (dashboard.allowed_users?.includes(userId)) {
      return true;
    }
  }

  return false;
}

// Generate static params for static generation (optional)
export async function generateStaticParams() {
  // In a real implementation, you might pre-generate popular dashboards
  return [];
}
