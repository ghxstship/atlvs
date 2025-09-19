import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UpdateApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

async function getAuthenticatedUser() {
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
    throw new Error('Unauthorized');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new Error('No active organization membership');
  }

  return { user, orgId: membership.organization_id, role: membership.role, supabase };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select('id, name, description, permissions, expires_at, is_active, created_at, last_used_at')
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (error) {
      console.error('API key fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'apikeys.get',
      resource_type: 'api_key',
      resource_id: apiKey.id,
      details: { name: apiKey.name },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ apiKey });

  } catch (error) {
    console.error('API key GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const updateData = UpdateApiKeySchema.parse(body);

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('API key update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'apikeys.update',
      resource_type: 'api_key',
      resource_id: apiKey.id,
      details: { updated_fields: Object.keys(updateData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ apiKey });

  } catch (error) {
    console.error('API key PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('name')
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('API key deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'apikeys.delete',
      resource_type: 'api_key',
      resource_id: params.id,
      details: { name: apiKey?.name || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API key DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
