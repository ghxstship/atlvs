import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  description: z.string().optional(),
  secret: z.string().optional(),
  active: z.boolean().default(true),
  headers: z.record(z.string()).optional(),
  retryPolicy: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    retryDelay: z.number().min(1000).max(300000).default(5000), // 1s to 5min
    backoffMultiplier: z.number().min(1).max(5).default(2)
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

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const event = searchParams.get('event');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    let query = supabase
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
        status
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (active !== null) {
      query = query.eq('active', active === 'true');
    }

    if (event) {
      query = query.contains('events', [event]);
    }

    const { data: webhooks, error, count } = await query;

    if (error) {
      console.error('Webhooks fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get available webhook events
    const availableEvents = [
      'project.created', 'project.updated', 'project.deleted',
      'job.created', 'job.updated', 'job.deleted', 'job.assigned',
      'person.created', 'person.updated', 'person.deleted',
      'company.created', 'company.updated', 'company.deleted',
      'invoice.created', 'invoice.updated', 'invoice.paid',
      'contract.signed', 'contract.expired',
      'user.invited', 'user.activated', 'user.deactivated',
      'notification.sent', 'audit.critical_action'
    ];

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.list',
      resource_type: 'webhook',
      details: { count: webhooks?.length || 0, filters: { active, event } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      webhooks: webhooks || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      availableEvents
    });

  } catch (error: any) {
    console.error('Webhooks GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const webhookData = WebhookSchema.parse(body);

    // Generate webhook secret if not provided
    const secret = webhookData.secret || `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        ...webhookData,
        secret,
        organization_id: orgId,
        created_by: user.id,
        status: 'active',
        success_count: 0,
        failure_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
      action: 'webhooks.create',
      resource_type: 'webhook',
      resource_id: webhook.id,
      details: { url: webhookData.url, events: webhookData.events },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ webhook }, { status: 201 });

  } catch (error: any) {
    console.error('Webhooks POST error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    const webhookData = WebhookSchema.partial().parse(updateData);

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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.update',
      resource_type: 'webhook',
      resource_id: webhook.id,
      details: { updated_fields: Object.keys(webhookData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ webhook });

  } catch (error: any) {
    console.error('Webhooks PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

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
    console.error('Webhooks DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
