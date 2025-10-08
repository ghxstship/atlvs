import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateContractSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  contractorId: z.string().uuid('Invalid contractor ID'),
  type: z.enum(['fixed_price', 'time_and_materials', 'cost_plus', 'unit_price']),
  status: z.enum(['draft', 'pending_approval', 'approved', 'active', 'completed', 'cancelled']).default('draft'),
  startDate: z.string(),
  endDate: z.string().optional(),
  value: z.number().positive('Contract value must be positive'),
  currency: z.string().default('USD'),
  paymentTerms: z.object({
    schedule: z.enum(['milestone', 'weekly', 'biweekly', 'monthly', 'completion']),
    net: z.number().default(30), // net payment days
    retentionPercentage: z.number().min(0).max(100).default(0),
    advancePayment: z.number().min(0).default(0)
  }),
  scope: z.object({
    description: z.string(),
    deliverables: z.array(z.string()),
    milestones: z.array(z.object({
      name: z.string(),
      description: z.string(),
      dueDate: z.string(),
      value: z.number().positive(),
      status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).default('pending')
    })).optional(),
    exclusions: z.array(z.string()).optional()
  }),
  terms: z.object({
    warrantyPeriod: z.number().optional(), // in months
    liquidatedDamages: z.number().optional(),
    performanceBond: z.number().optional(),
    insuranceRequirements: z.array(z.string()).optional(),
    safetyRequirements: z.array(z.string()).optional()
  }).optional(),
  approvals: z.array(z.object({
    approverRole: z.string(),
    approverId: z.string().uuid().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    comments: z.string().optional(),
    approvedAt: z.string().optional()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

const UpdateContractSchema = CreateContractSchema.partial().omit({ jobId: true, contractorId: true });

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
    const jobId = searchParams.get('jobId');
    const contractorId = searchParams.get('contractorId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('contracts')
      .select(`
        *,
        job:jobs(id, title, status, location),
        contractor:companies(id, name, type, contact_info),
        approvals:contract_approvals(
          approver:users(id, name, email),
          status,
          comments,
          approved_at
        ),
        milestones:contract_milestones(
          name,
          description,
          due_date,
          value,
          status,
          completed_at
        )
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (jobId) query = query.eq('job_id', jobId);
    if (contractorId) query = query.eq('contractor_id', contractorId);
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (search) {
      query = query.or(`scope->description.ilike.%${search}%`);
    }

    const { data: contracts, error, count } = await query;

    if (error) {
      console.error('Contracts fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate contract metrics
    const metrics = {
      totalValue: contracts?.reduce((sum, c) => sum + (c.value || 0), 0) || 0,
      activeContracts: contracts?.filter(c => c.status === 'active').length || 0,
      pendingApprovals: contracts?.filter(c => c.status === 'pending_approval').length || 0,
      completedContracts: contracts?.filter(c => c.status === 'completed').length || 0
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.contracting.list',
      resource_type: 'contract',
      details: { 
        count: contracts?.length || 0,
        filters: { jobId, contractorId, status, type, search }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      contracts: contracts || [], 
      metrics,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Contracting GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const contractData = CreateContractSchema.parse(body);

    // Verify job and contractor belong to organization
    const { data: job } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('id', contractData.jobId)
      .eq('organization_id', orgId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { data: contractor } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', contractData.contractorId)
      .eq('organization_id', orgId)
      .single();

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Create contract
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert({
        ...contractData,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Contract creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create milestones if provided
    if (contractData.scope.milestones && contractData.scope.milestones.length > 0) {
      const milestones = contractData.scope.milestones.map(milestone => ({
        contract_id: contract.id,
        organization_id: orgId,
        ...milestone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await supabase.from('contract_milestones').insert(milestones);
    }

    // Create approval workflow if approvals are defined
    if (contractData.approvals && contractData.approvals.length > 0) {
      const approvals = contractData.approvals.map(approval => ({
        contract_id: contract.id,
        organization_id: orgId,
        ...approval,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await supabase.from('contract_approvals').insert(approvals);
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.contracting.create',
      resource_type: 'contract',
      resource_id: contract.id,
      details: { 
        job_id: contractData.jobId,
        contractor_id: contractData.contractorId,
        value: contractData.value,
        type: contractData.type
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ contract }, { status: 201 });

  } catch (error) {
    console.error('Contracting POST error:', error);
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

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    const contractData = UpdateContractSchema.parse(updateData);

    const { data: contract, error } = await supabase
      .from('contracts')
      .update({
        ...contractData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Contract update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.contracting.update',
      resource_type: 'contract',
      resource_id: contract.id,
      details: { updated_fields: Object.keys(contractData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ contract });

  } catch (error) {
    console.error('Contracting PUT error:', error);
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
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    // Check if contract can be deleted (only draft or cancelled contracts)
    const { data: contract } = await supabase
      .from('contracts')
      .select('status, job_id, contractor_id, value')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (!['draft', 'cancelled'].includes(contract.status)) {
      return NextResponse.json({ 
        error: 'Only draft or cancelled contracts can be deleted' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Contract deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.contracting.delete',
      resource_type: 'contract',
      resource_id: id,
      details: { 
        job_id: contract.job_id,
        contractor_id: contract.contractor_id,
        value: contract.value,
        status: contract.status
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contracting DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
