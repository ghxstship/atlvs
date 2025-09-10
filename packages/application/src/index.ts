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
export { AssetsService } from './services/AssetsService';
export { ProcurementService } from './services/ProcurementService';
export { ProjectsService } from './services/ProjectsService';
export { ApiKeysService } from './services/ApiKeysService';
export { WebhooksService } from './services/WebhooksService';
export { ProgramsService } from './services/ProgramsService';
export { PipelineService } from './services/PipelineService';
export { FinanceService } from './services/FinanceService';
export { JobsService } from './services/JobsService';
export { AnalyticsService } from './services/AnalyticsService';
export { CompaniesService } from './services/CompaniesService';
export { ListingsService } from './services/ListingsService';
export { VendorsService } from './services/VendorsService';
export { CatalogItemsService } from './services/CatalogItemsService';
