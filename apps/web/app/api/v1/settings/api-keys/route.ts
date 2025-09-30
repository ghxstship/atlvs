import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { createHash, randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  scopes: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional()
});

const UpdateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
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

function generateApiKey(): { key: string; hash: string } {
  const key = `ghxst_${randomBytes(32).toString('hex')}`;
  const hash = createHash('sha256').update(key).digest('hex');
  return { key, hash };
}

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins and owners can view API keys
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');

    let query = supabase
      .from('api_keys')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: apiKeys, error } = await query;

    if (error) {
      console.error('API keys fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Remove sensitive data
    const sanitizedKeys = apiKeys?.map(key => ({
      id: key.id,
      name: key.name,
      description: key.description,
      scopes: key.scopes,
      lastUsedAt: key.last_used_at,
      expiresAt: key.expires_at,
      isActive: key.is_active,
      createdAt: key.created_at,
      keyPrefix: key.key_prefix // Only show prefix, not the full hash
    }));

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'api_keys.list',
      resource_type: 'api_key',
      details: { count: sanitizedKeys?.length || 0 },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ apiKeys: sanitizedKeys });

  } catch (err: unknown) {
    console.error('API keys GET error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins and owners can create API keys
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const keyData = CreateApiKeySchema.parse(body);

    // Generate API key
    const { key, hash } = generateApiKey();
    const keyPrefix = key.substring(0, 10);

    // Create API key record
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: orgId,
        user_id: user.id,
        name: keyData.name,
        description: keyData.description,
        key_hash: hash,
        key_prefix: keyPrefix,
        scopes: keyData.scopes,
        expires_at: keyData.expiresAt,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('API key creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'api_key.created',
      resource_type: 'api_key',
      resource_id: apiKey.id,
      details: { 
        name: keyData.name,
        scopes: keyData.scopes
      },
      occurred_at: new Date().toISOString()
    });

    // Return the key only once during creation
    return NextResponse.json({ 
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        description: apiKey.description,
        scopes: apiKey.scopes,
        expiresAt: apiKey.expires_at,
        key: key // Only returned during creation
      },
      message: 'Store this API key securely. It will not be shown again.'
    });

  } catch (err: unknown) {
    console.error('API key POST error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins and owners can update API keys
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'API key ID required' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = UpdateApiKeySchema.parse(body);

    // Verify the key belongs to the organization
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('organization_id')
      .eq('id', keyId)
      .single();

    if (!existingKey || existingKey.organization_id !== orgId) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Update the API key
    const { data: updatedKey, error } = await supabase
      .from('api_keys')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .select()
      .single();

    if (error) {
      console.error('API key update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'api_key.updated',
      resource_type: 'api_key',
      resource_id: keyId,
      details: { changes: updateData },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      apiKey: {
        id: updatedKey.id,
        name: updatedKey.name,
        description: updatedKey.description,
        scopes: updatedKey.scopes,
        isActive: updatedKey.is_active,
        updatedAt: updatedKey.updated_at
      }
    });

  } catch (err: unknown) {
    console.error('API key PUT error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins and owners can delete API keys
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'API key ID required' }, { status: 400 });
    }

    // Verify the key belongs to the organization
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('organization_id, name')
      .eq('id', keyId)
      .single();

    if (!existingKey || existingKey.organization_id !== orgId) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Soft delete by deactivating
    const { error } = await supabase
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: user.id
      })
      .eq('id', keyId);

    if (error) {
      console.error('API key revoke error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'api_key.revoked',
      resource_type: 'api_key',
      resource_id: keyId,
      details: { name: existingKey.name },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'API key revoked successfully'
    });

  } catch (err: unknown) {
    console.error('API key DELETE error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
