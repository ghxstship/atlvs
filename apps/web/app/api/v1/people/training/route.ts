import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateTrainingRecordSchema = z.object({
  personId: z.string().uuid(),
  programId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  completedDate: z.string().optional(),
  expiryDate: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
  status: z.enum(['enrolled', 'in_progress', 'completed', 'expired', 'failed']).default('enrolled'),
  certificateUrl: z.string().url().optional(),
  notes: z.string().optional()
});

const UpdateTrainingRecordSchema = CreateTrainingRecordSchema.partial();

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
    const { supabase, orgId } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const status = searchParams.get('status');

    let query = supabase
      .from('training_records')
      .select(`
        *,
        person:people!training_records_person_id_fkey(first_name, last_name, email),
        program:training_programs!training_records_program_id_fkey(name, description, category)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (personId) {
      query = query.eq('person_id', personId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: trainingRecords, error } = await query;

    if (error) {
      console.error('Training records fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trainingRecords: trainingRecords || [] });

  } catch (error) {
    console.error('Training records GET error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const trainingData = CreateTrainingRecordSchema.parse(body);

    const { data: trainingRecord, error } = await supabase
      .from('training_records')
      .insert({
        ...trainingData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Training record creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trainingRecord }, { status: 201 });

  } catch (error) {
    console.error('Training records POST error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
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
      return NextResponse.json({ error: 'Training record ID is required' }, { status: 400 });
    }

    const trainingData = UpdateTrainingRecordSchema.parse(updateData);

    const { data: trainingRecord, error } = await supabase
      .from('training_records')
      .update({
        ...trainingData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Training record update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!trainingRecord) {
      return NextResponse.json({ error: 'Training record not found' }, { status: 404 });
    }

    return NextResponse.json({ trainingRecord });

  } catch (error) {
    console.error('Training records PUT error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
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
      return NextResponse.json({ error: 'Training record ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('training_records')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Training record deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Training records DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
