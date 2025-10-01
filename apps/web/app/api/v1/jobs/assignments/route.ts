import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateAssignmentSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  contractorId: z.string().uuid('Invalid contractor ID'),
  role: z.string().min(1, 'Role is required'),
  rate: z.number().positive('Rate must be positive'),
  rateType: z.enum(['hourly', 'daily', 'fixed', 'milestone']),
  currency: z.string().default('USD'),
  startDate: z.string(),
  endDate: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'declined', 'active', 'completed', 'cancelled']).default('pending'),
  terms: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  milestones: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    dueDate: z.string(),
    amount: z.number().positive(),
    status: z.enum(['pending', 'in_progress', 'completed', 'approved'])
  })).optional(),
  notes: z.string().optional(),
});

const UpdateAssignmentSchema = CreateAssignmentSchema.partial();

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
    const rateType = searchParams.get('rateType');

    let query = supabase
      .from('job_assignments')
      .select(`
        *,
        job:jobs(id, title, type, category, status),
        contractor:contractors(id, name, email, company)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (jobId) query = query.eq('job_id', jobId);
    if (contractorId) query = query.eq('contractor_id', contractorId);
    if (status) query = query.eq('status', status);
    if (rateType) query = query.eq('rate_type', rateType);

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Assignments fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.assignments.list',
      resource_type: 'job_assignment',
      details: { count: assignments?.length || 0, filters: { jobId, contractorId, status, rateType } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ assignments: assignments || [] });

  } catch (error) {
    console.error('Assignments GET error:', error);
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
    const assignmentData = CreateAssignmentSchema.parse(body);

    // Verify job exists and belongs to organization
    const { data: job } = await supabase
      .from('jobs')
      .select('id, status')
      .eq('id', assignmentData.jobId)
      .eq('organization_id', orgId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'open') {
      return NextResponse.json({ error: 'Job is not open for assignments' }, { status: 400 });
    }

    const { data: assignment, error } = await supabase
      .from('job_assignments')
      .insert({
        job_id: assignmentData.jobId,
        contractor_id: assignmentData.contractorId,
        organization_id: orgId,
        role: assignmentData.role,
        rate: assignmentData.rate,
        rate_type: assignmentData.rateType,
        currency: assignmentData.currency,
        start_date: assignmentData.startDate,
        end_date: assignmentData.endDate,
        status: assignmentData.status,
        terms: assignmentData.terms,
        deliverables: assignmentData.deliverables,
        milestones: assignmentData.milestones,
        notes: assignmentData.notes,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Assignment creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send notification to contractor
    await supabase.from('notifications').insert({
      user_id: assignmentData.contractorId,
      organization_id: orgId,
      type: 'job_assignment',
      title: 'New Job Assignment',
      message: `You have been assigned to a new job: ${assignmentData.role}`,
      data: { assignment_id: assignment.id, job_id: assignmentData.jobId },
      created_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.assignments.create',
      resource_type: 'job_assignment',
      resource_id: assignment.id,
      details: { job_id: assignmentData.jobId, contractor_id: assignmentData.contractorId, role: assignmentData.role },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ assignment }, { status: 201 });

  } catch (error) {
    console.error('Assignments POST error:', error);
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
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const assignmentData = UpdateAssignmentSchema.parse(updateData);

    const { data: assignment, error } = await supabase
      .from('job_assignments')
      .update({
        ...assignmentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Assignment update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.assignments.update',
      resource_type: 'job_assignment',
      resource_id: assignment.id,
      details: { updated_fields: Object.keys(assignmentData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ assignment });

  } catch (error) {
    console.error('Assignments PUT error:', error);
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
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const { data: assignment } = await supabase
      .from('job_assignments')
      .select('role, job_id')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('job_assignments')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Assignment deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.assignments.delete',
      resource_type: 'job_assignment',
      resource_id: id,
      details: { role: assignment?.role || 'Unknown', job_id: assignment?.job_id },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Assignments DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
