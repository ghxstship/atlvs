import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';
import { AssetsService } from '@ghxstship/application';
import { SupabaseAssetsRepository } from '@ghxstship/infrastructure';
import { AuditLogger, EventBus } from '@ghxstship/application';

const createReportSchema = z.object({
  title: z.string().min(1, 'Report title is required'),
  type: z.enum(['usage', 'cost', 'maintenance', 'depreciation', 'inventory', 'performance']),
  dateRange: z.object({
    start: z.string().min(1, 'Start date is required'),
    end: z.string().min(1, 'End date is required')
  }),
  filters: z.object({
    categories: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional()
  }).optional(),
  scheduledFor: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check organization membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    // Check permissions
    const { data: permissions } = await supabase
      .from('role_permissions')
      .select('permission')
      .eq('role', membership.role)
      .eq('permission', 'assets:read');

    if (!permissions?.length) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const assetsRepo = new SupabaseAssetsRepository(supabase);
    const auditLogger = new AuditLogger(supabase);
    const eventBus = new EventBus();
    const assetsService = new AssetsService(assetsRepo, auditLogger, eventBus);

    const reports = await assetsService.listReports(membership.organization_id);

    await auditLogger.log({
      userId: user.id,
      organizationId: membership.organization_id,
      action: 'assets.reports.list',
      resourceType: 'report',
      details: { count: reports.length }
    });

    return NextResponse.json({ data: reports });

  } catch (error) {
    console.error('Asset Reports API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check organization membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    // Check permissions
    const { data: permissions } = await supabase
      .from('role_permissions')
      .select('permission')
      .eq('role', membership.role)
      .eq('permission', 'assets:write');

    if (!permissions?.length) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createReportSchema.parse(body);

    const assetsRepo = new SupabaseAssetsRepository(supabase);
    const auditLogger = new AuditLogger(supabase);
    const eventBus = new EventBus();
    const assetsService = new AssetsService(assetsRepo, auditLogger, eventBus);

    const report = await assetsService.createReport({
      ...validatedData,
      organizationId: membership.organization_id,
      generatedBy: user.id,
      status: validatedData.scheduledFor ? 'scheduled' : 'generating'
    });

    await auditLogger.log({
      userId: user.id,
      organizationId: membership.organization_id,
      action: 'assets.reports.create',
      resourceType: 'report',
      resourceId: report.id,
      details: { 
        title: report.title,
        type: report.type,
        dateRange: report.dateRange
      }
    });

    return NextResponse.json({ data: report }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Asset Reports API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
