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

const createMaintenanceSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  type: z.enum(['preventive', 'corrective', 'emergency', 'inspection']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue']).default('scheduled'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  estimatedDuration: z.number().optional(),
  assignedTo: z.string().optional(),
  vendor: z.string().optional(),
  cost: z.number().optional(),
  partsUsed: z.array(z.string()).optional(),
  nextMaintenanceDate: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
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
    const audit = AuditLogger as any;
    const bus = EventBus as any;
    const assetsService = new AssetsService(repos as any, audit, bus);

    const maintenanceRecords = await assetsService.getMaintenanceRecords(membership.organization_id);

    await audit.log('assets.maintenance.list', {
      userId: user.id,
      organizationId: membership.organization_id,
      resourceType: 'maintenance_record',
      details: { count: maintenanceRecords.length }
    });

    return NextResponse.json({ data: maintenanceRecords });

  } catch (error) {
    console.error('Asset Maintenance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
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
    const validatedData = createMaintenanceSchema.parse(body);

    const baseClient = supabase as any;
    const repos = {
      assets: new SupabaseAssetsRepository(baseClient),
      advancing: new SupabaseAssetAdvancingRepository(baseClient),
      assignments: new SupabaseAssetAssignmentRepository(baseClient),
      tracking: new SupabaseAssetTrackingRepository(baseClient),
      maintenance: new SupabaseAssetMaintenanceRepository(baseClient),
      reports: new SupabaseAssetReportRepository(baseClient)
    };
    const audit = AuditLogger as any;
    const bus = EventBus as any;
    const assetsService = new AssetsService(repos as any, audit, bus);

    const maintenanceRecord = await assetsService.scheduleMaintenace(
      membership.organization_id,
      user.id,
      validatedData as any
    );

    await audit.log('assets.maintenance.create', {
      userId: user.id,
      organizationId: membership.organization_id,
      resourceType: 'maintenance_record',
      resourceId: maintenanceRecord.id,
      details: { 
        assetId: maintenanceRecord.assetId,
        type: maintenanceRecord.type,
        priority: maintenanceRecord.priority,
        title: maintenanceRecord.title,
        scheduledDate: maintenanceRecord.scheduledDate
      }
    });

    return NextResponse.json({ data: maintenanceRecord }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Asset Maintenance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
