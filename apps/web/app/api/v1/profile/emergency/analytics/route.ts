import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { fetchEmergencyAnalytics } from '@/app/(app)/(shell)/profile/emergency/lib/emergencyService';

export const dynamic = 'force-dynamic';

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

export async function GET() {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    if (!['owner', 'admin'].includes(membership.role ?? '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const analytics = await fetchEmergencyAnalytics(supabase, membership.organization_id);
    return NextResponse.json(analytics);
  } catch (err) {
    console.error('GET /api/v1/profile/emergency/analytics error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
