import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

import { CreateProcurementRequestSchema } from '@/app/(app)/(shell)/procurement/requests/types';

// GET /api/v1/procurement/requests - List procurement requests
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    // Get user and organization context
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user membership in organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;
    
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const requesterId = searchParams.get('requester_id');
    const projectId = searchParams.get('project_id');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Build query
    let query = supabase
      .from('procurement_requests')
      .select(`
        *,
        requester:users!procurement_requests_requester_id_fkey(id, name, email),
        project:projects(id, name),
        approver:users!procurement_requests_approved_by_fkey(id, name, email),
        items:procurement_request_items(*)
      `, { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }
    
    if (priority) {
      const priorities = priority.split(',');
      query = query.in('priority', priorities);
    }
    
    if (category) {
      const categories = category.split(',');
      query = query.in('category', categories);
    }
    
    if (requesterId) {
      query = query.eq('requester_id', requesterId);
    }
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,business_justification.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'title', 'status', 'priority', 'estimated_total', 'requested_delivery_date'];
    if (validSortFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error, count } = await query;

    if (error) {
      console.error('Error fetching requests:', error);
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }

    return NextResponse.json({
      data: requests || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/v1/procurement/requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/procurement/requests - Create procurement request
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get user and organization context
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user membership in organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Validate the request data
    const validationResult = CreateProcurementRequestSchema.safeParse({
      ...body,
      organization_id: organizationId,
      requester_id: user.id
    });

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const requestData = validationResult.data;
    const { items, ...requestFields } = requestData;

    // Create the procurement request
    const { data: newRequest, error: requestError } = await supabase
      .from('procurement_requests')
      .insert(requestFields)
      .select(`
        *,
        requester:users!procurement_requests_requester_id_fkey(id, name, email),
        project:projects(id, name)
      `)
      .single();

    if (requestError) {
      console.error('Error creating request:', requestError);
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }

    // Create request items if provided
    if (items && items.length > 0) {
      const itemsData = items.map(item => ({
        ...item,
        request_id: newRequest.id
      }));

      const { error: itemsError } = await supabase
        .from('procurement_request_items')
        .insert(itemsData);

      if (itemsError) {
        console.error('Error creating request items:', itemsError);
        // Note: Request was created but items failed - could implement rollback here
      }
    }

    // Fetch the complete request with items
    const { data: completeRequest } = await supabase
      .from('procurement_requests')
      .select(`
        *,
        requester:users!procurement_requests_requester_id_fkey(id, name, email),
        project:projects(id, name),
        items:procurement_request_items(*)
      `)
      .eq('id', newRequest.id)
      .single();

    // Log activity
    await supabase
      .from('procurement_request_activity')
      .insert({
        request_id: newRequest.id,
        user_id: user.id,
        action: 'created',
        description: `Request "${newRequest.title}" created`,
        metadata: { status: newRequest.status }
      });

    return NextResponse.json({
      data: completeRequest,
      message: 'Request created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/v1/procurement/requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
