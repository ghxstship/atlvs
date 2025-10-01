import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const createCertificationSchema = z.object({
  name: z.string().min(1),
  issuing_organization: z.string().min(1),
  certification_number: z.string().optional(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
  status: z.enum(['active', 'expired', 'suspended', 'revoked']).default('active'),
  verification_url: z.string().url().optional(),
  attachment_url: z.string().url().optional(),
  notes: z.string().optional(),
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

    // Get user ID and verify profile access
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('id', params.profileId)
      .eq('organization_id', params.orgId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: certifications, error } = await supabase
      .from('user_certifications')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('organization_id', params.orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching certifications:', error);
      return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 });
    }

    return NextResponse.json(certifications);

  } catch (error) {
    console.error('Error in certifications GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('id', params.profileId)
      .eq('organization_id', params.orgId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user can add certifications (own profile or admin)
    const isOwnProfile = profile.user_id === userData.id;
    if (!isOwnProfile) {
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
    const validatedData = createCertificationSchema.parse(body);

    const { data: certification, error } = await supabase
      .from('user_certifications')
      .insert({
        ...validatedData,
        user_id: profile.user_id,
        organization_id: params.orgId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating certification:', error);
      return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 });
    }

    // Log activity
    await supabase
      .from('user_profile_activity')
      .insert({
        user_id: profile.user_id,
        organization_id: params.orgId,
        activity_type: 'certification_added',
        activity_description: `Added certification: ${validatedData.name}`,
        performed_by: userData.id
      });

    return NextResponse.json(certification, { status: 201 });

  } catch (error) {
    console.error('Error in certifications POST:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
