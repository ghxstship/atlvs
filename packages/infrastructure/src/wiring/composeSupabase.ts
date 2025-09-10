import type { SupabaseClient } from '@supabase/supabase-js';
import { ProjectsService, ApiKeysService, WebhooksService, ProgramsService, PipelineService, ProcurementService, FinanceService, JobsService, AnalyticsService, CompaniesService, ListingsService, VendorsService, CatalogItemsService } from '@ghxstship/application';
import { SupabaseProjectRepository } from '../repositories/SupabaseProjectRepository';
import { SupabaseApiKeyRepository } from '../repositories/SupabaseApiKeyRepository';
import { SupabaseWebhookRepository } from '../repositories/SupabaseWebhookRepository';
import { SupabaseAuditLogger } from '../adapters/SupabaseAuditLogger';
import { InMemoryEventBus } from '../adapters/InMemoryEventBus';
import { HttpWebhookDispatcher } from '../adapters/HttpWebhookDispatcher';
import { createServiceRoleClient } from '@ghxstship/auth';
import { SupabaseProgramsRepository } from '../repositories/SupabaseProgramsRepository';
import { SupabasePipelineRepository } from '../repositories/SupabasePipelineRepository';
import { SupabasePurchaseOrdersRepository } from '../repositories/SupabasePurchaseOrdersRepository';
import { SupabaseInvoicesRepository } from '../repositories/SupabaseInvoicesRepository';
import { SupabaseJobsRepository } from '../repositories/SupabaseJobsRepository';
import { SupabaseReportsRepository } from '../repositories/SupabaseReportsRepository';
import { SupabaseCompaniesRepository } from '../repositories/SupabaseCompaniesRepository';
import { SupabaseListingsRepository } from '../repositories/SupabaseListingsRepository';
import { SupabaseVendorsRepository } from '../repositories/SupabaseVendorsRepository';
import { SupabaseCatalogItemsRepository } from '../repositories/SupabaseCatalogItemsRepository';

// Stub repository classes for missing implementations
class StubTaskRepository {
  async findById(): Promise<any> { return null; }
  async findMany(): Promise<any[]> { return []; }
  async create(entity: any): Promise<any> { 
    throw new Error('TaskRepository not implemented'); 
  }
  async update(id: string, partial: any): Promise<any> { 
    throw new Error('TaskRepository not implemented'); 
  }
  async delete(): Promise<void> { 
    throw new Error('TaskRepository not implemented'); 
  }
  async findByProject(): Promise<any[]> { return []; }
  async findByAssignee(): Promise<any[]> { return []; }
  async findByStatus(): Promise<any[]> { return []; }
}

class StubRiskRepository {
  async findById(): Promise<any> { return null; }
  async findMany(): Promise<any[]> { return []; }
  async create(entity: any): Promise<any> { 
    throw new Error('RiskRepository not implemented'); 
  }
  async update(id: string, partial: any): Promise<any> { 
    throw new Error('RiskRepository not implemented'); 
  }
  async delete(): Promise<void> { 
    throw new Error('RiskRepository not implemented'); 
  }
  async findByProject(): Promise<any[]> { return []; }
  async findByCategory(): Promise<any[]> { return []; }
  async findByOwner(): Promise<any[]> { return []; }
}

class StubFileRepository {
  async findById(): Promise<any> { return null; }
  async findMany(): Promise<any[]> { return []; }
  async create(entity: any): Promise<any> { 
    throw new Error('FileRepository not implemented'); 
  }
  async update(id: string, partial: any): Promise<any> { 
    throw new Error('FileRepository not implemented'); 
  }
  async delete(): Promise<void> { 
    throw new Error('FileRepository not implemented'); 
  }
  async findByProject(): Promise<any[]> { return []; }
  async findByCategory(): Promise<any[]> { return []; }
}

class StubInspectionRepository {
  async findById(): Promise<any> { return null; }
  async findMany(): Promise<any[]> { return []; }
  async create(entity: any): Promise<any> { 
    throw new Error('InspectionRepository not implemented'); 
  }
  async update(id: string, partial: any): Promise<any> { 
    throw new Error('InspectionRepository not implemented'); 
  }
  async delete(): Promise<void> { 
    throw new Error('InspectionRepository not implemented'); 
  }
  async findByProject(): Promise<any[]> { return []; }
  async findByInspector(): Promise<any[]> { return []; }
  async findByType(): Promise<any[]> { return []; }
}

class StubActivationRepository {
  async findById(): Promise<any> { return null; }
  async findMany(): Promise<any[]> { return []; }
  async create(entity: any): Promise<any> { 
    throw new Error('ActivationRepository not implemented'); 
  }
  async update(id: string, partial: any): Promise<any> { 
    throw new Error('ActivationRepository not implemented'); 
  }
  async delete(): Promise<void> { 
    throw new Error('ActivationRepository not implemented'); 
  }
  async findByProject(): Promise<any[]> { return []; }
  async findByResponsible(): Promise<any[]> { return []; }
  async findByType(): Promise<any[]> { return []; }
}

class StubTimeEntryRepository {
  async findById(): Promise<any> { return null; }
  async findMany(): Promise<any[]> { return []; }
  async create(entity: any): Promise<any> { 
    throw new Error('TimeEntryRepository not implemented'); 
  }
  async update(id: string, partial: any): Promise<any> { 
    throw new Error('TimeEntryRepository not implemented'); 
  }
  async delete(): Promise<void> { 
    throw new Error('TimeEntryRepository not implemented'); 
  }
  async findByProject(): Promise<any[]> { return []; }
  async findByUser(): Promise<any[]> { return []; }
  async findByDateRange(): Promise<any[]> { return []; }
}

export function composeSupabaseServices(sb: SupabaseClient) {
  // Use service role client for system-level writes (e.g., audit logs) and privileged repos
  const serviceSb = createServiceRoleClient();

  const repos = {
    projects: new SupabaseProjectRepository(sb),
    tasks: new StubTaskRepository(),
    risks: new StubRiskRepository(),
    files: new StubFileRepository(),
    inspections: new StubInspectionRepository(),
    activations: new StubActivationRepository(),
    timeEntries: new StubTimeEntryRepository(),
    apiKeys: new SupabaseApiKeyRepository(serviceSb),
    webhooks: new SupabaseWebhookRepository(serviceSb),
    programs: new SupabaseProgramsRepository(serviceSb),
    pipeline: new SupabasePipelineRepository(serviceSb),
    purchaseOrders: new SupabasePurchaseOrdersRepository(serviceSb),
    invoices: new SupabaseInvoicesRepository(serviceSb),
    jobs: new SupabaseJobsRepository(serviceSb),
    reports: new SupabaseReportsRepository(serviceSb),
    listings: new SupabaseListingsRepository(serviceSb),
    vendors: new SupabaseVendorsRepository(serviceSb),
    catalogItems: new SupabaseCatalogItemsRepository(serviceSb)
  } as const;
  const audit = new SupabaseAuditLogger(serviceSb);
  const bus = new InMemoryEventBus();
  const dispatcher = new HttpWebhookDispatcher();

  const signingSecret = process.env.API_KEYS_SIGNING_SECRET || 'dev_signing_secret_change_me';

  const services = {
    projects: new ProjectsService({
      projects: repos.projects,
      tasks: repos.tasks,
      risks: repos.risks,
      files: repos.files,
      inspections: repos.inspections,
      activations: repos.activations,
      timeEntries: repos.timeEntries
    }, audit, bus),
    apiKeys: new ApiKeysService(repos.apiKeys, signingSecret),
    webhooks: new WebhooksService(repos.webhooks, dispatcher),
    programs: new ProgramsService({ programs: repos.programs }, audit, bus),
    pipeline: new PipelineService({ 
      pipeline: repos.pipeline,
      manning: new StubTaskRepository() as any,
      advancing: new StubTaskRepository() as any,
      onboarding: new StubTaskRepository() as any,
      training: new StubTaskRepository() as any,
      contracting: new StubTaskRepository() as any
    }, audit, bus),
    procurement: new ProcurementService(sb),
    finance: new FinanceService({ 
      invoices: repos.invoices, 
      purchaseOrders: repos.purchaseOrders,
      budgets: new StubTaskRepository() as any,
      expenses: new StubTaskRepository() as any,
      accounts: new StubTaskRepository() as any,
      transactions: new StubTaskRepository() as any,
      revenue: new StubTaskRepository() as any,
      forecasts: new StubTaskRepository() as any
    }, audit, bus),
    jobs: new JobsService({ 
      jobs: repos.jobs,
      opportunities: new StubTaskRepository() as any,
      bids: new StubTaskRepository() as any,
      contracts: new StubTaskRepository() as any,
      assignments: new StubTaskRepository() as any,
      compliance: new StubTaskRepository() as any,
      rfps: new StubTaskRepository() as any
    }, audit, bus),
    analytics: new AnalyticsService({ 
      reports: repos.reports,
      dashboards: new StubTaskRepository() as any,
      exportJobs: new StubTaskRepository() as any
    }, audit, bus)
    ,
    companies: new CompaniesService({ 
      companies: new SupabaseCompaniesRepository(serviceSb),
      contacts: new StubTaskRepository() as any,
      contracts: new StubTaskRepository() as any,
      qualifications: new StubTaskRepository() as any,
      ratings: new StubTaskRepository() as any
    }, audit, bus),
    listings: new ListingsService({ listings: repos.listings }, audit, bus),
    vendors: new VendorsService({ vendors: repos.vendors }, audit, bus),
    catalogItems: new CatalogItemsService({ catalogItems: repos.catalogItems }, audit, bus)
  } as const;

  // Forward domain events to webhooks dispatcher
  const forward = (eventName: string) =>
    bus.subscribe(eventName, async (evt) => {
      await services.webhooks.dispatch(evt.tenant.organizationId, {
        name: evt.name,
        payload: evt.payload,
        occurredAt: evt.occurredAt
      });
    });
  forward('marketplace.vendor.created');
  forward('marketplace.vendor.updated');
  forward('marketplace.vendor.deleted');
  forward('marketplace.catalogItem.created');
  forward('marketplace.catalogItem.updated');
  forward('marketplace.catalogItem.deleted');
  forward('finance.invoice.created');

  return { repos, audit, bus, services };
}
