import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

// Validation schema for company qualifications
const CompanyQualificationSchema = z.object({
  companyId: z.string().uuid(),
  type: z.enum(['certification', 'license', 'insurance', 'bond', 'safety', 'other']),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  issuingAuthority: z.string().optional(),
  certificateNumber: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  status: z.enum(['active', 'expired', 'pending', 'revoked']).default('pending'),
  documentUrl: z.string().url().optional(),
  verifiedDate: z.string().optional(),
  verifiedBy: z.string().uuid().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const expiring = searchParams.get('expiring'); // Get qualifications expiring soon
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('company_qualifications')
      .select(`
        *,
        companies!inner(name)
      `)
      .eq('organization_id', orgId);

    // Apply filters
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (companyId) query = query.eq('company_id', companyId);
    
    // Filter for expiring qualifications (within 30 days)
    if (expiring === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query
        .not('expiry_date', 'is', null)
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0]);
    }

    // Apply pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: qualifications, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch qualifications' }, { status: 500 });
    }

    // Format response with company names
    const formattedQualifications = qualifications.map(qualification => ({
      ...qualification,
      companyName: qualification.companies?.name,
      companies: undefined // Remove the joined data
    }));

    return NextResponse.json({
      qualifications: formattedQualifications,
      pagination: {
        page,
        limit,
        total: qualifications.length
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check permissions - require settings:manage for qualification creation
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role, permissions')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !membership.permissions?.includes('settings:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CompanyQualificationSchema.parse(body);

    // Verify company belongs to organization
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', validatedData.companyId)
      .eq('organization_id', orgId)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Create qualification
    const { data: qualification, error } = await supabase
      .from('company_qualifications')
      .insert({
        ...validatedData,
        organization_id: orgId,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create qualification' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'create',
      resource_type: 'company_qualification',
      resource_id: qualification.id,
      details: { name: qualification.name, company_id: qualification.company_id }
    });

    return NextResponse.json({
      qualification: {
        ...qualification,
        createdAt: qualification.created_at,
        updatedAt: qualification.updated_at
      }
    }, { status: 201 });

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

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Qualification ID required' }, { status: 400 });
    }

    const validatedData = CompanyQualificationSchema.partial().parse(updateData);

    // Check permissions
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role, permissions')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !membership.permissions?.includes('settings:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update qualification
    const { data: qualification, error } = await supabase
      .from('company_qualifications')
      .update(validatedData)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update qualification' }, { status: 500 });
    }

    if (!qualification) {
      return NextResponse.json({ error: 'Qualification not found' }, { status: 404 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'update',
      resource_type: 'company_qualification',
      resource_id: qualification.id,
      details: { changes: validatedData }
    });

    return NextResponse.json({
      qualification: {
        ...qualification,
        createdAt: qualification.created_at,
        updatedAt: qualification.updated_at
      }
    });

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

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get qualification ID from query params
    const { searchParams } = new URL(request.url);
    const qualificationId = searchParams.get('id');
    
    if (!qualificationId) {
      return NextResponse.json({ error: 'Qualification ID required' }, { status: 400 });
    }

    // Check permissions
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role, permissions')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !membership.permissions?.includes('settings:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get qualification details for audit log
    const { data: qualification } = await supabase
      .from('company_qualifications')
      .select('id, name, company_id')
      .eq('id', qualificationId)
      .eq('organization_id', orgId)
      .single();

    if (!qualification) {
      return NextResponse.json({ error: 'Qualification not found' }, { status: 404 });
    }

    // Delete qualification
    const { error } = await supabase
      .from('company_qualifications')
      .delete()
      .eq('id', qualificationId)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete qualification' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'delete',
      resource_type: 'company_qualification',
      resource_id: qualificationId,
      details: { name: qualification.name, company_id: qualification.company_id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
