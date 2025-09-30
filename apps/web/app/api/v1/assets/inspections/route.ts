import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth/server';

const InspectionSchema = z.object({
  asset_id: z.string().uuid(),
  inspection_type: z.enum(['safety', 'quality', 'maintenance', 'compliance', 'performance', 'condition', 'calibration']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'failed', 'cancelled']),
  title: z.string().min(1),
  description: z.string().optional(),
  scheduled_date: z.string(),
  completed_date: z.string().optional(),
  inspector: z.string().min(1),
  checklist_template: z.string().optional(),
  checklist_items: z.array(z.any()).optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  pass_fail: z.enum(['pass', 'fail', 'conditional']).optional(),
  next_inspection_date: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const orgId = request.headers.get('x-organization-id');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from('asset_inspections')
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

    const inspection_type = searchParams.get('inspection_type');
    if (inspection_type) {
      query = query.eq('inspection_type', inspection_type);
    }

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,findings.ilike.%${search}%`);
    }

    // Execute query
    const { data, error } = await query.order('scheduled_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch inspection records' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const orgId = request.headers.get('x-organization-id');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = InspectionSchema.parse(body);

    // Insert inspection record
    const { data, error } = await supabase
      .from('asset_inspections')
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
      return NextResponse.json({ error: 'Failed to create inspection record' }, { status: 500 });
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
