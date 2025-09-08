import type { ReportRepository, Report, DashboardRepository, Dashboard, ExportJobRepository, ExportJob, TenantContext, AuditLogger, EventBus, DomainEvent } from '@ghxstship/domain';

export class AnalyticsService {
  constructor(
    private readonly repos: { 
      reports: ReportRepository;
      dashboards: DashboardRepository;
      exportJobs: ExportJobRepository;
    }, 
    private readonly audit: AuditLogger, 
    private readonly bus: EventBus
  ) {}

  // Reports
  async listReports(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.reports.list(ctx.organizationId, limit, offset);
  }

  async createReport(ctx: TenantContext, input: Report) {
    const created = await this.repos.reports.create({ ...input, organizationId: ctx.organizationId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'report', id: created.id }, meta: created });
    
    const event: DomainEvent = {
      name: 'report.created',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId },
      actor: { userId: ctx.userId },
      payload: { reportId: created.id, organizationId: ctx.organizationId }
    };
    await this.bus.publish(event);
    return created;
  }

  async updateReport(ctx: TenantContext, id: string, updates: Partial<Report>) {
    const updated = await this.repos.reports.update(id, { ...updates, updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'update', entity: { type: 'report', id }, meta: updates });
    
    const event: DomainEvent = {
      name: 'report.updated',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId },
      actor: { userId: ctx.userId },
      payload: { reportId: id, organizationId: ctx.organizationId }
    };
    await this.bus.publish(event);
    return updated;
  }

  // Dashboards
  async listDashboards(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.dashboards.list(ctx.organizationId, limit, offset);
  }

  async createDashboard(ctx: TenantContext, input: Dashboard) {
    const created = await this.repos.dashboards.create({ ...input, organizationId: ctx.organizationId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'dashboard', id: created.id }, meta: created });
    
    const event: DomainEvent = {
      name: 'dashboard.created',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId },
      actor: { userId: ctx.userId },
      payload: { dashboardId: created.id, organizationId: ctx.organizationId }
    };
    await this.bus.publish(event);
    return created;
  }

  async updateDashboard(ctx: TenantContext, id: string, updates: Partial<Dashboard>) {
    const updated = await this.repos.dashboards.update(id, { ...updates, updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'update', entity: { type: 'dashboard', id }, meta: updates });
    
    const event: DomainEvent = {
      name: 'dashboard.updated',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId },
      actor: { userId: ctx.userId },
      payload: { dashboardId: id, organizationId: ctx.organizationId }
    };
    await this.bus.publish(event);
    return updated;
  }

  async deleteDashboard(ctx: TenantContext, id: string) {
    await this.repos.dashboards.delete(id, ctx.organizationId);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'delete', entity: { type: 'dashboard', id }, meta: {} });
    
    const event: DomainEvent = {
      name: 'dashboard.deleted',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId },
      actor: { userId: ctx.userId },
      payload: { dashboardId: id, organizationId: ctx.organizationId }
    };
    await this.bus.publish(event);
  }

  // Export Jobs
  async listExportJobs(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.exportJobs.list(ctx.organizationId, limit, offset);
  }

  async createExportJob(ctx: TenantContext, input: ExportJob) {
    const created = await this.repos.exportJobs.create({ ...input, organizationId: ctx.organizationId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'export_job', id: created.id }, meta: created });
    
    const event: DomainEvent = {
      name: 'export_job.created',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId },
      actor: { userId: ctx.userId },
      payload: { exportJobId: created.id, organizationId: ctx.organizationId }
    };
    await this.bus.publish(event);
    return created;
  }

  async updateExportJob(ctx: TenantContext, id: string, updates: Partial<ExportJob>) {
    const updated = await this.repos.exportJobs.update(id, { ...updates, updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'update', entity: { type: 'export_job', id }, meta: updates });
    
    const event: DomainEvent = {
      name: 'export_job.updated',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId },
      actor: { userId: ctx.userId },
      payload: { exportJobId: id, organizationId: ctx.organizationId }
    };
    await this.bus.publish(event);
    return updated;
  }

  async runExportJob(ctx: TenantContext, id: string) {
    await this.repos.exportJobs.run(id, ctx.organizationId);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'update', entity: { type: 'export_job', id }, meta: {} });
    
    const event: DomainEvent = {
      name: 'export_job.started',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId },
      actor: { userId: ctx.userId },
      payload: { exportJobId: id, organizationId: ctx.organizationId }
    };
    await this.bus.publish(event);
  }

  async deleteExportJob(ctx: TenantContext, id: string) {
    await this.repos.exportJobs.delete(id, ctx.organizationId);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'delete', entity: { type: 'export_job', id }, meta: {} });
    
    const event: DomainEvent = {
      name: 'export_job.deleted',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId },
      actor: { userId: ctx.userId },
      payload: { exportJobId: id, organizationId: ctx.organizationId }
    };
    await this.bus.publish(event);
  }

  // Legacy methods for backward compatibility
  async list(ctx: TenantContext, options: { limit?: number; offset?: number }) {
    return this.listReports(ctx, options);
  }

  async create(ctx: TenantContext, input: Report) {
    return this.createReport(ctx, input);
  }
}
