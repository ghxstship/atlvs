import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Widget update schema
const updateWidgetSchema = z.object({
  widget_type: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().min(1),
    h: z.number().min(1),
  }).optional(),
  config: z.record(z.any()).optional(),
  data_source: z.string().optional(),
  query_config: z.record(z.any()).optional(),
  refresh_interval: z.number().min(30).optional(),
  is_visible: z.boolean().optional(),
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

    // Get widget with dashboard info
    const { data: widget, error: widgetError } = await supabase
      .from('dashboard_widgets')
      .select(`
        *,
        dashboard:dashboards!inner(id, name, created_by)
      `)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    return NextResponse.json({ data: widget });

  } catch (error) {
    console.error('Widget GET error:', error);
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

    // Check if widget exists and get dashboard info
    const { data: existingWidget } = await supabase
      .from('dashboard_widgets')
      .select(`
        id, title, dashboard_id,
        dashboard:dashboards!inner(id, created_by)
      `)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single();

    if (!existingWidget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    // Check permissions (dashboard owner or admin can edit widgets)
    const canEdit = existingWidget.dashboard.created_by === user.id || 
                   ['owner', 'admin'].includes(membership.role);

    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateWidgetSchema.parse(body);

    // Update widget
    const { data: widget, error: updateError } = await supabase
      .from('dashboard_widgets')
      .update(validatedData)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .select(`
        *,
        dashboard:dashboards!inner(id, name)
      `)
      .single();

    if (updateError) {
      console.error('Widget update error:', updateError);
      return NextResponse.json({ error: 'Failed to update widget' }, { status: 500 });
    }

    // Log activity
    await supabase.from('dashboard_activity').insert({
      organization_id: organizationId,
      dashboard_id: widget.dashboard_id,
      widget_id: widget.id,
      user_id: user.id,
      action: 'update',
      details: {
        widget_title: widget.title,
        updated_fields: Object.keys(validatedData),
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ data: widget });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Widget PUT error:', error);
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

    // Check if widget exists and get dashboard info
    const { data: existingWidget } = await supabase
      .from('dashboard_widgets')
      .select(`
        id, title, dashboard_id,
        dashboard:dashboards!inner(id, created_by)
      `)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single();

    if (!existingWidget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    // Check permissions (dashboard owner or admin can delete widgets)
    const canDelete = existingWidget.dashboard.created_by === user.id || 
                     ['owner', 'admin'].includes(membership.role);

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Delete widget
    const { error: deleteError } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', organizationId);

    if (deleteError) {
      console.error('Widget deletion error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete widget' }, { status: 500 });
    }

    // Log activity
    await supabase.from('dashboard_activity').insert({
      organization_id: organizationId,
      dashboard_id: existingWidget.dashboard_id,
      widget_id: null, // Widget is deleted
      user_id: user.id,
      action: 'delete',
      details: {
        widget_title: existingWidget.title,
        widget_id: existingWidget.id,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ message: 'Widget deleted successfully' });

  } catch (error) {
    console.error('Widget DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
