import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

const CreateCallSheetSchema = z.object({
  event_id: z.string().uuid(),
  call_date: z.string().date(),
  details: z.record(z.any()).optional(),
  schedule: z.array(z.object({
    time: z.string(),
    activity: z.string(),
    location: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
  contacts: z.array(z.object({
    name: z.string(),
    role: z.string(),
    phone: z.string().optional(),
    email: z.string().email().optional()
  })).optional()
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
    const eventId = searchParams.get('event_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    let query = supabase
      .from('call_sheets')
      .select(`
        id,
        call_date,
        details,
        created_at,
        event:events(id, name)
      `)
      .eq('organization_id', membership.organization_id)
      .order('call_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: callSheets, error } = await query;

    if (error) throw error;

    return NextResponse.json({ call_sheets: callSheets || [] });
  } catch (error) {
    console.error('Call sheets API error:', error);
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
    const validatedData = CreateCallSheetSchema.parse(body);

    // Verify event belongs to organization
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', validatedData.event_id)
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
    }

    const callSheetData = {
      ...validatedData,
      organization_id: membership.organization_id
    };

    const { data: callSheet, error } = await supabase
      .from('call_sheets')
      .insert(callSheetData)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      organization_id: membership.organization_id,
      entity_type: 'call_sheet',
      entity_id: callSheet.id,
      action: 'created',
      actor_id: user.id,
      metadata: { call_date: callSheet.call_date, event_id: callSheet.event_id }
    });

    return NextResponse.json({ call_sheet: callSheet }, { status: 201 });
  } catch (error) {
    console.error('Create call sheet error:', error);
    
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
