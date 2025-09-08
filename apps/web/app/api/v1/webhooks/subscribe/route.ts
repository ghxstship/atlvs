import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext, WebhookSubscription } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import { randomBytes } from 'node:crypto';

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
  try {
    const { sb, services } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const url = String(body?.url ?? '').trim();
    const eventNames = Array.isArray(body?.eventNames) ? body.eventNames.map(String) : [];
    const secretInput = body?.secret ? String(body.secret) : undefined;

    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

    const sub: WebhookSubscription = {
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      url,
      secret: secretInput || randomBytes(24).toString('base64url'),
      eventNames,
      active: true,
      createdAt: new Date().toISOString()
    };

    const created = await services.webhooks.createSubscription(sub);
    return NextResponse.json({ subscription: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}
