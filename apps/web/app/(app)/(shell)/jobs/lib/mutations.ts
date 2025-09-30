// Jobs Mutations Service
// Database write operations for Jobs module

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
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  CreateBidRequest,
  UpdateBidRequest,
  CreateContractRequest,
  UpdateContractRequest,
  CreateComplianceRequest,
  UpdateComplianceRequest,
  CreateRfpRequest,
  UpdateRfpRequest
} from '../types';

export class JobsMutations {
  private supabase = createClient();

  // ============================================================================
  // JOBS MUTATIONS
  // ============================================================================

  async createJob(job: CreateJobRequest): Promise<Job> {
    const { data, error } = await this.supabase
      .from('jobs')
      .insert([job])
      .select(`
        *,
        project:projects(id, title, name),
        created_by_user:users!jobs_created_by_fkey(id, name, email)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      project_title: data.project?.title || data.project?.name,
      created_by_name: data.created_by_user?.name
    };
  }

  async updateJob(id: string, updates: UpdateJobRequest): Promise<Job> {
    const { data, error } = await this.supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        project:projects(id, title, name),
        created_by_user:users!jobs_created_by_fkey(id, name, email)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      project_title: data.project?.title || data.project?.name,
      created_by_name: data.created_by_user?.name
    };
  }

  async deleteJob(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // JOB ASSIGNMENTS MUTATIONS
  // ============================================================================

  async createAssignment(assignment: { job_id: string; assignee_user_id: string; note?: string }): Promise<JobAssignment> {
    const { data, error } = await this.supabase
      .from('job_assignments')
      .insert([assignment])
      .select(`
        *,
        job:jobs(id, title, status, project:projects(id, title, name)),
        assignee:users!job_assignments_assignee_user_id_fkey(id, name, email, avatar_url)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      job_title: data.job?.title,
      job_status: data.job?.status,
      project_title: data.job?.project?.title || data.job?.project?.name,
      assignee_name: data.assignee?.name,
      assignee_email: data.assignee?.email,
      assignee_avatar: data.assignee?.avatar_url
    };
  }

  async updateAssignment(id: string, updates: { job_id?: string; assignee_user_id?: string; note?: string }): Promise<JobAssignment> {
    const { data, error } = await this.supabase
      .from('job_assignments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        job:jobs(id, title, status, project:projects(id, title, name)),
        assignee:users!job_assignments_assignee_user_id_fkey(id, name, email, avatar_url)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      job_title: data.job?.title,
      job_status: data.job?.status,
      project_title: data.job?.project?.title || data.job?.project?.name,
      assignee_name: data.assignee?.name,
      assignee_email: data.assignee?.email,
      assignee_avatar: data.assignee?.avatar_url
    };
  }

  async deleteAssignment(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_assignments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // OPPORTUNITIES MUTATIONS
  // ============================================================================

  async createOpportunity(opportunity: CreateOpportunityRequest): Promise<Opportunity> {
    const { data, error } = await this.supabase
      .from('opportunities')
      .insert([opportunity])
      .select(`
        *,
        project:projects(id, title, name),
        bids(id, amount, status)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      project_title: data.project?.title || data.project?.name,
      bids_count: data.bids?.length || 0,
      highest_bid: data.bids?.length ?
        Math.max(...data.bids.map((bid: unknown) => bid.amount)) : 0,
      lowest_bid: data.bids?.length ?
        Math.min(...data.bids.map((bid: unknown) => bid.amount)) : 0
    };
  }

  async updateOpportunity(id: string, updates: UpdateOpportunityRequest): Promise<Opportunity> {
    const { data, error } = await this.supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        project:projects(id, title, name),
        bids(id, amount, status)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      project_title: data.project?.title || data.project?.name,
      bids_count: data.bids?.length || 0,
      highest_bid: data.bids?.length ?
        Math.max(...data.bids.map((bid: unknown) => bid.amount)) : 0,
      lowest_bid: data.bids?.length ?
        Math.min(...data.bids.map((bid: unknown) => bid.amount)) : 0
    };
  }

  async deleteOpportunity(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('opportunities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // BIDS MUTATIONS
  // ============================================================================

  async createBid(bid: CreateBidRequest): Promise<Bid> {
    const { data, error } = await this.supabase
      .from('job_bids')
      .insert([bid])
      .select(`
        *,
        job:jobs(id, title),
        bidder:users!job_bids_bidder_id_fkey(id, name, email, avatar_url)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      opportunity_title: data.job?.title,
      company_name: data.bidder?.name,
      company_logo: data.bidder?.avatar_url,
      bidder_name: data.bidder?.name,
      bidder_email: data.bidder?.email
    };
  }

  async updateBid(id: string, updates: UpdateBidRequest): Promise<Bid> {
    const { data, error } = await this.supabase
      .from('job_bids')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        job:jobs(id, title),
        bidder:users!job_bids_bidder_id_fkey(id, name, email, avatar_url)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      opportunity_title: data.job?.title,
      company_name: data.bidder?.name,
      company_logo: data.bidder?.avatar_url,
      bidder_name: data.bidder?.name,
      bidder_email: data.bidder?.email
    };
  }

  async deleteBid(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_bids')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // CONTRACTS MUTATIONS
  // ============================================================================

  async createContract(contract: CreateContractRequest): Promise<JobContract> {
    const { data, error } = await this.supabase
      .from('job_contracts')
      .insert([contract])
      .select(`
        *,
        job:jobs(id, title),
        contractor:users!job_contracts_contractor_id_fkey(id, name, email, avatar_url)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      job_title: data.job?.title,
      company_name: data.contractor?.name,
      company_logo: data.contractor?.avatar_url,
      contractor_name: data.contractor?.name,
      contractor_email: data.contractor?.email
    };
  }

  async updateContract(id: string, updates: UpdateContractRequest): Promise<JobContract> {
    const { data, error } = await this.supabase
      .from('job_contracts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        job:jobs(id, title),
        contractor:users!job_contracts_contractor_id_fkey(id, name, email, avatar_url)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      job_title: data.job?.title,
      company_name: data.contractor?.name,
      company_logo: data.contractor?.avatar_url,
      contractor_name: data.contractor?.name,
      contractor_email: data.contractor?.email
    };
  }

  async deleteContract(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_contracts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // COMPLIANCE MUTATIONS
  // ============================================================================

  async createCompliance(compliance: CreateComplianceRequest): Promise<JobCompliance> {
    const { data, error } = await this.supabase
      .from('job_compliance')
      .insert([compliance])
      .select(`
        *,
        job:jobs(id, title),
        assigned_to:users!job_compliance_assigned_to_fkey(id, name),
        reviewer:users!job_compliance_reviewer_fkey(id, name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      job_title: data.job?.title,
      assigned_to_name: data.assigned_to?.name,
      reviewer_name: data.reviewer?.name
    };
  }

  async updateCompliance(id: string, updates: UpdateComplianceRequest): Promise<JobCompliance> {
    const { data, error } = await this.supabase
      .from('job_compliance')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        job:jobs(id, title),
        assigned_to:users!job_compliance_assigned_to_fkey(id, name),
        reviewer:users!job_compliance_reviewer_fkey(id, name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      job_title: data.job?.title,
      assigned_to_name: data.assigned_to?.name,
      reviewer_name: data.reviewer?.name
    };
  }

  async deleteCompliance(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_compliance')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // RFPS MUTATIONS
  // ============================================================================

  async createRfp(rfp: CreateRfpRequest): Promise<RFP> {
    const { data, error } = await this.supabase
      .from('rfps')
      .insert([rfp])
      .select(`
        *,
        project:projects(id, title, name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      project_title: data.project?.title || data.project?.name,
      submissions_count: 0,
      average_bid: 0
    };
  }

  async updateRfp(id: string, updates: UpdateRfpRequest): Promise<RFP> {
    const { data, error } = await this.supabase
      .from('rfps')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        project:projects(id, title, name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      project_title: data.project?.title || data.project?.name,
      submissions_count: 0,
      average_bid: 0
    };
  }

  async deleteRfp(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('rfps')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
