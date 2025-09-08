import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';
import { AssetsService } from '@ghxstship/application';
import { SupabaseAssetsRepository } from '@ghxstship/infrastructure';
import { AuditLogger, EventBus } from '@ghxstship/application';

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

    const advancingItems = await assetsService.listAdvancingItems(membership.organization_id);

    await auditLogger.log({
      userId: user.id,
      organizationId: membership.organization_id,
      action: 'assets.advancing.list',
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
    const validatedData = createAdvancingItemSchema.parse(body);

    const assetsRepo = new SupabaseAssetsRepository(supabase);
    const auditLogger = new AuditLogger(supabase);
    const eventBus = new EventBus();
    const assetsService = new AssetsService(assetsRepo, auditLogger, eventBus);

    const advancingItem = await assetsService.createAdvancingItem({
      ...validatedData,
      organizationId: membership.organization_id,
      requestedDate: new Date().toISOString(),
      createdBy: user.id
    });

    await auditLogger.log({
      userId: user.id,
      organizationId: membership.organization_id,
      action: 'assets.advancing.create',
      resourceType: 'advancing_item',
      resourceId: advancingItem.id,
      details: { 
        name: advancingItem.name, 
        type: advancingItem.type,
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
