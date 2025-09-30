import type { ReportRepository, Report, TenantContext, AuditLogger, EventBus } from '@ghxstship/domain';

export class AnalyticsService {
  constructor(private readonly repos: { reports: ReportRepository }, private readonly audit: AuditLogger, private readonly bus: EventBus) {}

  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.reports.list(ctx.organizationId, limit, offset);
  }

  async create(ctx: TenantContext, input: Report) {
    const created = await this.repos.reports.create({ ...input, organizationId: ctx.organizationId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'report', id: created.id }, meta: created });
    return created;
  }
}
