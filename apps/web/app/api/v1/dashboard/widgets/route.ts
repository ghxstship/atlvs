import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Widget creation schema
const createWidgetSchema = z.object({
  dashboard_id: z.string().uuid(),
  widget_type: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().min(1),
    h: z.number().min(1),
  }),
  config: z.record(z.any()).default({}),
  data_source: z.string().optional(),
  query_config: z.record(z.any()).default({}),
  refresh_interval: z.number().min(30).default(300),
  is_visible: z.boolean().default(true),
});

// Widget update schema
const updateWidgetSchema = createWidgetSchema.partial().omit({ dashboard_id: true });

// Widget query schema
const widgetQuerySchema = z.object({
  dashboard_id: z.string().uuid().optional(),
  widget_type: z.string().optional(),
  data_source: z.string().optional(),
  is_visible: z.coerce.boolean().optional(),
});

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const query = widgetQuerySchema.parse(queryParams);

    // Build query
    let widgetQuery = supabase
      .from('dashboard_widgets')
      .select(`
        *,
        dashboard:dashboards!inner(id, name, created_by)
      `)
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.dashboard_id) {
      widgetQuery = widgetQuery.eq('dashboard_id', query.dashboard_id);
    }

    if (query.widget_type) {
      widgetQuery = widgetQuery.eq('widget_type', query.widget_type);
    }

    if (query.data_source) {
      widgetQuery = widgetQuery.eq('data_source', query.data_source);
    }

    if (query.is_visible !== undefined) {
      widgetQuery = widgetQuery.eq('is_visible', query.is_visible);
    }

    // Order by position for layout
    widgetQuery = widgetQuery.order('created_at', { ascending: true });

    const { data: widgets, error: widgetError } = await widgetQuery;

    if (widgetError) {
      console.error('Widget query error:', widgetError);
      return NextResponse.json({ error: 'Failed to fetch widgets' }, { status: 500 });
    }

    return NextResponse.json({ data: widgets });

  } catch (error) {
    console.error('Widget GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createWidgetSchema.parse(body);

    // Verify dashboard exists and user has access
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('id, created_by')
      .eq('id', validatedData.dashboard_id)
      .eq('organization_id', organizationId)
      .single();

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
    }

    // Check permissions (dashboard owner or admin can add widgets)
    const canEdit = dashboard.created_by === user.id || 
                   ['owner', 'admin'].includes(membership.role);

    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create widget
    const { data: widget, error: createError } = await supabase
      .from('dashboard_widgets')
      .insert({
        ...validatedData,
        organization_id: organizationId,
      })
      .select(`
        *,
        dashboard:dashboards!inner(id, name)
      `)
      .single();

    if (createError) {
      console.error('Widget creation error:', createError);
      return NextResponse.json({ error: 'Failed to create widget' }, { status: 500 });
    }

    // Log activity
    await supabase.from('dashboard_activity').insert({
      organization_id: organizationId,
      dashboard_id: widget.dashboard_id,
      widget_id: widget.id,
      user_id: user.id,
      action: 'create',
      details: {
        widget_title: widget.title,
        widget_type: widget.widget_type,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ data: widget }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Widget POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
