import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
  tax_id: z.string().optional(),
  vat_number: z.string().optional(),
  bio: z.string().optional(),
  tagline: z.string().optional(),
  years_experience: z.number().int().min(0).optional(),
  team_size: z.number().int().min(1).optional(),
  context: z.enum(['marketplace', 'procurement', 'internal']).default('marketplace')
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
    const context = searchParams.get('context') || 'marketplace';
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query for vendor profiles
    let query = supabase
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
        bio,
        tagline,
        years_experience,
        team_size,
        rating,
        total_reviews,
        total_projects,
        status,
        availability_status,
        created_at,
        updated_at
      `)
      .eq('organization_id', orgId)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply context-specific filters
    if (context === 'procurement') {
      // For procurement, we might want vendors with specific categories or verified status
      query = query.not('primary_category', 'is', null);
    }

    // Apply search filters
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('primary_category', category);
    }

    const { data: vendors, error } = await query;

    if (error) {
      console.error('Vendors fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'vendors.list',
      resource_type: 'vendor',
      details: { 
        count: vendors?.length || 0, 
        context,
        filters: { search, category, status } 
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      vendors: vendors || [], 
      context,
      pagination: {
        limit,
        offset,
        total: vendors?.length || 0
      }
    });

  } catch (error) {
    console.error('Vendors GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Check permissions - only admin/manager can create vendors
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const vendorData = vendorSchema.parse(body);

    // Create vendor profile
    const { data: vendor, error } = await supabase
      .from('opendeck_vendor_profiles')
      .insert({
        user_id: user.id,
        organization_id: orgId,
        business_name: vendorData.business_name,
        display_name: vendorData.display_name,
        business_type: vendorData.business_type,
        email: vendorData.email,
        phone: vendorData.phone,
        website: vendorData.website,
        address: vendorData.address,
        primary_category: vendorData.primary_category,
        categories: vendorData.categories || [],
        skills: vendorData.skills || [],
        hourly_rate: vendorData.hourly_rate,
        currency: vendorData.currency,
        tax_id: vendorData.tax_id,
        vat_number: vendorData.vat_number,
        bio: vendorData.bio,
        tagline: vendorData.tagline,
        years_experience: vendorData.years_experience,
        team_size: vendorData.team_size,
        status: 'active',
        availability_status: 'available',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Vendor creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'vendors.create',
      resource_type: 'vendor',
      resource_id: vendor.id,
      details: { 
        business_name: vendor.business_name,
        primary_category: vendor.primary_category,
        context: vendorData.context
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ vendor }, { status: 201 });

  } catch (error) {
    console.error('Vendors POST error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    // Check if user owns the vendor or is admin
    const { data: existingVendor } = await supabase
      .from('opendeck_vendor_profiles')
      .select('user_id')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!existingVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const isOwner = existingVendor.user_id === user.id;
    const isAdmin = ['owner', 'admin'].includes(role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update vendor
    const { data: vendor, error } = await supabase
      .from('opendeck_vendor_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Vendor update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'vendors.update',
      resource_type: 'vendor',
      resource_id: vendor.id,
      details: { updated_fields: Object.keys(updateData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ vendor });

  } catch (error) {
    console.error('Vendors PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
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
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    // Get vendor details before deletion
    const { data: vendor } = await supabase
      .from('opendeck_vendor_profiles')
      .select('business_name')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    // Delete vendor
    const { error } = await supabase
      .from('opendeck_vendor_profiles')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Vendor deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'vendors.delete',
      resource_type: 'vendor',
      resource_id: id,
      details: { business_name: vendor?.business_name || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Vendors DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
