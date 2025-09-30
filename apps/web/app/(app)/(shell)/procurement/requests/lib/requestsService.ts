import { createClient } from '@/lib/supabase/client';
import type { 
  ProcurementRequest, 
  CreateProcurementRequest, 
  UpdateProcurementRequest,
  RequestFilters,
  RequestSortOptions,
  RequestStatistics
} from '../types';

export class RequestsService {
  private supabase = createClient();

  // Get all requests with filtering and sorting
  async getRequests(
    organizationId: string,
    filters?: RequestFilters,
    sort?: RequestSortOptions,
    page = 1,
    limit = 50
  ): Promise<{ data: ProcurementRequest[]; count: number; error?: string }> {
    try {
      let query = this.supabase
        .from('procurement_requests')
        .select(`
          *,
          requester:users!procurement_requests_requester_id_fkey(id, name, email),
          project:projects(id, name),
          approver:users!procurement_requests_approved_by_fkey(id, name, email),
          items:procurement_request_items(*)
        `)
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters) {
        if (filters.status?.length) {
          query = query.in('status', filters.status);
        }
        if (filters.priority?.length) {
          query = query.in('priority', filters.priority);
        }
        if (filters.category?.length) {
          query = query.in('category', filters.category);
        }
        if (filters.requester_id) {
          query = query.eq('requester_id', filters.requester_id);
        }
        if (filters.project_id) {
          query = query.eq('project_id', filters.project_id);
        }
        if (filters.date_range) {
          query = query
            .gte('created_at', filters.date_range.start)
            .lte('created_at', filters.date_range.end);
        }
        if (filters.estimated_total_range) {
          query = query
            .gte('estimated_total', filters.estimated_total_range.min)
            .lte('estimated_total', filters.estimated_total_range.max);
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching requests:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error in getRequests:', error);
      return { data: [], count: 0, error: 'Failed to fetch requests' };
    }
  }

  // Get single request by ID
  async getRequest(id: string): Promise<{ data: ProcurementRequest | null; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_requests')
        .select(`
          *,
          requester:users!procurement_requests_requester_id_fkey(id, name, email),
          project:projects(id, name),
          approver:users!procurement_requests_approved_by_fkey(id, name, email),
          items:procurement_request_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching request:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error in getRequest:', error);
      return { data: null, error: 'Failed to fetch request' };
    }
  }

  // Create new request
  async createRequest(
    request: CreateProcurementRequest
  ): Promise<{ data: ProcurementRequest | null; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_requests')
        .insert(request)
        .select(`
          *,
          requester:users!procurement_requests_requester_id_fkey(id, name, email),
          project:projects(id, name),
          items:procurement_request_items(*)
        `)
        .single();

      if (error) {
        console.error('Error creating request:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error in createRequest:', error);
      return { data: null, error: 'Failed to create request' };
    }
  }

  // Update request
  async updateRequest(
    id: string,
    updates: Partial<UpdateProcurementRequest>
  ): Promise<{ data: ProcurementRequest | null; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_requests')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          requester:users!procurement_requests_requester_id_fkey(id, name, email),
          project:projects(id, name),
          approver:users!procurement_requests_approved_by_fkey(id, name, email),
          items:procurement_request_items(*)
        `)
        .single();

      if (error) {
        console.error('Error updating request:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error in updateRequest:', error);
      return { data: null, error: 'Failed to update request' };
    }
  }

  // Delete request
  async deleteRequest(id: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase
        .from('procurement_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting request:', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Error in deleteRequest:', error);
      return { error: 'Failed to delete request' };
    }
  }

  // Submit request for approval
  async submitRequest(id: string): Promise<{ data: ProcurementRequest | null; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_requests')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          requester:users!procurement_requests_requester_id_fkey(id, name, email),
          project:projects(id, name),
          items:procurement_request_items(*)
        `)
        .single();

      if (error) {
        console.error('Error submitting request:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error in submitRequest:', error);
      return { data: null, error: 'Failed to submit request' };
    }
  }

  // Approve request
  async approveRequest(
    id: string,
    approverId: string,
    notes?: string
  ): Promise<{ data: ProcurementRequest | null; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_requests')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          approval_notes: notes
        })
        .eq('id', id)
        .select(`
          *,
          requester:users!procurement_requests_requester_id_fkey(id, name, email),
          project:projects(id, name),
          approver:users!procurement_requests_approved_by_fkey(id, name, email),
          items:procurement_request_items(*)
        `)
        .single();

      if (error) {
        console.error('Error approving request:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error in approveRequest:', error);
      return { data: null, error: 'Failed to approve request' };
    }
  }

  // Reject request
  async rejectRequest(
    id: string,
    approverId: string,
    reason: string
  ): Promise<{ data: ProcurementRequest | null; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_requests')
        .update({
          status: 'rejected',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          rejected_reason: reason
        })
        .eq('id', id)
        .select(`
          *,
          requester:users!procurement_requests_requester_id_fkey(id, name, email),
          project:projects(id, name),
          approver:users!procurement_requests_approved_by_fkey(id, name, email),
          items:procurement_request_items(*)
        `)
        .single();

      if (error) {
        console.error('Error rejecting request:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error in rejectRequest:', error);
      return { data: null, error: 'Failed to reject request' };
    }
  }

  // Get request statistics
  async getRequestStatistics(organizationId: string): Promise<{ data: RequestStatistics | null; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_requests')
        .select('status, priority, category, estimated_total, created_at, approved_at')
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Error fetching request statistics:', error);
        return { data: null, error: error.message };
      }

      // Calculate statistics
      const stats: RequestStatistics = {
        total_requests: data.length,
        by_status: {
          draft: 0,
          submitted: 0,
          under_review: 0,
          approved: 0,
          rejected: 0,
          cancelled: 0,
          converted: 0
        },
        by_priority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0
        },
        by_category: {
          equipment: 0,
          supplies: 0,
          services: 0,
          materials: 0,
          software: 0,
          maintenance: 0,
          other: 0
        },
        total_estimated_value: 0,
        average_approval_time: 0,
        approval_rate: 0
      };

      let totalApprovalTime = 0;
      let approvedCount = 0;

      data.forEach(request => {
        // Count by status
        stats.by_status[request.status as keyof typeof stats.by_status]++;
        
        // Count by priority
        stats.by_priority[request.priority as keyof typeof stats.by_priority]++;
        
        // Count by category
        stats.by_category[request.category as keyof typeof stats.by_category]++;
        
        // Sum estimated total
        stats.total_estimated_value += request.estimated_total || 0;
        
        // Calculate approval time
        if (request.status === 'approved' && request.approved_at) {
          const createdAt = new Date(request.created_at);
          const approvedAt = new Date(request.approved_at);
          const approvalTime = (approvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // hours
          totalApprovalTime += approvalTime;
          approvedCount++;
        }
      });

      // Calculate averages and rates
      stats.average_approval_time = approvedCount > 0 ? totalApprovalTime / approvedCount : 0;
      stats.approval_rate = data.length > 0 ? (stats.by_status.approved / data.length) * 100 : 0;

      return { data: stats };
    } catch (error) {
      console.error('Error in getRequestStatistics:', error);
      return { data: null, error: 'Failed to fetch request statistics' };
    }
  }

  // Convert request to purchase order
  async convertToPurchaseOrder(
    requestId: string
  ): Promise<{ data: { orderId: string } | null; error?: string }> {
    try {
      // This would typically call a Supabase function or API endpoint
      // For now, we'll simulate the conversion
      const { data: request } = await this.getRequest(requestId);
      
      if (!request) {
        return { data: null, error: 'Request not found' };
      }

      if (request.status !== 'approved') {
        return { data: null, error: 'Only approved requests can be converted to purchase orders' };
      }

      // Update request status to converted
      await this.updateRequest(requestId, { status: 'converted' });

      // In a real implementation, this would create a purchase order
      // and return the order ID
      const orderId = `PO-${Date.now()}`;

      return { data: { orderId } };
    } catch (error) {
      console.error('Error in convertToPurchaseOrder:', error);
      return { data: null, error: 'Failed to convert request to purchase order' };
    }
  }
}
