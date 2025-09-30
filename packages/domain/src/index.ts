// Shared Kernel and Value Objects
export * from './shared';

// Legacy exports (backward compatibility)
export * from './core/Identifier';
export * from './core/Result';
export * from './security/r-b-a-c';
export * from './audit';

// Bounded Contexts
export * from './contexts';

export * from './repositories/base-repository';

export * from './modules/projects/Project';
export type { ProjectRepository } from './modules/projects/project-repository';
// export { ProjectRepositoryImpl } from './modules/projects/project-repository';
export * from './modules/api-keys/api-key';
export * from './modules/api-keys/api-key-repository';
export * from './webhooks/Webhook';
export * from './webhooks/webhook-repository';
export * from './modules/programming/Event';
export * from './modules/programming/Program';

// Profile module exports
export * from './modules/profile/Profile';
export * from './modules/profile/profile-repository';
export * from './modules/pipeline/Pipeline';
export * from './modules/pipeline/Manning';
export * from './modules/pipeline/Advancing';
export * from './modules/pipeline/Onboarding';
export * from './modules/pipeline/Training';
export * from './modules/pipeline/Contracting';
export * from './modules/procurement/purchase-order';
export * from './modules/finance';
export * from './modules/jobs/Job';
export * from './modules/jobs/Opportunity';
export * from './modules/jobs/Bid';
export * from './modules/jobs/Contract';
export * from './modules/jobs/Assignment';
export * from './modules/jobs/Compliance';
export * from './modules/jobs/r-f-p';
export * from './modules/analytics/Report';
export * from './modules/analytics/Dashboard';
export * from './modules/companies/Company';
export * from './modules/marketplace/Listing';
export * from './modules/marketplace/Vendor';
export * from './modules/marketplace/catalog-item';

// People module exports
export * from './modules/people/Person';
export * from './modules/people/Role';

// Assets module
export * from './modules/assets';

// Settings module
export * from './modules/settings';

// Resources module
export * from './modules/resources';

// Shared types
export type { Database } from './types/database';
