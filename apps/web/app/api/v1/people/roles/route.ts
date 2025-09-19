import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  department: z.string().optional(),
  level: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive']),
  category: z.enum(['production', 'creative', 'technical', 'management', 'administrative', 'other']),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.object({
    education: z.array(z.string()).optional(),
    experience: z.string().optional(),
    skills: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional()
  }).optional(),
  compensation: z.object({
    salaryMin: z.number().positive().optional(),
    salaryMax: z.number().positive().optional(),
    hourlyMin: z.number().positive().optional(),
    hourlyMax: z.number().positive().optional(),
    currency: z.string().default('USD'),
    benefits: z.array(z.string()).optional()
  }).optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

const UpdateRoleSchema = CreateRoleSchema.partial();

const AssignRoleSchema = z.object({
  personId: z.string().uuid('Invalid person ID'),
  roleId: z.string().uuid('Invalid role ID'),
  startDate: z.string(),
  endDate: z.string().optional(),
  isPrimary: z.boolean().default(false),
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
    const department = searchParams.get('department');
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const personId = searchParams.get('personId');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // If fetching roles for a specific person
    if (personId) {
      const { data: personRoles, error } = await supabase
        .from('person_roles')
        .select(`
          *,
          role:roles(*),
          person:people(id, name, email)
        `)
        .eq('person_id', personId)
        .eq('organization_id', orgId)
        .order('is_primary', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Person roles fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ roles: personRoles || [] });
    }

    // Otherwise, fetch all roles
    let query = supabase
      .from('roles')
      .select(`
        *,
        assignments:person_roles(count),
        people:person_roles(
          person:people(id, name, email),
          is_primary,
          start_date,
          end_date
        )
      `)
      .eq('organization_id', orgId)
      .order('department', { ascending: true })
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (department) query = query.eq('department', department);
    if (level) query = query.eq('level', level);
    if (category) query = query.eq('category', category);
    if (isActive !== null) query = query.eq('is_active', isActive === 'true');
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: roles, error } = await query;

    if (error) {
      console.error('Roles fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate role statistics
    const roleStats = roles?.map(role => ({
      ...role,
      totalAssignments: role.assignments?.[0]?.count || 0,
      activeAssignments: role.people?.filter((p: any) => !p.end_date).length || 0,
      primaryAssignments: role.people?.filter((p: any) => p.is_primary).length || 0
    })) || [];

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.roles.list',
      resource_type: 'role',
      details: { 
        count: roles?.length || 0,
        filters: { department, level, category, personId, isActive, search }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ roles: roleStats });

  } catch (error) {
    console.error('Roles GET error:', error);
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
    
    // Check if this is a role assignment or creation
    if (body.personId && body.roleId) {
      // Assign role to person
      const assignmentData = AssignRoleSchema.parse(body);

      // Verify person belongs to organization
      const { data: person } = await supabase
        .from('people')
        .select('id')
        .eq('id', assignmentData.personId)
        .eq('organization_id', orgId)
        .single();

      if (!person) {
        return NextResponse.json({ error: 'Person not found' }, { status: 404 });
      }

      // If this is a primary role, unset other primary roles for this person
      if (assignmentData.isPrimary) {
        await supabase
          .from('person_roles')
          .update({ is_primary: false, updated_at: new Date().toISOString() })
          .eq('person_id', assignmentData.personId)
          .eq('organization_id', orgId);
      }

      const { data: assignment, error } = await supabase
        .from('person_roles')
        .insert({
          person_id: assignmentData.personId,
          role_id: assignmentData.roleId,
          organization_id: orgId,
          start_date: assignmentData.startDate,
          end_date: assignmentData.endDate,
          is_primary: assignmentData.isPrimary,
          notes: assignmentData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Role assignment error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'people.roles.assign',
        resource_type: 'person_role',
        resource_id: assignment.id,
        details: { 
          person_id: assignmentData.personId,
          role_id: assignmentData.roleId,
          is_primary: assignmentData.isPrimary
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ assignment }, { status: 201 });
    } else {
      // Create new role
      const roleData = CreateRoleSchema.parse(body);

      const { data: newRole, error } = await supabase
        .from('roles')
        .insert({
          ...roleData,
          organization_id: orgId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Role creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'people.roles.create',
        resource_type: 'role',
        resource_id: newRole.id,
        details: { 
          name: newRole.name,
          department: newRole.department,
          level: newRole.level,
          category: newRole.category
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ role: newRole }, { status: 201 });
    }

  } catch (error) {
    console.error('Roles POST error:', error);
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
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const roleData = UpdateRoleSchema.parse(updateData);

    const { data: updatedRole, error } = await supabase
      .from('roles')
      .update({
        ...roleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Role update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!updatedRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.roles.update',
      resource_type: 'role',
      resource_id: updatedRole.id,
      details: { updated_fields: Object.keys(roleData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ role: updatedRole });

  } catch (error) {
    console.error('Roles PUT error:', error);
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
      // Remove role assignment
      const { error } = await supabase
        .from('person_roles')
        .delete()
        .eq('id', assignmentId)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Role assignment deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'people.roles.unassign',
        resource_type: 'person_role',
        resource_id: assignmentId,
        occurred_at: new Date().toISOString()
      });
    } else if (id) {
      // Delete role (check for active assignments first)
      const { data: activeAssignments } = await supabase
        .from('person_roles')
        .select('id')
        .eq('role_id', id)
        .is('end_date', null)
        .limit(1);

      if (activeAssignments && activeAssignments.length > 0) {
        return NextResponse.json({ 
          error: 'Cannot delete role with active assignments. Please reassign people first.' 
        }, { status: 400 });
      }

      const { data: deletedRole } = await supabase
        .from('roles')
        .select('name')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Role deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'people.roles.delete',
        resource_type: 'role',
        resource_id: id,
        details: { name: deletedRole?.name || 'Unknown' },
        occurred_at: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Roles DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
