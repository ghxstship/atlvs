import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
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

    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check if user has admin access to this organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Call the RPC function to remove demo data
    const { data, error } = await supabase.rpc('remove_demo_data', {
      org_id: organizationId,
      user_id: user.id
    });

    if (error) {
      console.error('Demo removal error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track telemetry
    if (process.env.NODE_ENV === 'production') {
      // Add telemetry tracking here
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Demo removal API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
