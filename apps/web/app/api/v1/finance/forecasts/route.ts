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
  return Sentry.startSpan({ name: 'finance.forecasts.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');
    const type = url.searchParams.get('type') || undefined;
    const period = url.searchParams.get('period') || undefined;
    const projectId = url.searchParams.get('projectId') || undefined;

    const filters = { type, period, projectId };
    const items = await services.finance.listForecasts(ctx, filters, { limit, offset });
    const prefs = getI18nPrefs(request);
    const itemsWithDisplay = items.map((forecast: any) => ({
      ...forecast,
      display: {
        projectedAmountFormatted: formatCurrency(Number(forecast.projectedAmount), forecast.currency, prefs.locale),
        actualAmountFormatted: forecast.actualAmount ? formatCurrency(Number(forecast.actualAmount), forecast.currency, prefs.locale) : null,
        varianceFormatted: forecast.variance ? formatCurrency(Number(forecast.variance), forecast.currency, prefs.locale) : null,
        periodStartFormatted: forecast.periodStart ? formatDateTime(forecast.periodStart, prefs.timeZone, prefs.locale) : null,
        periodEndFormatted: forecast.periodEnd ? formatDateTime(forecast.periodEnd, prefs.timeZone, prefs.locale) : null,
        createdAtFormatted: forecast.createdAt ? formatDateTime(forecast.createdAt, prefs.timeZone, prefs.locale) : null
      }
    }));
    return NextResponse.json({ items: itemsWithDisplay }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'finance.forecasts.create' }, async () => {
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
      projectId: body?.projectId ? String(body.projectId) : undefined,
      name: String(body?.name ?? ''),
      description: body?.description ? String(body.description) : undefined,
      type: String(body?.type ?? 'revenue'),
      period: String(body?.period ?? 'monthly'),
      periodStart: String(body?.periodStart ?? new Date().toISOString()),
      periodEnd: String(body?.periodEnd ?? new Date().toISOString()),
      projectedAmount: Number(body?.projectedAmount ?? 0),
      currency: String(body?.currency ?? 'USD'),
      assumptions: body?.assumptions || []
    };

    const created = await services.finance.createForecast(ctx, input as any);
    return NextResponse.json({ forecast: created }, { status: 201 });
  });
}
