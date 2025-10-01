import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateEndorsementSchema = z.object({
  endorsedPersonId: z.string().uuid(),
  competencyId: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  message: z.string().optional(),
  context: z.string().optional()
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

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const endorserId = searchParams.get('endorserId');

    let query = supabase
      .from('people_endorsements')
      .select(`
        *,
        endorsed_person:people!endorsed_id(first_name, last_name, email, role, department),
        endorser_person:people!endorser_id(first_name, last_name, email, role, department),
        competency:people_competencies(name, category)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (personId) query = query.eq('endorsed_id', personId);
    if (endorserId) query = query.eq('endorser_id', endorserId);

    const { data: endorsements, error } = await query;

    if (error) {
      console.error('Endorsements fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ endorsements: endorsements || [] });

  } catch (error) {
    console.error('Endorsements GET error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const endorsementData = CreateEndorsementSchema.parse(body);

    // Get endorser person ID from user
    const { data: endorserPerson } = await supabase
      .from('people')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .single();

    if (!endorserPerson) {
      return NextResponse.json({ error: 'Endorser person profile not found' }, { status: 404 });
    }

    const { data: endorsement, error } = await supabase
      .from('people_endorsements')
      .insert({
        endorsed_id: endorsementData.endorsedPersonId,
        endorser_id: endorserPerson.id,
        competency_id: endorsementData.competencyId,
        rating: endorsementData.rating,
        message: endorsementData.message,
        context: endorsementData.context,
        organization_id: orgId,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        endorsed_person:people!endorsed_id(first_name, last_name, email),
        endorser_person:people!endorser_id(first_name, last_name, email),
        competency:people_competencies(name, category)
      `)
      .single();

    if (error) {
      console.error('Endorsement creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.endorsements.create',
      resource_type: 'endorsement',
      resource_id: endorsement.id,
      details: { 
        endorsed_person_id: endorsementData.endorsedPersonId,
        rating: endorsementData.rating,
        competency_id: endorsementData.competencyId
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ endorsement }, { status: 201 });

  } catch (error) {
    console.error('Endorsements POST error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as unknown).name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: (error as unknown).errors }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}
