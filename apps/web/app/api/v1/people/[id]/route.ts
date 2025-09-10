import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PeopleService } from '@ghxstship/application/services/PeopleService';
import { extractTenantContext } from '@/lib/tenant-context';
import { enforceRBAC } from '@/lib/rbac';

const UpdatePersonSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  endDate: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await extractTenantContext();
    await enforceRBAC(context, 'people:read');

    const peopleService = new PeopleService(
      // Repository dependencies would be injected here
    );

    const person = await peopleService.getPerson(context, params.id);

    if (!person) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: person,
    });
  } catch (error) {
    console.error('Error fetching person:', error);
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await extractTenantContext(request);
    await enforceRBAC(context, 'people:write');

    const body = await request.json();
    const updates = UpdatePersonSchema.parse(body);

    const peopleService = new PeopleService(
      // Repository dependencies would be injected here
    );

    const person = await peopleService.updatePerson(context, params.id, updates);

    return NextResponse.json({
      success: true,
      data: person,
    });
  } catch (error) {
    console.error('Error updating person:', error);
    
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

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await extractTenantContext(request);
    await enforceRBAC(context, 'people:delete');

    const peopleService = new PeopleService(
      // Repository dependencies would be injected here
    );

    await peopleService.deletePerson(context, params.id);

    return NextResponse.json({
      success: true,
      message: 'Person deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting person:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
