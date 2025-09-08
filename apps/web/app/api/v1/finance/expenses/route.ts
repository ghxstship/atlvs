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
  return Sentry.startSpan({ name: 'finance.expenses.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');
    const status = url.searchParams.get('status') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const projectId = url.searchParams.get('projectId') || undefined;

    const filters = { status, category, projectId };
    const items = await services.finance.listExpenses(ctx, filters, { limit, offset });
    const prefs = getI18nPrefs(request);
    const itemsWithDisplay = items.map((expense: any) => ({
      ...expense,
      display: {
        amountFormatted: formatCurrency(Number(expense.amount), expense.currency, prefs.locale),
        expenseDateFormatted: expense.expenseDate ? formatDateTime(expense.expenseDate, prefs.timeZone, prefs.locale) : null,
        createdAtFormatted: expense.createdAt ? formatDateTime(expense.createdAt, prefs.timeZone, prefs.locale) : null,
        approvedAtFormatted: expense.approvedAt ? formatDateTime(expense.approvedAt, prefs.timeZone, prefs.locale) : null
      }
    }));
    return NextResponse.json({ items: itemsWithDisplay }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'finance.expenses.create' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    const body = await request.json();
    const input = {
      id: String(body?.id ?? crypto.randomUUID()),
      organizationId: ctx.organizationId,
      projectId: body?.projectId ? String(body.projectId) : undefined,
      budgetId: body?.budgetId ? String(body.budgetId) : undefined,
      title: String(body?.title ?? ''),
      description: body?.description ? String(body.description) : undefined,
      category: String(body?.category ?? 'other'),
      amount: Number(body?.amount ?? 0),
      currency: String(body?.currency ?? 'USD'),
      expenseDate: String(body?.expenseDate ?? new Date().toISOString()),
      receiptUrl: body?.receiptUrl ? String(body.receiptUrl) : undefined
    };

    const created = await services.finance.createExpense(ctx, input as any);
    return NextResponse.json({ expense: created }, { status: 201 });
  });
}
