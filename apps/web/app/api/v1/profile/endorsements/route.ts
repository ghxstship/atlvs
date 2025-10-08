import { z as zod } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import {
  endorsementFilterSchema,
  fetchEndorsements,
  fetchEndorsementById,
  fetchEndorsementStats,
  createEndorsement,
  updateEndorsement,
  deleteEndorsement,
  verifyEndorsement,
  toggleEndorsementFeatured,
  toggleEndorsementPublic
} from '@/app/(app)/(shell)/profile/endorsements/lib/endorsementService';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(cookieStore);
}

async function requireAuth() {
  const supabase = await getSupabase();
  const {
    data: { user }
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
    const endorsementId = searchParams.get('endorsement_id');

    if (endorsementId) {
      const endorsement = await fetchEndorsementById(supabase, endorsementId);
      return NextResponse.json(endorsement);
    }

    const filters = {
      search: searchParams.get('search') || undefined,
      relationship: searchParams.get('relationship') || undefined,
      rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
      verification_status: searchParams.get('verification_status') || undefined,
      is_public: searchParams.get('is_public') || undefined,
      is_featured: searchParams.get('is_featured') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined
    };

    const validatedFilters = endorsementFilterSchema.parse(filters);
    const result = await fetchEndorsements(
      supabase,
      membership.organization_id,
      user!.id,
      validatedFilters
    );

    const stats = await fetchEndorsementStats(
      supabase,
      membership.organization_id,
      user!.id
    );

    return NextResponse.json({
      ...result,
      stats
    });
  } catch (error) {
    console.error('Error in GET /api/v1/profile/endorsements:', error);
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
    const endorsementId = searchParams.get('endorsement_id');
    const action = searchParams.get('action');

    // Handle special actions
    if (endorsementId && action) {
      switch (action) {
        case 'verify': {
          const verifiedEndorsement = await verifyEndorsement(supabase, endorsementId, user!.id);
          return NextResponse.json(verifiedEndorsement);
        }
        
        case 'toggle_featured': {
          const body = await request.json();
          const featuredEndorsement = await toggleEndorsementFeatured(
            supabase,
            endorsementId,
            body.is_featured
          );
          return NextResponse.json(featuredEndorsement);
        }
        
        case 'toggle_public': {
          const publicBody = await request.json();
          const publicEndorsement = await toggleEndorsementPublic(
            supabase,
            endorsementId,
            publicBody.is_public
          );
          return NextResponse.json(publicEndorsement);
        }
        
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }

    // Create new endorsement
    const data = await request.json();
    const endorsement = await createEndorsement(
      supabase,
      membership.organization_id,
      user!.id,
      data
    );

    return NextResponse.json(endorsement, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/profile/endorsements:', error);
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
    const endorsementId = searchParams.get('endorsement_id');

    if (!endorsementId) {
      return NextResponse.json({ error: 'Endorsement ID required' }, { status: 400 });
    }

    const data = await request.json();
    const endorsement = await updateEndorsement(supabase, endorsementId, data);

    return NextResponse.json(endorsement);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/endorsements:', error);
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
    const endorsementId = searchParams.get('endorsement_id');

    if (!endorsementId) {
      return NextResponse.json({ error: 'Endorsement ID required' }, { status: 400 });
    }

    await deleteEndorsement(supabase, endorsementId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/v1/profile/endorsements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
