import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ExportJobSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  dataSource: z.enum(['projects', 'people', 'finance', 'events', 'custom_query']),
  format: z.enum(['csv', 'xlsx', 'json', 'pdf']),
  filters: z.record(z.any()).default({}),
  schedule: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
    time: z.string(),
    dayOfWeek: z.number().optional(),
    dayOfMonth: z.number().optional()
  }).optional()
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
  return Sentry.startSpan({ name: 'analytics.exports.list' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    const { data: exportJobs, error } = await sb
      .from('export_jobs')
      .select('*')
      .eq('organization_id', ctx.organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching export jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch export jobs' }, { status: 500 });
    }

    return NextResponse.json({ exportJobs: exportJobs || [] }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'analytics.exports.create' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = ExportJobSchema.parse(body);

      const { data: exportJob, error } = await sb
        .from('export_jobs')
        .insert({
          organization_id: ctx.organizationId,
          name: validatedData.name,
          description: validatedData.description,
          data_source: validatedData.dataSource,
          format: validatedData.format,
          filters: validatedData.filters,
          schedule: validatedData.schedule,
          status: 'active',
          created_by: ctx.userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating export job:', error);
        return NextResponse.json({ error: 'Failed to create export job' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'create',
        entity: { type: 'export_job', id: exportJob.id },
        meta: { name: exportJob.name, dataSource: exportJob.data_source, format: exportJob.format }
      });

      return NextResponse.json({ exportJob }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error creating export job:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan({ name: 'analytics.exports.update' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { id, ...updateData } = body;
      
      if (!id) {
        return NextResponse.json({ error: 'Export job ID is required' }, { status: 400 });
      }

      const validatedData = ExportJobSchema.partial().parse(updateData);

      const { data: exportJob, error } = await sb
        .from('export_jobs')
        .update(validatedData)
        .eq('id', id)
        .eq('organization_id', ctx.organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating export job:', error);
        return NextResponse.json({ error: 'Failed to update export job' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'update',
        entity: { type: 'export_job', id: exportJob.id },
        meta: validatedData
      });

      return NextResponse.json({ exportJob }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error updating export job:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return Sentry.startSpan({ name: 'analytics.exports.delete' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Export job ID is required' }, { status: 400 });
    }

    const { error } = await sb
      .from('export_jobs')
      .delete()
      .eq('id', id)
      .eq('organization_id', ctx.organizationId);

    if (error) {
      console.error('Error deleting export job:', error);
      return NextResponse.json({ error: 'Failed to delete export job' }, { status: 500 });
    }

    // Audit log
    await audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'export_job', id },
      meta: {}
    });

    return NextResponse.json({ success: true }, { status: 200 });
  });
}
