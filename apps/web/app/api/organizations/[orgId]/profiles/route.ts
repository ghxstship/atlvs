import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const createProfileSchema = z.object({
  avatar_url: z.string().url().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  nationality: z.string().optional(),
  languages: z.array(z.string()).optional(),
  phone_primary: z.string().optional(),
  phone_secondary: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  employee_id: z.string().optional(),
  hire_date: z.string().optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'intern']).optional(),
  manager_id: z.string().uuid().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  website_url: z.string().url().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check organization membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', params.orgId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get search params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        user:users(id, full_name, email),
        manager:users!manager_id(id, full_name)
      `)
      .eq('organization_id', params.orgId);

    // Apply filters
    if (search) {
      query = query.or(`job_title.ilike.%${search}%,department.ilike.%${search}%,bio.ilike.%${search}%`);
    }
    if (department) {
      query = query.eq('department', department);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    return NextResponse.json({
      data: profiles,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in profiles GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check organization membership and permissions
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', params.orgId)
      .eq('status', 'active')
      .single();

    if (!membership || !['owner', 'admin', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createProfileSchema.parse(body);

    // Get the current user ID from users table
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        ...validatedData,
        user_id: userData.id,
        organization_id: params.orgId,
        last_updated_by: userData.id,
        languages: validatedData.languages || [],
        skills: validatedData.skills || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Log activity
    await supabase
      .from('user_profile_activity')
      .insert({
        user_id: userData.id,
        organization_id: params.orgId,
        activity_type: 'profile_updated',
        activity_description: 'Profile created',
        performed_by: userData.id
      });

    return NextResponse.json(profile, { status: 201 });

  } catch (error) {
    console.error('Error in profiles POST:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
