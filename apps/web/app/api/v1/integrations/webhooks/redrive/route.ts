import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RedriveWebhookSchema = z.object({
  webhookId: z.string().uuid('Invalid webhook ID'),
  eventIds: z.array(z.string().uuid()).optional(),
  maxRetries: z.number().min(1).max(10).default(3)
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

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { webhookId, eventIds, maxRetries } = RedriveWebhookSchema.parse(body);

    // Verify webhook belongs to organization
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('id, url, events')
      .eq('id', webhookId)
      .eq('organization_id', orgId)
      .single();

    if (webhookError || !webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Get failed webhook events to redrive
    let query = supabase
      .from('webhook_events')
      .select('*')
      .eq('webhook_id', webhookId)
      .eq('status', 'failed')
      .order('created_at', { ascending: false });

    if (eventIds && eventIds.length > 0) {
      query = query.in('id', eventIds);
    }

    const { data: failedEvents, error: eventsError } = await query;

    if (eventsError) {
      console.error('Failed events fetch error:', eventsError);
      return NextResponse.json({ error: eventsError.message }, { status: 400 });
    }

    if (!failedEvents || failedEvents.length === 0) {
      return NextResponse.json({ message: 'No failed events found to redrive' });
    }

    // Mark events for redrive
    const redrivePromises = failedEvents.map(async (event: any) => {
      try {
        // Reset event status and increment retry count
        const { error: updateError } = await supabase
          .from('webhook_events')
          .update({
            status: 'pending',
            retry_count: (event.retry_count || 0) + 1,
            next_retry_at: new Date(Date.now() + 5000).toISOString(), // Retry in 5 seconds
            updated_at: new Date().toISOString()
          })
          .eq('id', event.id);

        if (updateError) {
          console.error(`Failed to update event ${event.id}:`, updateError);
          return { id: event.id, status: 'error', error: updateError.message };
        }

        return { id: event.id, status: 'queued' };
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
        return { id: event.id, status: 'error', error: error.message };
      }
    });

    const results = await Promise.all(redrivePromises);
    const successCount = results.filter(r => r.status === 'queued').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'integrations.webhooks.redrive',
      resource_type: 'webhook',
      resource_id: webhookId,
      details: { 
        events_redriven: successCount,
        events_failed: errorCount,
        total_events: failedEvents.length 
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({
      message: `Redrive initiated for ${successCount} events`,
      results: {
        total: failedEvents.length,
        queued: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Webhook redrive error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
