import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const SettingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['organization', 'security', 'notifications', 'integrations', 'billing', 'teams', 'permissions', 'automations', 'account']),
  value: z.string(),
  description: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  isPublic: z.boolean().default(false),
  isEditable: z.boolean().default(true),
  isRequired: z.boolean().default(false),
  defaultValue: z.string().optional(),
  validationRules: z.string().optional()
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
  return Sentry.startSpan({ name: 'settings.list' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const isPublic = url.searchParams.get('isPublic');
    const isEditable = url.searchParams.get('isEditable');
    const search = url.searchParams.get('search');
    const limit = Number(url.searchParams.get('limit') ?? '50');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    let query = sb
      .from('settings')
      .select('*')
      .eq('organization_id', ctx.organizationId)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (type) query = query.eq('type', type);
    if (isPublic !== null) query = query.eq('is_public', isPublic === 'true');
    if (isEditable !== null) query = query.eq('is_editable', isEditable === 'true');
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,value.ilike.%${search}%`);
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({ settings: settings || [] }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.create' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = SettingSchema.parse(body);

      // Check if setting with same name already exists
      const { data: existing } = await sb
        .from('settings')
        .select('id')
        .eq('organization_id', ctx.organizationId)
        .eq('name', validatedData.name)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: 'Setting with this name already exists' }, { status: 409 });
      }

      const { data: setting, error } = await sb
        .from('settings')
        .insert({
          organization_id: ctx.organizationId,
          name: validatedData.name,
          category: validatedData.category,
          value: validatedData.value,
          description: validatedData.description,
          type: validatedData.type,
          is_public: validatedData.isPublic,
          is_editable: validatedData.isEditable,
          is_required: validatedData.isRequired,
          default_value: validatedData.defaultValue,
          validation_rules: validatedData.validationRules,
          created_by: ctx.userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating setting:', error);
        return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'create',
        entity: { type: 'setting', id: setting.id },
        meta: { name: setting.name, category: setting.category, value: setting.value }
      });

      return NextResponse.json({ setting }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error creating setting:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.update' }, async () => {
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
        return NextResponse.json({ error: 'Setting ID is required' }, { status: 400 });
      }

      const validatedData = SettingSchema.partial().parse(updateData);

      const { data: setting, error } = await sb
        .from('settings')
        .update({
          ...validatedData,
          updated_by: ctx.userId
        })
        .eq('id', id)
        .eq('organization_id', ctx.organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'update',
        entity: { type: 'setting', id: setting.id },
        meta: validatedData
      });

      return NextResponse.json({ setting }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error updating setting:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.delete' }, async () => {
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
      return NextResponse.json({ error: 'Setting ID is required' }, { status: 400 });
    }

    // Check if setting is required (cannot be deleted)
    const { data: setting } = await sb
      .from('settings')
      .select('name, is_required')
      .eq('id', id)
      .eq('organization_id', ctx.organizationId)
      .single();

    if (setting?.is_required) {
      return NextResponse.json({ error: 'Cannot delete required setting' }, { status: 400 });
    }

    const { error } = await sb
      .from('settings')
      .delete()
      .eq('id', id)
      .eq('organization_id', ctx.organizationId);

    if (error) {
      console.error('Error deleting setting:', error);
      return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
    }

    // Audit log
    await audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'setting', id },
      meta: { name: setting?.name }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  });
}
