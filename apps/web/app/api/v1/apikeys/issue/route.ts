import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  expiresAt: z.string().optional()
});

async function getAuthenticatedUser() {
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

function generateApiKey(): string {
  const prefix = 'ghx_';
  const keyBytes = randomBytes(32);
  return prefix + keyBytes.toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const keyData = CreateApiKeySchema.parse(body);

    const apiKey = generateApiKey();
    const hashedKey = Buffer.from(apiKey).toString('base64');

    const { data: newApiKey, error } = await supabase
      .from('api_keys')
      .insert({
        ...keyData,
        organization_id: orgId,
        created_by: user.id,
        key_hash: hashedKey,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, name, description, permissions, expires_at, is_active, created_at')
      .single();

    if (error) {
      console.error('API key creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'apikeys.issue',
      resource_type: 'api_key',
      resource_id: newApiKey.id,
      details: { name: newApiKey.name, permissions: keyData.permissions },
      occurred_at: new Date().toISOString()
    });

    // Return the plain API key only once - it won't be shown again
    return NextResponse.json({ 
      apiKey: {
        ...newApiKey,
        key: apiKey // Only returned on creation
      }
    }, { status: 201 });

  } catch (error) {
    console.error('API key issue error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
