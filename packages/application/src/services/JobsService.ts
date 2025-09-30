import type { JobRepository, Job, TenantContext, AuditLogger, EventBus } from '@ghxstship/domain';

export class JobsService {
  constructor(private readonly repos: { jobs: JobRepository }, private readonly audit: AuditLogger, private readonly bus: EventBus) {}

  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.jobs.list(ctx.organizationId, limit, offset);
  }

  async create(ctx: TenantContext, input: Job) {
    const created = await this.repos.jobs.create({ ...input, organizationId: ctx.organizationId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'job', id: created.id }, meta: created });
    return created;
  }
}
