import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

// Validation schema for company ratings
const CompanyRatingSchema = z.object({
  companyId: z.string().uuid(),
  category: z.enum(['overall', 'quality', 'timeliness', 'communication', 'value', 'safety', 'other']),
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional(),
  reviewerName: z.string().optional(),
  reviewerTitle: z.string().optional(),
  projectId: z.string().uuid().optional(),
  isRecommended: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  wouldHireAgain: z.boolean().default(false)
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
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rating = searchParams.get('rating');
    const companyId = searchParams.get('companyId');
    const isPublic = searchParams.get('isPublic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('company_ratings')
      .select(`
        *,
        companies!inner(name),
        projects(name)
      `)
      .eq('organization_id', orgId);

    // Apply filters
    if (category) query = query.eq('category', category);
    if (rating) query = query.eq('rating', parseInt(rating));
    if (companyId) query = query.eq('company_id', companyId);
    if (isPublic) query = query.eq('is_public', isPublic === 'true');

    // Apply pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: ratings, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }

    // Format response with company and project names
    const formattedRatings = ratings.map(rating => ({
      ...rating,
      companyName: rating.companies?.name,
      projectName: rating.projects?.name,
      companies: undefined, // Remove the joined data
      projects: undefined
    }));

    return NextResponse.json({
      ratings: formattedRatings,
      pagination: {
        page,
        limit,
        total: ratings.length
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check permissions - require settings:manage for rating creation
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role, permissions')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !membership.permissions?.includes('settings:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CompanyRatingSchema.parse(body);

    // Verify company belongs to organization
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', validatedData.companyId)
      .eq('organization_id', orgId)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Verify project belongs to organization (if provided)
    if (validatedData.projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', validatedData.projectId)
        .eq('organization_id', orgId)
        .single();

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
    }

    // Create rating
    const { data: rating, error } = await supabase
      .from('company_ratings')
      .insert({
        ...validatedData,
        organization_id: orgId,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'create',
      resource_type: 'company_rating',
      resource_id: rating.id,
      details: { 
        category: rating.category, 
        rating: rating.rating,
        company_id: rating.company_id 
      }
    });

    return NextResponse.json({
      rating: {
        ...rating,
        createdAt: rating.created_at,
        updatedAt: rating.updated_at
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }

    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Rating ID required' }, { status: 400 });
    }

    const validatedData = CompanyRatingSchema.partial().parse(updateData);

    // Check permissions
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role, permissions')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !membership.permissions?.includes('settings:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update rating
    const { data: rating, error } = await supabase
      .from('company_ratings')
      .update(validatedData)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
    }

    if (!rating) {
      return NextResponse.json({ error: 'Rating not found' }, { status: 404 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'update',
      resource_type: 'company_rating',
      resource_id: rating.id,
      details: { changes: validatedData }
    });

    return NextResponse.json({
      rating: {
        ...rating,
        createdAt: rating.created_at,
        updatedAt: rating.updated_at
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }

    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    
    // Get user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization ID from headers
    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get rating ID from query params
    const { searchParams } = new URL(request.url);
    const ratingId = searchParams.get('id');
    
    if (!ratingId) {
      return NextResponse.json({ error: 'Rating ID required' }, { status: 400 });
    }

    // Check permissions
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role, permissions')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !membership.permissions?.includes('settings:manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get rating details for audit log
    const { data: rating } = await supabase
      .from('company_ratings')
      .select('id, category, rating, company_id')
      .eq('id', ratingId)
      .eq('organization_id', orgId)
      .single();

    if (!rating) {
      return NextResponse.json({ error: 'Rating not found' }, { status: 404 });
    }

    // Delete rating
    const { error } = await supabase
      .from('company_ratings')
      .delete()
      .eq('id', ratingId)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete rating' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'delete',
      resource_type: 'company_rating',
      resource_id: ratingId,
      details: { 
        category: rating.category, 
        rating: rating.rating,
        company_id: rating.company_id 
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
