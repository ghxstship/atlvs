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

const CreateRFPSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['construction', 'technical', 'creative', 'consulting', 'logistics', 'other']),
  budget: z.number().optional(),
  currency: z.string().optional(),
  submissionDeadline: z.string().optional(),
  projectStartDate: z.string().optional(),
  projectEndDate: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  evaluationCriteria: z.array(z.string()).optional(),
  contactEmail: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'rfps.list' }, async () => {
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
    
    const minBudget = url.searchParams.get('minBudget');
    if (minBudget) filters.minBudget = Number(minBudget);
    
    const maxBudget = url.searchParams.get('maxBudget');
    if (maxBudget) filters.maxBudget = Number(maxBudget);

    const items = await services.jobs.listRFPs(ctx, filters);
    return NextResponse.json({ items }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'rfps.create' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = CreateRFPSchema.parse(body);
      
      const input = {
        ...validatedData,
        id: crypto.randomUUID(),
        organizationId: ctx.organizationId,
        status: 'draft' as const,
        bidCount: 0,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const created = await services.jobs.createRFP(ctx, input);
      return NextResponse.json({ rfp: created }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      throw error;
    }
  });
}
