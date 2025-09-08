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

export function composeSupabaseServices(sb: SupabaseClient) {
  // Use service role client for system-level writes (e.g., audit logs) and privileged repos
  const serviceSb = createServiceRoleClient();

  const repos = {
    projects: new SupabaseProjectRepository(sb),
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
    projects: new ProjectsService(repos, audit, bus),
    apiKeys: new ApiKeysService(repos.apiKeys, signingSecret),
    webhooks: new WebhooksService(repos.webhooks, dispatcher),
    programs: new ProgramsService({ programs: repos.programs }, audit, bus),
    pipeline: new PipelineService({ pipeline: repos.pipeline }, audit, bus),
    procurement: new ProcurementService({ purchaseOrders: repos.purchaseOrders }, audit, bus),
    finance: new FinanceService({ invoices: repos.invoices, purchaseOrders: repos.purchaseOrders }, audit, bus),
    jobs: new JobsService({ jobs: repos.jobs }, audit, bus),
    analytics: new AnalyticsService({ reports: repos.reports }, audit, bus)
    ,
    companies: new CompaniesService({ companies: new SupabaseCompaniesRepository(serviceSb) }, audit, bus),
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
