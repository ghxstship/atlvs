import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';


interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/v1/procurement/requests/[id] - Get single procurement request
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const { id } = params;
    
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

    // Fetch the request with all related data
    const { data: procurementRequest, error } = await supabase
      .from('procurement_requests')
      .select(`
        *,
        requester:users!procurement_requests_requester_id_fkey(id, name, email),
        project:projects(id, name),
        approver:users!procurement_requests_approved_by_fkey(id, name, email),
        items:procurement_request_items(*),
        approval_steps:procurement_approval_steps(
          *,
          approver:users(id, name, email)
        ),
        activity:procurement_request_activity(
          *,
          user:users(id, name, email)
        )
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }
      console.error('Error fetching request:', error);
      return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
    }

    return NextResponse.json({ data: procurementRequest });

  } catch (error) {
    console.error('Error in GET /api/v1/procurement/requests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/v1/procurement/requests/[id] - Update procurement request
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const { id } = params;
    
    // Get user and organization context
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user membership and get current request
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get current request to check permissions
    const { data: currentRequest, error: fetchError } = await supabase
      .from('procurement_requests')
      .select('requester_id, status, organization_id')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
    }

    // Check permissions - user can update their own requests or managers can update any
    const canUpdate = currentRequest.requester_id === user.id || 
                     ['owner', 'admin', 'manager'].includes(membership.role);

    if (!canUpdate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Define allowed update fields
    const allowedFields = [
      'title', 'description', 'business_justification', 'category', 'priority',
      'estimated_total', 'currency', 'requested_delivery_date', 'budget_code',
      'department', 'status', 'approval_notes', 'rejected_reason'
    ];

    // Filter to only allowed fields
    const updateData = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {} as unknown);

    // Add approval fields if user has manager permissions and status is changing
    if (['owner', 'admin', 'manager'].includes(membership.role)) {
      if (body.status === 'approved') {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      } else if (body.status === 'rejected') {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
        updateData.rejected_reason = body.rejected_reason || 'No reason provided';
      } else if (body.status === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      }
    }

    // Validate status transitions
    const validTransitions = {
      'draft': ['submitted', 'cancelled'],
      'submitted': ['under_review', 'approved', 'rejected', 'cancelled'],
      'under_review': ['approved', 'rejected', 'cancelled'],
      'approved': ['converted', 'cancelled'],
      'rejected': ['submitted'], // Allow resubmission
      'cancelled': [], // Terminal state
      'converted': [] // Terminal state
    };

    if (updateData.status && updateData.status !== currentRequest.status) {
      const allowedNextStates = validTransitions[currentRequest.status as keyof typeof validTransitions] || [];
      if (!allowedNextStates.includes(updateData.status)) {
        return NextResponse.json({
          error: `Invalid status transition from ${currentRequest.status} to ${updateData.status}`
        }, { status: 400 });
      }
    }

    // Update the request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('procurement_requests')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        requester:users!procurement_requests_requester_id_fkey(id, name, email),
        project:projects(id, name),
        approver:users!procurement_requests_approved_by_fkey(id, name, email),
        items:procurement_request_items(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating request:', updateError);
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }

    // Log activity for significant changes
    if (updateData.status && updateData.status !== currentRequest.status) {
      const actionMap = {
        'submitted': 'submitted',
        'under_review': 'under_review',
        'approved': 'approved',
        'rejected': 'rejected',
        'cancelled': 'cancelled',
        'converted': 'converted'
      };

      const action = actionMap[updateData.status as keyof typeof actionMap] || 'updated';
      
      await supabase
        .from('procurement_request_activity')
        .insert({
          request_id: id,
          user_id: user.id,
          action,
          description: `Status changed from ${currentRequest.status} to ${updateData.status}`,
          metadata: {
            old_status: currentRequest.status,
            new_status: updateData.status,
            ...(updateData.rejected_reason && { rejected_reason: updateData.rejected_reason }),
            ...(updateData.approval_notes && { approval_notes: updateData.approval_notes })
          }
        });
    }

    return NextResponse.json({
      data: updatedRequest,
      message: 'Request updated successfully'
    });

  } catch (error) {
    console.error('Error in PATCH /api/v1/procurement/requests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/v1/procurement/requests/[id] - Delete procurement request
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const { id } = params;
    
    // Get user and organization context
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Verify user membership and get current request
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get current request to check permissions
    const { data: currentRequest, error: fetchError } = await supabase
      .from('procurement_requests')
      .select('requester_id, status, title')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
    }

    // Check permissions - user can delete their own draft/cancelled requests or managers can delete any
    const canDelete = (currentRequest.requester_id === user.id && ['draft', 'cancelled'].includes(currentRequest.status)) ||
                     ['owner', 'admin', 'manager'].includes(membership.role);

    if (!canDelete) {
      return NextResponse.json({ 
        error: 'Cannot delete request. Only draft or cancelled requests can be deleted by requesters, or managers can delete any request.' 
      }, { status: 403 });
    }

    // Delete the request (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('procurement_requests')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting request:', deleteError);
      return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/v1/procurement/requests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
