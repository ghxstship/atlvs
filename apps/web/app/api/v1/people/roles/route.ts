import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractTenantContext } from '@/lib/tenant-context';
import { enforceRBAC } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';

const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  department: z.string().optional(),
});

const RoleFiltersSchema = z.object({
  department: z.string().optional(),
  level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const context = await extractTenantContext();
    await enforceRBAC(context.userId, context.organizationId, 'people:read');

    const { searchParams } = new URL(request.url);
    const filtersData = {
      department: searchParams.get('department') || undefined,
      level: searchParams.get('level') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const filters = RoleFiltersSchema.parse(filtersData);
    const supabase = await createClient();
    let query = supabase
      .from('people_roles')
      .select('*')
      .eq('organization_id', context.organizationId);

    if (filters.department) query = query.eq('department', filters.department);
    if (filters.level) query = query.eq('level', filters.level);
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data: roles, error } = await query;
    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch roles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: roles,
      count: roles.length,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await extractTenantContext();
    await enforceRBAC(context.userId, context.organizationId, 'people:write');

    const body = await request.json();
    const roleData = CreateRoleSchema.parse(body);
    const supabase = await createClient();
    const { data: role, error } = await supabase
      .from('people_roles')
      .insert({
        organization_id: context.organizationId,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions ?? [],
        level: roleData.level,
        department: roleData.department,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !role) {
      console.error('Error creating role:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: role,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
