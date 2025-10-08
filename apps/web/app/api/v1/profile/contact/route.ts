import { z as zod } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import {
  contactFilterSchema,
  contactUpdateSchema,
  fetchUserContact,
  fetchContacts,
  updateUserContact,
  verifyContact,
  fetchContactStats
} from '@/app/(app)/(shell)/profile/contact/lib/contactService';

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

    const orgId = membership.organization_id;
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('user_id') || user!.id;
    const viewAll = url.searchParams.get('view_all') === 'true';

    // Check permissions
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

    // If viewing all contacts (admin only)
    if (viewAll) {
      if (!['owner', 'admin'].includes(membership.role)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const filters = contactFilterSchema.parse(Object.fromEntries(url.searchParams));
      const [contactsData, stats] = await Promise.all([
        fetchContacts(supabase, orgId, filters),
        fetchContactStats(supabase, orgId),
      ]);

      return NextResponse.json({
        ...contactsData,
        stats
      });
    }

    // Get single user contact
    const contact = await fetchUserContact(supabase, orgId, targetUserId);
    
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error in GET /api/v1/profile/contact:', error);
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

    // Check permissions
    if (targetUserId !== user!.id) {
      const isAdmin = ['owner', 'admin'].includes(membership.role);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const contactData = contactUpdateSchema.parse(body);
    const updatedContact = await updateUserContact(
      supabase,
      membership.organization_id,
      targetUserId,
      contactData
    );

    if (!updatedContact) {
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/contact:', error);
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

    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const targetUserId = url.searchParams.get('user_id') || user!.id;

    // Check permissions
    if (targetUserId !== user!.id) {
      const isAdmin = ['owner', 'admin'].includes(membership.role);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Handle verification action
    if (action === 'verify') {
      const success = await verifyContact(
        supabase,
        membership.organization_id,
        targetUserId
      );

      if (!success) {
        return NextResponse.json({ error: 'Failed to verify contact' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Contact verified successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/v1/profile/contact:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
