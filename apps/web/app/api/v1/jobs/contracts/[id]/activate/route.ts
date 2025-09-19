import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ActivateContractSchema = z.object({
  activationNotes: z.string().optional(),
  effectiveDate: z.string().optional(),
  sendNotifications: z.boolean().default(true),
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();
    
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const activationData = ActivateContractSchema.parse(body);

    // Get the contract and verify it can be activated
    const { data: contract, error: fetchError } = await supabase
      .from('job_contracts')
      .select(`
        *,
        job:jobs(id, title, type, category, status),
        contractor:contractors(id, name, email, company)
      `)
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Validate contract status
    if (!['draft', 'pending'].includes(contract.status)) {
      return NextResponse.json({ 
        error: `Contract cannot be activated. Current status: ${contract.status}` 
      }, { status: 400 });
    }

    // Check if all signatories have signed
    const unsignedSignatories = contract.signatories?.filter((s: any) => !s.signedAt) || [];
    if (unsignedSignatories.length > 0) {
      return NextResponse.json({ 
        error: 'All signatories must sign before contract can be activated',
        unsignedCount: unsignedSignatories.length
      }, { status: 400 });
    }

    // Check for required compliance documents
    const { data: complianceCheck } = await supabase
      .from('job_compliance')
      .select('id, status, compliance_type')
      .eq('job_id', contract.job_id)
      .eq('contractor_id', contract.contractor_id)
      .eq('status', 'verified');

    const requiredCompliance = ['insurance', 'license']; // Define required compliance types
    const verifiedTypes = complianceCheck?.map(c => c.compliance_type) || [];
    const missingCompliance = requiredCompliance.filter(type => !verifiedTypes.includes(type));

    if (missingCompliance.length > 0) {
      return NextResponse.json({ 
        error: 'Missing required compliance documents',
        missing: missingCompliance
      }, { status: 400 });
    }

    const effectiveDate = activationData.effectiveDate || new Date().toISOString();

    // Update contract status to active
    const { data: updatedContract, error: updateError } = await supabase
      .from('job_contracts')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
        activated_by: user.id,
        effective_date: effectiveDate,
        activation_notes: activationData.activationNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Contract activation error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Create milestone payment schedule if applicable
    if (contract.milestones && contract.milestones.length > 0) {
      const paymentSchedule = contract.milestones.map((milestone: any) => ({
        contract_id: params.id,
        job_id: contract.job_id,
        contractor_id: contract.contractor_id,
        organization_id: orgId,
        milestone_name: milestone.name,
        amount: milestone.amount,
        due_date: milestone.dueDate,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }));

      await supabase.from('payment_schedules').insert(paymentSchedule);
    }

    // Send notifications if requested
    if (activationData.sendNotifications) {
      // Notify contractor
      await supabase.from('notifications').insert({
        user_id: contract.contractor_id,
        organization_id: orgId,
        type: 'contract_activated',
        title: 'Contract Activated',
        message: `Your contract "${contract.title}" has been activated and is now in effect`,
        data: { 
          contract_id: params.id, 
          job_id: contract.job_id,
          effective_date: effectiveDate
        },
        created_at: new Date().toISOString()
      });

      // Notify finance team
      await supabase.from('notifications').insert({
        user_id: user.id,
        organization_id: orgId,
        type: 'contract_activated_finance',
        title: 'New Active Contract',
        message: `Contract ${contract.contract_number} has been activated with value ${contract.currency} ${contract.value}`,
        data: { 
          contract_id: params.id,
          contract_number: contract.contract_number,
          value: contract.value,
          payment_terms: contract.payment_terms
        },
        created_at: new Date().toISOString()
      });
    }

    // Update related job assignment if exists
    if (contract.assignment_id) {
      await supabase
        .from('job_assignments')
        .update({
          status: 'active',
          contract_id: params.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', contract.assignment_id);
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.contracts.activate',
      resource_type: 'job_contract',
      resource_id: params.id,
      details: { 
        contract_number: contract.contract_number,
        effective_date: effectiveDate,
        value: contract.value,
        contractor: contract.contractor?.name
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      contract: updatedContract,
      message: 'Contract activated successfully' 
    });

  } catch (error) {
    console.error('Contract activate error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
