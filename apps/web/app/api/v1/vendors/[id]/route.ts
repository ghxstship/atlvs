import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const updateVendorSchema = z.object({
  business_name: z.string().min(1).optional(),
  display_name: z.string().min(1).optional(),
  business_type: z.enum(['individual', 'company', 'agency']).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  primary_category: z.string().optional(),
  categories: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  hourly_rate: z.number().positive().optional(),
  currency: z.string().optional(),
  tax_id: z.string().optional(),
  vat_number: z.string().optional(),
  bio: z.string().optional(),
  tagline: z.string().optional(),
  years_experience: z.number().int().min(0).optional(),
  team_size: z.number().int().min(1).optional(),
  availability_status: z.enum(['available', 'busy', 'unavailable']).optional(),
});

async function getAuthenticatedUser() {
  const cookieStore = cookies();
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    const vendorId = params.id;

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    // Fetch vendor details with related data
    const { data: vendor, error } = await supabase
      .from('opendeck_vendor_profiles')
      .select(`
        *,
        portfolio_items:opendeck_portfolio_items(
          id,
          title,
          description,
          category,
          thumbnail_url,
          client_name,
          project_date,
          featured
        ),
        services:opendeck_services(
          id,
          title,
          description,
          category,
          pricing_model,
          base_price,
          currency,
          delivery_time,
          status
        )
      `)
      .eq('id', vendorId)
      .eq('organization_id', orgId)
      .single();

    if (error) {
      console.error('Vendor fetch error:', error);
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'vendors.view',
      resource_type: 'vendor',
      resource_id: vendorId,
      details: { business_name: vendor.business_name },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ vendor });

  } catch (error) {
    console.error('Vendor GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();
    const vendorId = params.id;

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    // Check if user owns the vendor or is admin
    const { data: existingVendor } = await supabase
      .from('opendeck_vendor_profiles')
      .select('user_id, business_name')
      .eq('id', vendorId)
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

    const body = await request.json();
    const updateData = updateVendorSchema.parse(body);

    // Update vendor
    const { data: vendor, error } = await supabase
      .from('opendeck_vendor_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
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
      resource_id: vendorId,
      details: { 
        business_name: existingVendor.business_name,
        updated_fields: Object.keys(updateData) 
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ vendor });

  } catch (error) {
    console.error('Vendor PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();
    const vendorId = params.id;

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    // Only admins can delete vendors
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get vendor details before deletion
    const { data: vendor } = await supabase
      .from('opendeck_vendor_profiles')
      .select('business_name')
      .eq('id', vendorId)
      .eq('organization_id', orgId)
      .single();

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Check for dependencies (contracts, active proposals, etc.)
    const { data: activeContracts } = await supabase
      .from('opendeck_contracts')
      .select('id')
      .eq('vendor_id', vendorId)
      .in('status', ['pending', 'active'])
      .limit(1);

    if (activeContracts && activeContracts.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete vendor with active contracts' 
      }, { status: 400 });
    }

    // Delete vendor (cascade will handle related records)
    const { error } = await supabase
      .from('opendeck_vendor_profiles')
      .delete()
      .eq('id', vendorId)
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
      resource_id: vendorId,
      details: { business_name: vendor.business_name },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' });

  } catch (error) {
    console.error('Vendor DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
