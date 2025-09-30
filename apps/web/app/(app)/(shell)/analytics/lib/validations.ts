/**
 * Analytics Input Validations
 *
 * Enterprise-grade input validation schemas for GHXSTSHIP Analytics module.
 * Uses Zod for comprehensive validation with custom error messages and sanitization.
 *
 * @version 1.0.0
 * @enterprise-compliance ZERO_TOLERANCE
 * @audit-status COMPLIANT
 */

import { z } from 'zod';
import type {
  CreateDashboardSchema,
  CreateReportSchema,
  CreateExportSchema,
  DashboardLayout,
  WidgetConfig,
  ReportFormat,
  ExportFormat,
} from '../types';

// ============================================================================
// BASE VALIDATION SCHEMAS
// ============================================================================

/**
 * Organization ID validation
 */
const organizationIdSchema = z.string().uuid('Invalid organization ID format');

/**
 * User ID validation
 */
const userIdSchema = z.string().uuid('Invalid user ID format');

/**
 * Name validation (common for entities)
 */
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(255, 'Name must be less than 255 characters')
  .trim();

/**
 * Description validation
 */
const descriptionSchema = z
  .string()
  .max(1000, 'Description must be less than 1000 characters')
  .optional();

// ============================================================================
// DASHBOARD VALIDATION SCHEMAS
// ============================================================================

/**
 * Dashboard layout validation
 */
const dashboardLayoutSchema: z.ZodType<DashboardLayout> = z.object({
  type: z.enum(['grid', 'masonry', 'flex', 'tabs', 'accordion', 'sidebar', 'fullscreen']),
  columns: z.number().int().min(1).max(12),
  gap: z.string().regex(/^[\d.]+(px|rem|em)$/, 'Gap must be a valid CSS unit'),
  responsive: z.record(z.string(), z.object({
    type: z.enum(['grid', 'masonry', 'flex', 'tabs', 'accordion', 'sidebar', 'fullscreen']).optional(),
    columns: z.number().int().min(1).max(12).optional(),
    gap: z.string().regex(/^[\d.]+(px|rem|em)$/, 'Gap must be a valid CSS unit').optional(),
  }).optional()).optional(),
});

/**
 * Widget configuration validation
 */
const widgetConfigSchema: z.ZodType<WidgetConfig> = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  showHeader: z.boolean(),
  showBorder: z.boolean(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
}).catchall(z.any()); // Allow additional config properties

/**
 * Dashboard widget validation
 */
const dashboardWidgetSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['metric', 'chart', 'table', 'activity', 'content', 'integration', 'navigation', 'custom']),
  position: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    width: z.number().int().min(1),
    height: z.number().int().min(1),
  }),
  size: z.object({
    minWidth: z.number().int().min(1),
    minHeight: z.number().int().min(1),
    maxWidth: z.number().int().positive().optional(),
    maxHeight: z.number().int().positive().optional(),
  }),
  config: widgetConfigSchema,
  data_source: z.object({
    type: z.enum(['query', 'api', 'realtime', 'static']),
    endpoint: z.string().url().optional(),
    query: z.string().optional(),
    parameters: z.record(z.any()).optional(),
    realtime: z.boolean().optional(),
  }),
  refresh_interval: z.number().int().min(5000).max(300000).optional(), // 5s to 5min
  permissions: z.object({
    view: z.array(z.string()),
    edit: z.array(z.string()),
    delete: z.array(z.string()),
  }),
});

/**
 * Dashboard permissions validation
 */
const dashboardPermissionsSchema = z.object({
  view: z.array(z.string()),
  edit: z.array(z.string()),
  delete: z.array(z.string()),
  share: z.array(z.string()),
});

/**
 * Dashboard filter validation
 */
const dashboardFilterSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['date', 'select', 'multiselect', 'range', 'text', 'boolean']),
  field: z.string().min(1),
  label: z.string().min(1),
  defaultValue: z.any().optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.any(),
    group: z.string().optional(),
  })).optional(),
  required: z.boolean(),
  persistent: z.boolean(),
});

/**
 * Create dashboard validation schema
 */
export const createDashboardSchema: z.ZodType<CreateDashboardSchema> = z.object({
  name: nameSchema,
  description: descriptionSchema,
  layout: dashboardLayoutSchema,
  widgets: z.array(dashboardWidgetSchema).max(50, 'Maximum 50 widgets per dashboard'),
  filters: z.array(dashboardFilterSchema).max(20, 'Maximum 20 filters per dashboard'),
  is_template: z.boolean(),
  is_public: z.boolean(),
});

// ============================================================================
// REPORT VALIDATION SCHEMAS
// ============================================================================

/**
 * Report data source validation
 */
const reportDataSourceSchema = z.object({
  type: z.enum(['database', 'api', 'file', 'integration']),
  connection: z.string().min(1),
  schema: z.string().optional(),
  table: z.string().optional(),
  query: z.string().optional(),
  parameters: z.record(z.any()).optional(),
});

/**
 * Report condition validation
 */
const reportConditionSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    field: z.string().min(1),
    operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like', 'ilike']),
    value: z.any(),
    and: z.array(reportConditionSchema).optional(),
    or: z.array(reportConditionSchema).optional(),
  })
);

/**
 * Report query validation
 */
const reportQuerySchema = z.object({
  select: z.array(z.string()).min(1, 'At least one field must be selected'),
  from: z.string().min(1),
  where: z.array(reportConditionSchema).optional(),
  groupBy: z.array(z.string()).optional(),
  orderBy: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  })).optional(),
  limit: z.number().int().min(1).max(10000).optional(),
  joins: z.array(z.object({
    type: z.enum(['inner', 'left', 'right', 'full']),
    table: z.string(),
    on: reportConditionSchema,
  })).optional(),
});

/**
 * Report schedule validation
 */
const reportScheduleSchema = z.object({
  frequency: z.enum(['once', 'hourly', 'daily', 'weekly', 'monthly']),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  dayOfWeek: z.number().int().min(0).max(6).optional(), // 0-6, Sunday = 0
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  timezone: z.string().min(1), // IANA timezone
  enabled: z.boolean(),
});

/**
 * Report format validation
 */
const reportFormatSchema: z.ZodType<ReportFormat> = z.object({
  type: z.enum(['pdf', 'excel', 'csv', 'json', 'html']),
  options: z.record(z.any()).optional(),
});

/**
 * Report permissions validation
 */
const reportPermissionsSchema = z.object({
  view: z.array(z.string()),
  edit: z.array(z.string()),
  delete: z.array(z.string()),
  run: z.array(z.string()),
  schedule: z.array(z.string()),
});

/**
 * Create report validation schema
 */
export const createReportSchema: z.ZodType<CreateReportSchema> = z.object({
  name: nameSchema,
  description: descriptionSchema,
  data_source: reportDataSourceSchema,
  query: reportQuerySchema,
  schedule: reportScheduleSchema.optional(),
  format: reportFormatSchema,
  recipients: z.array(z.string().email('Invalid email format')).max(50).optional(),
  is_active: z.boolean(),
});

// ============================================================================
// EXPORT VALIDATION SCHEMAS
// ============================================================================

/**
 * Export data source validation
 */
const exportDataSourceSchema = z.object({
  type: z.enum(['query', 'table', 'view', 'report']),
  source: z.string().min(1),
  parameters: z.record(z.any()).optional(),
});

/**
 * Export filter validation
 */
const exportFilterSchema = z.object({
  field: z.string().min(1),
  operator: z.string().min(1),
  value: z.any(),
});

/**
 * Export schedule validation
 */
const exportScheduleSchema = z.object({
  frequency: z.enum(['once', 'hourly', 'daily', 'weekly', 'monthly']),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  timezone: z.string().min(1),
  enabled: z.boolean(),
});

/**
 * Export format validation
 */
const exportFormatSchema: z.ZodType<ExportFormat> = z.object({
  type: z.enum(['csv', 'excel', 'json', 'pdf', 'xml']),
  options: z.object({
    delimiter: z.string().max(1).optional(),
    includeHeaders: z.boolean().optional(),
    compression: z.boolean().optional(),
  }).catchall(z.any()).optional(),
});

/**
 * Export permissions validation
 */
const exportPermissionsSchema = z.object({
  view: z.array(z.string()),
  create: z.array(z.string()),
  delete: z.array(z.string()),
  download: z.array(z.string()),
});

/**
 * Create export validation schema
 */
export const createExportSchema: z.ZodType<CreateExportSchema> = z.object({
  name: nameSchema,
  description: descriptionSchema,
  data_source: exportDataSourceSchema,
  format: exportFormatSchema,
  filters: z.array(exportFilterSchema).max(10, 'Maximum 10 filters per export'),
  schedule: exportScheduleSchema.optional(),
});

// ============================================================================
// API REQUEST VALIDATION SCHEMAS
// ============================================================================

/**
 * Pagination parameters validation
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Dashboard list filters
 */
export const dashboardFiltersSchema = paginationSchema.extend({
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  createdBy: userIdSchema.optional(),
});

/**
 * Report list filters
 */
export const reportFiltersSchema = paginationSchema.extend({
  isActive: z.boolean().optional(),
  format: z.enum(['pdf', 'excel', 'csv', 'json', 'html']).optional(),
  createdBy: userIdSchema.optional(),
});

/**
 * Export list filters
 */
export const exportFiltersSchema = paginationSchema.extend({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
  format: z.enum(['csv', 'excel', 'json', 'pdf', 'xml']).optional(),
  createdBy: userIdSchema.optional(),
});

// ============================================================================
// BULK OPERATION VALIDATIONS
// ============================================================================

/**
 * Bulk operation validation
 */
export const bulkOperationSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one item must be selected').max(100, 'Maximum 100 items per bulk operation'),
  operation: z.enum(['delete', 'update', 'duplicate', 'export']),
  data: z.record(z.any()).optional(),
});

/**
 * Bulk update validation
 */
export const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  updates: z.record(z.any()),
});

// ============================================================================
// ANALYTICS QUERY VALIDATIONS
// ============================================================================

/**
 * Analytics query validation
 */
export const analyticsQuerySchema = z.object({
  select: z.array(z.string()).min(1),
  from: z.string().min(1),
  where: z.array(reportConditionSchema).optional(),
  groupBy: z.array(z.string()).optional(),
  orderBy: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  })).optional(),
  limit: z.number().int().min(1).max(10000).default(1000),
  parameters: z.record(z.any()).optional(),
});

/**
 * Time series query validation
 */
export const timeSeriesQuerySchema = z.object({
  metric: z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['count', 'sum', 'avg', 'min', 'max', 'percentage']),
    field: z.string().optional(),
    filter: z.record(z.any()).optional(),
    format: z.object({
      prefix: z.string().optional(),
      suffix: z.string().optional(),
      decimals: z.number().int().min(0).max(10).optional(),
      currency: z.string().optional(),
      locale: z.string().optional(),
    }),
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/),
  interval: z.enum(['hour', 'day', 'week', 'month']),
  filters: z.record(z.any()).optional(),
});

// ============================================================================
// CUSTOM VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate dashboard layout compatibility
 */
export const validateDashboardLayout = (layout: DashboardLayout): boolean => {
  // Ensure responsive breakpoints are valid
  if (layout.responsive) {
    const breakpoints = Object.keys(layout.responsive);
    for (const breakpoint of breakpoints) {
      if (!['tablet', 'mobile', 'desktop'].includes(breakpoint)) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Validate report query for SQL injection
 */
export const validateReportQuery = (query: unknown): boolean => {
  // Basic SQL injection prevention
  const dangerousPatterns = [
    /(\bUNION\b|\bDROP\b|\bDELETE\b|\bUPDATE\b|\bINSERT\b)/i,
    /(-{2}|\/\*|\*\/)/, // Comments
    /('|(\\x27)|(\\x2D))/, // Quotes and dashes
  ];

  const queryString = JSON.stringify(query);
  return !dangerousPatterns.some(pattern => pattern.test(queryString));
};

/**
 * Validate export file size limits
 */
export const validateExportSize = (rowCount: number, format: string): boolean => {
  const limits = {
    csv: 100000,
    excel: 50000,
    json: 100000,
    pdf: 10000,
    xml: 50000,
  };

  const limit = limits[format as keyof typeof limits];
  return rowCount <= limit;
};

/**
 * Sanitize input strings
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end && end <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Max 1 year in future
};

// ============================================================================
// VALIDATION ERROR HANDLING
// ============================================================================

/**
 * Format validation errors for API responses
 */
export const formatValidationErrors = (errors: z.ZodError): Record<string, string[]> => {
  const formatted: Record<string, string[]> = {};

  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  });

  return formatted;
};

/**
 * Validate and parse data with custom error handling
 */
export const validateAndParse = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = formatValidationErrors(error);
      console.warn(`Validation failed for ${context || 'unknown'}:`, errors);
      return { success: false, errors };
    }
    throw error;
  }
};

// ============================================================================
// EXPORT VALIDATION SCHEMAS
// ============================================================================

export const AnalyticsValidations = {
  createDashboard: createDashboardSchema,
  createReport: createReportSchema,
  createExport: createExportSchema,
  pagination: paginationSchema,
  dashboardFilters: dashboardFiltersSchema,
  reportFilters: reportFiltersSchema,
  exportFilters: exportFiltersSchema,
  bulkOperation: bulkOperationSchema,
  bulkUpdate: bulkUpdateSchema,
  analyticsQuery: analyticsQuerySchema,
  timeSeriesQuery: timeSeriesQuerySchema,
  // Custom validators
  validateDashboardLayout,
  validateReportQuery,
  validateExportSize,
  validateDateRange,
  sanitizeString,
  validateAndParse,
  formatValidationErrors,
} as const;
