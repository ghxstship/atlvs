import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth/server';

const LifecycleSchema = z.object({
  asset_id: z.string().uuid(),
  lifecycle_stage: z.enum(['acquisition', 'deployment', 'operation', 'maintenance', 'optimization', 'decline', 'disposal', 'retired']),
  acquisition_date: z.string(),
  acquisition_cost: z.number().positive(),
  current_value: z.number().optional(),
  depreciation_method: z.enum(['straight_line', 'declining_balance', 'sum_of_years', 'units_of_production', 'custom']).optional(),
  depreciation_rate: z.number().optional(),
  useful_life_years: z.number().positive(),
  remaining_life_years: z.number().optional(),
  salvage_value: z.number().optional(),
  accumulated_depreciation: z.number().optional(),
  utilization_rate: z.number().optional(),
  maintenance_cost_total: z.number().optional(),
  roi_percentage: z.number().optional(),
  replacement_recommended: z.boolean().optional(),
  replacement_date: z.string().optional(),
  replacement_cost: z.number().optional(),
  disposal_date: z.string().optional(),
  disposal_value: z.number().optional(),
  disposal_method: z.enum(['sale', 'trade_in', 'donation', 'recycling', 'scrap', 'destruction']).optional(),
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
      .from('asset_lifecycle')
      .select(`
        *,
        assets!inner(name)
      `)
      .eq('organization_id', orgId);

    // Apply filters
    const lifecycle_stage = searchParams.get('lifecycle_stage');
    if (lifecycle_stage) {
      query = query.eq('lifecycle_stage', lifecycle_stage);
    }

    const replacement_recommended = searchParams.get('replacement_recommended');
    if (replacement_recommended) {
      query = query.eq('replacement_recommended', replacement_recommended === 'true');
    }

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`notes.ilike.%${search}%`);
    }

    // Execute query
    const { data, error } = await query.order('acquisition_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch lifecycle records' }, { status: 500 });
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
    const validatedData = LifecycleSchema.parse(body);

    // Insert lifecycle record
    const { data, error } = await supabase
      .from('asset_lifecycle')
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
      return NextResponse.json({ error: 'Failed to create lifecycle record' }, { status: 500 });
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
