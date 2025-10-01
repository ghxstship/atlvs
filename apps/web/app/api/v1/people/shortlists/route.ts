import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateShortlistSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  purpose: z.enum(['hiring', 'project', 'event', 'general'])
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
    const purpose = searchParams.get('purpose');
    const status = searchParams.get('status');

    let query = supabase
      .from('people_shortlists')
      .select(`
        *,
        creator:people!created_by(first_name, last_name, email),
        member_count:shortlist_members(count)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (purpose) query = query.eq('purpose', purpose);
    if (status) query = query.eq('status', status);

    const { data: shortlists, error } = await query;

    if (error) {
      console.error('Shortlists fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ shortlists: shortlists || [] });

  } catch (error) {
    console.error('Shortlists GET error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const shortlistData = CreateShortlistSchema.parse(body);

    // Get creator person ID from user
    const { data: creatorPerson } = await supabase
      .from('people')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .single();

    if (!creatorPerson) {
      return NextResponse.json({ error: 'Creator person profile not found' }, { status: 404 });
    }

    const { data: shortlist, error } = await supabase
      .from('people_shortlists')
      .insert({
        ...shortlistData,
        created_by: creatorPerson.id,
        organization_id: orgId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        creator:people!created_by(first_name, last_name, email),
        member_count:shortlist_members(count)
      `)
      .single();

    if (error) {
      console.error('Shortlist creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.shortlists.create',
      resource_type: 'shortlist',
      resource_id: shortlist.id,
      details: { 
        name: shortlistData.name,
        purpose: shortlistData.purpose
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ shortlist }, { status: 201 });

  } catch (error) {
    console.error('Shortlists POST error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as unknown).name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: (error as unknown).errors }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}
