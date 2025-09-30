import { z as zod } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import {
  certificationFilterSchema,
  certificationCreateSchema,
  certificationUpdateSchema,
  fetchUserCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  fetchCertificationStats,
} from '@/app/(app)/(shell)/profile/certifications/lib/certificationService';

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

    const orgId = membership.organization_id;
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('user_id') || user!.id;

    // Check if user can access the target user's certifications
    if (targetUserId !== user!.id) {
      // Only allow if user is admin/owner or manager of target user
      const { data: targetProfile } = await supabase
        .from('user_profiles')
        .select('manager_id')
        .eq('user_id', targetUserId)
        .eq('organization_id', orgId)
        .single();

      const isManager = targetProfile?.manager_id === user!.id;
      const isAdmin = ['owner', 'admin'].includes(membership.role);

      if (!isManager && !isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const filters = certificationFilterSchema.parse(Object.fromEntries(url.searchParams));
    
    const [certificationsData, stats] = await Promise.all([
      fetchUserCertifications(supabase, orgId, targetUserId, filters),
      fetchCertificationStats(supabase, orgId, targetUserId),
    ]);

    return NextResponse.json({
      ...certificationsData,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/profile/certifications:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const body = await request.json();
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('user_id') || user!.id;

    // Check if user can create certifications for target user
    if (targetUserId !== user!.id) {
      const isAdmin = ['owner', 'admin'].includes(membership.role);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const certificationData = certificationCreateSchema.parse(body);
    const newCertification = await createCertification(
      supabase,
      membership.organization_id,
      targetUserId,
      certificationData
    );

    if (!newCertification) {
      return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 });
    }

    return NextResponse.json(newCertification, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/profile/certifications:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const body = await request.json();
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('user_id') || user!.id;
    const certificationId = url.searchParams.get('certification_id');

    if (!certificationId) {
      return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 });
    }

    // Check if user can update certifications for target user
    if (targetUserId !== user!.id) {
      const isAdmin = ['owner', 'admin'].includes(membership.role);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const certificationData = certificationUpdateSchema.parse(body);
    const updatedCertification = await updateCertification(
      supabase,
      membership.organization_id,
      targetUserId,
      certificationId,
      certificationData
    );

    if (!updatedCertification) {
      return NextResponse.json({ error: 'Failed to update certification' }, { status: 500 });
    }

    return NextResponse.json(updatedCertification);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/certifications:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('user_id') || user!.id;
    const certificationId = url.searchParams.get('certification_id');

    if (!certificationId) {
      return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 });
    }

    // Check if user can delete certifications for target user
    if (targetUserId !== user!.id) {
      const isAdmin = ['owner', 'admin'].includes(membership.role);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const success = await deleteCertification(
      supabase,
      membership.organization_id,
      targetUserId,
      certificationId
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete certification' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/v1/profile/certifications:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
