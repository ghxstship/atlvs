import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { getCiBypassContext } from '../../../../../lib/ci-bypass';

export const dynamic = 'force-dynamic';

function getTenantContextFromRequest(req: NextRequest, userId?: string): TenantContext {
  const organizationId = req.headers.get('x-org-id') || '';
  const projectId = req.headers.get('x-project-id') || undefined;
  const rolesHeader = req.headers.get('x-roles');
  const roles = rolesHeader ? (rolesHeader.split(',').map((r) => r.trim()) as any) : [];
  if (!organizationId) throw new Error('Missing x-org-id header');
  if (!userId) throw new Error('Unauthenticated');
  return { organizationId, projectId, userId, roles };
}

export async function PATCH(request: NextRequest) {
  return Sentry.startSpan({ name: 'marketplace.vendors.update' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const id = String(body?.id ?? '');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    const patch = {
      name: body?.name !== undefined ? String(body.name) : undefined,
      website: body?.website !== undefined ? String(body.website) : undefined,
      contactEmail: body?.contactEmail !== undefined ? String(body.contactEmail) : undefined,
      status: body?.status !== undefined ? String(body.status) : undefined
    } as any;
    const updated = await services.vendors.update(ctx, id, patch);
    return NextResponse.json({ vendor: updated }, { status: 200 });
  });
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'marketplace.vendors.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    const items = await services.vendors.list(ctx, { limit, offset });
    return NextResponse.json({ items }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'marketplace.vendors.create' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const input = {
      id: String(body?.id ?? crypto.randomUUID()),
      organizationId: ctx.organizationId,
      name: String(body?.name ?? ''),
      website: body?.website ? String(body.website) : undefined,
      contactEmail: body?.contactEmail ? String(body.contactEmail) : undefined,
      status: String(body?.status ?? 'draft')
    };
    if (!input.name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const created = await services.vendors.create(ctx, input as any);
    return NextResponse.json({ vendor: created }, { status: 201 });
  });
}
