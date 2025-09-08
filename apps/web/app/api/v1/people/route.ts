import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PeopleService } from '@ghxstship/application/services/PeopleService';
import { extractTenantContext } from '@/lib/tenant-context';
import { enforceRBAC } from '@/lib/rbac';

const CreatePersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).optional(),
  avatarUrl: z.string().url().optional(),
  isDemo: z.boolean().optional(),
});

const PersonFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'terminated']).optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const context = await extractTenantContext(request);
    await enforceRBAC(context, 'people:read');

    const { searchParams } = new URL(request.url);
    const filtersData = {
      status: searchParams.get('status') || undefined,
      department: searchParams.get('department') || undefined,
      role: searchParams.get('role') || undefined,
      location: searchParams.get('location') || undefined,
      skills: searchParams.get('skills')?.split(',') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const filters = PersonFiltersSchema.parse(filtersData);
    const peopleService = new PeopleService(
      // Repository dependencies would be injected here
    );

    const people = await peopleService.getPeople(context, filters);

    return NextResponse.json({
      success: true,
      data: people,
      count: people.length,
    });
  } catch (error) {
    console.error('Error fetching people:', error);
    
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
    const personData = CreatePersonSchema.parse(body);

    const peopleService = new PeopleService(
      // Repository dependencies would be injected here
    );

    const person = await peopleService.createPerson({
      organizationId: context.organizationId,
      firstName: body.firstName,
      lastName: body.lastName,
      status: body.status,
      email: body.email,
      phone: body.phone,
      role: body.role,
      department: body.department,
      location: body.location,
      startDate: body.startDate,
      endDate: body.endDate,
      isDemo: body.isDemo
    });

    return NextResponse.json({
      success: true,
      data: person,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating person:', error);
    
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
