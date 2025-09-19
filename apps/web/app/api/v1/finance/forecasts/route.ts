import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateForecastSchema = z.object({
  name: z.string().min(1, 'Forecast name is required'),
  type: z.enum(['revenue', 'expense', 'cashflow', 'budget']),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  startDate: z.string(),
  endDate: z.string(),
  baseAmount: z.number().min(0),
  growthRate: z.number().optional(),
  confidence: z.enum(['low', 'medium', 'high']).default('medium'),
  assumptions: z.string().optional(),
  projectId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const UpdateForecastSchema = CreateForecastSchema.partial();

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
    const type = searchParams.get('type');
    const period = searchParams.get('period');
    const projectId = searchParams.get('projectId');
    const confidence = searchParams.get('confidence');

    let query = supabase
      .from('forecasts')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (period) query = query.eq('period', period);
    if (projectId) query = query.eq('project_id', projectId);
    if (confidence) query = query.eq('confidence', confidence);

    const { data: forecasts, error } = await query;

    if (error) {
      console.error('Forecasts fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'forecasts.list',
      resource_type: 'forecast',
      details: { count: forecasts?.length || 0, filters: { type, period, projectId, confidence } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ forecasts: forecasts || [] });

  } catch (error) {
    console.error('Forecasts GET error:', error);
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
    const forecastData = CreateForecastSchema.parse(body);

    const { data: forecast, error } = await supabase
      .from('forecasts')
      .insert({
        ...forecastData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Forecast creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'forecasts.create',
      resource_type: 'forecast',
      resource_id: forecast.id,
      details: { name: forecast.name, type: forecast.type, period: forecast.period },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ forecast }, { status: 201 });

  } catch (error) {
    console.error('Forecasts POST error:', error);
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
      return NextResponse.json({ error: 'Forecast ID is required' }, { status: 400 });
    }

    const forecastData = UpdateForecastSchema.parse(updateData);

    const { data: forecast, error } = await supabase
      .from('forecasts')
      .update({
        ...forecastData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Forecast update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!forecast) {
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'forecasts.update',
      resource_type: 'forecast',
      resource_id: forecast.id,
      details: { updated_fields: Object.keys(forecastData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ forecast });

  } catch (error) {
    console.error('Forecasts PUT error:', error);
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
      return NextResponse.json({ error: 'Forecast ID is required' }, { status: 400 });
    }

    const { data: forecast } = await supabase
      .from('forecasts')
      .select('name')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('forecasts')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Forecast deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'forecasts.delete',
      resource_type: 'forecast',
      resource_id: id,
      details: { name: forecast?.name || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Forecasts DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
