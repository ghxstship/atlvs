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

const createAdvancingItemSchema = z.object({
  projectId: z.string().optional(),
  assetId: z.string().optional(),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category: z.enum([
    'site_infrastructure',
    'site_assets', 
    'site_vehicles',
    'site_services',
    'heavy_machinery',
    'it_communication',
    'office_admin',
    'access_credentials',
    'parking',
    'travel_lodging',
    'artist_technical',
    'artist_hospitality',
    'artist_travel'
  ]),
  type: z.enum(['purchase', 'rental', 'service']),
  status: z.enum(['requested', 'approved', 'ordered', 'delivered', 'cancelled']).default('requested'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  requestedBy: z.string().min(1, 'Requested by is required'),
  approvedBy: z.string().optional(),
  vendor: z.string().optional(),
  estimatedCost: z.number().optional(),
  actualCost: z.number().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().optional(),
  neededBy: z.string().optional(),
  deliveryDate: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional()
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

    const advancingItems = await assetsService.getAdvancingItems(membership.organization_id);

    await auditLogger.log('assets.advancing.list', {
      userId: user.id,
      organizationId: membership.organization_id,
      resourceType: 'advancing_item',
      details: { count: advancingItems.length }
    });

    return NextResponse.json({ data: advancingItems });

  } catch (error) {
    console.error('Asset Advancing API error:', error);
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
    const validatedData = createAdvancingItemSchema.parse(body);

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

    const advancingItem = await assetsService.createAdvancingItem(
      membership.organization_id,
      user.id,
      {
        ...validatedData,
        requestedDate: new Date().toISOString()
      } as any
    );

    await auditLogger.log('assets.advancing.create', {
      userId: user.id,
      organizationId: membership.organization_id,
      resourceType: 'advancing_item',
      resourceId: advancingItem.id,
      details: { 
        title: advancingItem.title, 
        category: advancingItem.category,
        priority: advancingItem.priority,
        estimatedCost: advancingItem.estimatedCost
      }
    });

    return NextResponse.json({ data: advancingItem }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Asset Advancing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
