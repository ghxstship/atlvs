import { z as zod } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { CatalogService } from '@/app/(app)/(shell)/procurement/catalog/lib/catalogService';

const catalogQuerySchema = zod.object({
  page: zod.coerce.number().min(1).default(1),
  limit: zod.coerce.number().min(1).max(100).default(50),
  search: zod.string().optional(),
  type: zod.enum(['all', 'product', 'service']).default('all'),
  status: zod.enum(['all', 'active', 'inactive', 'discontinued']).default('all'),
  category: zod.string().optional(),
  supplier: zod.string().optional(),
  sortField: zod.enum(['name', 'price', 'rate', 'category', 'supplier', 'status', 'created_at', 'updated_at']).default('created_at'),
  sortDirection: zod.enum(['asc', 'desc']).default('desc'),
  priceMin: zod.coerce.number().min(0).optional(),
  priceMax: zod.coerce.number().min(0).optional(),
  dateStart: zod.string().optional(),
  dateEnd: zod.string().optional(),
  tags: zod.string().optional(), // Comma-separated tags
});

const bulkActionSchema = zod.object({
  type: zod.enum(['delete', 'update_status', 'update_category', 'update_supplier', 'export']),
  itemIds: zod.array(zod.string().uuid()),
  data: zod.record(zod.any()).optional(),
});

const exportConfigSchema = zod.object({
  format: zod.enum(['csv', 'xlsx', 'json', 'pdf']),
  fields: zod.array(zod.string()).default([]),
  includeHeaders: zod.boolean().default(true),
  filename: zod.string().optional(),
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract organization context
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user membership and permissions
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = catalogQuerySchema.parse(queryParams);

    // Build filters
    const filters: unknown = {
      search: validatedQuery.search,
      type: validatedQuery.type === 'all' ? undefined : validatedQuery.type,
      status: validatedQuery.status === 'all' ? undefined : validatedQuery.status,
      category: validatedQuery.category,
      supplier: validatedQuery.supplier,
    };

    if (validatedQuery.priceMin !== undefined || validatedQuery.priceMax !== undefined) {
      filters.priceRange = {
        min: validatedQuery.priceMin,
        max: validatedQuery.priceMax,
      };
    }

    if (validatedQuery.dateStart || validatedQuery.dateEnd) {
      filters.dateRange = {
        start: validatedQuery.dateStart,
        end: validatedQuery.dateEnd,
      };
    }

    if (validatedQuery.tags) {
      filters.tags = validatedQuery.tags.split(',').map((tag: string) => tag.trim());
    }

    // Build sort
    const sort = {
      field: validatedQuery.sortField,
      direction: validatedQuery.sortDirection,
    };

    const catalogService = new CatalogService();
    const result = await catalogService.getCatalogItems(
      orgId,
      filters,
      sort,
      validatedQuery.page,
      validatedQuery.limit
    );

    return NextResponse.json({
      data: result.items,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: result.total,
        hasMore: result.hasMore,
        totalPages: Math.ceil(result.total / validatedQuery.limit),
      },
    });
  } catch (error: unknown) {
    if (error instanceof zod.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching catalog items:', error);
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract organization context
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user membership and permissions
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check RBAC permissions - only admin/manager can create catalog items
    if (!['admin', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const catalogService = new CatalogService();

    // Handle different POST operations based on action
    if (body.action === 'bulk') {
      const validatedAction = bulkActionSchema.parse(body);
      const result = await catalogService.bulkUpdateCatalogItems(orgId, validatedAction, user.id);
      
      return NextResponse.json({
        data: result,
        message: `Bulk operation completed: ${result.success} successful, ${result.failed} failed`,
      });
    }

    if (body.action === 'export') {
      const validatedConfig = exportConfigSchema.parse(body);
      const blob = await catalogService.exportCatalogItems(orgId, validatedConfig);
      
      // Convert blob to base64 for JSON response
      const buffer = await blob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      return NextResponse.json({
        data: {
          content: base64,
          contentType: blob.type,
          filename: validatedConfig.filename || `catalog-export.${validatedConfig.format}`,
        },
      });
    }

    // Default: Create catalog item
    const item = await catalogService.createCatalogItem(orgId, body, user.id);
    
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof zod.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in catalog POST operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
