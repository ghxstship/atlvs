import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateManningPlanSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  name: z.string().min(1, 'Manning plan name is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
  startDate: z.string(),
  endDate: z.string().optional(),
  shifts: z.array(z.object({
    name: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    daysOfWeek: z.array(z.number().min(0).max(6)), // 0=Sunday, 6=Saturday
    requiredPersonnel: z.number().positive()
  })),
  positions: z.array(z.object({
    roleId: z.string().uuid(),
    quantity: z.number().positive(),
    priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
    requirements: z.object({
      minExperience: z.number().min(0).optional(),
      requiredCertifications: z.array(z.string()).optional(),
      requiredSkills: z.array(z.string()).optional(),
      physicalRequirements: z.array(z.string()).optional()
    }).optional(),
    compensation: z.object({
      hourlyRate: z.number().positive().optional(),
      overtimeRate: z.number().positive().optional(),
      currency: z.string().default('USD')
    }).optional()
  })),
  constraints: z.object({
    maxHoursPerWeek: z.number().positive().optional(),
    minRestHours: z.number().positive().optional(),
    maxConsecutiveDays: z.number().positive().optional(),
    unionRequirements: z.array(z.string()).optional(),
    safetyRequirements: z.array(z.string()).optional()
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdateManningPlanSchema = CreateManningPlanSchema.partial().omit({ jobId: true });

const AssignPersonnelSchema = z.object({
  manningPlanId: z.string().uuid('Invalid manning plan ID'),
  personId: z.string().uuid('Invalid person ID'),
  positionId: z.string().uuid('Invalid position ID'),
  shiftId: z.string().uuid('Invalid shift ID'),
  startDate: z.string(),
  endDate: z.string().optional(),
  status: z.enum(['assigned', 'confirmed', 'active', 'completed', 'cancelled']).default('assigned'),
  notes: z.string().optional(),
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

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const includeAssignments = searchParams.get('includeAssignments') === 'true';

    let query = supabase
      .from('manning_plans')
      .select(`
        *,
        job:jobs(id, title, status, location),
        positions:manning_positions(
          *,
          role:roles(id, name, level, category),
          assignments:personnel_assignments(
            person:people(id, name, email, status),
            status,
            start_date,
            end_date
          )
        ),
        shifts:manning_shifts(*),
        ${includeAssignments ? `
        assignments:personnel_assignments(
          person:people(id, name, email, phone),
          position:manning_positions(role:roles(name)),
          shift:manning_shifts(name, start_time, end_time),
          status,
          start_date,
          end_date
        )` : ''}
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (jobId) query = query.eq('job_id', jobId);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: manningPlans, error } = await query;

    if (error) {
      console.error('Manning plans fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate manning metrics
    const metrics = (manningPlans || []).reduce((acc, plan) => {
      const totalPositions = (plan as any).positions?.reduce((sum: number, pos) => sum + pos.quantity, 0) || 0;
      const filledPositions = (plan as any).positions?.reduce((sum: number, pos) => 
        sum + (pos.assignments?.filter((a: any) => ['assigned', 'confirmed', 'active'].includes(a.status)).length || 0), 0) || 0;
      
      return {
        totalPlans: acc.totalPlans + 1,
        activePlans: acc.activePlans + ((plan as any).status === 'active' ? 1 : 0),
        totalPositions: acc.totalPositions + totalPositions,
        filledPositions: acc.filledPositions + filledPositions,
        fillRate: acc.totalPositions > 0 ? (acc.filledPositions / acc.totalPositions) * 100 : 0
      };
    }, {
      totalPlans: 0,
      activePlans: 0,
      totalPositions: 0,
      filledPositions: 0,
      fillRate: 0
    }) || { totalPlans: 0, activePlans: 0, totalPositions: 0, filledPositions: 0, fillRate: 0 };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.manning.list',
      resource_type: 'manning_plan',
      details: { 
        count: manningPlans?.length || 0,
        filters: { jobId, status, search, includeAssignments }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      manningPlans: manningPlans || [], 
      metrics
    });

  } catch (error) {
    console.error('Manning GET error:', error);
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
    
    // Check if this is personnel assignment or manning plan creation
    if (body.manningPlanId && body.personId) {
      // Assign personnel to manning plan
      const assignmentData = AssignPersonnelSchema.parse(body);

      // Verify manning plan belongs to organization
      const { data: manningPlan } = await supabase
        .from('manning_plans')
        .select('id')
        .eq('id', assignmentData.manningPlanId)
        .eq('organization_id', orgId)
        .single();

      if (!manningPlan) {
        return NextResponse.json({ error: 'Manning plan not found' }, { status: 404 });
      }

      // Verify person belongs to organization
      const { data: person } = await supabase
        .from('people')
        .select('id, name')
        .eq('id', assignmentData.personId)
        .eq('organization_id', orgId)
        .single();

      if (!person) {
        return NextResponse.json({ error: 'Person not found' }, { status: 404 });
      }

      const { data: assignment, error } = await supabase
        .from('personnel_assignments')
        .insert({
          manning_plan_id: assignmentData.manningPlanId,
          person_id: assignmentData.personId,
          position_id: assignmentData.positionId,
          shift_id: assignmentData.shiftId,
          organization_id: orgId,
          start_date: assignmentData.startDate,
          end_date: assignmentData.endDate,
          status: assignmentData.status,
          notes: assignmentData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Personnel assignment error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.manning.assign',
        resource_type: 'personnel_assignment',
        resource_id: assignment.id,
        details: { 
          manning_plan_id: assignmentData.manningPlanId,
          person_id: assignmentData.personId,
          person_name: person.name
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ assignment }, { status: 201 });
    } else {
      // Create new manning plan
      const manningData = CreateManningPlanSchema.parse(body);

      // Verify job belongs to organization
      const { data: job } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('id', manningData.jobId)
        .eq('organization_id', orgId)
        .single();

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const { data: manningPlan, error } = await supabase
        .from('manning_plans')
        .insert({
          job_id: manningData.jobId,
          name: manningData.name,
          description: manningData.description,
          status: manningData.status,
          start_date: manningData.startDate,
          end_date: manningData.endDate,
          constraints: manningData.constraints,
          metadata: manningData.metadata,
          organization_id: orgId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Manning plan creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Create shifts
      if (manningData.shifts && manningData.shifts.length > 0) {
        const shifts = manningData.shifts.map(shift => ({
          manning_plan_id: manningPlan.id,
          organization_id: orgId,
          ...shift,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabase.from('manning_shifts').insert(shifts);
      }

      // Create positions
      if (manningData.positions && manningData.positions.length > 0) {
        const positions = manningData.positions.map(position => ({
          manning_plan_id: manningPlan.id,
          organization_id: orgId,
          role_id: position.roleId,
          quantity: position.quantity,
          priority: position.priority,
          requirements: position.requirements,
          compensation: position.compensation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabase.from('manning_positions').insert(positions);
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.manning.create',
        resource_type: 'manning_plan',
        resource_id: manningPlan.id,
        details: { 
          job_id: manningData.jobId,
          name: manningData.name,
          positions_count: manningData.positions?.length || 0,
          shifts_count: manningData.shifts?.length || 0
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ manningPlan }, { status: 201 });
    }

  } catch (error) {
    console.error('Manning POST error:', error);
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
      return NextResponse.json({ error: 'Manning plan ID is required' }, { status: 400 });
    }

    const manningData = UpdateManningPlanSchema.parse(updateData);

    const { data: manningPlan, error } = await supabase
      .from('manning_plans')
      .update({
        ...manningData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Manning plan update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!manningPlan) {
      return NextResponse.json({ error: 'Manning plan not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.manning.update',
      resource_type: 'manning_plan',
      resource_id: manningPlan.id,
      details: { updated_fields: Object.keys(manningData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ manningPlan });

  } catch (error) {
    console.error('Manning PUT error:', error);
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
    const { id, assignmentId } = body;

    if (assignmentId) {
      // Remove personnel assignment
      const { error } = await supabase
        .from('personnel_assignments')
        .delete()
        .eq('id', assignmentId)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Assignment deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.manning.unassign',
        resource_type: 'personnel_assignment',
        resource_id: assignmentId,
        occurred_at: new Date().toISOString()
      });
    } else if (id) {
      // Delete manning plan
      const { data: manningPlan } = await supabase
        .from('manning_plans')
        .select('name, status')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      if (!manningPlan) {
        return NextResponse.json({ error: 'Manning plan not found' }, { status: 404 });
      }

      if (manningPlan.status === 'active') {
        return NextResponse.json({ 
          error: 'Cannot delete active manning plan. Please deactivate it first.' 
        }, { status: 400 });
      }

      const { error } = await supabase
        .from('manning_plans')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Manning plan deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.manning.delete',
        resource_type: 'manning_plan',
        resource_id: id,
        details: { name: manningPlan.name },
        occurred_at: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Manning DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
