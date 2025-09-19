import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreatePersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'terminated']).default('active'),
  hireDate: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
});

const UpdatePersonSchema = CreatePersonSchema.partial();

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
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    let query = supabase
      .from('people')
      .select('*')
      .eq('organization_id', orgId)
      .order('last_name', { ascending: true });

    if (status) query = query.eq('status', status);
    if (department) query = query.eq('department', department);
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: people, error } = await query;

    if (error) {
      console.error('People fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.list',
      resource_type: 'person',
      details: { count: people?.length || 0, filters: { status, department, search } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ people: people || [] });

  } catch (error) {
    console.error('People GET error:', error);
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
    const personData = CreatePersonSchema.parse(body);

    const { data: person, error } = await supabase
      .from('people')
      .insert({
        ...personData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Person creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.create',
      resource_type: 'person',
      resource_id: person.id,
      details: { name: `${person.firstName} ${person.lastName}`, department: person.department },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ person }, { status: 201 });

  } catch (error) {
    console.error('People POST error:', error);
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
      return NextResponse.json({ error: 'Person ID is required' }, { status: 400 });
    }

    const personData = UpdatePersonSchema.parse(updateData);

    const { data: person, error } = await supabase
      .from('people')
      .update({
        ...personData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Person update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.update',
      resource_type: 'person',
      resource_id: person.id,
      details: { updated_fields: Object.keys(personData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ person });

  } catch (error) {
    console.error('People PUT error:', error);
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
      return NextResponse.json({ error: 'Person ID is required' }, { status: 400 });
    }

    const { data: person } = await supabase
      .from('people')
      .select('firstName, lastName')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Person deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.delete',
      resource_type: 'person',
      resource_id: id,
      details: { name: person ? `${person.firstName} ${person.lastName}` : 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('People DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
