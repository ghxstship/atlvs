/**
 * Dashboard Create Page
 * Enterprise-grade dashboard creation form
 * Provides schema-driven form with validation, auto-save, and templates
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import CreateDashboardDrawer from '../drawers/CreateDashboardDrawer';

// Metadata
export const metadata: Metadata = {
  title: 'Create Dashboard - GHXSTSHIP',
  description: 'Create a new enterprise dashboard with customizable widgets and layouts.',
};

// Loading component
function CreateDashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-content-lg">
      <div className="flex items-center gap-sm">
        <Loader2 className="h-icon-md w-icon-md animate-spin" />
        <span>Loading dashboard creation form...</span>
      </div>
    </div>
  );
}

// Page component
export default async function CreateDashboardPage() {
  // Server-side authentication and authorization
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

  // Check permissions
  const allowedRoles = ['owner', 'admin', 'editor'];
  if (!allowedRoles.includes(userRole)) {
    redirect('/dashboard');
  }

  // Get dashboard templates
  const { data: templates } = await supabase
    .from('dashboard_templates')
    .select('*')
    .eq('is_public', true)
    .order('usage_count', { ascending: false })
    .limit(10);

  // Get available widget types
  const { data: widgetTypes } = await supabase
    .from('widget_types')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return (
    <Suspense fallback={<CreateDashboardLoading />}>
      <CreateDashboardDrawer
        isOpen={true}
        onClose={() => window.history.back()}
        orgId={orgId}
        userId={session.user.id}
        userRole={userRole}
        templates={templates || []}
        availableWidgetTypes={widgetTypes || []}
      />
    </Suspense>
  );
}
