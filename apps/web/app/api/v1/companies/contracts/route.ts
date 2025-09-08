import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

// Validation schema for company contracts
const CompanyContractSchema = z.object({
  companyId: z.string().uuid(),
  type: z.enum(['msa', 'sow', 'nda', 'service_agreement', 'purchase_order', 'other']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'pending', 'active', 'expired', 'terminated', 'renewed']),
  value: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  renewalDate: z.string().optional(),
  autoRenewal: z.boolean().default(false),
  renewalTerms: z.string().optional(),
  documentUrl: z.string().url().optional(),
  terms: z.string().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('company_contracts')
      .select(`
        *,
        companies!inner(name)
      `)
      .eq('organization_id', orgId);

    // Apply filters
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (companyId) query = query.eq('company_id', companyId);

    // Apply pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: contracts, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }

    // Format response with company names
    const formattedContracts = contracts.map(contract => ({
      ...contract,
      companyName: contract.companies?.name,
      companies: undefined // Remove the joined data
    }));

    return NextResponse.json({
      contracts: formattedContracts,
      pagination: {
        page,
        limit,
        total: contracts.length
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
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

    // Check permissions - require settings:manage for contract creation
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
    const validatedData = CompanyContractSchema.parse(body);

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

    // Create contract
    const { data: contract, error } = await supabase
      .from('company_contracts')
      .insert({
        ...validatedData,
        organization_id: orgId,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'create',
      resource_type: 'company_contract',
      resource_id: contract.id,
      details: { title: contract.title, company_id: contract.company_id }
    });

    return NextResponse.json({
      contract: {
        ...contract,
        createdAt: contract.created_at,
        updatedAt: contract.updated_at
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
    const supabase = createServerClient();
    
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
      return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
    }

    const validatedData = CompanyContractSchema.partial().parse(updateData);

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

    // Update contract
    const { data: contract, error } = await supabase
      .from('company_contracts')
      .update(validatedData)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
    }

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'update',
      resource_type: 'company_contract',
      resource_id: contract.id,
      details: { changes: validatedData }
    });

    return NextResponse.json({
      contract: {
        ...contract,
        createdAt: contract.created_at,
        updatedAt: contract.updated_at
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
    const supabase = createServerClient();
    
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

    // Get contract ID from query params
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');
    
    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
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

    // Get contract details for audit log
    const { data: contract } = await supabase
      .from('company_contracts')
      .select('id, title, company_id')
      .eq('id', contractId)
      .eq('organization_id', orgId)
      .single();

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Delete contract
    const { error } = await supabase
      .from('company_contracts')
      .delete()
      .eq('id', contractId)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'delete',
      resource_type: 'company_contract',
      resource_id: contractId,
      details: { title: contract.title, company_id: contract.company_id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
