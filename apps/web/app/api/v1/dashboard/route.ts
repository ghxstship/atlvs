import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

// Dashboard creation schema
const createDashboardSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['system', 'custom', 'template']).default('custom'),
  layout: z.array(z.any()).default([]),
  settings: z.record(z.any()).default({}),
  is_default: z.boolean().default(false),
  is_public: z.boolean().default(false),
});

// Dashboard update schema
const updateDashboardSchema = createDashboardSchema.partial();

// Dashboard query schema
const dashboardQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['system', 'custom', 'template']).optional(),
  is_default: z.coerce.boolean().optional(),
  is_public: z.coerce.boolean().optional(),
  created_by: z.string().uuid().optional(),
  sort_by: z.enum(['name', 'created_at', 'updated_at']).default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });
    
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
    const query = dashboardQuerySchema.parse(queryParams);

    // Build query
    let dashboardQuery = supabase
      .from('dashboards')
      .select(`
        *,
        created_by_user:users!dashboards_created_by_fkey(id, email, full_name),
        widget_count:dashboard_widgets(count),
        share_count:dashboard_shares(count)
      `)
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.search) {
      dashboardQuery = dashboardQuery.or(`name.ilike.%${query.search}%,description.ilike.%${query.search}%`);
    }

    if (query.type) {
      dashboardQuery = dashboardQuery.eq('type', query.type);
    }

    if (query.is_default !== undefined) {
      dashboardQuery = dashboardQuery.eq('is_default', query.is_default);
    }

    if (query.is_public !== undefined) {
      dashboardQuery = dashboardQuery.eq('is_public', query.is_public);
    }

    if (query.created_by) {
      dashboardQuery = dashboardQuery.eq('created_by', query.created_by);
    }

    // Apply sorting
    dashboardQuery = dashboardQuery.order(query.sort_by, { ascending: query.sort_order === 'asc' });

    // Apply pagination
    const offset = (query.page - 1) * query.limit;
    dashboardQuery = dashboardQuery.range(offset, offset + query.limit - 1);

    const { data: dashboards, error: dashboardError, count } = await dashboardQuery;

    if (dashboardError) {
      console.error('Dashboard query error:', dashboardError);
      return NextResponse.json({ error: 'Failed to fetch dashboards' }, { status: 500 });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('dashboards')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    return NextResponse.json({
      data: dashboards,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / query.limit),
      },
    });

  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });
    
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

    // Validate user membership and permissions
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
    const validatedData = createDashboardSchema.parse(body);

    // Check for duplicate dashboard names
    const { data: existingDashboard } = await supabase
      .from('dashboards')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('name', validatedData.name)
      .single();

    if (existingDashboard) {
      return NextResponse.json({ 
        error: 'Dashboard name already exists',
        field: 'name'
      }, { status: 409 });
    }

    // Create dashboard
    const { data: dashboard, error: createError } = await supabase
      .from('dashboards')
      .insert({
        ...validatedData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select(`
        *,
        created_by_user:users!dashboards_created_by_fkey(id, email, full_name)
      `)
      .single();

    if (createError) {
      console.error('Dashboard creation error:', createError);
      return NextResponse.json({ error: 'Failed to create dashboard' }, { status: 500 });
    }

    // Log activity
    await supabase.from('dashboard_activity').insert({
      organization_id: organizationId,
      dashboard_id: dashboard.id,
      user_id: user.id,
      action: 'create',
      details: {
        dashboard_name: dashboard.name,
        dashboard_type: dashboard.type,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ data: dashboard }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Dashboard POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
