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

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'finance.budgets.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');
    const projectId = url.searchParams.get('projectId') || undefined;

    const items = await services.finance.listBudgets(ctx, projectId, { limit, offset });
    const prefs = getI18nPrefs(request);
    const itemsWithDisplay = items.map((budget: any) => ({
      ...budget,
      display: {
        amountFormatted: formatCurrency(Number(budget.amount), budget.currency, prefs.locale),
        spentFormatted: formatCurrency(Number(budget.spent), budget.currency, prefs.locale),
        createdAtFormatted: budget.createdAt ? formatDateTime(budget.createdAt, prefs.timeZone, prefs.locale) : null,
        updatedAtFormatted: budget.updatedAt ? formatDateTime(budget.updatedAt, prefs.timeZone, prefs.locale) : null
      }
    }));
    return NextResponse.json({ items: itemsWithDisplay }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'finance.budgets.create' }, async () => {
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
      projectId: String(body?.projectId ?? ''),
      category: String(body?.category ?? 'other'),
      name: String(body?.name ?? ''),
      description: body?.description ? String(body.description) : undefined,
      amount: Number(body?.amount ?? 0),
      currency: String(body?.currency ?? 'USD'),
      status: String(body?.status ?? 'draft'),
      startDate: String(body?.startDate ?? new Date().toISOString()),
      endDate: body?.endDate ? String(body.endDate) : undefined
    };

    const created = await services.finance.createBudget(ctx, input as any);
    return NextResponse.json({ budget: created }, { status: 201 });
  });
}
