import { z as zod } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import {
  professionalFilterSchema,
  fetchProfessionalProfiles,
  fetchProfessionalProfileById,
  fetchProfessionalStats,
  createProfessionalProfile,
  updateProfessionalProfile,
  deleteProfessionalProfile,
  updateProfileStatus,
} from '@/app/(app)/(shell)/profile/professional/lib/professionalService';

async function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(cookieStore);
}

async function requireAuth() {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { supabase, user };
}

async function getMembership(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get('profile_id');

    if (profileId) {
      const profile = await fetchProfessionalProfileById(supabase, profileId);
      return NextResponse.json(profile);
    }

    const filters = {
      search: searchParams.get('search') || '',
      employment_type: searchParams.get('employment_type') || 'all',
      status: searchParams.get('status') || 'all',
      department: searchParams.get('department') || 'all',
      manager: searchParams.get('manager') || 'all',
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
      hire_date_from: searchParams.get('hire_date_from') || undefined,
      hire_date_to: searchParams.get('hire_date_to') || undefined,
      completion_min: searchParams.get('completion_min') ? parseInt(searchParams.get('completion_min')!) : undefined,
      has_linkedin: searchParams.get('has_linkedin') === 'true',
      has_website: searchParams.get('has_website') === 'true',
    };

    const validatedFilters = professionalFilterSchema.parse(filters);
    const result = await fetchProfessionalProfiles(
      supabase,
      membership.organization_id,
      validatedFilters
    );

    const stats = await fetchProfessionalStats(
      supabase,
      membership.organization_id
    );

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/profile/professional:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get('profile_id');
    const action = searchParams.get('action');
    // Handle special actions
    if (profileId && action) {
      const body = await request.json();
      
      switch (action) {
        case 'update_visibility': {
          const updatedRecord = await updateProfileStatus(
            supabase,
            profileId,
            body.status
          );
          return NextResponse.json(updatedRecord);
        }
        
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }
    // Create new professional profile
    const data = await request.json();
    const profile = await createProfessionalProfile(
      supabase,
      membership.organization_id,
      user!.id,
      data
    );

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/profile/professional:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, error } = await requireAuth();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get('profile_id');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }

    const data = await request.json();
    const profile = await updateProfessionalProfile(supabase, profileId, data);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/professional:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, error } = await requireAuth();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get('profile_id');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }

    await deleteProfessionalProfile(supabase, profileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/v1/profile/professional:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
