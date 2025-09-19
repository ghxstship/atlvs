import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateCompetencySchema = z.object({
  name: z.string().min(1, 'Competency name is required'),
  category: z.enum(['technical', 'creative', 'management', 'soft_skills', 'industry_specific']),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  description: z.string().optional(),
  certificationRequired: z.boolean().default(false),
  certificationBody: z.string().optional(),
  expiryPeriod: z.number().optional(), // in months
  tags: z.array(z.string()).optional(),
});

const AssignCompetencySchema = z.object({
  personId: z.string().uuid('Invalid person ID'),
  competencyId: z.string().uuid('Invalid competency ID'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  certifiedDate: z.string().optional(),
  expiryDate: z.string().optional(),
  verifiedBy: z.string().uuid().optional(),
  notes: z.string().optional(),
});

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
    const category = searchParams.get('category');
    const personId = searchParams.get('personId');
    const search = searchParams.get('search');
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // If fetching competencies for a specific person
    if (personId) {
      const query = supabase
        .from('person_competencies')
        .select(`
          *,
          competency:competencies(*),
          person:people(id, name, email),
          verifier:users(id, name, email)
        `)
        .eq('person_id', personId)
        .eq('organization_id', orgId);

      if (!includeExpired) {
        query.or('expiry_date.is.null,expiry_date.gt.now()');
      }

      const { data: personCompetencies, error } = await query;

      if (error) {
        console.error('Person competencies fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ competencies: personCompetencies || [] });
    }

    // Otherwise, fetch all competencies
    let query = supabase
      .from('competencies')
      .select(`
        *,
        assignments:person_competencies(count)
      `)
      .eq('organization_id', orgId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) query = query.eq('category', category);
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: competencies, error } = await query;

    if (error) {
      console.error('Competencies fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.competencies.list',
      resource_type: 'competency',
      details: { count: competencies?.length || 0, filters: { category, personId, search } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ competencies: competencies || [] });

  } catch (error) {
    console.error('Competencies GET error:', error);
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
    
    // Check if this is a competency assignment or creation
    if (body.personId && body.competencyId) {
      // Assign competency to person
      const assignmentData = AssignCompetencySchema.parse(body);

      // Verify person belongs to organization
      const { data: person } = await supabase
        .from('people')
        .select('id')
        .eq('id', assignmentData.personId)
        .eq('organization_id', orgId)
        .single();

      if (!person) {
        return NextResponse.json({ error: 'Person not found' }, { status: 404 });
      }

      const { data: assignment, error } = await supabase
        .from('person_competencies')
        .insert({
          person_id: assignmentData.personId,
          competency_id: assignmentData.competencyId,
          organization_id: orgId,
          level: assignmentData.level,
          certified_date: assignmentData.certifiedDate,
          expiry_date: assignmentData.expiryDate,
          verified_by: assignmentData.verifiedBy || user.id,
          notes: assignmentData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Competency assignment error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'people.competencies.assign',
        resource_type: 'person_competency',
        resource_id: assignment.id,
        details: { 
          person_id: assignmentData.personId,
          competency_id: assignmentData.competencyId,
          level: assignmentData.level
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ assignment }, { status: 201 });
    } else {
      // Create new competency
      const competencyData = CreateCompetencySchema.parse(body);

      const { data: competency, error } = await supabase
        .from('competencies')
        .insert({
          ...competencyData,
          organization_id: orgId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Competency creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'people.competencies.create',
        resource_type: 'competency',
        resource_id: competency.id,
        details: { 
          name: competency.name,
          category: competency.category,
          level: competency.level
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ competency }, { status: 201 });
    }

  } catch (error) {
    console.error('Competencies POST error:', error);
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
      return NextResponse.json({ error: 'Competency ID is required' }, { status: 400 });
    }

    const { data: competency, error } = await supabase
      .from('competencies')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Competency update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!competency) {
      return NextResponse.json({ error: 'Competency not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.competencies.update',
      resource_type: 'competency',
      resource_id: competency.id,
      details: { updated_fields: Object.keys(updateData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ competency });

  } catch (error) {
    console.error('Competencies PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const { id, assignmentId } = body;

    if (assignmentId) {
      // Delete competency assignment
      const { error } = await supabase
        .from('person_competencies')
        .delete()
        .eq('id', assignmentId)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Assignment deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'people.competencies.unassign',
        resource_type: 'person_competency',
        resource_id: assignmentId,
        occurred_at: new Date().toISOString()
      });
    } else if (id) {
      // Delete competency
      const { data: competency } = await supabase
        .from('competencies')
        .select('name')
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

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'people.competencies.delete',
        resource_type: 'competency',
        resource_id: id,
        details: { name: competency?.name || 'Unknown' },
        occurred_at: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Competencies DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
