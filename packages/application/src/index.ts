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
