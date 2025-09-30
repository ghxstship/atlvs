// Jobs Queries Service
// Database read operations for Jobs module

import { createClient } from '@/lib/supabase/client';
import type {
  Job,
  JobAssignment,
  Opportunity,
  Bid,
  JobContract,
  JobCompliance,
  RFP,
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

export class JobsQueries {
  private supabase = createClient();

  // ============================================================================
  // JOBS READ OPERATIONS
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

  // ============================================================================
  // JOB ASSIGNMENTS READ OPERATIONS
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
  // OPPORTUNITIES READ OPERATIONS
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

    return (data || []).map(opportunity => ({
      ...opportunity,
      project_title: opportunity.project?.title || opportunity.project?.name,
      bids_count: opportunity.bids?.length || 0,
      highest_bid: opportunity.bids?.length ?
        Math.max(...opportunity.bids.map((bid: unknown) => bid.amount)) : 0,
      lowest_bid: opportunity.bids?.length ?
        Math.min(...opportunity.bids.map((bid: unknown) => bid.amount)) : 0
    }));
  }

  // ============================================================================
  // STATISTICS READ OPERATIONS
  // ============================================================================

  async getJobsStats(): Promise<JobsStats> {
    const { data: jobs, error } = await this.supabase
      .from('jobs')
      .select('status, due_at');

    if (error) throw error;

    const total = jobs?.length || 0;
    const open = jobs?.filter(job => job.status === 'open').length || 0;
    const in_progress = jobs?.filter(job => job.status === 'in_progress').length || 0;
    const blocked = jobs?.filter(job => job.status === 'blocked').length || 0;
    const completed = jobs?.filter(job => job.status === 'done').length || 0;
    const cancelled = jobs?.filter(job => job.status === 'cancelled').length || 0;
    const overdue = jobs?.filter(job =>
      job.due_at && new Date(job.due_at) < new Date() && job.status !== 'done'
    ).length || 0;

    return {
      total,
      open,
      in_progress,
      blocked,
      completed,
      cancelled,
      overdue,
      completion_rate: total > 0 ? (completed / total) * 100 : 0,
      average_completion_time: 0, // TODO: Calculate from job history
    };
  }
}
