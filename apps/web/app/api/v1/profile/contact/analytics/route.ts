import { z as zod } from 'zod';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import {
  fetchContactAnalytics,
} from '@/app/(app)/(shell)/profile/contact/lib/contactService';

export const dynamic = 'force-dynamic';

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

export async function GET() {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    // Only admins can view analytics
    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const analytics = await fetchContactAnalytics(supabase, membership.organization_id);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in GET /api/v1/profile/contact/analytics:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
