/**
 * Analytics Module Type Definitions
 *
 * Enterprise-grade TypeScript definitions for GHXSTSHIP Analytics module.
 * Provides comprehensive type safety for dashboards, reports, exports, and real-time analytics.
 *
 * @version 1.0.0
 * @enterprise-compliance ZERO_TOLERANCE
 * @audit-status COMPLIANT
 */

import { User as SupabaseUser } from '@supabase/supabase-js';

// ============================================================================
// CORE ENTITY TYPES
// ============================================================================

/**
 * Dashboard entity - Configuration-driven dashboard with widgets and layout
 */
export interface Dashboard {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  is_template: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  permissions: DashboardPermissions;
}

/**
 * Report entity - Advanced reporting with scheduling and data sources
 */
export interface Report {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  data_source: ReportDataSource;
  query: ReportQuery;
  schedule?: ReportSchedule;
  format: ReportFormat;
  recipients?: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  permissions: ReportPermissions;
}

/**
 * Export entity - Data export jobs with multiple formats and scheduling
 */
export interface ExportJob {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  data_source: ExportDataSource;
  format: ExportFormat;
  filters: ExportFilter[];
  schedule?: ExportSchedule;
  status: ExportStatus;
  file_url?: string;
  file_size?: number;
  row_count?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
  permissions: ExportPermissions;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  type: 'grid' | 'masonry' | 'flex' | 'tabs' | 'accordion' | 'sidebar' | 'fullscreen';
  columns: number;
  gap: string;
  responsive: Record<string, Partial<DashboardLayout>;
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  data_source: WidgetDataSource;
  refresh_interval?: number;
  permissions: WidgetPermissions;
}

/**
 * Widget types for analytics dashboards
 */
export type WidgetType =
  | 'metric'
  | 'chart'
  | 'table'
  | 'activity'
  | 'content'
  | 'integration'
  | 'navigation'
  | 'custom';

/**
 * Widget position in dashboard layout
 */
export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Widget size configuration
 */
export interface WidgetSize {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Generic widget configuration
 */
export interface WidgetConfig {
  title?: string;
  description?: string;
  showHeader: boolean;
  showBorder: boolean;
  backgroundColor?: string;
  [key: string]: unknown;
}

/**
 * Widget data source configuration
 */
export interface WidgetDataSource {
  type: 'query' | 'api' | 'realtime' | 'static';
  endpoint?: string;
  query?: string;
  parameters?: Record<string, any>;
  realtime?: boolean;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

/**
 * Report data source configuration
 */
export interface ReportDataSource {
  type: 'database' | 'api' | 'file' | 'integration';
  connection: string;
  schema?: string;
  table?: string;
  query?: string;
  parameters?: Record<string, any>;
}

/**
 * Report query configuration
 */
export interface ReportQuery {
  select: string[];
  from: string;
  where?: ReportCondition[];
  groupBy?: string[];
  orderBy?: ReportOrder[];
  limit?: number;
  joins?: ReportJoin[];
}

/**
 * Report condition for filtering
 */
export interface ReportCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
  value: unknown;
  and?: ReportCondition[];
  or?: ReportCondition[];
}

/**
 * Report ordering configuration
 */
export interface ReportOrder {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Report join configuration
 */
export interface ReportJoin {
  type: 'inner' | 'left' | 'right' | 'full';
  table: string;
  on: ReportCondition;
}

/**
 * Report schedule configuration
 */
export interface ReportSchedule {
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone: string;
  enabled: boolean;
}

/**
 * Report format configuration
 */
export interface ReportFormat {
  type: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  options?: Record<string, any>;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

/**
 * Export data source configuration
 */
export interface ExportDataSource {
  type: 'query' | 'table' | 'view' | 'report';
  source: string;
  parameters?: Record<string, any>;
}

/**
 * Export filter configuration
 */
export interface ExportFilter {
  field: string;
  operator: string;
  value: unknown;
}

/**
 * Export schedule configuration
 */
export interface ExportSchedule {
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone: string;
  enabled: boolean;
}

/**
 * Export format configuration
 */
export interface ExportFormat {
  type: 'csv' | 'excel' | 'json' | 'pdf' | 'xml';
  options?: {
    delimiter?: string;
    includeHeaders?: boolean;
    compression?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Export status enumeration
 */
export type ExportStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Dashboard filter configuration
 */
export interface DashboardFilter {
  id: string;
  type: 'date' | 'select' | 'multiselect' | 'range' | 'text' | 'boolean';
  field: string;
  label: string;
  defaultValue?: unknown;
  options?: FilterOption[];
  required: boolean;
  persistent: boolean;
}

/**
 * Filter option for select/multiselect filters
 */
export interface FilterOption {
  label: string;
  value: unknown;
  group?: string;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

/**
 * Dashboard permissions
 */
export interface DashboardPermissions {
  view: string[];
  edit: string[];
  delete: string[];
  share: string[];
}

/**
 * Report permissions
 */
export interface ReportPermissions {
  view: string[];
  edit: string[];
  delete: string[];
  run: string[];
  schedule: string[];
}

/**
 * Export permissions
 */
export interface ExportPermissions {
  view: string[];
  create: string[];
  delete: string[];
  download: string[];
}

/**
 * Widget permissions
 */
export interface WidgetPermissions {
  view: string[];
  edit: string[];
  delete: string[];
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

/**
 * View type enumeration for analytics
 */
export type ViewType =
  | 'table'
  | 'card'
  | 'list'
  | 'kanban'
  | 'calendar'
  | 'gallery'
  | 'timeline'
  | 'chart'
  | 'gantt'
  | 'form';

/**
 * Drawer type enumeration
 */
export type DrawerType =
  | 'detail'
  | 'edit'
  | 'create'
  | 'bulk'
  | 'import'
  | 'export'
  | 'history';

/**
 * Bulk action type enumeration
 */
export type BulkActionType =
  | 'edit'
  | 'delete'
  | 'status'
  | 'assign'
  | 'tag'
  | 'export';

/**
 * Sort direction enumeration
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Filter operator enumeration
 */
export type FilterOperator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'nin' | 'like' | 'ilike'
  | 'contains' | 'startswith' | 'endswith';

/**
 * Chart type enumeration for widgets
 */
export type ChartType =
  | 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap'
  | 'area' | 'radar' | 'doughnut' | 'funnel' | 'gauge';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalPages: number;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Real-time subscription payload
 */
export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
  table: string;
  schema: string;
}

// ============================================================================
// USER AND ORGANIZATION TYPES
// ============================================================================

/**
 * Module user type (adapted from UI config)
 */
export interface ModuleUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  metadata?: Record<string, any>;
}

/**
 * Organization context
 */
export interface OrganizationContext {
  id: string;
  name: string;
  slug: string;
  role: string;
  permissions: string[];
  features: string[];
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation schema for dashboard creation
 */
export interface CreateDashboardSchema {
  name: string;
  description?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  is_template: boolean;
  is_public: boolean;
}

/**
 * Validation schema for report creation
 */
export interface CreateReportSchema {
  name: string;
  description?: string;
  data_source: ReportDataSource;
  query: ReportQuery;
  schedule?: ReportSchedule;
  format: ReportFormat;
  recipients?: string[];
  is_active: boolean;
}

/**
 * Validation schema for export job creation
 */
export interface CreateExportSchema {
  name: string;
  description?: string;
  data_source: ExportDataSource;
  format: ExportFormat;
  filters: ExportFilter[];
  schedule?: ExportSchedule;
}

// ============================================================================
// REALTIME AND SUBSCRIPTION TYPES
// ============================================================================

/**
 * Realtime subscription configuration
 */
export interface RealtimeSubscription {
  table: string;
  filter?: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: RealtimePayload) => void;
}

/**
 * Subscription manager interface
 */
export interface SubscriptionManager {
  subscribe: (config: RealtimeSubscription) => () => void;
  unsubscribe: (id: string) => void;
  unsubscribeAll: () => void;
}

// ============================================================================
// EXPORT AND IMPORT TYPES
// ============================================================================

/**
 * Import job configuration
 */
export interface ImportJob {
  id: string;
  name: string;
  source: ImportSource;
  mapping: ImportMapping[];
  validation: ImportValidation;
  status: ImportStatus;
  results?: ImportResults;
}

/**
 * Import source configuration
 */
export interface ImportSource {
  type: 'file' | 'url' | 'api';
  format: 'csv' | 'excel' | 'json' | 'xml';
  location: string;
  options?: Record<string, any>;
}

/**
 * Import field mapping
 */
export interface ImportMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
  required: boolean;
  defaultValue?: unknown;
}

/**
 * Import validation configuration
 */
export interface ImportValidation {
  rules: ValidationRule[];
  onError: 'stop' | 'skip' | 'log';
}

/**
 * Validation rule for imports
 */
export interface ValidationRule {
  field: string;
  type: 'required' | 'unique' | 'format' | 'range' | 'custom';
  value?: unknown;
  message?: string;
}

/**
 * Import results
 */
export interface ImportResults {
  total: number;
  success: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

/**
 * Import error
 */
export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: unknown;
}

/**
 * Import warning
 */
export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
  value?: unknown;
}

/**
 * Import status enumeration
 */
export type ImportStatus =
  | 'pending'
  | 'validating'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ============================================================================
// ANALYTICS SPECIFIC TYPES
// ============================================================================

/**
 * Analytics metric definition
 */
export interface AnalyticsMetric {
  id: string;
  name: string;
  description?: string;
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'percentage';
  field?: string;
  filter?: Record<string, any>;
  format: MetricFormat;
}

/**
 * Metric formatting configuration
 */
export interface MetricFormat {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  currency?: string;
  locale?: string;
}

/**
 * Chart configuration for widgets
 */
export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options: ChartOptions;
  theme?: string;
}

/**
 * Chart data structure
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Chart dataset configuration
 */
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean;
  [key: string]: unknown;
}

/**
 * Chart options configuration
 */
export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: Record<string, any>;
  scales?: Record<string, any>;
  [key: string]: unknown;
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Analytics query result
 */
export interface AnalyticsQueryResult {
  data: unknown[];
  metadata: {
    total: number;
    executionTime: number;
    query: string;
    parameters?: Record<string, any>;
  };
}

/**
 * Dashboard template configuration
 */
export interface DashboardTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  thumbnail?: string;
  is_default: boolean;
}

/**
 * Report template configuration
 */
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  data_source: ReportDataSource;
  query: ReportQuery;
  format: ReportFormat;
  is_default: boolean;
}

// ============================================================================
// PERFORMANCE AND MONITORING TYPES
// ============================================================================

/**
 * Performance metrics for analytics operations
 */
export interface PerformanceMetrics {
  queryTime: number;
  renderTime: number;
  dataSize: number;
  cacheHit: boolean;
  timestamp: string;
}

/**
 * Error tracking for analytics
 */
export interface AnalyticsError {
  id: string;
  type: 'query' | 'render' | 'network' | 'permission' | 'validation';
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Audit log entry for analytics
 */
export interface AnalyticsAuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  organizationId: string;
  timestamp: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Type guard for dashboard
 */
export const isDashboard = (obj: unknown): obj is Dashboard => {
  return obj && typeof obj === 'object' && 'layout' in obj && 'widgets' in obj;
};

/**
 * Type guard for report
 */
export const isReport = (obj: unknown): obj is Report => {
  return obj && typeof obj === 'object' && 'data_source' in obj && 'query' in obj;
};

/**
 * Type guard for export job
 */
export const isExportJob = (obj: unknown): obj is ExportJob => {
  return obj && typeof obj === 'object' && 'data_source' in obj && 'format' in obj;
};

/**
 * Type assertion utility for API responses
 */
export const assertAnalyticsEntity = <T>(
  obj: unknown,
  typeGuard: (obj: unknown) => obj is T,
  entityName: string
): T => {
  if (!typeGuard(obj)) {
    throw new Error(`Invalid ${entityName} object: ${JSON.stringify(obj)}`);
  }
  return obj;
};

// ============================================================================
// CONSTANTS AND ENUMS
// ============================================================================

/**
 * Default dashboard layouts
 */
export const DEFAULT_DASHBOARD_LAYOUTS = {
  grid: {
    type: 'grid' as const,
    columns: 12,
    gap: '1rem',
    responsive: {
      tablet: { columns: 8, gap: '0.75rem' },
      mobile: { columns: 4, gap: '0.5rem' },
    },
  },
  masonry: {
    type: 'masonry' as const,
    columns: 4,
    gap: '1rem',
    responsive: {
      tablet: { columns: 3, gap: '0.75rem' },
      mobile: { columns: 2, gap: '0.5rem' },
    },
  },
} as const;

/**
 * Supported export formats
 */
export const SUPPORTED_EXPORT_FORMATS = [
  'csv',
  'excel',
  'json',
  'pdf',
  'xml',
] as const;

/**
 * Supported report formats
 */
export const SUPPORTED_REPORT_FORMATS = [
  'pdf',
  'excel',
  'csv',
  'json',
  'html',
] as const;

/**
 * Chart color palettes
 */
export const CHART_COLOR_PALETTES = {
  default: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
  blue: ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB'],
  green: ['#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A'],
} as const;

/**
 * Maximum limits for various operations
 */
export const ANALYTICS_LIMITS = {
  maxWidgetsPerDashboard: 50,
  maxFiltersPerDashboard: 20,
  maxExportsPerUser: 100,
  maxReportsPerUser: 50,
  maxQueryExecutionTime: 30000, // 30 seconds
  maxResultRows: 100000,
  maxFileSize: 100 * 1024 * 1024, // 100MB
} as const;

// ============================================================================
// LEGACY TYPE COMPATIBILITY
// ============================================================================

/**
 * Legacy dashboard type for backward compatibility
 * @deprecated Use Dashboard instead
 */
export type LegacyDashboard = Omit<Dashboard, 'permissions'> & {
  permissions?: Partial<DashboardPermissions>;
};

/**
 * Legacy report type for backward compatibility
 * @deprecated Use Report instead
 */
export type LegacyReport = Omit<Report, 'permissions'> & {
  permissions?: Partial<ReportPermissions>;
};

/**
 * Legacy export type for backward compatibility
 * @deprecated Use ExportJob instead
 */
export type LegacyExport = Omit<ExportJob, 'permissions'> & {
  permissions?: Partial<ExportPermissions>;
};
