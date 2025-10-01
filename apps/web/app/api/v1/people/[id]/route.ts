import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UpdatePersonSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  currency: z.string().optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    expiryDate: z.string().optional()
  })).optional(),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
    email: z.string().email().optional()
  }).optional(),
  metadata: z.record(z.any()).optional(),
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { data: person, error } = await supabase
      .from('people')
      .select(`
        *,
        user:users(id, email, raw_user_meta_data),
        competencies:person_competencies(
          competency:competencies(id, name, category, level),
          level,
          certified_date,
          expiry_date
        ),
        assignments:job_assignments(
          job:jobs(id, title, status),
          role,
          status,
          start_date,
          end_date
        ),
        projects:project_members(
          project:projects(id, name, status),
          role,
          allocation_percentage
        )
      `)
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (error || !person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    // Calculate person metrics
    const metrics = {
      totalProjects: person.projects?.length || 0,
      activeProjects: person.projects?.filter((p: any) => p.project?.status === 'active').length || 0,
      totalAssignments: person.assignments?.length || 0,
      activeAssignments: person.assignments?.filter((a: any) => a.status === 'active').length || 0,
      competencyCount: person.competencies?.length || 0,
      utilization: calculateUtilization(person.projects || []),
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.get',
      resource_type: 'person',
      resource_id: params.id,
      details: { person_name: person.name },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ person, metrics });

  } catch (error) {
    console.error('Person GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Check permissions - managers can edit people in their department, admins/owners can edit anyone
    const { data: existingPerson } = await supabase
      .from('people')
      .select('department, created_by')
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (!existingPerson) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    // Check if user has permission to edit
    const canEdit = ['owner', 'admin'].includes(role) || 
                   (role === 'manager' && existingPerson.created_by === user.id);

    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const updateData = UpdatePersonSchema.parse(body);

    const { data: person, error } = await supabase
      .from('people')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Person update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If status changed to terminated, update related records
    if (updateData.status === 'terminated') {
      // End active assignments
      await supabase
        .from('job_assignments')
        .update({
          status: 'completed',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('person_id', params.id)
        .eq('status', 'active');

      // Remove from active projects
      await supabase
        .from('project_members')
        .update({
          status: 'inactive',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('person_id', params.id)
        .eq('status', 'active');

      // Send notification
      await supabase.from('notifications').insert({
        user_id: person.user_id,
        organization_id: orgId,
        type: 'status_change',
        title: 'Employment Status Updated',
        message: 'Your employment status has been updated to terminated',
        created_at: new Date().toISOString()
      });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.update',
      resource_type: 'person',
      resource_id: params.id,
      details: { 
        updated_fields: Object.keys(updateData),
        status_change: updateData.status
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ person });

  } catch (error) {
    console.error('Person PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: person } = await supabase
      .from('people')
      .select('name, email')
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    // Check for active assignments or projects
    const { data: activeAssignments } = await supabase
      .from('job_assignments')
      .select('id')
      .eq('person_id', params.id)
      .eq('status', 'active')
      .limit(1);

    if (activeAssignments && activeAssignments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete person with active assignments. Please reassign or complete them first.' 
      }, { status: 400 });
    }

    // Soft delete by updating status
    const { error } = await supabase
      .from('people')
      .update({
        status: 'terminated',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Person deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.delete',
      resource_type: 'person',
      resource_id: params.id,
      details: { 
        name: person.name,
        email: person.email
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Person has been deactivated' });

  } catch (error) {
    console.error('Person DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate utilization
function calculateUtilization(projects: any[]) {
  const activeProjects = projects.filter(p => p.project?.status === 'active');
  if (activeProjects.length === 0) return 0;
  
  const totalAllocation = activeProjects.reduce((sum, p) => sum + (p.allocation_percentage || 0), 0);
  return Math.min(totalAllocation, 100);
}
