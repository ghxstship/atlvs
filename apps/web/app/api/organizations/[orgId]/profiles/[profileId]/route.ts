import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const updateProfileSchema = z.object({
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
  website_url: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string; profileId: string } }
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

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user:users(id, full_name, email),
        manager:users!manager_id(id, full_name)
      `)
      .eq('id', params.profileId)
      .eq('organization_id', params.orgId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string; profileId: string } }
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

    // Get current user ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can update this profile (own profile or has admin rights)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('id', params.profileId)
      .eq('organization_id', params.orgId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const isOwnProfile = profile.user_id === userData.id;
    
    if (!isOwnProfile) {
      // Check if user has admin rights
      const { data: membership } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userData.id)
        .eq('organization_id', params.orgId)
        .eq('status', 'active')
        .single();

      if (!membership || !['owner', 'admin', 'manager'].includes(membership.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update({
        ...validatedData,
        last_updated_by: userData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.profileId)
      .eq('organization_id', params.orgId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Log activity
    await supabase
      .from('user_profile_activity')
      .insert({
        user_id: profile.user_id,
        organization_id: params.orgId,
        activity_type: 'profile_updated',
        activity_description: 'Profile information updated',
        performed_by: userData.id
      });

    return NextResponse.json(updatedProfile);

  } catch (error) {
    console.error('Error in profile PUT:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string; profileId: string } }
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

    // Check organization membership and admin rights
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', params.orgId)
      .eq('status', 'active')
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', params.profileId)
      .eq('organization_id', params.orgId);

    if (error) {
      console.error('Error deleting profile:', error);
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile deleted successfully' });

  } catch (error) {
    console.error('Error in profile DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
