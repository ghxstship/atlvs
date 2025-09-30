import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth/server';

const ComplianceUpdateSchema = z.object({
  compliance_type: z.enum(['safety', 'regulatory', 'certification', 'audit', 'insurance', 'environmental', 'quality']).optional(),
  status: z.enum(['pending', 'in_progress', 'compliant', 'non_compliant', 'expired']).optional(),
  requirement: z.string().min(1).optional(),
  description: z.string().optional(),
  due_date: z.string().optional(),
  completed_date: z.string().optional(),
  assigned_to: z.string().optional(),
  inspector: z.string().optional(),
  certificate_url: z.string().url().optional(),
  notes: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data, error } = await supabase
      .from('asset_compliance')
      .select(`
        *,
        assets!inner(name)
      `)
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Compliance record not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch compliance record' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = ComplianceUpdateSchema.parse(body);

    // Update compliance record
    const { data, error } = await supabase
      .from('asset_compliance')
      .update({
        ...validatedData,
        updated_by: user.id
      })
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Compliance record not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update compliance record' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from('asset_compliance')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete compliance record' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Compliance record deleted successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
