import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateNetworkConnectionSchema = z.object({
  personId: z.string().uuid(),
  connectedPersonId: z.string().uuid(),
  relationshipType: z.enum(['colleague', 'mentor', 'mentee', 'collaborator', 'friend', 'professional']),
  strength: z.enum(['weak', 'moderate', 'strong']),
  notes: z.string().optional()
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

    let query = supabase
      .from('people_network_connections')
      .select(`
        *,
        person:people!person_id(first_name, last_name, email, role, department),
        connected_person:people!connected_person_id(first_name, last_name, email, role, department)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (personId) {
      query = query.or(`person_id.eq.${personId},connected_person_id.eq.${personId}`);
    }

    const { data: connections, error } = await query;

    if (error) {
      console.error('Network connections fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ connections: connections || [] });

  } catch (error) {
    console.error('Network GET error:', error);
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
    const connectionData = CreateNetworkConnectionSchema.parse(body);

    const { data: connection, error } = await supabase
      .from('people_network_connections')
      .insert({
        person_id: connectionData.personId,
        connected_person_id: connectionData.connectedPersonId,
        relationship_type: connectionData.relationshipType,
        strength: connectionData.strength,
        notes: connectionData.notes,
        organization_id: orgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        person:people!person_id(first_name, last_name, email),
        connected_person:people!connected_person_id(first_name, last_name, email)
      `)
      .single();

    if (error) {
      console.error('Network connection creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.network.create',
      resource_type: 'network_connection',
      resource_id: connection.id,
      details: { 
        person_id: connectionData.personId,
        connected_person_id: connectionData.connectedPersonId,
        relationship_type: connectionData.relationshipType
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ connection }, { status: 201 });

  } catch (error) {
    console.error('Network POST error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as unknown).name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: (error as unknown).errors }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}
