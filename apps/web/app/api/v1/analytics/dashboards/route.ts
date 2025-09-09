import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DashboardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  layout: z.enum(['grid', 'freeform']).default('grid'),
  widgets: z.array(z.any()).default([])
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
  return Sentry.startSpan({ name: 'analytics.dashboards.list' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    const { data: dashboards, error } = await sb
      .from('dashboards')
      .select('*')
      .eq('organization_id', ctx.organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching dashboards:', error);
      return NextResponse.json({ error: 'Failed to fetch dashboards' }, { status: 500 });
    }

    return NextResponse.json({ dashboards: dashboards || [] }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'analytics.dashboards.create' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = DashboardSchema.parse(body);

      const { data: dashboard, error } = await sb
        .from('dashboards')
        .insert({
          organization_id: ctx.organizationId,
          name: validatedData.name,
          description: validatedData.description,
          is_public: validatedData.isPublic,
          layout: validatedData.layout,
          widgets: validatedData.widgets,
          created_by: ctx.userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating dashboard:', error);
        return NextResponse.json({ error: 'Failed to create dashboard' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'create',
        entity: { type: 'dashboard', id: dashboard.id },
        meta: { name: dashboard.name, layout: dashboard.layout, widgets: dashboard.widgets }
      });

      return NextResponse.json({ dashboard }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error creating dashboard:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan({ name: 'analytics.dashboards.update' }, async () => {
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
        return NextResponse.json({ error: 'Dashboard ID is required' }, { status: 400 });
      }

      const validatedData = DashboardSchema.partial().parse(updateData);

      const { data: dashboard, error } = await sb
        .from('dashboards')
        .update(validatedData)
        .eq('id', id)
        .eq('organization_id', ctx.organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating dashboard:', error);
        return NextResponse.json({ error: 'Failed to update dashboard' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'update',
        entity: { type: 'dashboard', id: dashboard.id },
        meta: validatedData
      });

      return NextResponse.json({ dashboard }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error updating dashboard:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return Sentry.startSpan({ name: 'analytics.dashboards.delete' }, async () => {
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
      return NextResponse.json({ error: 'Dashboard ID is required' }, { status: 400 });
    }

    const { error } = await sb
      .from('dashboards')
      .delete()
      .eq('id', id)
      .eq('organization_id', ctx.organizationId);

    if (error) {
      console.error('Error deleting dashboard:', error);
      return NextResponse.json({ error: 'Failed to delete dashboard' }, { status: 500 });
    }

    // Audit log
    await audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'dashboard', id },
      meta: {}
    });

    return NextResponse.json({ success: true }, { status: 200 });
  });
}
