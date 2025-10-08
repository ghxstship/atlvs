import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas
const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  industry: z.string().min(1, 'Industry is required'),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'blacklisted']).default('active'),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional()
});

const UpdateCompanySchema = CreateCompanySchema.partial();

const QuerySchema = z.object({
  industry: z.string().optional(),
  status: z.string().optional(),
  size: z.string().optional(),
  search: z.string().optional(),
  limit: z.string().transform(val => parseInt(val) || 50).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional()
});

async function getAuthenticatedUser(request: NextRequest) {
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

  // Get organization membership
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
    const { user, orgId, supabase } = await getAuthenticatedUser(request);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { industry, status, size, search, limit = 50, offset = 0 } = QuerySchema.parse(queryParams);

    // Build query
    let query = supabase
      .from('companies')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (industry) query = query.eq('industry', industry);
    if (status) query = query.eq('status', status);
    if (size) query = query.eq('size', size);
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: companies, error, count } = await query;

    if (error) {
      console.error('Companies fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'companies.list',
      resource_type: 'company',
      details: { filters: { industry, status, size, search }, count: companies?.length || 0 },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({
      companies: companies || [],
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Companies GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser(request);

    // Check permissions (admin/manager can create companies)
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const companyData = CreateCompanySchema.parse(body);

    // Create company
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        ...companyData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Company creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'companies.create',
      resource_type: 'company',
      resource_id: company.id,
      details: { name: company.name, industry: company.industry },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ company }, { status: 201 });

  } catch (error) {
    console.error('Companies POST error:', error);
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
    const { user, orgId, role, supabase } = await getAuthenticatedUser(request);

    // Check permissions
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const companyData = UpdateCompanySchema.parse(updateData);

    // Update company
    const { data: company, error } = await supabase
      .from('companies')
      .update({
        ...companyData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Company update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'companies.update',
      resource_type: 'company',
      resource_id: company.id,
      details: { updated_fields: Object.keys(companyData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ company });

  } catch (error) {
    console.error('Companies PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser(request);

    // Check permissions (only admin/owner can delete)
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Check for dependencies (contracts, ratings, etc.)
    const { data: contracts } = await supabase
      .from('company_contracts')
      .select('id')
      .eq('company_id', id)
      .eq('organization_id', orgId)
      .limit(1);

    if (contracts && contracts.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete company with active contracts. Please remove contracts first.' 
      }, { status: 409 });
    }

    // Get company name for audit log
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    // Delete company
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Company deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'companies.delete',
      resource_type: 'company',
      resource_id: id,
      details: { name: company?.name || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Companies DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
