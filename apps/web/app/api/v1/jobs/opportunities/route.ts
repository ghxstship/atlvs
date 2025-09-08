import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

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

const CreateOpportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['construction', 'technical', 'creative', 'logistics', 'consulting', 'other']),
  estimatedValue: z.number().optional(),
  currency: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'opportunities.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');
    
    // Parse filters
    const filters: any = {};
    const status = url.searchParams.get('status');
    if (status) filters.status = status.split(',');
    
    const type = url.searchParams.get('type');
    if (type) filters.type = type.split(',');
    
    const minValue = url.searchParams.get('minValue');
    if (minValue) filters.minValue = Number(minValue);
    
    const maxValue = url.searchParams.get('maxValue');
    if (maxValue) filters.maxValue = Number(maxValue);

    const items = await services.jobs.listOpportunities(ctx, filters);
    return NextResponse.json({ items }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'opportunities.create' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = CreateOpportunitySchema.parse(body);
      
      const input = {
        ...validatedData,
        id: crypto.randomUUID(),
        organizationId: ctx.organizationId,
        status: 'lead' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const created = await services.jobs.createOpportunity(ctx, input);
      return NextResponse.json({ opportunity: created }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      throw error;
    }
  });
}
