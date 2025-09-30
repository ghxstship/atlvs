import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';
import { rateLimitRequest } from '../../../../_components/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateCustomRoleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  permissions: z.record(z.array(z.string()))
});

const UpdateCustomRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  permissions: z.record(z.array(z.string())).optional()
});

// const _AssignRoleSchema = z.object({
//   userId: z.string().uuid(),
//   roleId: z.string().uuid()
// });

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

  const admin = createServiceRoleClient();

  return { user, orgId: membership.organization_id, role: membership.role, supabase, admin };
}

export async function GET(request: NextRequest) {
  try {
    const rl = await rateLimitRequest(request, 'rl:settings-roles-get', 60, 30);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { user, orgId, role, admin } = await getAuthenticatedUser();

    // Only admins and owners can view custom roles
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeSystem = searchParams.get('includeSystem') === 'true';

    let query = admin
      .from('custom_roles')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (!includeSystem) {
      query = query.eq('is_system', false);
    }

    const { data: roles, error } = await query;

    if (error) {
      console.error('Custom roles fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get role assignments count
    const roleIds = roles?.map(r => r.id) || [];
    const { data: assignments } = await admin
      .from('user_roles')
      .select('role_id')
      .in('role_id', roleIds);

    const assignmentCounts = assignments?.reduce((acc, a) => {
      acc[a.role_id] = (acc[a.role_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const rolesWithCounts = roles?.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: role.is_system,
      assignedUsers: assignmentCounts[role.id] || 0,
      createdAt: role.created_at,
      updatedAt: role.updated_at
    }));

    await admin.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'roles.list',
      resource_type: 'custom_role',
      details: { count: rolesWithCounts?.length || 0 },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ roles: rolesWithCounts });

  } catch (err: unknown) {
    console.error('Custom roles GET error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rl = await rateLimitRequest(request, 'rl:settings-roles-post', 60, 15);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { user, orgId, role, supabase, admin } = await getAuthenticatedUser();

    // Only owners can create custom roles
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Only organization owners can create custom roles' }, { status: 403 });
    }

    const body = await request.json();
    const roleData = CreateCustomRoleSchema.parse(body);

    // Check if role name already exists
    const { data: existingRole } = await supabase
      .from('custom_roles')
      .select('id')
      .eq('organization_id', orgId)
      .eq('name', roleData.name)
      .single();

    if (existingRole) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 400 });
    }

    // Create custom role
    const { data: newRole, error } = await supabase
      .from('custom_roles')
      .insert({
        organization_id: orgId,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        is_system: false,
        created_at: new Date().toISOString(),
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Custom role creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create permission matrix entries
    const permissionEntries = Object.entries(roleData.permissions).flatMap(([resource, actions]) =>
      actions.map(action => ({
        organization_id: orgId,
        role_id: newRole.id,
        resource,
        action,
        allowed: true,
        conditions: {},
        created_at: new Date().toISOString()
      }))
    );

    if (permissionEntries.length > 0) {
      await admin.from('permission_matrix').insert(permissionEntries);
    }

    await admin.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'role.created',
      resource_type: 'custom_role',
      resource_id: newRole.id,
      details: { 
        name: roleData.name,
        permissions: roleData.permissions
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      role: {
        id: newRole.id,
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        isSystem: newRole.is_system,
        createdAt: newRole.created_at
      }
    });

  } catch (err: unknown) {
    console.error('Custom role POST error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rl = await rateLimitRequest(request, 'rl:settings-roles-put', 60, 15);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { user, orgId, role, supabase, admin } = await getAuthenticatedUser();

    // Only owners can update custom roles
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Only organization owners can update custom roles' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('id');

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID required' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = UpdateCustomRoleSchema.parse(body);

    // Verify the role belongs to the organization and is not a system role
    const { data: existingRole } = await supabase
      .from('custom_roles')
      .select('organization_id, is_system')
      .eq('id', roleId)
      .single();

    if (!existingRole || existingRole.organization_id !== orgId) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (existingRole.is_system) {
      return NextResponse.json({ error: 'System roles cannot be modified' }, { status: 400 });
    }

    // Update the custom role
    const { data: updatedRole, error } = await supabase
      .from('custom_roles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', roleId)
      .select()
      .single();

    if (error) {
      console.error('Custom role update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update permission matrix if permissions changed
    if (updateData.permissions) {
      // Delete existing permissions
      await admin
        .from('permission_matrix')
        .delete()
        .eq('role_id', roleId);

      // Insert new permissions
      const permissionEntries = Object.entries(updateData.permissions).flatMap(([resource, actions]) =>
        actions.map(action => ({
          organization_id: orgId,
          role_id: roleId,
          resource,
          action,
          allowed: true,
          conditions: {},
          created_at: new Date().toISOString()
        }))
      );

      if (permissionEntries.length > 0) {
        await admin.from('permission_matrix').insert(permissionEntries);
      }
    }

    await admin.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'role.updated',
      resource_type: 'custom_role',
      resource_id: roleId,
      details: { changes: updateData },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: updatedRole.permissions,
        isSystem: updatedRole.is_system,
        updatedAt: updatedRole.updated_at
      }
    });

  } catch (err: unknown) {
    console.error('Custom role PUT error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rl = await rateLimitRequest(request, 'rl:settings-roles-delete', 60, 10);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { user, orgId, role, supabase, admin } = await getAuthenticatedUser();

    // Only owners can delete custom roles
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Only organization owners can delete custom roles' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('id');

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID required' }, { status: 400 });
    }

    // Verify the role belongs to the organization and is not a system role
    const { data: existingRole } = await supabase
      .from('custom_roles')
      .select('organization_id, name, is_system')
      .eq('id', roleId)
      .single();

    if (!existingRole || existingRole.organization_id !== orgId) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (existingRole.is_system) {
      return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 400 });
    }

    // Check if role is assigned to any users
    const { data: assignments } = await admin
      .from('user_roles')
      .select('id')
      .eq('role_id', roleId)
      .limit(1);

    if (assignments && assignments.length > 0) {
      return NextResponse.json({ error: 'Cannot delete role that is assigned to users' }, { status: 400 });
    }

    // Delete permission matrix entries
    await admin
      .from('permission_matrix')
      .delete()
      .eq('role_id', roleId);

    // Delete the custom role
    const { error } = await supabase
      .from('custom_roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      console.error('Custom role delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await admin.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'role.deleted',
      resource_type: 'custom_role',
      resource_id: roleId,
      details: { name: existingRole.name },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Custom role deleted successfully'
    });

  } catch (err: unknown) {
    console.error('Custom role DELETE error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
