import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Dashboard update schema
const updateDashboardSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  type: z.enum(['system', 'custom', 'template']).optional(),
  layout: z.array(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  is_default: z.boolean().optional(),
  is_public: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Validate user membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get dashboard with related data
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select(`
        *,
        created_by_user:users!dashboards_created_by_fkey(id, email, full_name),
        widgets:dashboard_widgets(*),
        shares:dashboard_shares(
          *,
          shared_with_user:users!dashboard_shares_shared_with_user_id_fkey(id, email, full_name)
        ),
        user_preferences:user_dashboard_preferences!inner(*)
      `)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single();

    if (dashboardError || !dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
    }

    // Update last accessed time for user preferences
    await supabase
      .from('user_dashboard_preferences')
      .upsert({
        user_id: user.id,
        organization_id: organizationId,
        dashboard_id: dashboard.id,
        last_accessed_at: new Date().toISOString(),
      });

    // Log view activity
    await supabase.from('dashboard_activity').insert({
      organization_id: organizationId,
      dashboard_id: dashboard.id,
      user_id: user.id,
      action: 'view',
      details: {
        dashboard_name: dashboard.name,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ data: dashboard });

  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Validate user membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if dashboard exists and user has permission to edit
    const { data: existingDashboard } = await supabase
      .from('dashboards')
      .select('id, created_by, name')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single();

    if (!existingDashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
    }

    // Check permissions (owner or admin can edit)
    const canEdit = existingDashboard.created_by === user.id || 
                   ['owner', 'admin'].includes(membership.role);

    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateDashboardSchema.parse(body);

    // Check for duplicate names if name is being updated
    if (validatedData.name && validatedData.name !== existingDashboard.name) {
      const { data: duplicateDashboard } = await supabase
        .from('dashboards')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('name', validatedData.name)
        .neq('id', params.id)
        .single();

      if (duplicateDashboard) {
        return NextResponse.json({ 
          error: 'Dashboard name already exists',
          field: 'name'
        }, { status: 409 });
      }
    }

    // Update dashboard
    const { data: dashboard, error: updateError } = await supabase
      .from('dashboards')
      .update(validatedData)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .select(`
        *,
        created_by_user:users!dashboards_created_by_fkey(id, email, full_name)
      `)
      .single();

    if (updateError) {
      console.error('Dashboard update error:', updateError);
      return NextResponse.json({ error: 'Failed to update dashboard' }, { status: 500 });
    }

    // Log activity
    await supabase.from('dashboard_activity').insert({
      organization_id: organizationId,
      dashboard_id: dashboard.id,
      user_id: user.id,
      action: 'update',
      details: {
        dashboard_name: dashboard.name,
        updated_fields: Object.keys(validatedData),
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ data: dashboard });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Dashboard PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Validate user membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if dashboard exists and user has permission to delete
    const { data: existingDashboard } = await supabase
      .from('dashboards')
      .select('id, created_by, name, type, is_default')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single();

    if (!existingDashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
    }

    // Prevent deletion of system dashboards
    if (existingDashboard.type === 'system') {
      return NextResponse.json({ error: 'Cannot delete system dashboards' }, { status: 400 });
    }

    // Check permissions (owner or admin can delete)
    const canDelete = existingDashboard.created_by === user.id || 
                     ['owner', 'admin'].includes(membership.role);

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Prevent deletion of default dashboard without replacement
    if (existingDashboard.is_default) {
      const { count: otherDashboards } = await supabase
        .from('dashboards')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .neq('id', params.id);

      if (!otherDashboards || otherDashboards === 0) {
        return NextResponse.json({ 
          error: 'Cannot delete the only dashboard. Create another dashboard first.' 
        }, { status: 400 });
      }
    }

    // Delete dashboard (cascades to widgets, shares, preferences, etc.)
    const { error: deleteError } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', organizationId);

    if (deleteError) {
      console.error('Dashboard deletion error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete dashboard' }, { status: 500 });
    }

    // Log activity
    await supabase.from('dashboard_activity').insert({
      organization_id: organizationId,
      dashboard_id: null, // Dashboard is deleted
      user_id: user.id,
      action: 'delete',
      details: {
        dashboard_name: existingDashboard.name,
        dashboard_id: existingDashboard.id,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ message: 'Dashboard deleted successfully' });

  } catch (error) {
    console.error('Dashboard DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
