import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';
import { AssetsService } from '@ghxstship/application';
import { SupabaseAssetsRepository } from '@ghxstship/infrastructure';
import { AuditLogger, EventBus } from '@ghxstship/application';

const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
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
  type: z.enum(['fixed', 'rentable', 'service']),
  status: z.enum(['available', 'in_use', 'under_maintenance', 'damaged', 'missing', 'retired']).default('available'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.number().optional(),
  currentValue: z.number().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional()
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

    const assets = await assetsService.listAssets(membership.organization_id);

    await auditLogger.log({
      userId: user.id,
      organizationId: membership.organization_id,
      action: 'assets.list',
      resourceType: 'asset',
      details: { count: assets.length }
    });

    return NextResponse.json({ data: assets });

  } catch (error) {
    console.error('Assets API error:', error);
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
    const validatedData = createAssetSchema.parse(body);

    const assetsRepo = new SupabaseAssetsRepository(supabase);
    const auditLogger = new AuditLogger(supabase);
    const eventBus = new EventBus();
    const assetsService = new AssetsService(assetsRepo, auditLogger, eventBus);

    const asset = await assetsService.createAsset({
      ...validatedData,
      organizationId: membership.organization_id,
      createdBy: user.id
    });

    await auditLogger.log({
      userId: user.id,
      organizationId: membership.organization_id,
      action: 'assets.create',
      resourceType: 'asset',
      resourceId: asset.id,
      details: { name: asset.name, category: asset.category }
    });

    return NextResponse.json({ data: asset }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Assets API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
