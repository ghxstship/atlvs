// Placeholder exports for missing components
export const AuditLogger = {
  log: (event: string, data?: any) => console.log('AuditLogger:', event, data),
  error: (event: string, error: any) => console.error('AuditLogger:', event, error),
};

export const EventBus = {
  emit: (event: string, data?: any) => console.log('EventBus:', event, data),
  on: (event: string, handler: Function) => console.log('EventBus on:', event),
  off: (event: string, handler: Function) => console.log('EventBus off:', event),
};

// Export services
export { AssetsService } from './services/assets-service';
export { ProcurementService } from './services/procurement-service';
export { ProjectsService } from './services/projects-service';
export { ApiKeysService } from './services/api-keys-service';
export { WebhooksService } from './services/webhooks-service';
export { ProgramsService } from './services/programs-service';
export { PipelineService } from './services/pipeline-service';
export { FinanceService } from './services/finance-service';
export { JobsService } from './services/jobs-service';
export { AnalyticsService } from './services/analytics-service';
export { CompaniesService } from './services/companies-service';
export { ListingsService } from './services/listings-service';
export { VendorsService } from './services/vendors-service';
export { CatalogItemsService } from './services/catalog-items-service';
