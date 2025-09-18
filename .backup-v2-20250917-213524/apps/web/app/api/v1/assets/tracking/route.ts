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

const updateTrackingSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  currentLocation: z.string().min(1, 'Current location is required'),
  previousLocation: z.string().optional(),
  status: z.enum(['active', 'idle', 'in_transit', 'maintenance', 'offline']).default('active'),
  trackedBy: z.string().min(1, 'Tracked by is required'),
  trackingMethod: z.enum(['manual', 'barcode', 'qr_code', 'rfid', 'gps']).default('manual'),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  signalStrength: z.number().min(0).max(100).optional(),
  notes: z.string().optional()
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

    const trackingData = await assetsService.getTrackingData(membership.organization_id);

    await audit.log('assets.tracking.list', {
      userId: user.id,
      organizationId: membership.organization_id,
      resourceType: 'tracking_data',
      details: { count: trackingData.length }
    });

    return NextResponse.json({ data: trackingData });

  } catch (error) {
    console.error('Asset Tracking API error:', error);
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
    const validatedData = updateTrackingSchema.parse(body);

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

    const trackingRecord = await assetsService.updateAssetLocation(
      validatedData.assetId,
      membership.organization_id,
      user.id,
      validatedData.currentLocation,
      validatedData.coordinates
    );

    await audit.log('assets.tracking.update', {
      userId: user.id,
      organizationId: membership.organization_id,
      resourceType: 'tracking_data',
      resourceId: trackingRecord.id,
      details: { 
        assetId: trackingRecord.assetId,
        location: trackingRecord.location,
        status: trackingRecord.status,
        trackingMethod: trackingRecord.trackingMethod
      }
    });

    return NextResponse.json({ data: trackingRecord }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Asset Tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
