import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';

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

    // Enforce business-layer permission
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const name = String(body?.name ?? '').trim();
    const scopes = Array.isArray(body?.scopes) ? body.scopes.map(String) : [];
    const mode = body?.mode === 'live' ? 'live' : 'test';

    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const { key, record } = await services.apiKeys.issue(ctx.organizationId, name, scopes, mode);

    // Return plaintext key once, omit hash
    return NextResponse.json(
      {
        key,
        apiKey: {
          id: record.id,
          organizationId: record.organizationId,
          name: record.name,
          prefix: record.prefix,
          scopes: record.scopes,
          active: record.active,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          lastUsedAt: record.lastUsedAt,
          expiresAt: record.expiresAt
        }
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}
