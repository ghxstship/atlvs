import { z as zod } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { CatalogService } from '@/app/(app)/(shell)/procurement/catalog/lib/catalogService';

const updateCatalogItemSchema = zod.object({
  name: zod.string().min(1).max(255).optional(),
  description: zod.string().optional(),
  category: zod.string().optional(),
  price: zod.number().min(0).optional(),
  rate: zod.number().min(0).optional(),
  currency: zod.string().min(3).max(3).optional(),
  unit: zod.enum(['hour', 'day', 'week', 'month', 'project', 'fixed']).optional(),
  sku: zod.string().optional(),
  supplier: zod.string().optional(),
  status: zod.enum(['active', 'inactive', 'discontinued']).optional(),
  specifications: zod.string().optional(),
  tags: zod.array(zod.string()).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify user membership
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

    // Get type from query parameter
    const url = new URL(request.url);
    const type = url.searchParams.get('type') as 'product' | 'service';
    
    if (!type || !['product', 'service'].includes(type)) {
      return NextResponse.json({ error: 'Type parameter required (product or service)' }, { status: 400 });
    }

    const catalogService = new CatalogService();
    const item = await catalogService.getCatalogItem(orgId, params.id, type);

    if (!item) {
      return NextResponse.json({ error: 'Catalog item not found' }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error: unknown) {
    console.error('Error fetching catalog item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check RBAC permissions - only admin/manager can update catalog items
    if (!['admin', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get type from query parameter
    const url = new URL(request.url);
    const type = url.searchParams.get('type') as 'product' | 'service';
    
    if (!type || !['product', 'service'].includes(type)) {
      return NextResponse.json({ error: 'Type parameter required (product or service)' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateCatalogItemSchema.parse(body);

    const catalogService = new CatalogService();
    const updatedItem = await catalogService.updateCatalogItem(
      orgId,
      params.id,
      type,
      validatedData,
      user.id
    );

    return NextResponse.json({ data: updatedItem });
  } catch (error: unknown) {
    if (error instanceof zod.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating catalog item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check RBAC permissions - only admin/manager can delete catalog items
    if (!['admin', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get type from query parameter
    const url = new URL(request.url);
    const type = url.searchParams.get('type') as 'product' | 'service';
    
    if (!type || !['product', 'service'].includes(type)) {
      return NextResponse.json({ error: 'Type parameter required (product or service)' }, { status: 400 });
    }

    const catalogService = new CatalogService();
    await catalogService.deleteCatalogItem(orgId, params.id, type, user.id);

    return NextResponse.json({ message: 'Catalog item deleted successfully' });
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
