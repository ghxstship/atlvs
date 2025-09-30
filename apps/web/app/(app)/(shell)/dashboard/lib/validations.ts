/**
 * Dashboard Module Validation Schemas
 * Enterprise-grade input validation using Zod
 * Comprehensive validation with sanitization, transformation, and error handling
 */

import { z } from 'zod';

// Base validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, 'URL must use HTTP or HTTPS protocol');

export const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-1](\.\d+)?\s*\)$|^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$|^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[0-1](\.\d+)?\s*\)$/, 'Invalid color format');

export const slugSchema = z
  .string()
  .min(1, 'Slug cannot be empty')
  .max(100, 'Slug too long')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .transform((slug) => slug.toLowerCase().trim());

// Dashboard validation schemas
export const dashboardLayoutSchema = z.enum([
  'grid',
  'masonry',
  'flex',
  'tabs',
  'accordion',
  'sidebar',
  'fullscreen'
]);

export const accessLevelSchema = z.enum([
  'private',
  'team',
  'organization',
  'public'
]);

export const widgetTypeSchema = z.enum([
  // Metrics & KPIs
  'metric',
  'comparison_metric',
  'progress_metric',
  'kpi_card',
  'gauge',

  // Charts & Visualizations
  'bar_chart',
  'column_chart',
  'line_chart',
  'area_chart',
  'pie_chart',
  'donut_chart',
  'scatter_plot',
  'heatmap',
  'funnel_chart',
  'waterfall_chart',

  // Tables & Lists
  'data_table',
  'pivot_table',
  'activity_feed',
  'task_list',
  'leaderboard',

  // Content & Communication
  'text_block',
  'rich_text',
  'announcement',
  'notes',
  'image',
  'video',
  'iframe',

  // Integration & External
  'calendar',
  'weather',
  'clock',
  'countdown',
  'social_feed',
  'custom_html',
  'api_widget',

  // Navigation & Layout
  'quick_actions',
  'navigation_menu',
  'breadcrumb',
  'filter_bar',
  'search_box',
  'spacer',
  'divider'
]);

export const chartTypeSchema = z.enum([
  'bar',
  'column',
  'line',
  'area',
  'pie',
  'donut',
  'scatter',
  'bubble',
  'radar',
  'polar',
  'treemap',
  'sunburst',
  'sankey',
  'gauge',
  'funnel',
  'waterfall',
  'heatmap',
  'candlestick'
]);

export const dataSourceSchema = z.enum([
  'dashboard',
  'projects',
  'tasks',
  'people',
  'companies',
  'finance',
  'jobs',
  'procurement',
  'programming',
  'assets',
  'analytics',
  'files',
  'settings',
  'profile',
  'custom_query',
  'external_api'
]);

export const refreshIntervalSchema = z.enum([
  'real_time',
  '30_seconds',
  '1_minute',
  '5_minutes',
  '15_minutes',
  '30_minutes',
  '1_hour',
  '6_hours',
  '12_hours',
  '24_hours',
  'manual'
]);

// Widget position validation
export const widgetPositionSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1).max(12),
  minW: z.number().int().min(1).optional(),
  minH: z.number().int().min(1).optional(),
  maxW: z.number().int().min(1).optional(),
  maxH: z.number().int().min(1).optional(),
  static: z.boolean().optional(),
  isDraggable: z.boolean().optional(),
  isResizable: z.boolean().optional()
});

// Widget configuration validation
export const widgetConfigSchema = z.object({
  // Data Configuration
  dataSource: dataSourceSchema.optional(),
  query: z.string().optional(),
  filters: z.record(z.unknown()).optional(),
  groupBy: z.array(z.string()).optional(),
  sortBy: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  })).optional(),
  limit: z.number().int().min(1).max(10000).optional(),

  // Chart Configuration
  chartType: chartTypeSchema.optional(),
  xAxis: z.string().optional(),
  yAxis: z.union([z.string(), z.array(z.string())]).optional(),
  series: z.array(z.string()).optional(),
  colors: z.array(colorSchema).optional(),

  // Display Configuration
  title: z.string().max(200).optional(),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(1000).optional(),
  showLegend: z.boolean().optional(),
  showTooltip: z.boolean().optional(),
  showDataLabels: z.boolean().optional(),

  // Formatting
  numberFormat: z.string().optional(),
  dateFormat: z.string().optional(),
  currencyFormat: z.string().optional(),

  // Interaction
  clickAction: z.enum(['none', 'drill_down', 'navigate', 'modal', 'custom']).optional(),
  clickTarget: z.string().optional(),

  // Styling
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  backgroundColor: colorSchema.optional(),
  textColor: colorSchema.optional(),
  borderColor: colorSchema.optional(),

  // Content
  content: z.string().optional(),
  html: z.string().optional(),
  markdown: z.string().optional(),

  // External Integration
  url: urlSchema.optional(),
  apiEndpoint: urlSchema.optional(),
  embedCode: z.string().optional(),

  // Metric-specific
  value: z.union([z.number(), z.string()]).optional(),
  format: z.enum(['number', 'currency', 'percentage', 'duration', 'text']).optional(),
  change: z.number().optional(),
  change_type: z.enum(['increase', 'decrease', 'neutral']).optional(),
  target: z.number().optional(),
  status: z.enum(['good', 'warning', 'critical']).optional(),
  previous_value: z.union([z.number(), z.string()]).optional(),

  // Conditional Formatting
  conditionalFormatting: z.array(z.object({
    field: z.string(),
    condition: z.enum(['gt', 'lt', 'eq', 'ne', 'gte', 'lte', 'contains', 'starts_with', 'ends_with']),
    value: z.unknown(),
    style: z.record(z.unknown())
  })).optional()
}).strict();

// Dashboard widget validation
export const dashboardWidgetSchema = z.object({
  id: uuidSchema,
  dashboard_id: uuidSchema,
  type: widgetTypeSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional(),
  config: widgetConfigSchema,
  position: widgetPositionSchema,
  refresh_interval: refreshIntervalSchema,
  is_visible: z.boolean(),
  organization_id: uuidSchema,
  created_by: uuidSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// Dashboard validation
export const dashboardSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  description: z.string().max(500).optional(),
  slug: slugSchema.optional(),
  layout: dashboardLayoutSchema,
  layout_config: z.record(z.unknown()),
  is_default: z.boolean(),
  is_template: z.boolean(),
  access_level: accessLevelSchema,
  allowed_users: z.array(uuidSchema).optional(),
  allowed_roles: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  organization_id: uuidSchema,
  created_by: uuidSchema,
  widgets: z.array(dashboardWidgetSchema).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// Create/Update schemas (without server-generated fields)
export const createDashboardSchema = dashboardSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  widgets: true
});

export const updateDashboardSchema = dashboardSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    organization_id: true,
    created_by: true,
    widgets: true
  })
  .partial();

// Widget schemas
export const createWidgetSchema = dashboardWidgetSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const updateWidgetSchema = dashboardWidgetSchema
  .omit({
    id: true,
    dashboard_id: true,
    organization_id: true,
    created_by: true,
    created_at: true,
    updated_at: true
  })
  .partial();

// Filter validation schemas
export const filterTypeSchema = z.enum([
  'date_range',
  'select',
  'multi_select',
  'text',
  'number',
  'boolean'
]);

export const filterOperatorSchema = z.enum([
  'eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'in', 'not_in',
  'contains', 'starts_with', 'ends_with'
]);

export const dashboardFilterSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, 'Filter name is required').max(100, 'Name too long'),
  type: filterTypeSchema,
  field: z.string().min(1, 'Field is required'),
  value: z.unknown(),
  operator: filterOperatorSchema.optional(),
  is_global: z.boolean(),
  widget_ids: z.array(uuidSchema).optional()
});

export const createFilterSchema = dashboardFilterSchema.omit({ id: true });
export const updateFilterSchema = dashboardFilterSchema.omit({ id: true }).partial();

// Export validation schemas
export const exportFormatSchema = z.enum([
  'pdf', 'png', 'jpeg', 'excel', 'csv', 'json'
]);

export const dashboardExportSchema = z.object({
  format: exportFormatSchema,
  options: z.object({
    include_data: z.boolean().optional(),
    include_images: z.boolean().optional(),
    page_size: z.enum(['A4', 'A3', 'letter', 'legal']).optional(),
    orientation: z.enum(['portrait', 'landscape']).optional(),
    quality: z.enum(['low', 'medium', 'high']).optional()
  }).optional()
});

// Bulk operation schemas
export const bulkWidgetUpdateSchema = z.object({
  updates: z.array(z.object({
    id: uuidSchema,
    updates: updateWidgetSchema
  })).min(1, 'At least one update required').max(100, 'Too many updates')
});

export const bulkFilterDeleteSchema = z.object({
  filter_ids: z.array(uuidSchema).min(1, 'At least one filter required').max(50, 'Too many filters')
});

// Search and query validation
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(500, 'Query too long'),
  filters: z.record(z.unknown()).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional()
});

// Analytics validation
export const analyticsQuerySchema = z.object({
  modules: z.array(z.string()).min(1, 'At least one module required'),
  date_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  filters: z.record(z.unknown()).optional(),
  group_by: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional()
});

// Sanitization utilities
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
};

export const sanitizeMarkdown = (markdown: string): string => {
  // Basic markdown sanitization
  return markdown
    .replace(/javascript:/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '');
};

// Custom validation functions
export const validateWidgetPosition = (position: unknown): boolean => {
  try {
    widgetPositionSchema.parse(position);
    return true;
  } catch {
    return false;
  }
};

export const validateWidgetConfig = (config: unknown, widgetType: string): boolean => {
  try {
    // Type-specific validation could be added here
    widgetConfigSchema.parse(config);
    return true;
  } catch {
    return false;
  }
};

export const validateDashboardLayout = (layout: string, config: unknown): boolean => {
  try {
    dashboardLayoutSchema.parse(layout);
    // Layout-specific validation could be added here
    return true;
  } catch {
    return false;
  }
};

// Export all schemas
export const schemas = {
  // Dashboard schemas
  dashboard: dashboardSchema,
  createDashboard: createDashboardSchema,
  updateDashboard: updateDashboardSchema,

  // Widget schemas
  widget: dashboardWidgetSchema,
  createWidget: createWidgetSchema,
  updateWidget: updateWidgetSchema,

  // Filter schemas
  filter: dashboardFilterSchema,
  createFilter: createFilterSchema,
  updateFilter: updateFilterSchema,

  // Export schemas
  export: dashboardExportSchema,

  // Bulk operation schemas
  bulkWidgetUpdate: bulkWidgetUpdateSchema,
  bulkFilterDelete: bulkFilterDeleteSchema,

  // Search and analytics schemas
  search: searchQuerySchema,
  analytics: analyticsQuerySchema
};
