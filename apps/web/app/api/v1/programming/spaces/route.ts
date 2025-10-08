import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

const CreateSpaceSchema = z.object({
  name: z.string().min(1).max(200),
  kind: z.enum(['room', 'green_room', 'dressing_room', 'meeting_room', 'classroom', 'other']).default('room'),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
  location: z.string().optional()
});

export async function GET(request: NextRequest) {
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

    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, roles')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const { data: spaces, error } = await supabase
      .from('spaces')
      .select('id, name, kind, capacity, description, location, created_at')
      .eq('organization_id', membership.organization_id)
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ spaces: spaces || [] });
  } catch (error) {
    console.error('Spaces API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, roles')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const roles = Array.isArray(membership.roles) ? membership.roles : [];
    if (!roles.includes('admin') && !roles.includes('manager')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = CreateSpaceSchema.parse(body);

    const spaceData = {
      ...validatedData,
      organization_id: membership.organization_id
    };

    const { data: space, error } = await supabase
      .from('spaces')
      .insert(spaceData)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      organization_id: membership.organization_id,
      entity_type: 'space',
      entity_id: space.id,
      action: 'created',
      actor_id: user.id,
      metadata: { name: space.name, kind: space.kind }
    });

    return NextResponse.json({ space }, { status: 201 });
  } catch (error) {
    console.error('Create space error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
