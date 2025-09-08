import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PeopleService } from '@ghxstship/application/services/PeopleService';
import { extractTenantContext } from '@/lib/tenant-context';
import { enforceRBAC } from '@/lib/rbac';

const CreateCompetencySchema = z.object({
  name: z.string().min(1, 'Competency name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  levelDefinitions: z.object({
    beginner: z.string().optional(),
    intermediate: z.string().optional(),
    advanced: z.string().optional(),
    expert: z.string().optional(),
  }).optional(),
});

const CompetencyFiltersSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const context = await extractTenantContext(request);
    await enforceRBAC(context, 'people:read');

    const { searchParams } = new URL(request.url);
    const filtersData = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const filters = CompetencyFiltersSchema.parse(filtersData);
    const peopleService = new PeopleService(
      // Repository dependencies would be injected here
    );

    const competencies = await peopleService.getCompetencies(context, filters);

    return NextResponse.json({
      success: true,
      data: competencies,
      count: competencies.length,
    });
  } catch (error) {
    console.error('Error fetching competencies:', error);
    
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
    const competencyData = CreateCompetencySchema.parse(body);

    const peopleService = new PeopleService(
      // Repository dependencies would be injected here
    );

    const competency = await peopleService.createCompetency(context, competencyData);

    return NextResponse.json({
      success: true,
      data: competency,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating competency:', error);
    
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
