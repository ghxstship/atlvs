/**
 * Infrastructure Layer - Main Export
 * All infrastructure services and adapters
 */

// ============================================================================
// ADAPTERS
// ============================================================================
// export * from './adapters/in-memory-event-bus';
// export * from './adapters/in-memory-audit-logger';
export * from './adapters/http-webhook-dispatcher';
// export * from './adapters/supabase-audit-logger';

// ============================================================================
// REPOSITORIES
// ============================================================================
// export * from './repositories/in-memory-project-repository';
// export * from './repositories/supabase-project-repository';
export * from './repositories/supabase-api-key-repository';
export * from './repositories/supabase-webhook-repository';
export * from './repositories/supabase-programs-repository';
export * from './repositories/supabase-pipeline-repository';
export * from './repositories/supabase-purchase-orders-repository';
export * from './repositories/supabase-invoices-repository';
export * from './repositories/supabase-jobs-repository';
export * from './repositories/supabase-reports-repository';
export * from './repositories/supabase-companies-repository';
export * from './repositories/supabase-listings-repository';
export * from './repositories/supabase-vendors-repository';
export * from './repositories/supabase-catalog-items-repository';
export * from './repositories/supabase-assets-repository';
export * from './repositories/supabase-asset-advancing-repository';
export * from './repositories/supabase-asset-assignment-repository';
export * from './repositories/supabase-asset-tracking-repository';
export * from './repositories/supabase-asset-maintenance-repository';
export * from './repositories/supabase-asset-report-repository';

// ============================================================================
// EXTERNAL SERVICES
// ============================================================================
export * from './external-services';

// ============================================================================
// INFRASTRUCTURE SERVICES
// ============================================================================
export * from './logging';
export * from './messaging';
export * from './monitoring';
export * from './realtime/RealtimeManager';
export * from './concurrency/OptimisticLockingService';
export * from './offline/OfflineSupportService';
export * from './performance/PerformanceMonitoringService';
export * from './caching/CachingAndPaginationService';

// ============================================================================
// DATABASE & PERSISTENCE
// ============================================================================
export * from './database/cursor-pagination';
export * from './persistence/supabase/client';

// ============================================================================
// WIRING & COMPOSITION
// ============================================================================
export * from './wiring/compose';
// export { composeSupabaseServices } from './wiring/composeSupabase';
