import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateContractSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  contractorId: z.string().uuid('Invalid contractor ID'),
  contractType: z.enum(['fixed_price', 'time_materials', 'retainer', 'milestone', 'cost_plus']),
  title: z.string().min(1, 'Contract title is required'),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  value: z.number().positive('Contract value must be positive'),
  currency: z.string().default('USD'),
  paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'milestone_based']),
  status: z.enum(['draft', 'pending', 'active', 'completed', 'terminated', 'expired']).default('draft'),
  terms: z.string(),
  deliverables: z.array(z.object({
    name: z.string(),
    description: z.string(),
    dueDate: z.string(),
    amount: z.number().optional()
  })).optional(),
  milestones: z.array(z.object({
    name: z.string(),
    description: z.string(),
    dueDate: z.string(),
    amount: z.number(),
    status: z.enum(['pending', 'in_progress', 'completed', 'approved', 'paid'])
  })).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional(),
  signatories: z.array(z.object({
    userId: z.string(),
    role: z.string(),
    signedAt: z.string().optional()
  })).optional(),
});

const UpdateContractSchema = CreateContractSchema.partial();

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

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const contractorId = searchParams.get('contractorId');
    const status = searchParams.get('status');
    const contractType = searchParams.get('contractType');
    const expiringSoon = searchParams.get('expiringSoon');

    let query = supabase
      .from('job_contracts')
      .select(`
        *,
        job:jobs(id, title, type, category),
        contractor:contractors(id, name, email, company)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (jobId) query = query.eq('job_id', jobId);
    if (contractorId) query = query.eq('contractor_id', contractorId);
    if (status) query = query.eq('status', status);
    if (contractType) query = query.eq('contract_type', contractType);
    
    // Check for contracts expiring in next 30 days
    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.lte('end_date', thirtyDaysFromNow.toISOString());
      query = query.gte('end_date', new Date().toISOString());
      query = query.eq('status', 'active');
    }

    const { data: contracts, error } = await query;

    if (error) {
      console.error('Contracts fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate contract metrics
    const metrics = {
      total: contracts?.length || 0,
      totalValue: contracts?.reduce((sum, c) => sum + (c.value || 0), 0) || 0,
      active: contracts?.filter(c => c.status === 'active').length || 0,
      pending: contracts?.filter(c => c.status === 'pending').length || 0,
      expiringSoon: contracts?.filter(c => {
        if (c.status !== 'active' || !c.end_date) return false;
        const daysUntilExpiry = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
      }).length || 0
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.contracts.list',
      resource_type: 'job_contract',
      details: { count: contracts?.length || 0, filters: { jobId, contractorId, status, contractType } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ contracts: contracts || [], metrics });

  } catch (error) {
    console.error('Contracts GET error:', error);
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

    // Verify job exists and belongs to organization
    const { data: job } = await supabase
      .from('jobs')
      .select('id, title, organization_id')
      .eq('id', contractData.jobId)
      .eq('organization_id', orgId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Generate contract number
    const contractNumber = `CTR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data: contract, error } = await supabase
      .from('job_contracts')
      .insert({
        job_id: contractData.jobId,
        contractor_id: contractData.contractorId,
        organization_id: orgId,
        contract_number: contractNumber,
        contract_type: contractData.contractType,
        title: contractData.title,
        description: contractData.description,
        start_date: contractData.startDate,
        end_date: contractData.endDate,
        value: contractData.value,
        currency: contractData.currency,
        payment_terms: contractData.paymentTerms,
        status: contractData.status,
        terms: contractData.terms,
        deliverables: contractData.deliverables,
        milestones: contractData.milestones,
        attachments: contractData.attachments,
        signatories: contractData.signatories,
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

    // Send notification to contractor
    await supabase.from('notifications').insert({
      user_id: contractData.contractorId,
      organization_id: orgId,
      type: 'new_contract',
      title: 'New Contract Created',
      message: `A new contract has been created for: ${contractData.title}`,
      data: { contract_id: contract.id, job_id: contractData.jobId },
      created_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.contracts.create',
      resource_type: 'job_contract',
      resource_id: contract.id,
      details: { 
        job_id: contractData.jobId,
        contractor_id: contractData.contractorId,
        contract_number: contractNumber,
        value: contractData.value
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ contract }, { status: 201 });

  } catch (error) {
    console.error('Contracts POST error:', error);
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

    // Check if contract can be edited
    const { data: existingContract } = await supabase
      .from('job_contracts')
      .select('status')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!existingContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (['completed', 'terminated'].includes(existingContract.status)) {
      return NextResponse.json({ error: 'Cannot edit completed or terminated contracts' }, { status: 400 });
    }

    const { data: contract, error } = await supabase
      .from('job_contracts')
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

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.contracts.update',
      resource_type: 'job_contract',
      resource_id: contract.id,
      details: { updated_fields: Object.keys(contractData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ contract });

  } catch (error) {
    console.error('Contracts PUT error:', error);
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

    const { data: contract } = await supabase
      .from('job_contracts')
      .select('title, status, contract_number')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (contract?.status === 'active') {
      return NextResponse.json({ error: 'Cannot delete active contracts. Please terminate first.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('job_contracts')
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
      action: 'jobs.contracts.delete',
      resource_type: 'job_contract',
      resource_id: id,
      details: { 
        title: contract?.title || 'Unknown',
        contract_number: contract?.contract_number
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contracts DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
