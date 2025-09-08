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

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'pipeline.stages.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    const items = await services.pipeline.listStages(ctx);
    return NextResponse.json({ items }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'pipeline.stages.create' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const stage = {
      id: String(body?.id ?? crypto.randomUUID()),
      organizationId: ctx.organizationId,
      name: String(body?.name ?? ''),
      order: Number(body?.order ?? 0)
    };
    if (!stage.name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const created = await services.pipeline.createStage(ctx, stage as any);
    return NextResponse.json({ stage: created }, { status: 201 });
  });
}
