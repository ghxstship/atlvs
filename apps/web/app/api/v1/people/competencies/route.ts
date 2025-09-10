import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractTenantContext } from '@/lib/tenant-context';
import { enforceRBAC } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';

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
    const context = await extractTenantContext();
    await enforceRBAC(context.userId, context.organizationId, 'people:read');

    const { searchParams } = new URL(request.url);
    const filtersData = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const filters = CompetencyFiltersSchema.parse(filtersData);
    const supabase = await createClient();
    let query = supabase
      .from('people_competencies')
      .select('*')
      .eq('organization_id', context.organizationId);

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);

    const { data: competencies, error } = await query;
    if (error) {
      console.error('Error fetching competencies:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch competencies' },
        { status: 500 }
      );
    }

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
    const context = await extractTenantContext();
    await enforceRBAC(context.userId, context.organizationId, 'people:write');

    const body = await request.json();
    const competencyData = CreateCompetencySchema.parse(body);
    const supabase = await createClient();
    const { data: competency, error } = await supabase
      .from('people_competencies')
      .insert({
        organization_id: context.organizationId,
        name: competencyData.name,
        description: competencyData.description,
        category: competencyData.category,
        level_definitions: competencyData.levelDefinitions ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !competency) {
      console.error('Error creating competency:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create competency' },
        { status: 500 }
      );
    }

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
