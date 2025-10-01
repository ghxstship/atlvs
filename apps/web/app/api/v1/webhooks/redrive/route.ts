import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RedriveRequestSchema = z.object({
  deliveryId: z.string().uuid().optional(),
  webhookId: z.string().uuid().optional(),
  eventType: z.string().optional(),
  status: z.enum(['failed', 'pending']).optional(),
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

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'failed';
    const webhookId = searchParams.get('webhookId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Get failed/pending webhook deliveries that can be redriven
    let query = supabase
      .from('webhook_deliveries')
      .select(`
        id,
        webhook_id,
        event_type,
        status,
        payload,
        response_status,
        response_body,
        attempt_count,
        created_at,
        webhooks!inner(
          id,
          url,
          organization_id,
          active
        )
      `)
      .eq('webhooks.organization_id', orgId)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (webhookId) {
      query = query.eq('webhook_id', webhookId);
    }

    const { data: deliveries, error } = await query;

    if (error) {
      console.error('Failed deliveries fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get summary statistics
    const { data: stats } = await supabase
      .from('webhook_deliveries')
      .select(`
        status,
        webhooks!inner(organization_id)
      `)
      .eq('webhooks.organization_id', orgId);

    const summary = {
      total: stats?.length || 0,
      failed: stats?.filter(d => d.status === 'failed').length || 0,
      pending: stats?.filter(d => d.status === 'pending').length || 0,
      delivered: stats?.filter(d => d.status === 'delivered').length || 0
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.redrive.list',
      resource_type: 'webhook_delivery',
      details: { count: deliveries?.length || 0, status, webhookId },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      deliveries: deliveries || [],
      summary
    });

  } catch (error) {
    console.error('Webhook redrive GET error:', error);
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
    const redriveData = RedriveRequestSchema.parse(body);

    let deliveriesToRedrive = [];

    if (redriveData.deliveryId) {
      // Redrive specific delivery
      const { data: delivery } = await supabase
        .from('webhook_deliveries')
        .select(`
          *,
          webhooks!inner(
            id,
            url,
            headers,
            secret,
            organization_id,
            active,
            retry_policy
          )
        `)
        .eq('id', redriveData.deliveryId)
        .eq('webhooks.organization_id', orgId)
        .single();

      if (!delivery) {
        return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
      }

      deliveriesToRedrive = [delivery];
    } else {
      // Redrive multiple deliveries based on criteria
      let query = supabase
        .from('webhook_deliveries')
        .select(`
          *,
          webhooks!inner(
            id,
            url,
            headers,
            secret,
            organization_id,
            active,
            retry_policy
          )
        `)
        .eq('webhooks.organization_id', orgId)
        .in('status', ['failed', 'pending'])
        .limit(50); // Safety limit

      if (redriveData.webhookId) {
        query = query.eq('webhook_id', redriveData.webhookId);
      }

      if (redriveData.eventType) {
        query = query.eq('event_type', redriveData.eventType);
      }

      if (redriveData.status) {
        query = query.eq('status', redriveData.status);
      }

      const { data: deliveries } = await query;
      deliveriesToRedrive = deliveries || [];
    }

    const results = [];

    for (const delivery of deliveriesToRedrive) {
      try {
        // Check if webhook is active
        if (!delivery.webhooks.active) {
          results.push({
            deliveryId: delivery.id,
            success: false,
            error: 'Webhook is inactive'
          });
          continue;
        }

        // Check retry limits
        const retryPolicy = delivery.webhooks.retry_policy || { maxRetries: 3 };
        if (delivery.attempt_count >= retryPolicy.maxRetries) {
          results.push({
            deliveryId: delivery.id,
            success: false,
            error: 'Max retry attempts exceeded'
          });
          continue;
        }

        // Simulate webhook redrive (in a real implementation, you would make HTTP request)
        const redriveResult = {
          success: Math.random() > 0.3, // 70% success rate for simulation
          status: Math.random() > 0.3 ? 200 : 500,
          response: Math.random() > 0.3 ? 'OK' : 'Internal Server Error'
        };

        // Update delivery record
        const updateData = {
          status: redriveResult.success ? 'delivered' : 'failed',
          response_status: redriveResult.status,
          response_body: redriveResult.response,
          attempt_count: delivery.attempt_count + 1,
          delivered_at: redriveResult.success ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        };

        await supabase
          .from('webhook_deliveries')
          .update(updateData)
          .eq('id', delivery.id);

        // Update webhook success/failure counts
        if (redriveResult.success) {
          await supabase
            .from('webhooks')
            .update({
              success_count: delivery.webhooks.success_count + 1,
              last_triggered_at: new Date().toISOString()
            })
            .eq('id', delivery.webhook_id);
        } else {
          await supabase
            .from('webhooks')
            .update({
              failure_count: delivery.webhooks.failure_count + 1
            })
            .eq('id', delivery.webhook_id);
        }

        results.push({
          deliveryId: delivery.id,
          success: redriveResult.success,
          status: redriveResult.status,
          response: redriveResult.response,
          attemptCount: delivery.attempt_count + 1
        });

      } catch (redriveError) {
        console.error(`Redrive error for delivery ${delivery.id}:`, redriveError);
        results.push({
          deliveryId: delivery.id,
          success: false,
          error: 'Redrive failed'
        });
      }
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.redrive.execute',
      resource_type: 'webhook_delivery',
      details: { 
        totalAttempted: deliveriesToRedrive.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        criteria: redriveData
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      totalAttempted: deliveriesToRedrive.length,
      results
    });

  } catch (error) {
    console.error('Webhook redrive POST error:', error);
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
    const { action, deliveryIds } = body;

    if (action === 'mark_as_resolved') {
      // Mark failed deliveries as resolved (won't be redriven)
      if (!deliveryIds || !Array.isArray(deliveryIds)) {
        return NextResponse.json({ error: 'deliveryIds array is required' }, { status: 400 });
      }

      const { data: deliveries, error } = await supabase
        .from('webhook_deliveries')
        .update({
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .in('id', deliveryIds)
        .eq('status', 'failed')
        .select(`
          id,
          webhooks!inner(organization_id)
        `);

      if (error) {
        console.error('Mark as resolved error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Verify all deliveries belong to this organization
      const invalidDeliveries = deliveries?.filter(d => (d as any).webhooks.organization_id !== orgId);
      if (invalidDeliveries?.length) {
        return NextResponse.json({ error: 'Some deliveries do not belong to your organization' }, { status: 403 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'webhooks.redrive.mark_resolved',
        resource_type: 'webhook_delivery',
        details: { deliveryIds, count: deliveries?.length || 0 },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        resolved: deliveries?.length || 0
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Webhook redrive PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (role !== 'owner') {
      return NextResponse.json({ error: 'Only organization owners can purge delivery history' }, { status: 403 });
    }

    const body = await request.json();
    const { confirm, olderThanDays = 30 } = body;

    if (!confirm) {
      return NextResponse.json({ error: 'Confirmation required to purge delivery history' }, { status: 400 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Delete old webhook deliveries
    const { data: deletedDeliveries, error } = await supabase
      .from('webhook_deliveries')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select(`
        id,
        webhooks!inner(organization_id)
      `);

    if (error) {
      console.error('Delivery history purge error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Verify all deliveries belonged to this organization
    const invalidDeliveries = deletedDeliveries?.filter(d => (d as any).webhooks.organization_id !== orgId);
    if (invalidDeliveries?.length) {
      return NextResponse.json({ error: 'Some deliveries did not belong to your organization' }, { status: 403 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'webhooks.redrive.purge_history',
      resource_type: 'webhook_delivery',
      details: { 
        olderThanDays,
        purgedCount: deletedDeliveries?.length || 0,
        cutoffDate: cutoffDate.toISOString()
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      purged: deletedDeliveries?.length || 0,
      cutoffDate: cutoffDate.toISOString()
    });

  } catch (error) {
    console.error('Webhook redrive DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
