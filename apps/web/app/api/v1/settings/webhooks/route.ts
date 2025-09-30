import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  headers: z.record(z.string()).optional(),
  secret: z.string().optional(),
  isActive: z.boolean().default(true),
  retryCount: z.number().min(0).max(10).default(3),
  timeoutSeconds: z.number().min(1).max(60).default(30)
});

const UpdateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  headers: z.record(z.string()).optional(),
  secret: z.string().optional(),
  isActive: z.boolean().optional(),
  retryCount: z.number().min(0).max(10).optional(),
  timeoutSeconds: z.number().min(1).max(60).optional()
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

function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString('hex')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins and owners can view webhooks
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');

    let query = supabase
      .from('webhooks')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: webhooks, error } = await query;

    if (error) {
      console.error('Webhooks fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Don't expose the full secret
    const sanitizedWebhooks = webhooks?.map(webhook => ({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      headers: webhook.headers,
      isActive: webhook.is_active,
      retryCount: webhook.retry_count,
      timeoutSeconds: webhook.timeout_seconds,
      lastTriggeredAt: webhook.last_triggered_at,
      failureCount: webhook.failure_count,
      createdAt: webhook.created_at,
      hasSecret: !!webhook.secret
    }));

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.list',
      resource_type: 'webhook',
      details: { count: sanitizedWebhooks?.length || 0 },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ webhooks: sanitizedWebhooks });

  } catch (err: unknown) {
    console.error('Webhooks GET error:', err);
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

    // Only admins and owners can create webhooks
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const webhookData = CreateWebhookSchema.parse(body);

    // Generate secret if not provided
    const secret = webhookData.secret || generateWebhookSecret();

    // Create webhook record
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        organization_id: orgId,
        name: webhookData.name,
        url: webhookData.url,
        events: webhookData.events,
        headers: webhookData.headers || {},
        secret: secret,
        is_active: webhookData.isActive,
        retry_count: webhookData.retryCount,
        timeout_seconds: webhookData.timeoutSeconds,
        failure_count: 0,
        created_at: new Date().toISOString(),
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Webhook creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhook.created',
      resource_type: 'webhook',
      resource_id: webhook.id,
      details: { 
        name: webhookData.name,
        url: webhookData.url,
        events: webhookData.events
      },
      occurred_at: new Date().toISOString()
    });

    // Return the secret only once during creation
    return NextResponse.json({ 
      webhook: {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        headers: webhook.headers,
        secret: secret, // Only returned during creation
        isActive: webhook.is_active,
        retryCount: webhook.retry_count,
        timeoutSeconds: webhook.timeout_seconds
      },
      message: 'Store the webhook secret securely. It will not be shown again.'
    });

  } catch (err: unknown) {
    console.error('Webhook POST error:', err);
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

    // Only admins and owners can update webhooks
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = UpdateWebhookSchema.parse(body);

    // Verify the webhook belongs to the organization
    const { data: existingWebhook } = await supabase
      .from('webhooks')
      .select('organization_id')
      .eq('id', webhookId)
      .single();

    if (!existingWebhook || existingWebhook.organization_id !== orgId) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Update the webhook
    const updateFields: Record<string, unknown> = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    // If updating secret, generate new one if not provided
    if (updateData.secret === '') {
      updateFields.secret = generateWebhookSecret();
    }

    const { data: updatedWebhook, error } = await supabase
      .from('webhooks')
      .update(updateFields)
      .eq('id', webhookId)
      .select()
      .single();

    if (error) {
      console.error('Webhook update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhook.updated',
      resource_type: 'webhook',
      resource_id: webhookId,
      details: { changes: updateData },
      occurred_at: new Date().toISOString()
    });

    const response = {
      webhook: {
        id: updatedWebhook.id,
        name: updatedWebhook.name,
        url: updatedWebhook.url,
        events: updatedWebhook.events,
        headers: updatedWebhook.headers,
        isActive: updatedWebhook.is_active,
        retryCount: updatedWebhook.retry_count,
        timeoutSeconds: updatedWebhook.timeout_seconds,
        updatedAt: updatedWebhook.updated_at,
        secret: undefined as string | undefined
      },
      message: undefined as string | undefined
    };

    // If secret was regenerated, return it once
    if (updateData.secret === '') {
      response.webhook.secret = updateFields.secret as string;
      response.message = 'Webhook secret regenerated. Store it securely.';
    }

    return NextResponse.json(response);

  } catch (err: unknown) {
    console.error('Webhook PUT error:', err);
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

    // Only admins and owners can delete webhooks
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 });
    }

    // Verify the webhook belongs to the organization
    const { data: existingWebhook } = await supabase
      .from('webhooks')
      .select('organization_id, name')
      .eq('id', webhookId)
      .single();

    if (!existingWebhook || existingWebhook.organization_id !== orgId) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Delete the webhook
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) {
      console.error('Webhook delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhook.deleted',
      resource_type: 'webhook',
      resource_id: webhookId,
      details: { name: existingWebhook.name },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Webhook deleted successfully'
    });

  } catch (err: unknown) {
    console.error('Webhook DELETE error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
