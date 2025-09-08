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

const CreateAssignmentSchema = z.object({
  jobId: z.string().min(1),
  assigneeUserId: z.string().optional(),
  assigneeCompanyId: z.string().optional(),
  assigneeType: z.enum(['contractor', 'employee', 'consultant', 'vendor']),
  role: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hourlyRate: z.number().optional(),
  totalBudget: z.number().optional(),
  currency: z.string().optional(),
  note: z.string().optional(),
});

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'assignments.list' }, async () => {
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
    
    const assigneeType = url.searchParams.get('assigneeType');
    if (assigneeType) filters.assigneeType = assigneeType.split(',');
    
    const jobId = url.searchParams.get('jobId');
    if (jobId) filters.jobId = jobId;

    const items = await services.jobs.listAssignments(ctx, filters);
    return NextResponse.json({ items }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'assignments.create' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = CreateAssignmentSchema.parse(body);
      
      const input = {
        ...validatedData,
        id: crypto.randomUUID(),
        organizationId: ctx.organizationId,
        status: 'pending' as const,
        assignedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const created = await services.jobs.createAssignment(ctx, input);
      return NextResponse.json({ assignment: created }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      throw error;
    }
  });
}
