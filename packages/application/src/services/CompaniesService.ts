import type { 
  CompanyRepository, 
  CompanyContactRepository,
  CompanyContractRepository,
  CompanyQualificationRepository,
  CompanyRatingRepository,
  Company, 
  CompanyContact,
  CompanyContract,
  CompanyQualification,
  CompanyRating,
  TenantContext, 
  AuditLogger, 
  EventBus 
} from '@ghxstship/domain';

export class CompaniesService {
  constructor(
    private readonly repos: { 
      companies: CompanyRepository;
      contacts: CompanyContactRepository;
      contracts: CompanyContractRepository;
      qualifications: CompanyQualificationRepository;
      ratings: CompanyRatingRepository;
    }, 
    private readonly audit: AuditLogger, 
    private readonly bus: EventBus
  ) {}

  // Company CRUD operations
  async listCompanies(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.companies.list(ctx.organizationId, limit, offset);
  }

  async createCompany(ctx: TenantContext, input: Company) {
    const created = await this.repos.companies.create({
      ...input,
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'company', id: created.id },
      meta: created
    });

    await this.bus.publish('company.created', { company: created, context: ctx });
    return created;
  }

  async updateCompany(ctx: TenantContext, id: string, patch: Partial<Company>) {
    const updated = await this.repos.companies.update(id, patch);
    
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'update',
      entity: { type: 'company', id },
      meta: patch
    });

    await this.bus.publish('company.updated', { company: updated, changes: patch, context: ctx });
    return updated;
  }

  async deleteCompany(ctx: TenantContext, id: string) {
    // Check for dependencies before deletion
    const contracts = await this.repos.contracts.findByCompanyId(id);
    const qualifications = await this.repos.qualifications.findByCompanyId(id);
    const ratings = await this.repos.ratings.findByCompanyId(id);
    
    if (contracts.length > 0 || qualifications.length > 0 || ratings.length > 0) {
      throw new Error('Cannot delete company with existing contracts, qualifications, or ratings');
    }

    await this.repos.companies.delete(id);
    
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'company', id }
    });

    await this.bus.publish('company.deleted', { companyId: id, context: ctx });
    return true;
  }

  // Contact management
  async listContacts(ctx: TenantContext, companyId?: string) {
    if (companyId) {
      return this.repos.contacts.findByCompanyId(companyId);
    }
    return this.repos.contacts.list(ctx.organizationId);
  }

  async createContact(ctx: TenantContext, input: CompanyContact) {
    // If setting as primary, unset other primary contacts for the company
    if (input.isPrimary) {
      await this.repos.contacts.unsetPrimaryForCompany(input.companyId);
    }

    const created = await this.repos.contacts.create({
      ...input,
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'company_contact', id: created.id },
      meta: created
    });

    return created;
  }

  // Contract management
  async listContracts(ctx: TenantContext, filters?: { companyId?: string; status?: string; type?: string }) {
    return this.repos.contracts.list(ctx.organizationId, filters);
  }

  async createContract(ctx: TenantContext, input: CompanyContract) {
    const created = await this.repos.contracts.create({
      ...input,
      organizationId: ctx.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'company_contract', id: created.id },
      meta: created
    });

    await this.bus.publish('contract.created', { contract: created, context: ctx });
    return created;
  }

  async renewContract(ctx: TenantContext, contractId: string, renewalData: { 
    endDate: string; 
    renewalTerms?: string; 
    value?: number 
  }) {
    const contract = await this.repos.contracts.findById(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const updated = await this.repos.contracts.update(contractId, {
      ...renewalData,
      status: 'active',
      renewalDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'renew',
      entity: { type: 'company_contract', id: contractId },
      meta: renewalData
    });

    await this.bus.publish('contract.renewed', { contract: updated, context: ctx });
    return updated;
  }

  async getExpiringContracts(ctx: TenantContext, daysAhead: number = 30) {
    return this.repos.contracts.findExpiring(ctx.organizationId, daysAhead);
  }

  // Qualification management
  async listQualifications(ctx: TenantContext, filters?: { companyId?: string; type?: string; status?: string }) {
    return this.repos.qualifications.list(ctx.organizationId, filters);
  }

  async createQualification(ctx: TenantContext, input: CompanyQualification) {
    const created = await this.repos.qualifications.create({
      ...input,
      organizationId: ctx.organizationId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'company_qualification', id: created.id },
      meta: created
    });

    return created;
  }

  async verifyQualification(ctx: TenantContext, qualificationId: string) {
    const updated = await this.repos.qualifications.update(qualificationId, {
      status: 'active',
      verifiedDate: new Date().toISOString().split('T')[0],
      verifiedBy: ctx.userId,
      updatedAt: new Date().toISOString()
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'verify',
      entity: { type: 'company_qualification', id: qualificationId }
    });

    await this.bus.publish('qualification.verified', { qualification: updated, context: ctx });
    return updated;
  }

  async getExpiringQualifications(ctx: TenantContext, daysAhead: number = 30) {
    return this.repos.qualifications.findExpiring(ctx.organizationId, daysAhead);
  }

  // Rating management
  async listRatings(ctx: TenantContext, filters?: { companyId?: string; category?: string; rating?: number }) {
    return this.repos.ratings.list(ctx.organizationId, filters);
  }

  async createRating(ctx: TenantContext, input: CompanyRating) {
    const created = await this.repos.ratings.create({
      ...input,
      organizationId: ctx.organizationId,
      createdBy: ctx.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'company_rating', id: created.id },
      meta: created
    });

    // Update company average rating
    await this.updateCompanyAverageRating(ctx, input.companyId);

    await this.bus.publish('rating.created', { rating: created, context: ctx });
    return created;
  }

  async getCompanyAverageRating(ctx: TenantContext, companyId: string) {
    return this.repos.ratings.getAverageRating(companyId);
  }

  private async updateCompanyAverageRating(ctx: TenantContext, companyId: string) {
    const averageRating = await this.repos.ratings.getAverageRating(companyId);
    
    if (averageRating !== null) {
      await this.repos.companies.update(companyId, {
        // Assuming we add an averageRating field to Company entity
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Analytics and reporting
  async getCompanyAnalytics(ctx: TenantContext) {
    const [
      totalCompanies,
      activeContracts,
      expiringContracts,
      expiringQualifications,
      averageRating,
      pendingReviews
    ] = await Promise.all([
      this.repos.companies.count(ctx.organizationId),
      this.repos.contracts.countByStatus(ctx.organizationId, 'active'),
      this.repos.contracts.findExpiring(ctx.organizationId, 30),
      this.repos.qualifications.findExpiring(ctx.organizationId, 30),
      this.repos.ratings.getOrganizationAverageRating(ctx.organizationId),
      this.repos.qualifications.countByStatus(ctx.organizationId, 'pending')
    ]);

    return {
      totalCompanies,
      activeContracts,
      expiringContractsCount: expiringContracts.length,
      expiringQualificationsCount: expiringQualifications.length,
      averageRating: averageRating || 0,
      pendingReviews,
      alerts: {
        expiringContracts: expiringContracts.slice(0, 5), // Top 5 expiring
        expiringQualifications: expiringQualifications.slice(0, 5)
      }
    };
  }

  async getTopRatedCompanies(ctx: TenantContext, limit: number = 10) {
    return this.repos.ratings.getTopRatedCompanies(ctx.organizationId, limit);
  }

  // Workflow management
  async processContractRenewal(ctx: TenantContext, contractId: string) {
    const contract = await this.repos.contracts.findById(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (!contract.autoRenewal) {
      throw new Error('Contract is not set for auto-renewal');
    }

    // Calculate new end date (typically 1 year from current end date)
    const currentEndDate = new Date(contract.endDate!);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    return this.renewContract(ctx, contractId, {
      endDate: newEndDate.toISOString().split('T')[0],
      renewalTerms: contract.renewalTerms || 'Auto-renewed for 1 year'
    });
  }

  async processQualificationExpiry(ctx: TenantContext) {
    const expiringQualifications = await this.getExpiringQualifications(ctx, 0); // Already expired
    
    for (const qualification of expiringQualifications) {
      await this.repos.qualifications.update(qualification.id, {
        status: 'expired',
        updatedAt: new Date().toISOString()
      });

      await this.audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: 'system' },
        tenant: { organizationId: ctx.organizationId },
        action: 'expire',
        entity: { type: 'company_qualification', id: qualification.id }
      });
    }

    return expiringQualifications.length;
  }
}

