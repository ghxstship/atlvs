// Jobs Export Service
// Data export functionality for Jobs module

import { createClient } from '@/lib/supabase/client';
import type { Job, JobAssignment, Opportunity, Bid, JobContract, JobCompliance, RFP } from '../types';

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeRelated?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

export interface ExportResult {
  data: string | Buffer;
  filename: string;
  contentType: string;
  size: number;
}

export class JobsExportService {
  private supabase = createClient();

  // ============================================================================
  // EXPORT METHODS
  // ============================================================================

  async exportJobs(options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const { data: jobs } = await this.supabase
      .from('jobs')
      .select(`
        *,
        project:projects(title, name),
        created_by_user:users!jobs_created_by_fkey(name, email),
        assignments:job_assignments(
          assignee:users(name, email),
          status,
          assigned_at
        )
      `)
      .order('created_at', { ascending: false });

    if (!jobs) {
      throw new Error('No jobs data found');
    }

    const enrichedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status,
      priority: job.priority,
      type: job.type,
      category: job.category,
      project_name: job.project?.title || job.project?.name,
      created_by_name: job.created_by_user?.name,
      created_by_email: job.created_by_user?.email,
      created_at: job.created_at,
      updated_at: job.updated_at,
      due_at: job.due_at,
      assigned_to: job.assigned_to,
      total_budget: job.total_budget,
      currency: job.currency,
      assignments_count: job.assignments?.length || 0,
      active_assignments: job.assignments?.filter((a: unknown) => a.status === 'in-progress').length || 0
    }));

    return this.formatExportData(enrichedJobs, 'jobs', options.format);
  }

  async exportAssignments(options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const { data: assignments } = await this.supabase
      .from('job_assignments')
      .select(`
        *,
        job:jobs(title, status, project:projects(title, name)),
        assignee:users!job_assignments_assignee_user_id_fkey(name, email, avatar_url)
      `)
      .order('assigned_at', { ascending: false });

    if (!assignments) {
      throw new Error('No assignments data found');
    }

    const enrichedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      job_title: assignment.job?.title,
      job_status: assignment.job?.status,
      project_name: assignment.job?.project?.title || assignment.job?.project?.name,
      assignee_name: assignment.assignee?.name,
      assignee_email: assignment.assignee?.email,
      status: assignment.status,
      role: assignment.role,
      assigned_at: assignment.assigned_at,
      started_at: assignment.started_at,
      completed_at: assignment.completed_at,
      notes: assignment.notes
    }));

    return this.formatExportData(enrichedAssignments, 'assignments', options.format);
  }

  async exportOpportunities(options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const { data: opportunities } = await this.supabase
      .from('opportunities')
      .select(`
        *,
        project:projects(title, name),
        bids(id, amount, status, bidder:users(name, email))
      `)
      .order('created_at', { ascending: false });

    if (!opportunities) {
      throw new Error('No opportunities data found');
    }

    const enrichedOpportunities = opportunities.map(opportunity => ({
      id: opportunity.id,
      title: opportunity.title,
      description: opportunity.description,
      status: opportunity.status,
      budget: opportunity.budget,
      currency: opportunity.currency,
      stage: opportunity.stage,
      probability: opportunity.probability,
      project_name: opportunity.project?.title || opportunity.project?.name,
      opens_at: opportunity.opens_at,
      closes_at: opportunity.closes_at,
      bids_count: opportunity.bids?.length || 0,
      highest_bid: opportunity.bids?.length ?
        Math.max(...opportunity.bids.map((bid: unknown) => bid.amount)) : 0,
      lowest_bid: opportunity.bids?.length ?
        Math.min(...opportunity.bids.map((bid: unknown) => bid.amount)) : 0,
      created_at: opportunity.created_at
    }));

    return this.formatExportData(enrichedOpportunities, 'opportunities', options.format);
  }

  async exportBids(options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const { data: bids } = await this.supabase
      .from('job_bids')
      .select(`
        *,
        job:jobs(title),
        bidder:users!job_bids_bidder_id_fkey(name, email, avatar_url)
      `)
      .order('submitted_at', { ascending: false });

    if (!bids) {
      throw new Error('No bids data found');
    }

    const enrichedBids = bids.map(bid => ({
      id: bid.id,
      job_title: bid.job?.title,
      bidder_name: bid.bidder?.name,
      bidder_email: bid.bidder?.email,
      amount: bid.amount,
      currency: bid.currency,
      status: bid.status,
      proposed_timeline: bid.proposed_timeline,
      cover_letter: bid.cover_letter,
      submitted_at: bid.submitted_at,
      reviewed_at: bid.reviewed_at
    }));

    return this.formatExportData(enrichedBids, 'bids', options.format);
  }

  async exportContracts(options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const { data: contracts } = await this.supabase
      .from('job_contracts')
      .select(`
        *,
        job:jobs(title),
        contractor:users!job_contracts_contractor_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (!contracts) {
      throw new Error('No contracts data found');
    }

    const enrichedContracts = contracts.map(contract => ({
      id: contract.id,
      job_title: contract.job?.title,
      contractor_name: contract.contractor?.name,
      contractor_email: contract.contractor?.email,
      title: contract.title,
      contract_type: contract.contract_type,
      status: contract.status,
      total_value: contract.total_value,
      currency: contract.currency,
      start_date: contract.start_date,
      end_date: contract.end_date,
      payment_terms: contract.payment_terms,
      created_at: contract.created_at
    }));

    return this.formatExportData(enrichedContracts, 'contracts', options.format);
  }

  async exportCompliance(options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const { data: compliance } = await this.supabase
      .from('job_compliance')
      .select(`
        *,
        job:jobs(title),
        assigned_to:users!job_compliance_assigned_to_fkey(name),
        reviewer:users!job_compliance_reviewer_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (!compliance) {
      throw new Error('No compliance data found');
    }

    const enrichedCompliance = compliance.map(item => ({
      id: item.id,
      job_title: item.job?.title,
      kind: item.kind,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      assigned_to_name: item.assigned_to?.name,
      reviewer_name: item.reviewer?.name,
      due_at: item.due_at,
      completed_at: item.completed_at,
      evidence_url: item.evidence_url,
      notes: item.notes,
      created_at: item.created_at
    }));

    return this.formatExportData(enrichedCompliance, 'compliance', options.format);
  }

  async exportRfps(options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const { data: rfps } = await this.supabase
      .from('rfps')
      .select(`
        *,
        project:projects(title, name)
      `)
      .order('created_at', { ascending: false });

    if (!rfps) {
      throw new Error('No RFPs data found');
    }

    const enrichedRfps = rfps.map(rfp => ({
      id: rfp.id,
      title: rfp.title,
      description: rfp.description,
      status: rfp.status,
      budget: rfp.budget,
      currency: rfp.currency,
      project_name: rfp.project?.title || rfp.project?.name,
      submission_deadline: rfp.submission_deadline,
      evaluation_criteria: rfp.evaluation_criteria,
      contact_email: rfp.contact_email,
      published_at: rfp.published_at,
      created_at: rfp.created_at
    }));

    return this.formatExportData(enrichedRfps, 'rfps', options.format);
  }

  // ============================================================================
  // FORMAT HELPERS
  // ============================================================================

  private formatExportData(data: unknown[], entityType: string, format: 'csv' | 'json' | 'xlsx'): ExportResult {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');

    switch (format) {
      case 'csv':
        return this.toCSV(data, entityType, timestamp);
      case 'json':
        return this.toJSON(data, entityType, timestamp);
      case 'xlsx':
        return this.toXLSX(data, entityType, timestamp);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private toCSV(data: unknown[], entityType: string, timestamp: string): ExportResult {
    if (data.length === 0) {
      const csv = 'No data available\n';
      return {
        data: csv,
        filename: `${entityType}_export_${timestamp}.csv`,
        contentType: 'text/csv',
        size: csv.length
      };
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ];

    const csv = csvRows.join('\n') + '\n';
    return {
      data: csv,
      filename: `${entityType}_export_${timestamp}.csv`,
      contentType: 'text/csv',
      size: csv.length
    };
  }

  private toJSON(data: unknown[], entityType: string, timestamp: string): ExportResult {
    const json = JSON.stringify({
      export_info: {
        entity_type: entityType,
        total_records: data.length,
        exported_at: new Date().toISOString(),
        format: 'json'
      },
      data
    }, null, 2);

    return {
      data: json,
      filename: `${entityType}_export_${timestamp}.json`,
      contentType: 'application/json',
      size: json.length
    };
  }

  private toXLSX(data: unknown[], entityType: string, timestamp: string): ExportResult {
    // For now, return CSV as XLSX would require additional dependencies
    // In production, would use a library like xlsx or exceljs
    console.warn('XLSX export not implemented, returning CSV format');
    return this.toCSV(data, entityType, timestamp);
  }

  // ============================================================================
  // BULK EXPORT
  // ============================================================================

  async exportAllData(options: ExportOptions = { format: 'json' }): Promise<ExportResult> {
    const [jobs, assignments, opportunities, bids, contracts, compliance, rfps] = await Promise.all([
      this.exportJobs(options),
      this.exportAssignments(options),
      this.exportOpportunities(options),
      this.exportBids(options),
      this.exportContracts(options),
      this.exportCompliance(options),
      this.exportRfps(options)
    ]);

    const allData = {
      export_info: {
        exported_at: new Date().toISOString(),
        format: options.format,
        total_entities: 7
      },
      jobs: jobs.data,
      assignments: assignments.data,
      opportunities: opportunities.data,
      bids: bids.data,
      contracts: contracts.data,
      compliance: compliance.data,
      rfps: rfps.data
    };

    const json = JSON.stringify(allData, null, 2);
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');

    return {
      data: json,
      filename: `jobs_complete_export_${timestamp}.json`,
      contentType: 'application/json',
      size: json.length
    };
  }
}
