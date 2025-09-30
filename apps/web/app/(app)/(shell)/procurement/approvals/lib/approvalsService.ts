import { createClient } from '@/lib/supabase/client';
import type { 
  ApprovalStep,
  ApprovalPolicy,
  ApprovalWorkflow,
  CreateApprovalPolicy,
  UpdateApprovalPolicy,
  ApprovalDecision,
  ApprovalFilters,
  ApprovalSortOptions,
  ApprovalStatistics,
  ApprovalDashboardData,
  BulkApprovalRequest
} from '../types';

export class ApprovalsService {
  private supabase = createClient();

  // Get pending approvals for current user
  async getPendingApprovals(
    organizationId: string,
    userId: string,
    filters?: ApprovalFilters,
    sort?: ApprovalSortOptions,
    page = 1,
    limit = 50
  ): Promise<{ data: ApprovalStep[]; count: number; error?: string }> {
    try {
      let query = this.supabase
        .from('procurement_approval_steps')
        .select(`
          *,
          approver:users(id, name, email),
          request:procurement_requests(
            id, title, status, estimated_total, currency, category, priority,
            requester:users!procurement_requests_requester_id_fkey(id, name, email)
          )
        `)
        .eq('approver_id', userId)
        .eq('status', 'pending');

      // Join with organization through request
      query = query.in('request.organization_id', [organizationId]);

      // Apply filters
      if (filters) {
        if (filters.request_status?.length) {
          query = query.in('request.status', filters.request_status);
        }
        if (filters.amount_range) {
          query = query
            .gte('request.estimated_total', filters.amount_range.min)
            .lte('request.estimated_total', filters.amount_range.max);
        }
        if (filters.date_range) {
          query = query
            .gte('created_at', filters.date_range.start)
            .lte('created_at', filters.date_range.end);
        }
      }

      // Apply sorting
      if (sort) {
        const sortField = sort.field === 'request_title' ? 'request.title' : sort.field;
        query = query.order(sortField, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching pending approvals:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error in getPendingApprovals:', error);
      return { data: [], count: 0, error: 'Failed to fetch pending approvals' };
    }
  }

  // Get all approval steps with filtering
  async getApprovalSteps(
    organizationId: string,
    filters?: ApprovalFilters,
    sort?: ApprovalSortOptions,
    page = 1,
    limit = 50
  ): Promise<{ data: ApprovalStep[]; count: number; error?: string }> {
    try {
      let query = this.supabase
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
      if (filters) {
        if (filters.status?.length) {
          query = query.in('status', filters.status);
        }
        if (filters.approver_id) {
          query = query.eq('approver_id', filters.approver_id);
        }
        if (filters.request_status?.length) {
          query = query.in('request.status', filters.request_status);
        }
        if (filters.amount_range) {
          query = query
            .gte('request.estimated_total', filters.amount_range.min)
            .lte('request.estimated_total', filters.amount_range.max);
        }
        if (filters.date_range) {
          query = query
            .gte('created_at', filters.date_range.start)
            .lte('created_at', filters.date_range.end);
        }
      }

      // Apply sorting
      if (sort) {
        const sortField = sort.field === 'request_title' ? 'request.title' : sort.field;
        query = query.order(sortField, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching approval steps:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error in getApprovalSteps:', error);
      return { data: [], count: 0, error: 'Failed to fetch approval steps' };
    }
  }

  // Make approval decision
  async makeDecision(
    stepId: string,
    decision: ApprovalDecision
  ): Promise<{ data: ApprovalStep | null; error?: string }> {
    try {
      // Get current step
      const { data: currentStep, error: fetchError } = await this.supabase
        .from('procurement_approval_steps')
        .select('*')
        .eq('id', stepId)
        .single();

      if (fetchError) {
        return { data: null, error: 'Approval step not found' };
      }

      if (currentStep.status !== 'pending') {
        return { data: null, error: 'Approval step is not pending' };
      }

      // Update the approval step
      const updateData: unknown = {
        status: decision.action === 'approve' ? 'approved' : 
                decision.action === 'reject' ? 'rejected' :
                decision.action === 'skip' ? 'skipped' : 'pending',
        notes: decision.notes,
        approved_at: new Date().toISOString()
      };

      const { data: updatedStep, error: updateError } = await this.supabase
        .from('procurement_approval_steps')
        .update(updateData)
        .eq('id', stepId)
        .select(`
          *,
          approver:users(id, name, email),
          request:procurement_requests(
            id, title, status, estimated_total, currency,
            requester:users!procurement_requests_requester_id_fkey(id, name, email)
          )
        `)
        .single();

      if (updateError) {
        console.error('Error updating approval step:', updateError);
        return { data: null, error: 'Failed to update approval step' };
      }

      // Check if this completes the approval workflow
      await this.checkWorkflowCompletion(currentStep.request_id);

      return { data: updatedStep };
    } catch (error) {
      console.error('Error in makeDecision:', error);
      return { data: null, error: 'Failed to make approval decision' };
    }
  }

  // Bulk approval decisions
  async makeBulkDecisions(
    bulkRequest: BulkApprovalRequest
  ): Promise<{ data: ApprovalStep[]; error?: string }> {
    try {
      const results: ApprovalStep[] = [];
      
      for (const stepId of bulkRequest.step_ids) {
        const { data, error } = await this.makeDecision(stepId, {
          step_id: stepId,
          action: bulkRequest.action,
          notes: bulkRequest.notes
        });
        
        if (error) {
          console.error(`Error processing step ${stepId}:`, error);
          continue;
        }
        
        if (data) {
          results.push(data);
        }
      }

      return { data: results };
    } catch (error) {
      console.error('Error in makeBulkDecisions:', error);
      return { data: [], error: 'Failed to process bulk decisions' };
    }
  }

  // Check if approval workflow is complete
  private async checkWorkflowCompletion(requestId: string): Promise<void> {
    try {
      // Get all approval steps for the request
      const { data: steps } = await this.supabase
        .from('procurement_approval_steps')
        .select('status, step_order')
        .eq('request_id', requestId)
        .order('step_order');

      if (!steps || steps.length === 0) return;

      // Check if all steps are completed
      const allCompleted = steps.every(step => ['approved', 'rejected', 'skipped'].includes(step.status));
      const hasRejection = steps.some(step => step.status === 'rejected');

      if (allCompleted) {
        const newStatus = hasRejection ? 'rejected' : 'approved';
        
        // Update request status
        await this.supabase
          .from('procurement_requests')
          .update({ 
            status: newStatus,
            approved_at: newStatus === 'approved' ? new Date().toISOString() : undefined
          })
          .eq('id', requestId);
      }
    } catch (error) {
      console.error('Error checking workflow completion:', error);
    }
  }

  // Get approval policies
  async getPolicies(
    organizationId: string,
    page = 1,
    limit = 50
  ): Promise<{ data: ApprovalPolicy[]; count: number; error?: string }> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await this.supabase
        .from('procurement_approval_policies')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching policies:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error in getPolicies:', error);
      return { data: [], count: 0, error: 'Failed to fetch policies' };
    }
  }

  // Create approval policy
  async createPolicy(
    policy: CreateApprovalPolicy
  ): Promise<{ data: ApprovalPolicy | null; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_approval_policies')
        .insert(policy)
        .select()
        .single();

      if (error) {
        console.error('Error creating policy:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error in createPolicy:', error);
      return { data: null, error: 'Failed to create policy' };
    }
  }

  // Update approval policy
  async updatePolicy(
    id: string,
    updates: Partial<UpdateApprovalPolicy>
  ): Promise<{ data: ApprovalPolicy | null; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_approval_policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating policy:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error in updatePolicy:', error);
      return { data: null, error: 'Failed to update policy' };
    }
  }

  // Delete approval policy
  async deletePolicy(id: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase
        .from('procurement_approval_policies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting policy:', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Error in deletePolicy:', error);
      return { error: 'Failed to delete policy' };
    }
  }

  // Get approval statistics
  async getStatistics(
    organizationId: string,
    dateRange?: { start: string; end: string }
  ): Promise<{ data: ApprovalStatistics | null; error?: string }> {
    try {
      let query = this.supabase
        .from('procurement_approval_steps')
        .select(`
          status,
          approved_at,
          created_at,
          approver:users(id, name, email),
          request:procurement_requests!inner(organization_id, estimated_total)
        `)
        .eq('request.organization_id', organizationId);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching statistics:', error);
        return { data: null, error: error.message };
      }

      // Calculate statistics
      const stats: ApprovalStatistics = {
        total_pending: 0,
        total_approved: 0,
        total_rejected: 0,
        average_approval_time: 0,
        approval_rate: 0,
        by_approver: {},
        by_amount_range: {
          '0-1000': 0,
          '1000-5000': 0,
          '5000-10000': 0,
          '10000+': 0
        }
      };

      let totalApprovalTime = 0;
      let approvedCount = 0;

      data?.forEach(step => {
        // Count by status
        if (step.status === 'pending') stats.total_pending++;
        else if (step.status === 'approved') stats.total_approved++;
        else if (step.status === 'rejected') stats.total_rejected++;

        // Calculate approval time
        if (step.status === 'approved' && step.approved_at) {
          const createdAt = new Date(step.created_at);
          const approvedAt = new Date(step.approved_at);
          const approvalTime = (approvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // hours
          totalApprovalTime += approvalTime;
          approvedCount++;
        }

        // Count by approver
        if (step.approver) {
          const approverId = step.approver.id;
          if (!stats.by_approver[approverId]) {
            stats.by_approver[approverId] = {
              name: step.approver.name,
              pending: 0,
              approved: 0,
              rejected: 0,
              avg_time: 0
            };
          }
          
          if (step.status === 'pending') stats.by_approver[approverId].pending++;
          else if (step.status === 'approved') stats.by_approver[approverId].approved++;
          else if (step.status === 'rejected') stats.by_approver[approverId].rejected++;
        }

        // Count by amount range
        const amount = step.request?.estimated_total || 0;
        if (amount < 1000) stats.by_amount_range['0-1000']++;
        else if (amount < 5000) stats.by_amount_range['1000-5000']++;
        else if (amount < 10000) stats.by_amount_range['5000-10000']++;
        else stats.by_amount_range['10000+']++;
      });

      // Calculate averages
      stats.average_approval_time = approvedCount > 0 ? totalApprovalTime / approvedCount : 0;
      const totalDecisions = stats.total_approved + stats.total_rejected;
      stats.approval_rate = totalDecisions > 0 ? (stats.total_approved / totalDecisions) * 100 : 0;

      return { data: stats };
    } catch (error) {
      console.error('Error in getStatistics:', error);
      return { data: null, error: 'Failed to fetch statistics' };
    }
  }

  // Get dashboard data
  async getDashboardData(
    organizationId: string,
    userId: string
  ): Promise<{ data: ApprovalDashboardData | null; error?: string }> {
    try {
      // Get pending approvals for user
      const { data: pendingApprovals } = await this.getPendingApprovals(
        organizationId,
        userId,
        undefined,
        { field: 'created_at', direction: 'asc' },
        1,
        10
      );

      // Get recent decisions by user
      const { data: recentDecisions } = await this.getApprovalSteps(
        organizationId,
        { 
          approver_id: userId,
          status: ['approved', 'rejected']
        },
        { field: 'approved_at', direction: 'desc' },
        1,
        10
      );

      // Get statistics
      const { data: statistics } = await this.getStatistics(organizationId);

      // Get overdue approvals (pending for more than 48 hours)
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: overdueApprovals } = await this.getApprovalSteps(
        organizationId,
        {
          status: ['pending'],
          date_range: { start: '2020-01-01', end: twoDaysAgo }
        },
        { field: 'created_at', direction: 'asc' },
        1,
        20
      );

      const dashboardData: ApprovalDashboardData = {
        pending_approvals: pendingApprovals || [],
        recent_decisions: recentDecisions || [],
        statistics: statistics || {
          total_pending: 0,
          total_approved: 0,
          total_rejected: 0,
          average_approval_time: 0,
          approval_rate: 0,
          by_approver: {},
          by_amount_range: {}
        },
        overdue_approvals: overdueApprovals || [],
        delegations: [] // TODO: Implement delegations
      };

      return { data: dashboardData };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      return { data: null, error: 'Failed to fetch dashboard data' };
    }
  }
}
