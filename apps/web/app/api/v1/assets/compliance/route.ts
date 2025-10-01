import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options: unknown) => {
      cookieStore.set(name, value, options);
    },
    remove: (name: string, options: unknown) => {
      cookieStore.delete(name);
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error, supabase };
}

const ComplianceSchema = z.object({
  asset_id: z.string().uuid(),
  compliance_type: z.enum(['safety', 'regulatory', 'certification', 'audit', 'insurance', 'environmental', 'quality']),
  status: z.enum(['pending', 'in_progress', 'compliant', 'non_compliant', 'expired']),
  requirement: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string(),
  completed_date: z.string().optional(),
  assigned_to: z.string().optional(),
  inspector: z.string().optional(),
  certificate_url: z.string().url().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError, supabase } = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const orgId = request.headers.get('x-organization-id');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from('asset_compliance')
      .select(`
        *,
        assets!inner(name)
      `)
      .eq('organization_id', orgId);

    // Apply filters
    const status = searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
    }

    const compliance_type = searchParams.get('compliance_type');
    if (compliance_type) {
      query = query.eq('compliance_type', compliance_type);
    }

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`requirement.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Execute query
    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch compliance records' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError, supabase } = await getAuthenticatedUser();
    const orgId = request.headers.get('x-organization-id');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ComplianceSchema.parse(body);

    // Insert compliance record
    const { data, error } = await supabase
      .from('asset_compliance')
      .insert([{
        ...validatedData,
        organization_id: orgId,
        created_by: user.id,
        updated_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create compliance record' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
