import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { getCiBypassContext } from '../../../../../lib/ci-bypass';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ContractSchema = z.object({
  projectId: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['service', 'employment', 'vendor', 'nda', 'licensing', 'other']).default('service'),
  status: z.enum(['draft', 'review', 'negotiation', 'approved', 'signed', 'active', 'completed', 'terminated', 'expired']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  contractorId: z.string().uuid().optional(),
  contractorName: z.string().optional(),
  contractorEmail: z.string().email().optional(),
  value: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  autoRenewal: z.boolean().default(false),
  terms: z.string().optional()
});

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
  return Sentry.startSpan({ name: 'pipeline.contracting.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:read') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const contracts = await services.pipeline.listContracts(ctx, projectId || undefined);
    return NextResponse.json({ contracts }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'pipeline.contracting.create' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:write') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = ContractSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const contract = {
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      ...validation.data,
      createdBy: ctx.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await services.pipeline.createContract(ctx, contract);
    return NextResponse.json({ contract: created }, { status: 201 });
  });
}
