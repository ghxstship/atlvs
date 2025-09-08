import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PeopleService } from '@ghxstship/application/services/PeopleService';
import { extractTenantContext } from '@/lib/tenant-context';
import { enforceRBAC } from '@/lib/rbac';

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
    const context = await extractTenantContext(request);
    await enforceRBAC(context, 'people:read');

    const { searchParams } = new URL(request.url);
    const filtersData = {
      department: searchParams.get('department') || undefined,
      level: searchParams.get('level') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const filters = RoleFiltersSchema.parse(filtersData);
    const peopleService = new PeopleService(
      // Repository dependencies would be injected here
    );

    const roles = await peopleService.getRoles(context, filters);

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
    const context = await extractTenantContext(request);
    await enforceRBAC(context, 'people:write');

    const body = await request.json();
    const roleData = CreateRoleSchema.parse(body);

    const peopleService = new PeopleService(
      // Repository dependencies would be injected here
    );

    const role = await peopleService.createRole(context, roleData);

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
