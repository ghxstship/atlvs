import { 
  Job, JobRepository,
  Opportunity, OpportunityRepository, OpportunityFilters,
  Bid, BidRepository, BidFilters,
  JobContract, ContractRepository, ContractFilters,
  JobAssignment, AssignmentRepository, AssignmentFilters,
  JobCompliance, ComplianceRepository, ComplianceFilters,
  RFP, RFPRepository, RFPFilters,
  TenantContext, AuditLogger, EventBus 
} from '@ghxstship/domain';

interface JobsServiceRepositories {
  jobs: JobRepository;
  opportunities: OpportunityRepository;
  bids: BidRepository;
  contracts: ContractRepository;
  assignments: AssignmentRepository;
  compliance: ComplianceRepository;
  rfps: RFPRepository;
}

export class JobsService {
  constructor(
    private readonly repos: JobsServiceRepositories,
    private readonly audit: AuditLogger,
    private readonly bus: EventBus
  ) {}

  // ========== Jobs ==========
  async listJobs(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.jobs.list(ctx.organizationId, limit, offset);
  }

  // Alias for API compatibility
  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.listJobs(ctx, { limit, offset });
  }

  // Alias for API compatibility
  async create(ctx: TenantContext, input: any) {
    return this.createJob(ctx, input);
  }

  async getJob(ctx: TenantContext, id: string) {
    const job = await this.repos.jobs.findById(id, ctx.organizationId);
    if (!job) throw new Error('Job not found');
    return job;
  }

  async createJob(ctx: TenantContext, input: Omit<Job, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) {
    const job: Job = {
      ...input,
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await this.repos.jobs.create(job);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'job_created' as any,
      entity: { type: 'job', id: created.id },
      meta: created
    });
    await this.bus.publish({ eventType: 'job.created', payload: created } as any);
    return created;
  }

  async updateJob(ctx: TenantContext, id: string, input: Partial<Job>) {
    const existing = await this.getJob(ctx, id);
    const updated = await this.repos.jobs.update(id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'job_updated' as any,
      entity: { type: 'job', id },
      meta: { before: existing, after: updated }
    });
    await this.bus.publish({ eventType: 'job.updated', payload: updated } as any);
    return updated;
  }

  // Note: JobRepository doesn't have delete method, removing this method
  // If delete functionality is needed, it should be added to the JobRepository interface

  // ========== Opportunities ==========
  async listOpportunities(ctx: TenantContext, filters?: any) {
    return this.repos.opportunities.list(ctx.organizationId, filters);
  }

  async getOpportunity(ctx: TenantContext, id: string) {
    const opportunity = await this.repos.opportunities.findById(ctx.organizationId, id);
    if (!opportunity) throw new Error('Opportunity not found');
    return opportunity;
  }

  async createOpportunity(ctx: TenantContext, input: Omit<Opportunity, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) {
    const opportunity: Opportunity = {
      ...input,
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await this.repos.opportunities.create(opportunity);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'opportunity', id: created.id },
      meta: created
    });
    await this.bus.publish({ eventType: 'opportunity.created', payload: created } as any);
    return created;
  }

  async updateOpportunity(ctx: TenantContext, id: string, input: Partial<Opportunity>) {
    const existing = await this.getOpportunity(ctx, id);
    const updated = await this.repos.opportunities.update(ctx.organizationId, id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'update',
      entity: { type: 'opportunity', id },
      meta: { before: existing, after: updated }
    });
    await this.bus.publish({ eventType: 'opportunity.updated', payload: updated } as any);
    return updated;
  }

  // ========== Bids ==========
  async listBids(ctx: TenantContext, filters?: any) {
    return this.repos.bids.list(ctx.organizationId, filters);
  }

  async getBid(ctx: TenantContext, id: string) {
    const bids = await this.repos.bids.list(ctx.organizationId, {});
    const bid = bids.find(b => b.id === id);
    if (!bid) throw new Error('Bid not found');
    return bid;
  }

  async createBid(ctx: TenantContext, input: Omit<Bid, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) {
    const bid: Bid = {
      ...input,
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await this.repos.bids.create(bid);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'bid_created' as any,
      entity: { type: 'bid', id: created.id },
      meta: created
    });
    await this.bus.publish({ eventType: 'bid.created', payload: created } as any);
    return created;
  }

  async submitBid(ctx: TenantContext, id: string) {
    const existing = await this.getBid(ctx, id);
    if (existing.status !== 'draft') {
      throw new Error('Only draft bids can be submitted');
    }

    const updated = await this.repos.bids.update(ctx.organizationId, id, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'bid_submitted' as any,
      entity: { type: 'bid', id },
      meta: { before: existing, after: updated }
    });
    await this.bus.publish({ eventType: 'bid.submitted', payload: updated } as any);
    return updated;
  }

  // ========== Contracts ==========
  async listContracts(ctx: TenantContext, filters?: any) {
    return this.repos.contracts.list(ctx.organizationId, filters);
  }

  async getContract(ctx: TenantContext, id: string) {
    const contract = await this.repos.contracts.findById(ctx.organizationId, id);
    if (!contract) throw new Error('Contract not found');
    return contract;
  }

  async createContract(ctx: TenantContext, input: Omit<JobContract, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) {
    const contract: JobContract = {
      ...input,
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await this.repos.contracts.create(contract);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'contract_created' as any,
      entity: { type: 'contract', id: created.id },
      meta: created
    });
    await this.bus.publish({ eventType: 'contract.created', payload: created } as any);
    return created;
  }

  async activateContract(ctx: TenantContext, id: string) {
    const existing = await this.getContract(ctx, id);
    if (existing.status !== 'draft') {
      throw new Error('Only draft contracts can be activated');
    }

    const updated = await this.repos.contracts.update(ctx.organizationId, id, {
      status: 'active',
      updatedAt: new Date().toISOString(),
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'contract_activated' as any,
      entity: { type: 'contract', id },
      meta: { before: existing, after: updated }
    });
    await this.bus.publish({ eventType: 'contract.activated', payload: updated } as any);
    return updated;
  }

  // ========== Assignments ==========
  async listAssignments(ctx: TenantContext, filters?: any) {
    return this.repos.assignments.list(ctx.organizationId, filters);
  }

  async getAssignment(ctx: TenantContext, id: string) {
    const assignment = await this.repos.assignments.findById(ctx.organizationId, id);
    if (!assignment) throw new Error('Assignment not found');
    return assignment;
  }

  async createAssignment(ctx: TenantContext, input: Omit<JobAssignment, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) {
    const assignment: JobAssignment = {
      ...input,
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await this.repos.assignments.create(assignment);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'assignment_created' as any,
      entity: { type: 'assignment', id: created.id },
      meta: created
    });
    await this.bus.publish({ eventType: 'assignment.created', payload: created } as any);
    return created;
  }

  async acceptAssignment(ctx: TenantContext, id: string) {
    const existing = await this.getAssignment(ctx, id);
    if (existing.status !== 'pending') {
      throw new Error('Only pending assignments can be accepted');
    }

    const updated = await this.repos.assignments.update(ctx.organizationId, id, {
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'assignment_accepted' as any,
      entity: { type: 'assignment', id },
      meta: { before: existing, after: updated }
    });
    await this.bus.publish({ eventType: 'assignment.accepted', payload: updated } as any);
    return updated;
  }

  // ========== Compliance ==========
  async listCompliance(ctx: TenantContext, filters?: any) {
    return this.repos.compliance.list(ctx.organizationId, filters);
  }

  async getCompliance(ctx: TenantContext, id: string) {
    const compliance = await this.repos.compliance.findById(ctx.organizationId, id);
    if (!compliance) throw new Error('Compliance item not found');
    return compliance;
  }

  async createCompliance(ctx: TenantContext, input: Omit<JobCompliance, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) {
    const compliance: JobCompliance = {
      ...input,
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await this.repos.compliance.create(compliance);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'compliance_created' as any,
      entity: { type: 'compliance', id: created.id },
      meta: created
    });
    await this.bus.publish({ eventType: 'compliance.created', payload: created } as any);
    return created;
  }

  async markCompliant(ctx: TenantContext, id: string, evidenceUrl?: string) {
    const existing = await this.getCompliance(ctx, id);
    const updated = await this.repos.compliance.update(ctx.organizationId, id, {
      status: 'approved',
      documentUrl: evidenceUrl,
      updatedAt: new Date().toISOString(),
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'compliance_approved' as any,
      entity: { type: 'compliance', id },
      meta: { before: existing, after: updated }
    });
    await this.bus.publish({ eventType: 'compliance.approved', payload: updated } as any);
    return updated;
  }

  // ========== RFPs ==========
  async listRFPs(ctx: TenantContext, filters?: any) {
    return this.repos.rfps.list(ctx.organizationId, filters);
  }

  async getRFP(ctx: TenantContext, id: string) {
    const rfp = await this.repos.rfps.findById(ctx.organizationId, id);
    if (!rfp) throw new Error('RFP not found');
    return rfp;
  }

  async createRFP(ctx: TenantContext, input: Omit<RFP, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) {
    const rfp: RFP = {
      ...input,
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await this.repos.rfps.create(rfp);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'rfp_created' as any,
      entity: { type: 'rfp', id: created.id },
      meta: created
    });
    await this.bus.publish({ eventType: 'rfp.created', payload: created } as any);
    return created;
  }

  async publishRFP(ctx: TenantContext, id: string) {
    const existing = await this.getRFP(ctx, id);
    if (existing.status !== 'draft') {
      throw new Error('Only draft RFPs can be published');
    }

    const updated = await this.repos.rfps.update(ctx.organizationId, id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'rfp_published' as any,
      entity: { type: 'rfp', id },
      meta: { before: existing, after: updated }
    });
    await this.bus.publish({ eventType: 'rfp.published', payload: updated } as any);
    return updated;
  }

  // ========== Workflow Methods ==========
  async getJobOverview(ctx: TenantContext, jobId: string) {
    const job = await this.getJob(ctx, jobId);
    const assignments = await this.repos.assignments.list(ctx.organizationId, { jobId });
    const contracts = await this.repos.contracts.list(ctx.organizationId, {});
    const compliance = await this.repos.compliance.list(ctx.organizationId, { jobId });
    const bids = await this.repos.bids.list(ctx.organizationId, {});

    return {
      job,
      assignments,
      contracts,
      compliance,
      bids,
      stats: {
        totalAssignments: assignments.length,
        activeAssignments: assignments.filter(a => a.status === 'in_progress').length,
        totalContracts: contracts.length,
        activeContracts: contracts.filter(c => c.status === 'active').length,
        pendingCompliance: compliance.filter(c => c.status === 'pending').length,
        totalBids: bids.length,
      }
    };
  }

  async getOrganizationStats(ctx: TenantContext) {
    const [jobs, opportunities, bids, contracts, assignments, compliance, rfps] = await Promise.all([
      this.repos.jobs.list(ctx.organizationId),
      this.repos.opportunities.list(ctx.organizationId),
      this.repos.bids.list(ctx.organizationId),
      this.repos.contracts.list(ctx.organizationId),
      this.repos.assignments.list(ctx.organizationId),
      this.repos.compliance.list(ctx.organizationId),
      this.repos.rfps.list(ctx.organizationId),
    ]);

    return {
      jobs: {
        total: jobs.length,
        active: jobs.filter(j => j.status === 'in_progress').length,
        completed: jobs.filter(j => j.status === 'completed').length,
      },
      opportunities: {
        total: opportunities.length,
        openOpportunities: opportunities.filter(o => o.status === 'qualified').length,
      },
      bids: {
        total: bids.length,
        submitted: bids.filter(b => b.status === 'submitted' || b.status === 'under_review').length,
        accepted: bids.filter(b => b.status === 'accepted').length,
      },
      contracts: {
        total: contracts.length,
        active: contracts.filter(c => c.status === 'active').length,
      },
      assignments: {
        total: assignments.length,
        active: assignments.filter(a => a.status === 'in_progress').length,
      },
      compliance: {
        total: compliance.length,
        compliantItems: compliance.filter(c => c.status === 'approved').length,
        pending: compliance.filter(c => c.status === 'pending').length,
      },
      rfps: {
        total: rfps.length,
        openRFPs: rfps.filter(r => r.status === 'published').length,
      },
    };
  }
}
