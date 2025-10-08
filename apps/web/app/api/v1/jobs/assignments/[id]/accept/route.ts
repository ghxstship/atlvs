import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const AcceptAssignmentSchema = z.object({
  acceptanceNotes: z.string().optional(),
  agreedToTerms: z.boolean(),
  availableStartDate: z.string().optional()
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const body = await request.json();
    const acceptanceData = AcceptAssignmentSchema.parse(body);

    if (!acceptanceData.agreedToTerms) {
      return NextResponse.json({ error: 'Must agree to terms to accept assignment' }, { status: 400 });
    }

    // Get the assignment and verify contractor
    const { data: assignment, error: fetchError } = await supabase
      .from('job_assignments')
      .select(`
        *,
        job:jobs(id, title, type, category, status)
      `)
      .eq('id', params.id)
      .single();

    if (fetchError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Verify the user is the assigned contractor
    if (assignment.contractor_id !== user.id) {
      // Check if user is admin/owner of the organization
      const { data: membership } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', assignment.organization_id)
        .single();

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return NextResponse.json({ error: 'Only the assigned contractor can accept this assignment' }, { status: 403 });
      }
    }

    if (assignment.status !== 'pending') {
      return NextResponse.json({ error: `Assignment cannot be accepted. Current status: ${assignment.status}` }, { status: 400 });
    }

    // Update assignment status to accepted
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('job_assignments')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        acceptance_notes: acceptanceData.acceptanceNotes,
        available_start_date: acceptanceData.availableStartDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Assignment acceptance error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Create contract record
    const { data: contract } = await supabase
      .from('job_contracts')
      .insert({
        job_id: assignment.job_id,
        assignment_id: params.id,
        contractor_id: assignment.contractor_id,
        organization_id: assignment.organization_id,
        status: 'active',
        start_date: acceptanceData.availableStartDate || assignment.start_date,
        end_date: assignment.end_date,
        rate: assignment.rate,
        rate_type: assignment.rate_type,
        currency: assignment.currency,
        terms: assignment.terms,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    // Send notification to job owner
    await supabase.from('notifications').insert({
      user_id: assignment.created_by,
      organization_id: assignment.organization_id,
      type: 'assignment_accepted',
      title: 'Job Assignment Accepted',
      message: `Contractor has accepted the assignment for: ${assignment.role}`,
      data: { 
        assignment_id: params.id, 
        job_id: assignment.job_id,
        contract_id: contract?.id 
      },
      created_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({
      organization_id: assignment.organization_id,
      user_id: user.id,
      action: 'jobs.assignments.accept',
      resource_type: 'job_assignment',
      resource_id: params.id,
      details: { 
        job_id: assignment.job_id,
        role: assignment.role,
        contract_id: contract?.id
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      assignment: updatedAssignment,
      contract: contract,
      message: 'Assignment accepted successfully' 
    });

  } catch (error) {
    console.error('Assignment accept error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
