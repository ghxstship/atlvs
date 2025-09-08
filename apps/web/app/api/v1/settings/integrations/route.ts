import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const IntegrationSettingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider: z.string().min(1, 'Provider is required'),
  category: z.enum(['accounting', 'crm', 'project_management', 'communication', 'storage', 'analytics', 'other']),
  isEnabled: z.boolean().default(true),
  config: z.record(z.any()).default({}),
  credentials: z.record(z.any()).optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  syncFrequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).optional(),
  syncStatus: z.enum(['active', 'error', 'paused']).default('active'),
  errorMessage: z.string().optional()
});

function getTenantContextFromRequest(req: NextRequest, userId?: string): TenantContext {
  const organizationId = req.headers.get('x-org-id') || '';
  const projectId = req.headers.get('x-project-id') || undefined;
  const rolesHeader = req.headers.get('x-roles');
  const roles = rolesHeader ? (rolesHeader.split(',').map((r) => r.trim()) as any) : [];
  if (!organizationId) throw new Error('Missing x-org-id header');
  if (!userId) throw new Error('Unauthenticated');
  return { organizationId, projectId, userId, roles };
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.integrations.list' }, async () => {
    const { sb } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const provider = url.searchParams.get('provider');

    let query = sb
      .from('integration_settings')
      .select('*')
      .eq('organization_id', ctx.organizationId)
      .order('name', { ascending: true });

    if (category) query = query.eq('category', category);
    if (provider) query = query.eq('provider', provider);

    const { data: integrationSettings, error } = await query;

    if (error) {
      console.error('Error fetching integration settings:', error);
      return NextResponse.json({ error: 'Failed to fetch integration settings' }, { status: 500 });
    }

    return NextResponse.json({ integrationSettings: integrationSettings || [] }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.integrations.create' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = IntegrationSettingSchema.parse(body);

      const { data: integrationSetting, error } = await sb
        .from('integration_settings')
        .insert({
          organization_id: ctx.organizationId,
          name: validatedData.name,
          provider: validatedData.provider,
          category: validatedData.category,
          is_enabled: validatedData.isEnabled,
          config: validatedData.config,
          credentials: validatedData.credentials,
          webhook_url: validatedData.webhookUrl,
          sync_frequency: validatedData.syncFrequency,
          sync_status: validatedData.syncStatus,
          error_message: validatedData.errorMessage,
          created_by: ctx.userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating integration setting:', error);
        return NextResponse.json({ error: 'Failed to create integration setting' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'create',
        entity: { type: 'integration_setting', id: integrationSetting.id },
        meta: { name: validatedData.name, provider: validatedData.provider, category: validatedData.category }
      });

      return NextResponse.json({ integrationSetting }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error creating integration setting:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.integrations.update' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { id, ...updateData } = body;
      
      if (!id) {
        return NextResponse.json({ error: 'Integration setting ID is required' }, { status: 400 });
      }

      const validatedData = IntegrationSettingSchema.partial().parse(updateData);

      const updateFields: any = {};
      if (validatedData.name !== undefined) updateFields.name = validatedData.name;
      if (validatedData.provider !== undefined) updateFields.provider = validatedData.provider;
      if (validatedData.category !== undefined) updateFields.category = validatedData.category;
      if (validatedData.isEnabled !== undefined) updateFields.is_enabled = validatedData.isEnabled;
      if (validatedData.config !== undefined) updateFields.config = validatedData.config;
      if (validatedData.credentials !== undefined) updateFields.credentials = validatedData.credentials;
      if (validatedData.webhookUrl !== undefined) updateFields.webhook_url = validatedData.webhookUrl;
      if (validatedData.syncFrequency !== undefined) updateFields.sync_frequency = validatedData.syncFrequency;
      if (validatedData.syncStatus !== undefined) updateFields.sync_status = validatedData.syncStatus;
      if (validatedData.errorMessage !== undefined) updateFields.error_message = validatedData.errorMessage;

      const { data: integrationSetting, error } = await sb
        .from('integration_settings')
        .update(updateFields)
        .eq('id', id)
        .eq('organization_id', ctx.organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating integration setting:', error);
        return NextResponse.json({ error: 'Failed to update integration setting' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'update',
        entity: { type: 'integration_setting', id: integrationSetting.id },
        meta: validatedData
      });

      return NextResponse.json({ integrationSetting }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error updating integration setting:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.integrations.delete' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Integration setting ID is required' }, { status: 400 });
    }

    const { data: integration } = await sb
      .from('integration_settings')
      .select('name, provider')
      .eq('id', id)
      .eq('organization_id', ctx.organizationId)
      .single();

    const { error } = await sb
      .from('integration_settings')
      .delete()
      .eq('id', id)
      .eq('organization_id', ctx.organizationId);

    if (error) {
      console.error('Error deleting integration setting:', error);
      return NextResponse.json({ error: 'Failed to delete integration setting' }, { status: 500 });
    }

    // Audit log
    await audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'integration_setting', id },
      meta: { name: integration?.name, provider: integration?.provider }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  });
}
