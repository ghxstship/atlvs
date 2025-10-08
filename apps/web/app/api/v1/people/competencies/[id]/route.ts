import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UpdateCompetencySchema = z.object({
  name: z.string().min(1, 'Competency name is required').optional(),
  category: z.enum(['technical', 'creative', 'management', 'soft_skills', 'industry_specific']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  description: z.string().optional(),
  certificationRequired: z.boolean().optional(),
  certificationBody: z.string().optional(),
  expiryPeriod: z.number().optional(), // in months
  tags: z.array(z.string()).optional()
});

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
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

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    const { id } = params;

    const { data: competency, error } = await supabase
      .from('competencies')
      .select(`
        *,
        assignments:person_competencies(
          id,
          level,
          certified_date,
          expiry_date,
          person:people(id, first_name, last_name, email)
        )
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) {
      console.error('Competency fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!competency) {
      return NextResponse.json({ error: 'Competency not found' }, { status: 404 });
    }

    return NextResponse.json({ competency });

  } catch (error) {
    console.error('Competency GET error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();
    const { id } = params;

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const updateData = UpdateCompetencySchema.parse(body);

    const { data: competency, error } = await supabase
      .from('competencies')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select(`
        *,
        assignments:person_competencies(count)
      `)
      .single();

    if (error) {
      console.error('Competency update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!competency) {
      return NextResponse.json({ error: 'Competency not found' }, { status: 404 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.competencies.update',
      resource_type: 'competency',
      resource_id: id,
      details: { updated_fields: Object.keys(updateData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ competency });

  } catch (error) {
    console.error('Competency PATCH error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as unknown).name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: (error as unknown).errors }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();
    const { id } = params;

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if competency has assignments
    const { count: assignmentCount } = await supabase
      .from('person_competencies')
      .select('*', { count: 'exact', head: true })
      .eq('competency_id', id);

    if (assignmentCount && assignmentCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete competency with active assignments',
        details: { assignmentCount }
      }, { status: 409 });
    }

    // Get competency details for audit log
    const { data: competency } = await supabase
      .from('competencies')
      .select('name, category')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('competencies')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Competency deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.competencies.delete',
      resource_type: 'competency',
      resource_id: id,
      details: { 
        name: competency?.name || 'Unknown',
        category: competency?.category || 'Unknown'
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Competency DELETE error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}
