import { z as zod } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import {
  emergencyFilterSchema,
  emergencyUpsertSchema,
  fetchEmergencyContacts,
  fetchEmergencyContactById,
  fetchEmergencyStats,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  verifyEmergencyContact,
} from '@/app/(app)/(shell)/profile/emergency/lib/emergencyService';

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

function assertAdmin(role?: string | null) {
  return role && ['owner', 'admin'].includes(role);
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
    const contactId = url.searchParams.get('contact_id');
    const targetUserId = url.searchParams.get('user_id') || user!.id;
    const viewAll = url.searchParams.get('view_all') === 'true';

    if (contactId) {
      const contact = await fetchEmergencyContactById(supabase, orgId, targetUserId, contactId);
      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
      return NextResponse.json(contact);
    }

    if (targetUserId !== user!.id || viewAll) {
      if (!assertAdmin(membership.role)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    const filters = emergencyFilterSchema.parse(Object.fromEntries(url.searchParams));
    const data = await fetchEmergencyContacts(supabase, orgId, filters);
    const stats = await fetchEmergencyStats(supabase, orgId);

    return NextResponse.json({
      ...data,
      stats,
    });
  } catch (err) {
    console.error('GET /api/v1/profile/emergency error:', err);
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

    const orgId = membership.organization_id;
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const userId = url.searchParams.get('user_id') || user!.id;
    const contactId = url.searchParams.get('contact_id');

    if (userId !== user!.id && !assertAdmin(membership.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (action === 'verify') {
      if (!contactId) {
        return NextResponse.json({ error: 'contact_id is required for verification' }, { status: 400 });
      }
      await verifyEmergencyContact(supabase, orgId, userId, contactId);
      return NextResponse.json({ message: 'Emergency contact verified successfully' });
    }

    const payload = emergencyUpsertSchema.parse(await request.json());
    const contact = await createEmergencyContact(supabase, orgId, userId, payload);
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    console.error('POST /api/v1/profile/emergency error:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
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

    const orgId = membership.organization_id;
    const url = new URL(request.url);
    const contactId = url.searchParams.get('contact_id');
    const userId = url.searchParams.get('user_id') || user!.id;

    if (!contactId) {
      return NextResponse.json({ error: 'contact_id is required' }, { status: 400 });
    }

    if (userId !== user!.id && !assertAdmin(membership.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const payload = emergencyUpsertSchema.parse(await request.json());
    const contact = await updateEmergencyContact(supabase, orgId, userId, contactId, payload);
    return NextResponse.json(contact);
  } catch (err) {
    console.error('PUT /api/v1/profile/emergency error:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
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

    const orgId = membership.organization_id;
    const url = new URL(request.url);
    const contactId = url.searchParams.get('contact_id');
    const userId = url.searchParams.get('user_id') || user!.id;

    if (!contactId) {
      return NextResponse.json({ error: 'contact_id is required' }, { status: 400 });
    }

    if (userId !== user!.id && !assertAdmin(membership.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await deleteEmergencyContact(supabase, orgId, userId, contactId);
    return NextResponse.json({ message: 'Emergency contact deleted' });
  } catch (err) {
    console.error('DELETE /api/v1/profile/emergency error:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
