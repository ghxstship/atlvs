import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { getCiBypassContext } from '../../../../../lib/ci-bypass';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const TrainingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['safety', 'technical', 'compliance', 'soft_skills', 'certification', 'other']).default('other'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
  duration: z.number().int().min(1),
  format: z.enum(['in_person', 'online', 'hybrid', 'self_paced']).default('in_person'),
  maxParticipants: z.number().int().min(1).optional(),
  prerequisites: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]),
  certificationRequired: z.boolean().default(false),
  validityPeriod: z.number().int().min(1).optional(),
  instructorId: z.string().uuid().optional()
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
  return Sentry.startSpan({ name: 'pipeline.training.list' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:read') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const trainings = await services.pipeline.listTrainings(ctx);
    return NextResponse.json({ trainings }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'pipeline.training.create' }, async () => {
    const { sb, services } = getSupabaseAndServices();
    const ci = getCiBypassContext(request);
    const ctx = ci ?? getTenantContextFromRequest(request, (await sb.auth.getUser()).data.user?.id);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:write') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = TrainingSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const training = {
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await services.pipeline.createTraining(ctx, training);
    return NextResponse.json({ training: created }, { status: 201 });
  });
}
