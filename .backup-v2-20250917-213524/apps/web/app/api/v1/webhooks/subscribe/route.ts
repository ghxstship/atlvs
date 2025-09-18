import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SubscriptionSchema = z.object({
  events: z.array(z.string()).min(1),
  url: z.string().url(),
  description: z.string().optional(),
  headers: z.record(z.string()).optional(),
  filters: z.object({
    projectIds: z.array(z.string().uuid()).optional(),
    userIds: z.array(z.string().uuid()).optional(),
    eventTypes: z.array(z.string()).optional(),
    conditions: z.record(z.any()).optional()
  }).optional()
});

const BulkSubscriptionSchema = z.object({
  subscriptions: z.array(SubscriptionSchema).min(1).max(10),
  template: z.object({
    headers: z.record(z.string()).optional(),
    retryPolicy: z.object({
      maxRetries: z.number().min(0).max(10).default(3),
      retryDelay: z.number().min(1000).max(300000).default(5000),
      backoffMultiplier: z.number().min(1).max(5).default(2)
    }).optional()
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
    
    // Get webhook subscriptions (active webhooks grouped by event type)
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('id, url, events, description, active, created_at')
      .eq('organization_id', orgId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Webhook subscriptions fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Group webhooks by event type for subscription view
    const subscriptionsByEvent: Record<string, any[]> = {};
    const allEvents = [
      'project.created', 'project.updated', 'project.deleted',
      'job.created', 'job.updated', 'job.deleted', 'job.assigned',
      'person.created', 'person.updated', 'person.deleted',
      'company.created', 'company.updated', 'company.deleted',
      'invoice.created', 'invoice.updated', 'invoice.paid',
      'contract.signed', 'contract.expired',
      'user.invited', 'user.activated', 'user.deactivated',
      'notification.sent', 'audit.critical_action'
    ];

    allEvents.forEach(eventType => {
      subscriptionsByEvent[eventType] = webhooks?.filter(webhook => 
        webhook.events.includes(eventType)
      ) || [];
    });

    // Get subscription templates (common webhook configurations)
    const templates = [
      {
        name: 'Project Notifications',
        description: 'Get notified about project lifecycle events',
        events: ['project.created', 'project.updated', 'project.deleted'],
        suggestedUrl: 'https://your-app.com/webhooks/projects'
      },
      {
        name: 'Job Management',
        description: 'Track job assignments and updates',
        events: ['job.created', 'job.updated', 'job.assigned'],
        suggestedUrl: 'https://your-app.com/webhooks/jobs'
      },
      {
        name: 'Financial Events',
        description: 'Monitor invoices and payments',
        events: ['invoice.created', 'invoice.updated', 'invoice.paid'],
        suggestedUrl: 'https://your-app.com/webhooks/finance'
      },
      {
        name: 'User Activity',
        description: 'Track user onboarding and activity',
        events: ['user.invited', 'user.activated', 'user.deactivated'],
        suggestedUrl: 'https://your-app.com/webhooks/users'
      },
      {
        name: 'Security Alerts',
        description: 'Critical security and audit events',
        events: ['audit.critical_action'],
        suggestedUrl: 'https://your-app.com/webhooks/security'
      }
    ];

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.subscriptions.list',
      resource_type: 'webhook',
      details: { totalWebhooks: webhooks?.length || 0 },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      subscriptionsByEvent,
      templates,
      totalWebhooks: webhooks?.length || 0
    });

  } catch (error: any) {
    console.error('Webhook subscriptions GET error:', error);
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
    const { action, ...data } = body;

    if (action === 'bulk_subscribe') {
      // Create multiple webhook subscriptions from templates
      const bulkData = BulkSubscriptionSchema.parse(data);
      const results = [];

      for (const subscription of bulkData.subscriptions) {
        try {
          const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

          const webhookData = {
            ...subscription,
            secret,
            organization_id: orgId,
            created_by: user.id,
            active: true,
            status: 'active',
            success_count: 0,
            failure_count: 0,
            retry_policy: bulkData.template?.retryPolicy || {
              maxRetries: 3,
              retryDelay: 5000,
              backoffMultiplier: 2
            },
            headers: {
              ...bulkData.template?.headers,
              ...subscription.headers
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: webhook, error } = await supabase
            .from('webhooks')
            .insert(webhookData)
            .select()
            .single();

          if (error) {
            results.push({
              url: subscription.url,
              success: false,
              error: error.message
            });
          } else {
            results.push({
              url: subscription.url,
              success: true,
              webhookId: webhook.id,
              events: subscription.events
            });
          }
        } catch (subscriptionError) {
          results.push({
            url: subscription.url,
            success: false,
            error: 'Subscription creation failed'
          });
        }
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'webhooks.bulk_subscribe',
        resource_type: 'webhook',
        details: { 
          totalAttempted: bulkData.subscriptions.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        results
      });
    }

    if (action === 'quick_subscribe') {
      // Quick subscribe to a template
      const { templateName, url, customEvents } = data;

      const templates: Record<string, string[]> = {
        'project_notifications': ['project.created', 'project.updated', 'project.deleted'],
        'job_management': ['job.created', 'job.updated', 'job.assigned'],
        'financial_events': ['invoice.created', 'invoice.updated', 'invoice.paid'],
        'user_activity': ['user.invited', 'user.activated', 'user.deactivated'],
        'security_alerts': ['audit.critical_action']
      };

      const events = customEvents || templates[templateName];
      if (!events) {
        return NextResponse.json({ error: 'Invalid template name' }, { status: 400 });
      }

      const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .insert({
          url,
          events,
          description: `Quick subscription for ${templateName}`,
          secret,
          organization_id: orgId,
          created_by: user.id,
          active: true,
          status: 'active',
          success_count: 0,
          failure_count: 0,
          retry_policy: {
            maxRetries: 3,
            retryDelay: 5000,
            backoffMultiplier: 2
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Quick subscribe error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'webhooks.quick_subscribe',
        resource_type: 'webhook',
        resource_id: webhook.id,
        details: { templateName, url, events },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ webhook }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Webhook subscribe POST error:', error);
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
    const { action, eventType, webhookIds } = body;

    if (action === 'bulk_unsubscribe') {
      // Unsubscribe multiple webhooks from an event type
      if (!eventType) {
        return NextResponse.json({ error: 'eventType is required for bulk unsubscribe' }, { status: 400 });
      }

      // Get webhooks that contain this event type
      const { data: webhooks } = await supabase
        .from('webhooks')
        .select('id, events')
        .eq('organization_id', orgId)
        .contains('events', [eventType]);

      const results = [];

      for (const webhook of webhooks || []) {
        const updatedEvents = webhook.events.filter((e: string) => e !== eventType);
        
        if (updatedEvents.length === 0) {
          // Delete webhook if no events left
          const { error } = await supabase
            .from('webhooks')
            .delete()
            .eq('id', webhook.id);

          results.push({
            webhookId: webhook.id,
            action: 'deleted',
            success: !error,
            error: error?.message
          });
        } else {
          // Update webhook with remaining events
          const { error } = await supabase
            .from('webhooks')
            .update({
              events: updatedEvents,
              updated_at: new Date().toISOString()
            })
            .eq('id', webhook.id);

          results.push({
            webhookId: webhook.id,
            action: 'updated',
            success: !error,
            error: error?.message,
            remainingEvents: updatedEvents
          });
        }
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'webhooks.bulk_unsubscribe',
        resource_type: 'webhook',
        details: { eventType, affectedWebhooks: results.length },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        results
      });
    }

    if (action === 'toggle_subscriptions') {
      // Enable/disable multiple webhook subscriptions
      const { enable, webhookIds } = body;

      if (!webhookIds || !Array.isArray(webhookIds)) {
        return NextResponse.json({ error: 'webhookIds array is required' }, { status: 400 });
      }

      const { data: webhooks, error } = await supabase
        .from('webhooks')
        .update({
          active: enable,
          updated_at: new Date().toISOString()
        })
        .in('id', webhookIds)
        .eq('organization_id', orgId)
        .select('id, url');

      if (error) {
        console.error('Toggle subscriptions error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: `webhooks.${enable ? 'enable' : 'disable'}_subscriptions`,
        resource_type: 'webhook',
        details: { webhookIds, count: webhooks?.length || 0 },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        updated: webhooks?.length || 0,
        action: enable ? 'enabled' : 'disabled'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Webhook subscribe PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const { eventType, confirm } = body;

    if (!confirm) {
      return NextResponse.json({ error: 'Confirmation required to delete all subscriptions' }, { status: 400 });
    }

    let query = supabase.from('webhooks').delete().eq('organization_id', orgId);

    if (eventType) {
      // Delete all webhooks for a specific event type
      query = query.contains('events', [eventType]);
    }

    const { data: deletedWebhooks, error } = await query.select('id, url, events');

    if (error) {
      console.error('Bulk subscription deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.delete_all_subscriptions',
      resource_type: 'webhook',
      details: { 
        eventType: eventType || 'all',
        deletedCount: deletedWebhooks?.length || 0
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      deleted: deletedWebhooks?.length || 0,
      eventType: eventType || 'all'
    });

  } catch (error: any) {
    console.error('Webhook subscribe DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
