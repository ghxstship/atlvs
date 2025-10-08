import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';

const vendorSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  display_name: z.string().min(1, 'Display name is required'),
  business_type: z.enum(['individual', 'company', 'agency']).default('company'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  primary_category: z.string().min(1, 'Primary category is required'),
  categories: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  hourly_rate: z.number().positive().optional(),
  currency: z.string().default('USD'),
  payment_terms: z.string().optional(),
  tax_id: z.string().optional(),
  vat_number: z.string().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sb = createServerClient(cookieStore);

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check authentication
    const { data: { user }, error: authError } = await sb.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user has access to organization
    const { data: membership } = await sb
      .from('memberships')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';

    // Fetch vendors from opendeck_vendor_profiles with procurement context
    let query = sb
      .from('opendeck_vendor_profiles')
      .select(`
        id,
        business_name,
        display_name,
        business_type,
        email,
        phone,
        website,
        address,
        primary_category,
        categories,
        skills,
        hourly_rate,
        currency,
        tax_id,
        vat_number,
        rating,
        total_reviews,
        total_projects,
        status,
        created_at,
        updated_at
      `)
      .eq('organization_id', orgId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('primary_category', category);
    }

    const { data: vendors, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    return NextResponse.json({ data: vendors });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sb = createServerClient(cookieStore);

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check authentication
    const { data: { user }, error: authError } = await sb.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user has admin or manager role
    const { data: membership } = await sb
      .from('memberships')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = vendorSchema.parse(body);

    // Create vendor profile in opendeck_vendor_profiles
    const { data: vendor, error } = await sb
      .from('opendeck_vendor_profiles')
      .insert({
        user_id: user.id, // Required field
        organization_id: orgId,
        business_name: validatedData.business_name,
        display_name: validatedData.display_name,
        business_type: validatedData.business_type,
        email: validatedData.email,
        phone: validatedData.phone,
        website: validatedData.website,
        address: validatedData.address,
        primary_category: validatedData.primary_category,
        categories: validatedData.categories || [],
        skills: validatedData.skills || [],
        hourly_rate: validatedData.hourly_rate,
        currency: validatedData.currency,
        tax_id: validatedData.tax_id,
        vat_number: validatedData.vat_number,
        bio: validatedData.notes, // Map notes to bio field
        status: 'active', // Default status for procurement vendors
        availability_status: 'available'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
    }

    // Log audit event
    await sb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'procurement.vendor.create',
      resource_type: 'vendor',
      resource_id: vendor.id,
      details: { 
        business_name: vendor.business_name,
        primary_category: vendor.primary_category,
        context: 'procurement'
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ data: vendor }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
