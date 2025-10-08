import { z } from 'zod';

// Common validation schemas and utilities for API routes
// Provides comprehensive input sanitization and validation

// Base schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const emailSchema = z.string().email('Invalid email format').toLowerCase();
export const urlSchema = z.string().url('Invalid URL format');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// Date and time schemas
export const isoDateSchema = z.string().datetime('Invalid ISO date format');
export const dateSchema = z.date();
export const timestampSchema = z.number().int().positive('Invalid timestamp');

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

// Sorting schemas
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');
export const commonSortFields = ['created_at', 'updated_at', 'name', 'id'] as const;

// Search and filter schemas
export const searchSchema = z.string().min(1).max(255);
export const filterBooleanSchema = z.coerce.boolean().optional();

// Organization and user context schemas
export const organizationIdSchema = uuidSchema;
export const userIdSchema = uuidSchema;

// Money and currency schemas
export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).default('USD');
export const amountSchema = z.number().min(0).max(999999999.99);

// Status enums (common patterns)
export const activeStatusSchema = z.enum(['active', 'inactive']).default('active');
export const workflowStatusSchema = z.enum(['draft', 'pending', 'approved', 'rejected', 'completed']);
export const visibilitySchema = z.enum(['public', 'private', 'organization']).default('organization');

// File upload schemas
export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  size: z.number().int().min(0).max(50 * 1024 * 1024), // 50MB max
  url: urlSchema.optional()
});

// Address schemas
export const addressSchema = z.object({
  street: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional()
}).optional();

// Contact schemas
export const contactSchema = z.object({
  name: z.string().min(1).max(255),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  role: z.string().max(100).optional()
});

// Audit and logging schemas
export const auditLogSchema = z.object({
  action: z.string().min(1).max(100),
  resourceType: z.string().min(1).max(50),
  resourceId: uuidSchema.optional(),
  details: z.record(z.unknown()).optional(),
  occurredAt: isoDateSchema.optional()
});

// Common CRUD operation schemas
export const createOperationSchema = z.object({
  createdBy: userIdSchema.optional(),
  createdAt: isoDateSchema.optional()
});

export const updateOperationSchema = z.object({
  updatedBy: userIdSchema.optional(),
  updatedAt: isoDateSchema.optional()
});

// Query parameter validation
export const queryParamsSchema = z.object({
  search: searchSchema.optional(),
  filter: z.record(z.unknown()).optional(),
  sortBy: z.enum(commonSortFields).optional(),
  sortOrder: sortOrderSchema.optional()
}).merge(paginationSchema);

// Bulk operation schemas
export const bulkOperationSchema = z.object({
  operation: z.enum(['create', 'update', 'delete', 'activate', 'deactivate']),
  ids: z.array(uuidSchema).min(1).max(1000),
  data: z.record(z.unknown()).optional()
});

// Export schemas
export const exportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx', 'pdf']).default('csv'),
  fields: z.array(z.string()).optional(),
  filters: z.record(z.unknown()).optional(),
  includeHeaders: z.boolean().default(true)
});

// Import schemas
export const importSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  data: z.array(z.record(z.unknown())),
  updateExisting: z.boolean().default(false),
  validateOnly: z.boolean().default(false)
});

// API response schemas
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema,
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number()
  }).optional(),
  meta: z.record(z.unknown()).optional()
});

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
  field: z.string().optional()
});

// Validation result helpers
export function createValidationErrorResponse(errors: z.ZodError['errors']) {
  return {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: errors
  };
}

export function createSuccessResponse<T>(data: T, meta?: Record<string, unknown>) {
  return {
    data,
    ...(meta && { meta })
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// Input sanitization helpers
export function sanitizeString(input: string): string {
  // Remove null bytes and control characters
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a proper HTML sanitizer
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeFilename(filename: string): string {
  // Remove path traversal and dangerous characters
  return filename
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\.\./g, '_')
    .substring(0, 255);
}

// Validation middleware helpers
export function validateRequestBody<T extends z.ZodType>(
  schema: T
) {
  return async (request: Request): Promise<z.infer<T>> => {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createValidationErrorResponse(error.errors);
      }
      throw { error: 'Invalid JSON', code: 'INVALID_JSON' };
    }
  };
}

export function validateQueryParams<T extends z.ZodType>(
  schema: T
) {
  return (url: URL): z.infer<T> => {
    try {
      const params = Object.fromEntries(url.searchParams.entries());
      return schema.parse(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createValidationErrorResponse(error.errors);
      }
      throw { error: 'Invalid query parameters', code: 'INVALID_QUERY' };
    }
  };
}

// Rate limiting schemas (for future use)
export const rateLimitSchema = z.object({
  identifier: z.string().min(1).max(255),
  endpoint: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(10000).default(100),
  windowMs: z.number().int().min(1000).max(86400000).default(60000), // 1 minute default
});

// Feature flag schemas
export const featureFlagSchema = z.object({
  name: z.string().min(1).max(100),
  enabled: z.boolean().default(false),
  organizationId: organizationIdSchema.optional(),
  percentage: z.number().min(0).max(100).optional(),
  conditions: z.record(z.unknown()).optional()
});

// Comprehensive validation for common entities

// User validation
export const userProfileSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  fullName: z.string().min(1).max(255),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: z.string().optional(),
  avatarUrl: urlSchema.optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  isActive: z.boolean().default(true)
});

// Organization validation
export const organizationSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  description: z.string().max(1000).optional(),
  website: urlSchema.optional(),
  logoUrl: urlSchema.optional(),
  industry: z.string().max(100).optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().default(true)
});

// Project validation
export const projectSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  budget: amountSchema.optional(),
  currency: currencySchema,
  progress: z.number().min(0).max(100).default(0)
});

// Company validation
export const companySchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  industry: z.string().min(1).max(100),
  website: urlSchema.optional().or(z.literal('')),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'blacklisted']).default('active'),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  logoUrl: urlSchema.optional().or(z.literal('')),
  notes: z.string().optional()
});

// Finance validation
export const financeTransactionSchema = z.object({
  id: uuidSchema,
  amount: amountSchema,
  currency: currencySchema,
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  date: dateSchema,
  status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
  reference: z.string().max(255).optional()
});

// Programming/Event validation
export const eventSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  type: z.enum(['performance', 'activation', 'workshop', 'meeting', 'rehearsal', 'setup', 'breakdown', 'other']),
  status: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']).default('draft'),
  startTime: dateSchema,
  endTime: dateSchema,
  venue: z.string().max(255).optional(),
  capacity: z.number().int().min(0).optional(),
  isPublic: z.boolean().default(false),
  streamingUrl: urlSchema.optional(),
  budget: amountSchema.optional()
});

// Assets validation
export const assetSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  type: z.enum(['equipment', 'vehicle', 'software', 'facility', 'other']),
  category: z.string().min(1).max(100),
  status: z.enum(['active', 'maintenance', 'retired', 'lost']).default('active'),
  serialNumber: z.string().max(255).optional(),
  purchaseDate: dateSchema.optional(),
  purchasePrice: amountSchema.optional(),
  location: z.string().max(255).optional(),
  assignedTo: uuidSchema.optional()
});

// Jobs validation
export const jobSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  type: z.enum(['full_time', 'part_time', 'contract', 'freelance']),
  status: z.enum(['draft', 'open', 'in_progress', 'filled', 'cancelled']).default('draft'),
  department: z.string().max(100).optional(),
  location: z.string().max(255).optional(),
  salaryMin: amountSchema.optional(),
  salaryMax: amountSchema.optional(),
  currency: currencySchema,
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([])
});

// People validation
export const personSchema = z.object({
  id: uuidSchema,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: emailSchema,
  phone: phoneSchema.optional(),
  title: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
  managerId: uuidSchema.optional(),
  hireDate: dateSchema.optional(),
  status: z.enum(['active', 'inactive', 'terminated']).default('active'),
  avatarUrl: urlSchema.optional()
});

// Procurement validation
export const procurementSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  type: z.enum(['goods', 'services', 'software', 'equipment']),
  status: z.enum(['draft', 'pending_approval', 'approved', 'ordered', 'received', 'cancelled']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  vendorId: uuidSchema.optional(),
  requesterId: uuidSchema,
  approverId: uuidSchema.optional(),
  estimatedCost: amountSchema.optional(),
  actualCost: amountSchema.optional(),
  currency: currencySchema,
  requiredDate: dateSchema.optional()
});

// Analytics validation
export const analyticsSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  type: z.enum(['dashboard', 'report', 'export', 'alert']),
  status: z.enum(['active', 'inactive', 'error']).default('active'),
  config: z.record(z.unknown()),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    timezone: z.string().default('UTC')
  }).optional(),
  lastRun: dateSchema.optional(),
  nextRun: dateSchema.optional()
});

// Files/Resources validation
export const fileSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  type: z.enum(['document', 'image', 'video', 'audio', 'archive', 'other']),
  category: z.string().max(100).optional(),
  size: z.number().int().min(0),
  mimeType: z.string().max(100),
  url: urlSchema,
  thumbnailUrl: urlSchema.optional(),
  tags: z.array(z.string()).default([]),
  visibility: visibilitySchema,
  uploadedBy: userIdSchema
});

// Settings validation
export const settingsSchema = z.object({
  id: uuidSchema,
  category: z.string().min(1).max(100),
  key: z.string().min(1).max(255),
  value: z.unknown(), // Settings can be any type
  type: z.enum(['string', 'number', 'boolean', 'json', 'array']).default('string'),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  updatedBy: userIdSchema
});

// Dashboard validation
export const dashboardSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  type: z.enum(['system', 'custom', 'template']).default('custom'),
  layout: z.array(z.unknown()).default([]),
  settings: z.record(z.unknown()).default({}),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  createdBy: userIdSchema
});

// Profile validation
export const profileSchema = z.object({
  id: uuidSchema,
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.object({
    name: z.string().min(1).max(255),
    issuer: z.string().min(1).max(255),
    dateIssued: dateSchema,
    expiryDate: dateSchema.optional(),
    credentialId: z.string().max(255).optional(),
    url: urlSchema.optional()
  })).default([]),
  experience: z.array(z.object({
    title: z.string().min(1).max(255),
    company: z.string().min(1).max(255),
    startDate: dateSchema,
    endDate: dateSchema.optional(),
    description: z.string().max(1000).optional(),
    isCurrent: z.boolean().default(false)
  })).default([]),
  socialLinks: z.record(urlSchema).optional(),
  preferences: z.record(z.unknown()).default({})
});

// Pipeline validation
export const pipelineSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  type: z.enum(['sales', 'recruiting', 'projects', 'custom']).default('sales'),
  stages: z.array(z.object({
    id: uuidSchema,
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    order: z.number().int().min(0),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(), // Hex color
    isWon: z.boolean().default(false),
    isLost: z.boolean().default(false)
  })),
  isActive: z.boolean().default(true),
  createdBy: userIdSchema
});

// Export the validation schemas
export const validationSchemas = {
  // Base schemas
  uuid: uuidSchema,
  email: emailSchema,
  url: urlSchema,
  phone: phoneSchema,
  isoDate: isoDateSchema,
  date: dateSchema,
  timestamp: timestampSchema,
  currency: currencySchema,
  amount: amountSchema,

  // Common schemas
  pagination: paginationSchema,
  search: searchSchema,
  organizationId: organizationIdSchema,
  userId: userIdSchema,

  // Entity schemas
  userProfile: userProfileSchema,
  organization: organizationSchema,
  project: projectSchema,
  company: companySchema,
  financeTransaction: financeTransactionSchema,
  event: eventSchema,
  asset: assetSchema,
  job: jobSchema,
  person: personSchema,
  procurement: procurementSchema,
  analytics: analyticsSchema,
  file: fileSchema,
  settings: settingsSchema,
  dashboard: dashboardSchema,
  profile: profileSchema,
  pipeline: pipelineSchema,

  // Operation schemas
  createOperation: createOperationSchema,
  updateOperation: updateOperationSchema,
  queryParams: queryParamsSchema,
  bulkOperation: bulkOperationSchema,
  export: exportSchema,
  import: importSchema,

  // Response schemas
  apiResponse: apiResponseSchema,
  errorResponse: errorResponseSchema
};
