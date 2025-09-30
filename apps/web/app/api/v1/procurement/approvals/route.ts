import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DecisionSchema = z.object({
  step_id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'delegate', 'skip', 'request_info']),
  notes: z.string().optional(),
  delegate_to: z.string().uuid().optional()
});

type ApprovalStepRecord = {
  id: string;
  approver_id: string;
  status: ApprovalStatus;
  step_order: number;
  request_id: string;
  notes: string | null;
  request: {
    organization_id: string;
    status: string;
  };
};

type ApprovalStatus = 'approved' | 'rejected' | 'skipped' | 'pending';

// GET /api/v1/procurement/approvals - List approval steps
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
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
    const approverId = searchParams.get('approver_id');
    const requestStatus = searchParams.get('request_status');
    const pendingOnly = searchParams.get('pending_only') === 'true';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Build query
    let query = supabase
      .from('procurement_approval_steps')
      .select(`
        *,
        approver:users(id, name, email),
        request:procurement_requests(
          id, title, status, estimated_total, currency, category, priority, organization_id,
          requester:users!procurement_requests_requester_id_fkey(id, name, email)
        )
      `, { count: 'exact' });

    // Filter by organization through request
    query = query.eq('request.organization_id', organizationId);

    // Apply filters
    if (pendingOnly || status === 'pending') {
      query = query.eq('status', 'pending');
      if (approverId) {
        query = query.eq('approver_id', approverId);
      } else {
        // If no specific approver, show user's pending approvals
        query = query.eq('approver_id', user.id);
      }
    } else {
      if (status) {
        const statuses = status.split(',');
        query = query.in('status', statuses);
      }
      if (approverId) {
        query = query.eq('approver_id', approverId);
      }
    }
    
    if (requestStatus) {
      const requestStatuses = requestStatus.split(',');
      query = query.in('request.status', requestStatuses);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'step_order', 'approved_at'];
    if (validSortFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: approvals, error, count } = await query;

    if (error) {
      console.error('Error fetching approvals:', error);
      return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
    }

    return NextResponse.json({
      data: approvals || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/v1/procurement/approvals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/procurement/approvals - Make approval decision
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
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
    
    const validationResult = DecisionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const { step_id, action, notes, delegate_to } = validationResult.data;

    // Get current approval step
    const { data: currentStep, error: fetchError } = await supabase
      .from('procurement_approval_steps')
      .select(`
        *,
        request:procurement_requests(organization_id, status)
      `)
      .eq('id', step_id)
      .single<ApprovalStepRecord>();

    if (fetchError) {
      return NextResponse.json({ error: 'Approval step not found' }, { status: 404 });
    }

    // Verify organization access
    if (currentStep.request.organization_id !== organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify user is the approver or has manager permissions
    const canApprove = currentStep.approver_id === user.id || 
                      ['owner', 'admin', 'manager'].includes(membership.role);

    if (!canApprove) {
      return NextResponse.json({ error: 'Not authorized to approve this step' }, { status: 403 });
    }

    if (currentStep.status !== 'pending') {
      return NextResponse.json({ error: 'Approval step is not pending' }, { status: 400 });
    }

    // Handle delegation
    if (action === 'delegate' && delegate_to) {
      // Verify delegate exists and has access to organization
      const { data: delegateUser } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('user_id', delegate_to)
        .eq('organization_id', organizationId)
        .single();

      if (!delegateUser) {
        return NextResponse.json({ error: 'Delegate user not found in organization' }, { status: 400 });
      }

      // Update approver to delegate
      const { error: delegateError } = await supabase
        .from('procurement_approval_steps')
        .update({
          approver_id: delegate_to,
          notes: notes || `Delegated by ${user.email}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', step_id);

      if (delegateError) {
        return NextResponse.json({ error: 'Failed to delegate approval' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Approval delegated successfully' });
    }

    // Update the approval step
    type ApprovalStatus = 'approved' | 'rejected' | 'skipped' | 'pending';
    const nextStatus: ApprovalStatus =
      action === 'approve'
        ? 'approved'
        : action === 'reject'
          ? 'rejected'
          : action === 'skip'
            ? 'skipped'
            : 'pending';

    const timestamp = new Date().toISOString();
    const updateData: {
      status: ApprovalStatus;
      notes: string | null | undefined;
      approved_at: string | null;
      updated_at: string;
    } = {
      status: nextStatus,
      notes,
      approved_at: nextStatus === 'approved' ? timestamp : null,
      updated_at: timestamp
    };

    const { data: updatedStep, error: updateError } = await supabase
      .from('procurement_approval_steps')
      .update(updateData)
      .eq('id', step_id)
      .select(`
        *,
        approver:users(id, name, email),
        request:procurement_requests(
          id, title, status, estimated_total, currency,
          requester:users!procurement_requests_requester_id_fkey(id, name, email)
        )
      `)
      .single<ApprovalStepRecord>();

    if (updateError) {
      console.error('Error updating approval step:', updateError);
      return NextResponse.json({ error: 'Failed to update approval step' }, { status: 500 });
    }

    // Log activity
    await supabase
      .from('procurement_request_activity')
      .insert({
        request_id: currentStep.request_id,
        user_id: user.id,
        action: action === 'approve' ? 'approved' : 
                action === 'reject' ? 'rejected' : action,
        description: `Approval step ${currentStep.step_order} ${action}d by ${user.email}`,
        metadata: {
          step_id: step_id,
          step_order: currentStep.step_order,
          action: action,
          notes: notes
        }
      });

    // Check if workflow is complete
    const { data: allSteps } = await supabase
      .from('procurement_approval_steps')
      .select('status, step_order')
      .eq('request_id', currentStep.request_id)
      .order('step_order');

    if (allSteps) {
      const allCompleted = allSteps.every(step => ['approved', 'rejected', 'skipped'].includes(step.status));
      const hasRejection = allSteps.some(step => step.status === 'rejected');

      if (allCompleted) {
        const newRequestStatus = hasRejection ? 'rejected' : 'approved';
        
        // Update request status
        await supabase
          .from('procurement_requests')
          .update({ 
            status: newRequestStatus,
            approved_at: newRequestStatus === 'approved' ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentStep.request_id);
      }
    }

    return NextResponse.json({
      data: updatedStep,
      message: `Approval ${action}d successfully`
    });

  } catch (error) {
    console.error('Error in POST /api/v1/procurement/approvals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
