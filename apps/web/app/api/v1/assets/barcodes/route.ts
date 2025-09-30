import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth/server';

const BarcodeSchema = z.object({
  asset_id: z.string().uuid(),
  barcode_type: z.enum(['code128', 'code39', 'ean13', 'upc_a', 'qr_code', 'data_matrix', 'pdf417']),
  barcode_value: z.string().min(1),
  qr_code_value: z.string().optional(),
  status: z.enum(['active', 'inactive', 'damaged', 'replaced']),
  print_date: z.string(),
  printed_by: z.string().optional(),
  scan_count: z.number().optional(),
  last_scanned_at: z.string().optional(),
  last_scanned_by: z.string().optional(),
  location_when_scanned: z.string().optional(),
  mobile_app_compatible: z.boolean().optional(),
  encoding_format: z.enum(['utf8', 'ascii', 'iso8859_1', 'binary']).optional(),
  label_size: z.enum(['1x1', '1x2', '2x1', '2x2', '3x1', '4x2', 'custom']).optional(),
  label_material: z.enum(['paper', 'vinyl', 'polyester', 'aluminum', 'ceramic', 'tamper_evident']).optional(),
  replacement_reason: z.string().optional(),
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
      .from('asset_barcodes')
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

    const barcode_type = searchParams.get('barcode_type');
    if (barcode_type) {
      query = query.eq('barcode_type', barcode_type);
    }

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`barcode_value.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    // Execute query
    const { data, error } = await query.order('print_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch barcode records' }, { status: 500 });
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
    const validatedData = BarcodeSchema.parse(body);

    // Insert barcode record
    const { data, error } = await supabase
      .from('asset_barcodes')
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
      return NextResponse.json({ error: 'Failed to create barcode record' }, { status: 500 });
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
