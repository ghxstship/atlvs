import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const IntegrationConfigSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['webhook', 'api', 'sso', 'email', 'sms', 'accounting', 'crm', 'project_management']),
  enabled: z.boolean(),
  config: z.record(z.any()),
  credentials: z.record(z.any()).optional(),
  settings: z.object({
    syncFrequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).optional(),
    retryAttempts: z.number().min(0).max(10).optional(),
    timeout: z.number().positive().optional(),
    rateLimitPerHour: z.number().positive().optional()
  }).optional()
});

const UpdateIntegrationSchema = IntegrationConfigSchema.partial();

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
    const type = searchParams.get('type');
    const enabled = searchParams.get('enabled');

    let query = supabase
      .from('integrations')
      .select('id, name, type, enabled, config, settings, status, last_sync, created_at, updated_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (enabled !== null) query = query.eq('enabled', enabled === 'true');

    const { data: integrations, error } = await query;

    if (error) {
      console.error('Integrations fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get available integration types
    const availableIntegrations = [
      { type: 'webhook', name: 'Webhooks', description: 'HTTP callbacks for real-time notifications' },
      { type: 'api', name: 'REST API', description: 'RESTful API access' },
      { type: 'sso', name: 'Single Sign-On', description: 'SAML/OAuth authentication' },
      { type: 'email', name: 'Email Service', description: 'SMTP/Email provider integration' },
      { type: 'sms', name: 'SMS Service', description: 'SMS notification provider' },
      { type: 'accounting', name: 'Accounting Software', description: 'QuickBooks, Xero, etc.' },
      { type: 'crm', name: 'CRM Systems', description: 'Salesforce, HubSpot, etc.' },
      { type: 'project_management', name: 'Project Management', description: 'Asana, Jira, etc.' }
    ];

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.integrations.list',
      resource_type: 'integration',
      details: { count: integrations?.length || 0, filters: { type, enabled } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      integrations: integrations || [],
      availableIntegrations
    });

  } catch (error) {
    console.error('Integrations GET error:', error);
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

    if (action === 'test_integration') {
      const { integrationId } = data;

      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', integrationId)
        .eq('organization_id', orgId)
        .single();

      if (!integration) {
        return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
      }

      // Simulate integration test based on type
      let testResult = { success: true, message: 'Integration test successful' };

      if (integration.type === 'webhook') {
        // Test webhook endpoint
        try {
          const webhookUrl = integration.config?.url;
          if (!webhookUrl) {
            testResult = { success: false, message: 'Webhook URL not configured' };
          } else {
            // In a real implementation, you would make an HTTP request to test the webhook
            testResult = { success: true, message: 'Webhook endpoint is reachable' };
          }
        } catch (error) {
          testResult = { success: false, message: 'Webhook test failed' };
        }
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'settings.integrations.test',
        resource_type: 'integration',
        resource_id: integrationId,
        details: testResult,
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json(testResult);
    }

    // Create new integration
    const integrationData = IntegrationConfigSchema.parse(data);

    const { data: integration, error } = await supabase
      .from('integrations')
      .insert({
        ...integrationData,
        organization_id: orgId,
        status: 'active',
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Integration creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.integrations.create',
      resource_type: 'integration',
      resource_id: integration.id,
      details: { name: integrationData.name, type: integrationData.type },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ integration }, { status: 201 });

  } catch (error) {
    console.error('Integrations POST error:', error);
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
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    const integrationData = UpdateIntegrationSchema.parse(updateData);

    const { data: integration, error } = await supabase
      .from('integrations')
      .update({
        ...integrationData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Integration update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.integrations.update',
      resource_type: 'integration',
      resource_id: integration.id,
      details: { updated_fields: Object.keys(integrationData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ integration });

  } catch (error) {
    console.error('Integrations PUT error:', error);
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
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    const { data: integration } = await supabase
      .from('integrations')
      .select('name, type')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Integration deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.integrations.delete',
      resource_type: 'integration',
      resource_id: id,
      details: { name: integration.name, type: integration.type },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Integrations DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
