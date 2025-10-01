import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';
import { AssetsService } from '@ghxstship/application';
import { AuditLogger, EventBus } from '@ghxstship/application';
import {
  SupabaseAssetsRepository,
  SupabaseAssetAdvancingRepository,
  SupabaseAssetAssignmentRepository,
  SupabaseAssetTrackingRepository,
  SupabaseAssetMaintenanceRepository,
  SupabaseAssetReportRepository
} from '@ghxstship/infrastructure';

const createAssignmentSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  assigneeType: z.enum(['project', 'crew_member', 'vendor', 'partner']),
  assigneeId: z.string().min(1, 'Assignee ID is required'),
  assigneeName: z.string().min(1, 'Assignee name is required'),
  status: z.enum(['assigned', 'in_use', 'returned', 'overdue', 'damaged']).default('assigned'),
  assignedBy: z.string().min(1, 'Assigned by is required'),
  expectedReturnDate: z.string().optional(),
  location: z.string().optional(),
  purpose: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'damaged']).default('excellent'),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });
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

    const baseClient = supabase as any;
    const repos = {
      assets: new SupabaseAssetsRepository(baseClient),
      advancing: new SupabaseAssetAdvancingRepository(baseClient),
      assignments: new SupabaseAssetAssignmentRepository(baseClient),
      tracking: new SupabaseAssetTrackingRepository(baseClient),
      maintenance: new SupabaseAssetMaintenanceRepository(baseClient),
      reports: new SupabaseAssetReportRepository(baseClient)
    };
    const auditLogger = AuditLogger as any;
    const eventBus = EventBus as any;
    const assetsService = new AssetsService(repos as any, auditLogger, eventBus);

    const assignments = await assetsService.getAssignments(membership.organization_id);

    await auditLogger.log('assets.assignments.list', {
      userId: user.id,
      organizationId: membership.organization_id,
      resourceType: 'assignment',
      details: { count: assignments.length }
    });

    return NextResponse.json({ data: assignments });

  } catch (error) {
    console.error('Asset Assignments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });
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
    const validatedData = createAssignmentSchema.parse(body);

    const baseClient = supabase as any;
    const repos = {
      assets: new SupabaseAssetsRepository(baseClient),
      advancing: new SupabaseAssetAdvancingRepository(baseClient),
      assignments: new SupabaseAssetAssignmentRepository(baseClient),
      tracking: new SupabaseAssetTrackingRepository(baseClient),
      maintenance: new SupabaseAssetMaintenanceRepository(baseClient),
      reports: new SupabaseAssetReportRepository(baseClient)
    };
    const auditLogger = AuditLogger as any;
    const eventBus = EventBus as any;
    const assetsService = new AssetsService(repos as any, auditLogger, eventBus);

    const assignment = await assetsService.createAssignment(
      membership.organization_id,
      user.id,
      validatedData as any
    );

    await auditLogger.log('assets.assignments.create', {
      userId: user.id,
      organizationId: membership.organization_id,
      resourceType: 'assignment',
      resourceId: assignment.id,
      details: { 
        assetId: assignment.assetId,
        assignedToType: assignment.assignedToType,
        assignedTo: assignment.assignedTo,
        purpose: assignment.purpose
      }
    });

    return NextResponse.json({ data: assignment }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Asset Assignments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
