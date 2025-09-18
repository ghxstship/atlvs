import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateListingSchema = z.object({
  title: z.string().min(1, 'Listing title is required'),
  description: z.string(),
  type: z.enum(['offer', 'request', 'exchange']),
  category: z.enum(['equipment', 'services', 'talent', 'locations', 'materials', 'other']),
  subcategory: z.string().optional(),
  pricing: z.object({
    amount: z.number().positive().optional(),
    currency: z.string().default('USD'),
    negotiable: z.boolean().default(true),
    paymentTerms: z.string().optional()
  }).optional(),
  location: z.object({
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    isRemote: z.boolean().default(false)
  }),
  availability: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    flexible: z.boolean().default(true),
    immediateAvailable: z.boolean().default(false)
  }),
  requirements: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string(),
    isPrimary: z.boolean().default(false)
  })).optional(),
  contactInfo: z.object({
    preferredMethod: z.enum(['email', 'phone', 'platform']),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    showPublic: z.boolean().default(false)
  }),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

const UpdateListingSchema = CreateListingSchema.partial();

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
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const showMine = searchParams.get('showMine');
    const active = searchParams.get('active');

    let query = supabase
      .from('marketplace_listings')
      .select(`
        *,
        organization:organizations(id, name, slug),
        creator:users(id, name, email),
        responses:listing_responses(count)
      `)
      .order('created_at', { ascending: false });

    if (showMine === 'true') {
      query = query.eq('organization_id', orgId);
    }

    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);
    if (location) query = query.ilike('location->city', `%${location}%`);
    if (minPrice) query = query.gte('pricing->amount', parseFloat(minPrice));
    if (maxPrice) query = query.lte('pricing->amount', parseFloat(maxPrice));
    if (featured === 'true') query = query.eq('featured', true);
    if (active === 'true') {
      query = query.or('expires_at.is.null,expires_at.gt.now()');
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: listings, error } = await query;

    if (error) {
      console.error('Listings fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'marketplace.listings.list',
      resource_type: 'marketplace_listing',
      details: { 
        count: listings?.length || 0,
        filters: { type, category, location, minPrice, maxPrice, search, featured }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ listings: listings || [] });

  } catch (error: any) {
    console.error('Listings GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    const body = await request.json();
    const listingData = CreateListingSchema.parse(body);

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .insert({
        ...listingData,
        organization_id: orgId,
        created_by: user.id,
        status: 'active',
        view_count: 0,
        response_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Listing creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If featured, notify relevant users
    if (listingData.featured) {
      const { data: interestedUsers } = await supabase
        .from('user_preferences')
        .select('user_id')
        .contains('marketplace_categories', [listingData.category])
        .neq('user_id', user.id)
        .limit(100);

      if (interestedUsers && interestedUsers.length > 0) {
        const notifications = interestedUsers.map(u => ({
          user_id: u.user_id,
          organization_id: orgId,
          type: 'marketplace_featured',
          title: 'New Featured Listing',
          message: `New ${listingData.type}: ${listingData.title}`,
          data: { listing_id: listing.id, category: listingData.category },
          created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'marketplace.listings.create',
      resource_type: 'marketplace_listing',
      resource_id: listing.id,
      details: { 
        title: listing.title,
        type: listing.type,
        category: listing.category,
        featured: listing.featured
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ listing }, { status: 201 });

  } catch (error: any) {
    console.error('Listings POST error:', error);
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

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const listingData = UpdateListingSchema.parse(updateData);

    // Check if user can edit this listing
    const { data: existingListing } = await supabase
      .from('marketplace_listings')
      .select('created_by')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existingListing.created_by !== user.id && !['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .update({
        ...listingData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Listing update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'marketplace.listings.update',
      resource_type: 'marketplace_listing',
      resource_id: listing.id,
      details: { updated_fields: Object.keys(listingData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ listing });

  } catch (error: any) {
    console.error('Listings PUT error:', error);
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Check if user can delete this listing
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('title, created_by')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.created_by !== user.id && !['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Listing deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'marketplace.listings.delete',
      resource_type: 'marketplace_listing',
      resource_id: id,
      details: { title: listing.title },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Listings DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
