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
  return Sentry.startSpan({ name: 'finance.transactions.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');
    const accountId = url.searchParams.get('accountId') || undefined;
    const kind = url.searchParams.get('kind') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const filters = { accountId, kind, status };
    const items = await services.finance.listTransactions(ctx, filters, { limit, offset });
    const prefs = getI18nPrefs(request);
    const itemsWithDisplay = items.map((transaction: any) => ({
      ...transaction,
      display: {
        amountFormatted: formatCurrency(Number(transaction.amount), transaction.currency, prefs.locale),
        occurredAtFormatted: transaction.occurredAt ? formatDateTime(transaction.occurredAt, prefs.timeZone, prefs.locale) : null,
        reconciledAtFormatted: transaction.reconciledAt ? formatDateTime(transaction.reconciledAt, prefs.timeZone, prefs.locale) : null
      }
    }));
    return NextResponse.json({ items: itemsWithDisplay }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'finance.transactions.create' }, async () => {
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
      accountId: String(body?.accountId ?? ''),
      projectId: body?.projectId ? String(body.projectId) : undefined,
      invoiceId: body?.invoiceId ? String(body.invoiceId) : undefined,
      expenseId: body?.expenseId ? String(body.expenseId) : undefined,
      kind: String(body?.kind ?? 'expense'),
      amount: Number(body?.amount ?? 0),
      currency: String(body?.currency ?? 'USD'),
      description: String(body?.description ?? ''),
      reference: body?.reference ? String(body.reference) : undefined,
      occurredAt: String(body?.occurredAt ?? new Date().toISOString())
    };

    const created = await services.finance.createTransaction(ctx, input as any);
    return NextResponse.json({ transaction: created }, { status: 201 });
  });
}
