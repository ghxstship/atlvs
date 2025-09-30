// Jobs Service Layer
// Comprehensive service layer for Jobs module with full CRUD operations

import { createClient } from '@/lib/supabase/client';
import type {
  Job,
  JobAssignment,
  Opportunity,
  Bid,
  JobContract,
  JobCompliance,
  RFP,
  CreateJobRequest,
  UpdateJobRequest,
  JobsStats,
  AssignmentsStats,
  OpportunitiesStats,
  BidsStats,
  ContractsStats,
  ComplianceStats,
  RfpStats,
  JobsFilters,
  AssignmentsFilters,
  OpportunitiesFilters,
  BidsFilters,
  ContractsFilters,
  ComplianceFilters,
  RfpsFilters
} from '../types';

export class JobsService {
  private supabase = createClient();

  // ============================================================================
  // JOBS CRUD OPERATIONS
  // ============================================================================

  async getJobs(filters?: JobsFilters): Promise<Job[]> {
    let query = this.supabase
      .from('jobs')
      .select(`
        *,
        project:projects(id, title, name),
        created_by_user:users!jobs_created_by_fkey(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }
    if (filters?.due_before) {
      query = query.lte('due_at', filters.due_before);
    }
    if (filters?.due_after) {
      query = query.gte('due_at', filters.due_after);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(job => ({
      ...job,
      project_title: job.project?.title || job.project?.name,
      created_by_name: job.created_by_user?.name
    }));
  }

  async getJob(id: string): Promise<Job | null> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select(`
        *,
        project:projects(id, title, name),
        created_by_user:users!jobs_created_by_fkey(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      project_title: data.project?.title || data.project?.name,
      created_by_name: data.created_by_user?.name
    };
  }

  async createJob(job: CreateJobRequest): Promise<Job> {
    const { data, error } = await this.supabase
      .from('jobs')
      .insert([job])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateJob(id: string, updates: UpdateJobRequest): Promise<Job> {
    const { data, error } = await this.supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteJob(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // JOB ASSIGNMENTS CRUD OPERATIONS
  // ============================================================================

  async getAssignments(filters?: AssignmentsFilters): Promise<JobAssignment[]> {
    let query = this.supabase
      .from('job_assignments')
      .select(`
        *,
        job:jobs(id, title, status, project:projects(id, title, name)),
        assignee:users!job_assignments_assignee_user_id_fkey(id, name, email, avatar_url)
      `)
      .order('assigned_at', { ascending: false });

    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id);
    }
    if (filters?.assignee_user_id) {
      query = query.eq('assignee_user_id', filters.assignee_user_id);
    }
    if (filters?.assigned_after) {
      query = query.gte('assigned_at', filters.assigned_after);
    }
    if (filters?.assigned_before) {
      query = query.lte('assigned_at', filters.assigned_before);
    }
    if (filters?.search) {
      query = query.or(`job.title.ilike.%${filters.search}%,assignee.name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(assignment => ({
      ...assignment,
      job_title: assignment.job?.title,
      job_status: assignment.job?.status,
      project_title: assignment.job?.project?.title || assignment.job?.project?.name,
      assignee_name: assignment.assignee?.name,
      assignee_email: assignment.assignee?.email,
      assignee_avatar: assignment.assignee?.avatar_url
    }));
  }

  // ============================================================================
  // OPPORTUNITIES CRUD OPERATIONS
  // ============================================================================

  async getOpportunities(filters?: OpportunitiesFilters): Promise<Opportunity[]> {
    let query = this.supabase
      .from('opportunities')
      .select(`
        *,
        project:projects(id, title, name),
        bids(id, amount, status)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters?.stage) {
      query = query.eq('stage', filters.stage);
    }
    if (filters?.budget_min) {
      query = query.gte('budget', filters.budget_min);
    }
    if (filters?.budget_max) {
      query = query.lte('budget', filters.budget_max);
    }
    if (filters?.closes_after) {
      query = query.gte('closes_at', filters.closes_after);
    }
    if (filters?.closes_before) {
      query = query.lte('closes_at', filters.closes_before);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(opportunity => {
      const bids = opportunity.bids || [];
      const bidAmounts = bids.map(bid => bid.amount).filter(Boolean);
      
      return {
        ...opportunity,
        project_title: opportunity.project?.title || opportunity.project?.name,
        bids_count: bids.length,
        highest_bid: bidAmounts.length > 0 ? Math.max(...bidAmounts) : undefined,
        lowest_bid: bidAmounts.length > 0 ? Math.min(...bidAmounts) : undefined
      };
    });
  }

  // ============================================================================
  // BIDS CRUD OPERATIONS
  // ============================================================================

  async getBids(filters?: BidsFilters): Promise<Bid[]> {
    let query = this.supabase
      .from('bids')
      .select(`
        *,
        opportunity:opportunities(id, title, project:projects(id, title, name)),
        company:companies(id, name, logo_url)
      `)
      .order('submitted_at', { ascending: false });

    if (filters?.opportunity_id) {
      query = query.eq('opportunity_id', filters.opportunity_id);
    }
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.amount_min) {
      query = query.gte('amount', filters.amount_min);
    }
    if (filters?.amount_max) {
      query = query.lte('amount', filters.amount_max);
    }
    if (filters?.submitted_after) {
      query = query.gte('submitted_at', filters.submitted_after);
    }
    if (filters?.submitted_before) {
      query = query.lte('submitted_at', filters.submitted_before);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(bid => ({
      ...bid,
      opportunity_title: bid.opportunity?.title,
      project_title: bid.opportunity?.project?.title || bid.opportunity?.project?.name,
      project_id: bid.opportunity?.project?.id,
      company_name: bid.company?.name,
      company_logo: bid.company?.logo_url
    }));
  }

  // ============================================================================
  // CONTRACTS CRUD OPERATIONS
  // ============================================================================

  async getContracts(filters?: ContractsFilters): Promise<JobContract[]> {
    let query = this.supabase
      .from('job_contracts')
      .select(`
        *,
        job:jobs(id, title, project:projects(id, title, name)),
        company:companies(id, name, logo_url)
      `)
      .order('created_at', { ascending: false });

    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id);
    }
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.contract_type) {
      query = query.eq('contract_type', filters.contract_type);
    }
    if (filters?.value_min) {
      query = query.gte('value', filters.value_min);
    }
    if (filters?.value_max) {
      query = query.lte('value', filters.value_max);
    }
    if (filters?.start_after) {
      query = query.gte('start_date', filters.start_after);
    }
    if (filters?.start_before) {
      query = query.lte('start_date', filters.start_before);
    }
    if (filters?.end_after) {
      query = query.gte('end_date', filters.end_after);
    }
    if (filters?.end_before) {
      query = query.lte('end_date', filters.end_before);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(contract => ({
      ...contract,
      job_title: contract.job?.title,
      project_title: contract.job?.project?.title || contract.job?.project?.name,
      project_id: contract.job?.project?.id,
      company_name: contract.company?.name,
      company_logo: contract.company?.logo_url
    }));
  }

  // ============================================================================
  // COMPLIANCE CRUD OPERATIONS
  // ============================================================================

  async getCompliance(filters?: ComplianceFilters): Promise<JobCompliance[]> {
    let query = this.supabase
      .from('job_compliance')
      .select(`
        *,
        job:jobs(id, title, project:projects(id, title, name)),
        assigned_to_user:users!job_compliance_assigned_to_fkey(id, name, email),
        reviewer_user:users!job_compliance_reviewer_fkey(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id);
    }
    if (filters?.kind) {
      query = query.eq('kind', filters.kind);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.reviewer) {
      query = query.eq('reviewer', filters.reviewer);
    }
    if (filters?.due_after) {
      query = query.gte('due_at', filters.due_after);
    }
    if (filters?.due_before) {
      query = query.lte('due_at', filters.due_before);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(compliance => ({
      ...compliance,
      job_title: compliance.job?.title,
      project_title: compliance.job?.project?.title || compliance.job?.project?.name,
      assigned_to_name: compliance.assigned_to_user?.name,
      reviewer_name: compliance.reviewer_user?.name
    }));
  }

  // ============================================================================
  // RFPS CRUD OPERATIONS
  // ============================================================================

  async getRfps(filters?: RfpsFilters): Promise<RFP[]> {
    let query = this.supabase
      .from('rfps')
      .select(`
        *,
        project:projects(id, title, name)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters?.budget_min) {
      query = query.gte('budget', filters.budget_min);
    }
    if (filters?.budget_max) {
      query = query.lte('budget', filters.budget_max);
    }
    if (filters?.deadline_after) {
      query = query.gte('submission_deadline', filters.deadline_after);
    }
    if (filters?.deadline_before) {
      query = query.lte('submission_deadline', filters.deadline_before);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(rfp => ({
      ...rfp,
      project_title: rfp.project?.title || rfp.project?.name
    }));
  }

  // ============================================================================
  // STATISTICS AND ANALYTICS
  // ============================================================================

  async getJobsStats(): Promise<JobsStats> {
    const { data: jobs, error } = await this.supabase
      .from('jobs')
      .select('id, status, created_at, due_at');

    if (error) throw error;

    const now = new Date();
    const total = jobs?.length || 0;
    const open = jobs?.filter(job => job.status === 'open').length || 0;
    const in_progress = jobs?.filter(job => job.status === 'in_progress').length || 0;
    const blocked = jobs?.filter(job => job.status === 'blocked').length || 0;
    const completed = jobs?.filter(job => job.status === 'done').length || 0;
    const cancelled = jobs?.filter(job => job.status === 'cancelled').length || 0;
    const overdue = jobs?.filter(job => {
      if (!job.due_at || job.status === 'done') return false;
      return new Date(job.due_at) < now;
    }).length || 0;

    const completion_rate = total > 0 ? (completed / total) * 100 : 0;
    
    // Calculate average completion time (simplified)
    const completedJobs = jobs?.filter(job => job.status === 'done') || [];
    const average_completion_time = completedJobs.length > 0 
      ? completedJobs.reduce((acc, job) => {
          const created = new Date(job.created_at);
          const completed = new Date(); // Simplified - would need completion date
          return acc + (completed.getTime() - created.getTime());
        }, 0) / completedJobs.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      total,
      open,
      in_progress,
      blocked,
      completed,
      cancelled,
      overdue,
      completion_rate,
      average_completion_time
    };
  }

  async getAssignmentsStats(): Promise<AssignmentsStats> {
    const { data: assignments, error } = await this.supabase
      .from('job_assignments')
      .select(`
        id,
        assignee_user_id,
        job:jobs(status, due_at),
        assignee:users!job_assignments_assignee_user_id_fkey(id, name)
      `);

    if (error) throw error;

    const now = new Date();
    const total = assignments?.length || 0;
    const active = assignments?.filter(a => a.job?.status && !['done', 'cancelled'].includes(a.job.status)).length || 0;
    const completed = assignments?.filter(a => a.job?.status === 'done').length || 0;
    const overdue = assignments?.filter(a => {
      if (!a.job?.due_at || a.job?.status === 'done') return false;
      return new Date(a.job.due_at) < now;
    }).length || 0;

    // Group by assignee
    const assigneeMap = new Map();
    assignments?.forEach(assignment => {
      if (assignment.assignee) {
        const key = assignment.assignee.id;
        if (!assigneeMap.has(key)) {
          assigneeMap.set(key, {
            assignee_id: assignment.assignee.id,
            assignee_name: assignment.assignee.name,
            count: 0
          });
        }
        assigneeMap.get(key).count++;
      }
    });

    const by_assignee = Array.from(assigneeMap.values());

    return {
      total,
      active,
      completed,
      overdue,
      by_assignee
    };
  }

  async getOpportunitiesStats(): Promise<OpportunitiesStats> {
    const { data: opportunities, error } = await this.supabase
      .from('opportunities')
      .select('id, status, budget');

    if (error) throw error;

    const total = opportunities?.length || 0;
    const open = opportunities?.filter(o => o.status === 'open').length || 0;
    const closed = opportunities?.filter(o => o.status === 'closed').length || 0;
    const awarded = opportunities?.filter(o => o.status === 'awarded').length || 0;
    const cancelled = opportunities?.filter(o => o.status === 'cancelled').length || 0;

    const budgets = opportunities?.map(o => o.budget).filter(Boolean) || [];
    const total_value = budgets.reduce((sum, budget) => sum + budget, 0);
    const average_value = budgets.length > 0 ? total_value / budgets.length : 0;
    const win_rate = total > 0 ? (awarded / total) * 100 : 0;

    return {
      total,
      open,
      closed,
      awarded,
      cancelled,
      total_value,
      average_value,
      win_rate
    };
  }

  async getBidsStats(): Promise<BidsStats> {
    const { data: bids, error } = await this.supabase
      .from('bids')
      .select('id, status, amount');

    if (error) throw error;

    const total = bids?.length || 0;
    const submitted = bids?.filter(b => b.status === 'submitted').length || 0;
    const under_review = bids?.filter(b => b.status === 'under_review').length || 0;
    const accepted = bids?.filter(b => b.status === 'accepted').length || 0;
    const rejected = bids?.filter(b => b.status === 'rejected').length || 0;
    const withdrawn = bids?.filter(b => b.status === 'withdrawn').length || 0;

    const amounts = bids?.map(b => b.amount).filter(Boolean) || [];
    const total_value = amounts.reduce((sum, amount) => sum + amount, 0);
    const average_value = amounts.length > 0 ? total_value / amounts.length : 0;
    const win_rate = total > 0 ? (accepted / total) * 100 : 0;

    return {
      total,
      submitted,
      under_review,
      accepted,
      rejected,
      withdrawn,
      total_value,
      average_value,
      win_rate
    };
  }

  async getContractsStats(): Promise<ContractsStats> {
    const { data: contracts, error } = await this.supabase
      .from('job_contracts')
      .select('id, status, value, end_date');

    if (error) throw error;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const total = contracts?.length || 0;
    const draft = contracts?.filter(c => c.status === 'draft').length || 0;
    const active = contracts?.filter(c => c.status === 'active').length || 0;
    const completed = contracts?.filter(c => c.status === 'completed').length || 0;
    const terminated = contracts?.filter(c => c.status === 'terminated').length || 0;

    const values = contracts?.map(c => c.value).filter(Boolean) || [];
    const total_value = values.reduce((sum, value) => sum + value, 0);
    const average_value = values.length > 0 ? total_value / values.length : 0;

    const expiring_soon = contracts?.filter(c => {
      if (!c.end_date || c.status !== 'active') return false;
      const endDate = new Date(c.end_date);
      return endDate <= thirtyDaysFromNow && endDate > now;
    }).length || 0;

    return {
      total,
      draft,
      active,
      completed,
      terminated,
      total_value,
      average_value,
      expiring_soon
    };
  }

  async getComplianceStats(): Promise<ComplianceStats> {
    const { data: compliance, error } = await this.supabase
      .from('job_compliance')
      .select('id, status, kind, due_at');

    if (error) throw error;

    const now = new Date();
    const total = compliance?.length || 0;
    const pending = compliance?.filter(c => c.status === 'pending').length || 0;
    const submitted = compliance?.filter(c => c.status === 'submitted').length || 0;
    const approved = compliance?.filter(c => c.status === 'approved').length || 0;
    const rejected = compliance?.filter(c => c.status === 'rejected').length || 0;
    const overdue = compliance?.filter(c => {
      if (!c.due_at || c.status === 'approved') return false;
      return new Date(c.due_at) < now;
    }).length || 0;

    // Group by kind
    const kindMap = new Map();
    compliance?.forEach(item => {
      const kind = item.kind;
      if (!kindMap.has(kind)) {
        kindMap.set(kind, { kind, count: 0 });
      }
      kindMap.get(kind).count++;
    });

    const by_kind = Array.from(kindMap.values());

    return {
      total,
      pending,
      submitted,
      approved,
      rejected,
      overdue,
      by_kind
    };
  }

  async getRfpStats(): Promise<RfpStats> {
    const { data: rfps, error } = await this.supabase
      .from('rfps')
      .select('id, status');

    if (error) throw error;

    const total = rfps?.length || 0;
    const draft = rfps?.filter(r => r.status === 'draft').length || 0;
    const published = rfps?.filter(r => r.status === 'published').length || 0;
    const closed = rfps?.filter(r => r.status === 'closed').length || 0;
    const awarded = rfps?.filter(r => r.status === 'awarded').length || 0;
    const cancelled = rfps?.filter(r => r.status === 'cancelled').length || 0;

    // Note: Would need to implement RFP submissions tracking for these metrics
    const total_submissions = 0;
    const average_submissions = 0;

    return {
      total,
      draft,
      published,
      closed,
      awarded,
      cancelled,
      total_submissions,
      average_submissions
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async exportJobs(format: 'csv' | 'json' = 'csv'): Promise<string> {
    const jobs = await this.getJobs();
    
    if (format === 'json') {
      return JSON.stringify(jobs, null, 2);
    }
    
    // CSV export
    const headers = ['ID', 'Title', 'Status', 'Project', 'Due Date', 'Created By', 'Created Date'];
    const rows = jobs.map(job => [
      job.id,
      job.title,
      job.status,
      job.project_title || '',
      job.due_at || '',
      job.created_by_name || '',
      job.created_at
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  async searchJobs(query: string): Promise<Job[]> {
    return this.getJobs({ search: query });
  }

  async getJobsByProject(projectId: string): Promise<Job[]> {
    return this.getJobs({ project_id: projectId });
  }

  async getOverdueJobs(): Promise<Job[]> {
    const now = new Date().toISOString();
    return this.getJobs({ due_before: now });
  }
}
