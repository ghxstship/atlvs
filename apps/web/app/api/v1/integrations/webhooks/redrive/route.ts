import { NextResponse, type NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getSupabaseAndServices } from '@/lib/services';
import { getCiBypassContext } from '@/lib/ci-bypass';
import type { TenantContext } from '@ghxstship/domain';

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

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'integrations.webhooks.redrive' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    // Require admin capability
    const isAdmin = (ctx.roles as any[])?.includes('admin');
    if (!ci && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const limit = Number(new URL(request.url).searchParams.get('limit') ?? '50');
    await services.webhooks.redrive(limit);
    return NextResponse.json({ ok: true, attempted: limit }, { status: 200 });
  });
}
