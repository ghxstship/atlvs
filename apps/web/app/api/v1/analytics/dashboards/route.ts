import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateDashboardSchema = z.object({
  name: z.string().min(1, 'Dashboard name is required'),
  description: z.string().optional(),
  layout: z.object({
    widgets: z.array(z.object({
      id: z.string(),
      type: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        w: z.number(),
        h: z.number(),
      }),
      config: z.record(z.any()),
    })),
  }),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

const UpdateDashboardSchema = CreateDashboardSchema.partial();

async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new Error('No active organization membership');
  }

  return { user, orgId: membership.organization_id, role: membership.role, supabase };
}

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('isPublic');
    const tags = searchParams.get('tags');

    let query = supabase
      .from('analytics_dashboards')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (isPublic !== null) query = query.eq('is_public', isPublic === 'true');
    if (tags) {
      const tagArray = tags.split(',');
      query = query.contains('tags', tagArray);
    }

    const { data: dashboards, error } = await query;

    if (error) {
      console.error('Dashboards fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.dashboards.list',
      resource_type: 'dashboard',
      details: { count: dashboards?.length || 0, filters: { isPublic, tags } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ dashboards: dashboards || [] });

  } catch (error) {
    console.error('Analytics dashboards GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const dashboardData = CreateDashboardSchema.parse(body);

    const { data: dashboard, error } = await supabase
      .from('analytics_dashboards')
      .insert({
        ...dashboardData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Dashboard creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.dashboards.create',
      resource_type: 'dashboard',
      resource_id: dashboard.id,
      details: { name: dashboard.name, widgets_count: dashboard.layout?.widgets?.length || 0 },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ dashboard }, { status: 201 });

  } catch (error) {
    console.error('Analytics dashboards POST error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Dashboard ID is required' }, { status: 400 });
    }

    const dashboardData = UpdateDashboardSchema.parse(updateData);

    const { data: dashboard, error } = await supabase
      .from('analytics_dashboards')
      .update({
        ...dashboardData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Dashboard update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.dashboards.update',
      resource_type: 'dashboard',
      resource_id: dashboard.id,
      details: { updated_fields: Object.keys(dashboardData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ dashboard });

  } catch (error) {
    console.error('Analytics dashboards PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Dashboard ID is required' }, { status: 400 });
    }

    const { data: dashboard } = await supabase
      .from('analytics_dashboards')
      .select('name')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('analytics_dashboards')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Dashboard deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.dashboards.delete',
      resource_type: 'dashboard',
      resource_id: id,
      details: { name: dashboard?.name || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics dashboards DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
