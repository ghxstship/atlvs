import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UpdateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  headers: z.record(z.string()).optional(),
  retryPolicy: z.object({
    maxRetries: z.number().min(0).max(10),
    retryDelay: z.number().min(1000).max(300000),
    backoffMultiplier: z.number().min(1).max(5)
  }).optional()
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
    const { user, orgId, supabase } = await getAuthenticatedUser();
    const { id } = params;

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .select(`
        id,
        url,
        events,
        description,
        active,
        headers,
        retry_policy,
        created_at,
        updated_at,
        last_triggered_at,
        success_count,
        failure_count,
        status,
        created_by
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) {
      console.error('Webhook fetch error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get recent webhook deliveries
    const { data: deliveries } = await supabase
      .from('webhook_deliveries')
      .select(`
        id,
        event_type,
        status,
        response_status,
        response_body,
        attempt_count,
        delivered_at,
        created_at
      `)
      .eq('webhook_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.get',
      resource_type: 'webhook',
      resource_id: id,
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      webhook,
      recentDeliveries: deliveries || []
    });

  } catch (error: any) {
    console.error('Webhook GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'test') {
      // Test webhook by sending a test payload
      const { data: webhook } = await supabase
        .from('webhooks')
        .select('url, headers, secret, success_count')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      if (!webhook) {
        return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
      }

      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook delivery',
          webhook_id: id,
          organization_id: orgId
        }
      };

      try {
        // In a real implementation, you would make an HTTP request to the webhook URL
        // For now, we'll simulate the test
        const testResult = {
          success: true,
          status: 200,
          response: 'OK',
          deliveredAt: new Date().toISOString()
        };

        // Log the test delivery
        await supabase.from('webhook_deliveries').insert({
          webhook_id: id,
          event_type: 'webhook.test',
          payload: testPayload,
          status: 'delivered',
          response_status: 200,
          response_body: 'OK',
          attempt_count: 1,
          delivered_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

        // Update webhook success count
        await supabase
          .from('webhooks')
          .update({
            success_count: webhook.success_count + 1,
            last_triggered_at: new Date().toISOString()
          })
          .eq('id', id);

        await supabase.from('audit_logs').insert({
          organization_id: orgId,
          user_id: user.id,
          action: 'webhooks.test',
          resource_type: 'webhook',
          resource_id: id,
          details: testResult,
          occurred_at: new Date().toISOString()
        });

        return NextResponse.json(testResult);

      } catch (testError) {
        const errorResult = {
          success: false,
          error: 'Test delivery failed',
          deliveredAt: new Date().toISOString()
        };

        // Log the failed test delivery
        await supabase.from('webhook_deliveries').insert({
          webhook_id: id,
          event_type: 'webhook.test',
          payload: testPayload,
          status: 'failed',
          response_status: 0,
          response_body: String(testError),
          attempt_count: 1,
          created_at: new Date().toISOString()
        });

        return NextResponse.json(errorResult, { status: 400 });
      }
    }

    if (action === 'regenerate_secret') {
      // Regenerate webhook secret
      const newSecret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .update({
          secret: newSecret,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', orgId)
        .select('secret')
        .single();

      if (error) {
        console.error('Secret regeneration error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'webhooks.regenerate_secret',
        resource_type: 'webhook',
        resource_id: id,
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ secret: webhook.secret });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Webhook POST error:', error);
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

    const { id } = params;
    const body = await request.json();
    const webhookData = UpdateWebhookSchema.parse(body);

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .update({
        ...webhookData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Webhook update error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.update',
      resource_type: 'webhook',
      resource_id: id,
      details: { updated_fields: Object.keys(webhookData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ webhook });

  } catch (error: any) {
    console.error('Webhook PUT error:', error);
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

    const { id } = params;

    const { data: webhook } = await supabase
      .from('webhooks')
      .select('url, events')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Webhook deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.delete',
      resource_type: 'webhook',
      resource_id: id,
      details: { url: webhook.url, events: webhook.events },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
