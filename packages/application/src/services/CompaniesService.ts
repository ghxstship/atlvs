import type { CompanyRepository, Company, TenantContext, AuditLogger, EventBus } from '@ghxstship/domain';

export class CompaniesService {
  constructor(private readonly repos: { companies: CompanyRepository }, private readonly audit: AuditLogger, private readonly bus: EventBus) {}

  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.companies.list(ctx.organizationId, limit, offset);
  }

  async create(ctx: TenantContext, input: Company) {
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
    return created;
  }
}
