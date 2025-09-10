import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';

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

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'procurement.purchase_orders.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    const { data: items, error } = await sb
      .from('procurement_orders')
      .select('*')
      .eq('organization_id', ctx.organizationId)
      .order('created_at', { ascending: false })
      .range(offset, Math.max(offset + limit - 1, offset));

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
    }

    return NextResponse.json({ items: items ?? [] }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'procurement.purchase_orders.create' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const input = {
      id: String(body?.id ?? crypto.randomUUID()),
      organizationId: ctx.organizationId,
      vendor: String(body?.vendor ?? ''),
      total: Number(body?.total ?? body?.total_amount ?? 0),
      currency: String(body?.currency ?? 'USD'),
      status: String(body?.status ?? 'draft')
    };
    if (!input.vendor) return NextResponse.json({ error: 'vendor is required' }, { status: 400 });

    const { data: created, error } = await sb
      .from('procurement_orders')
      .insert({
        id: input.id,
        organization_id: ctx.organizationId,
        vendor: input.vendor,
        total_amount: input.total,
        currency: input.currency,
        status: input.status,
        created_by: ctx.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
    }

    return NextResponse.json({ purchaseOrder: created }, { status: 201 });
  });
}
