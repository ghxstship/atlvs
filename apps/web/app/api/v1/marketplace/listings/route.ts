import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { getCiBypassContext } from '../../../../../lib/ci-bypass';
import { getI18nPrefs, formatCurrency, formatDateTime } from '../../../../../lib/i18n';

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
  return Sentry.startSpan({ name: 'marketplace.listings.update' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const input = {
      id: String(body?.id ?? ''),
      organizationId: ctx.organizationId,
      title: body?.title !== undefined ? String(body.title) : undefined,
      description: body?.description !== undefined ? String(body.description) : undefined,
      price: body?.price !== undefined ? Number(body.price) : undefined,
      currency: body?.currency !== undefined ? String(body.currency) : undefined,
      status: body?.status !== undefined ? String(body.status) : undefined,
      vendorId: body?.vendorId !== undefined ? String(body.vendorId) : undefined
    } as any;
    if (!input.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { id, ...patch } = input as any;
    const updated = await services.listings.update(ctx, id, patch);
    return NextResponse.json({ listing: updated }, { status: 200 });
  });
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'marketplace.listings.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    const items = await services.listings.list(ctx, { limit, offset });
    const prefs = getI18nPrefs(request);
    const itemsWithDisplay = items.map((it: any) => ({
      ...it,
      display: {
        priceFormatted: formatCurrency(Number(it.price), it.currency, prefs.locale),
        createdAtFormatted: it.createdAt ? formatDateTime(it.createdAt, prefs.timeZone, prefs.locale) : null,
        updatedAtFormatted: it.updatedAt ? formatDateTime(it.updatedAt, prefs.timeZone, prefs.locale) : null
      }
    }));
    return NextResponse.json({ items: itemsWithDisplay }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'marketplace.listings.create' }, async () => {
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
      title: String(body?.title ?? ''),
      description: body?.description ? String(body.description) : undefined,
      price: Number(body?.price ?? 0),
      currency: String(body?.currency ?? 'USD'),
      status: String(body?.status ?? 'draft')
    };
    if (!input.title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const created = await services.listings.create(ctx, input as any);
    return NextResponse.json({ listing: created }, { status: 201 });
  });
}
