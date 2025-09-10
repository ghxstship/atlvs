import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractTenantContext } from '@/lib/tenant-context';
import { enforceRBAC } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';

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
    const context = await extractTenantContext();
    await enforceRBAC(context.userId, context.organizationId, 'people:read');

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
    const supabase = await createClient();
    let query = supabase
      .from('people')
      .select('*')
      .eq('organization_id', context.organizationId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.department) query = query.eq('department', filters.department);
    if (filters.role) query = query.eq('role', filters.role);
    if (filters.location) query = query.eq('location', filters.location);
    // naive search across a couple of likely columns
    if (filters.search) {
      // Using ilike on a coalesce of name fields if available; fallback to email
      query = query.or(
        `firstName.ilike.%${filters.search}%,lastName.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    const { data: people, error } = await query;
    if (error) {
      console.error('Error querying people:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch people' },
        { status: 500 }
      );
    }

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
    const context = await extractTenantContext();
    await enforceRBAC(context.userId, context.organizationId, 'people:write');

    const body = await request.json();
    const personData = CreatePersonSchema.parse(body);
    const supabase = await createClient();
    const { data: person, error } = await supabase
      .from('people')
      .insert({
        organization_id: context.organizationId,
        firstName: personData.firstName,
        lastName: personData.lastName,
        email: personData.email,
        phone: personData.phone,
        role: personData.role,
        department: personData.department,
        location: personData.location,
        startDate: personData.startDate,
        status: personData.status,
        avatarUrl: personData.avatarUrl,
        isDemo: personData.isDemo ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !person) {
      console.error('Error inserting person:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create person' },
        { status: 500 }
      );
    }

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
