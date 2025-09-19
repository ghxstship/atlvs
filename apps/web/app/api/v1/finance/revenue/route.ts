import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateRevenueSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  category: z.string().optional(),
  projectId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  revenueDate: z.string(),
  recognitionDate: z.string().optional(),
  status: z.enum(['projected', 'invoiced', 'received']).default('projected'),
  notes: z.string().optional(),
});

const UpdateRevenueSchema = CreateRevenueSchema.partial();

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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const projectId = searchParams.get('projectId');

    let query = supabase
      .from('revenue')
      .select('*')
      .eq('organization_id', orgId)
      .order('revenue_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (projectId) query = query.eq('project_id', projectId);

    const { data: revenue, error } = await query;

    if (error) {
      console.error('Revenue fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'revenue.list',
      resource_type: 'revenue',
      details: { count: revenue?.length || 0, filters: { status, category, projectId } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ revenue: revenue || [] });

  } catch (error) {
    console.error('Revenue GET error:', error);
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
    const revenueData = CreateRevenueSchema.parse(body);

    const { data: revenue, error } = await supabase
      .from('revenue')
      .insert({
        ...revenueData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Revenue creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'revenue.create',
      resource_type: 'revenue',
      resource_id: revenue.id,
      details: { description: revenue.description, amount: revenue.amount, currency: revenue.currency },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ revenue }, { status: 201 });

  } catch (error) {
    console.error('Revenue POST error:', error);
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
      return NextResponse.json({ error: 'Revenue ID is required' }, { status: 400 });
    }

    const revenueData = UpdateRevenueSchema.parse(updateData);

    const { data: revenue, error } = await supabase
      .from('revenue')
      .update({
        ...revenueData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Revenue update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!revenue) {
      return NextResponse.json({ error: 'Revenue not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'revenue.update',
      resource_type: 'revenue',
      resource_id: revenue.id,
      details: { updated_fields: Object.keys(revenueData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ revenue });

  } catch (error) {
    console.error('Revenue PUT error:', error);
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
      return NextResponse.json({ error: 'Revenue ID is required' }, { status: 400 });
    }

    const { data: revenue } = await supabase
      .from('revenue')
      .select('description')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('revenue')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Revenue deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'revenue.delete',
      resource_type: 'revenue',
      resource_id: id,
      details: { description: revenue?.description || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Revenue DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
