import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateCatalogItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string(),
  category: z.enum(['equipment', 'services', 'talent', 'locations', 'software', 'other']),
  subcategory: z.string().optional(),
  type: z.enum(['rental', 'purchase', 'service', 'subscription']),
  pricing: z.object({
    basePrice: z.number().positive(),
    currency: z.string().default('USD'),
    unit: z.enum(['hour', 'day', 'week', 'month', 'project', 'each']),
    minimumOrder: z.number().optional(),
    discounts: z.array(z.object({
      quantity: z.number(),
      percentage: z.number().min(0).max(100)
    })).optional()
  }),
  availability: z.object({
    status: z.enum(['available', 'limited', 'unavailable', 'on_request']),
    quantity: z.number().optional(),
    location: z.string().optional(),
    leadTime: z.string().optional()
  }),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string(),
    isPrimary: z.boolean().default(false)
  })).optional(),
  tags: z.array(z.string()).optional(),
  vendorId: z.string().uuid().optional(),
  isPublic: z.boolean().default(true),
  featured: z.boolean().default(false),
});

const UpdateCatalogItemSchema = CreateCatalogItemSchema.partial();

async function getAuthenticatedUser() {
  const cookieStore = cookies();
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
    throw new Error('Unauthorized');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new Error('No active organization membership');
  }

  return { user, orgId: membership.organization_id, role: membership.role, supabase };
}

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const availability = searchParams.get('availability');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const vendorId = searchParams.get('vendorId');

    let query = supabase
      .from('marketplace_catalog_items')
      .select(`
        *,
        vendor:marketplace_vendors(id, name, rating),
        reviews:marketplace_reviews(rating)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (type) query = query.eq('type', type);
    if (availability) query = query.eq('availability->status', availability);
    if (minPrice) query = query.gte('pricing->basePrice', parseFloat(minPrice));
    if (maxPrice) query = query.lte('pricing->basePrice', parseFloat(maxPrice));
    if (location) query = query.ilike('availability->location', `%${location}%`);
    if (featured === 'true') query = query.eq('featured', true);
    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Catalog items fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate average ratings
    const itemsWithRatings = items?.map(item => ({
      ...item,
      averageRating: item.reviews?.length > 0 
        ? item.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / item.reviews.length 
        : 0,
      reviewCount: item.reviews?.length || 0
    })) || [];

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'marketplace.catalog_items.list',
      resource_type: 'catalog_item',
      details: { 
        count: items?.length || 0,
        filters: { category, type, availability, minPrice, maxPrice, location, search }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ items: itemsWithRatings });

  } catch (error: any) {
    console.error('Catalog items GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const itemData = CreateCatalogItemSchema.parse(body);

    // Verify vendor if provided
    if (itemData.vendorId) {
      const { data: vendor } = await supabase
        .from('marketplace_vendors')
        .select('id')
        .eq('id', itemData.vendorId)
        .single();

      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
      }
    }

    const { data: item, error } = await supabase
      .from('marketplace_catalog_items')
      .insert({
        ...itemData,
        organization_id: orgId,
        created_by: user.id,
        view_count: 0,
        inquiry_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Catalog item creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'marketplace.catalog_items.create',
      resource_type: 'catalog_item',
      resource_id: item.id,
      details: { 
        name: item.name,
        category: item.category,
        type: item.type,
        base_price: item.pricing?.basePrice
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ item }, { status: 201 });

  } catch (error: any) {
    console.error('Catalog items POST error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const itemData = UpdateCatalogItemSchema.parse(updateData);

    const { data: item, error } = await supabase
      .from('marketplace_catalog_items')
      .update({
        ...itemData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Catalog item update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'marketplace.catalog_items.update',
      resource_type: 'catalog_item',
      resource_id: item.id,
      details: { updated_fields: Object.keys(itemData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ item });

  } catch (error: any) {
    console.error('Catalog items PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const { data: item } = await supabase
      .from('marketplace_catalog_items')
      .select('name')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('marketplace_catalog_items')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Catalog item deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'marketplace.catalog_items.delete',
      resource_type: 'catalog_item',
      resource_id: id,
      details: { name: item?.name || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Catalog items DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
