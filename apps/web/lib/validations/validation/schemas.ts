import { z } from 'zod';

// Common validation schemas and utilities for API routes

// Sanitization functions
export const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeURL = (url: string): string => {
  return url.replace(/javascript:/gi, '').replace(/data:/gi, '');
};

// Base schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .transform(sanitizeEmail)
  .max(254, 'Email too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .transform(sanitizeString)
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters');

export const descriptionSchema = z
  .string()
  .max(1000, 'Description too long')
  .transform(sanitizeString)
  .optional();

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .transform(sanitizeURL)
  .optional();

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .max(20, 'Phone number too long')
  .optional();

// Date and time schemas
export const dateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
  .transform((date) => new Date(date));

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Invalid ISO date format');

// Numeric schemas
export const positiveNumberSchema = z
  .number()
  .positive('Must be positive')
  .finite('Must be finite');

export const currencySchema = positiveNumberSchema
  .max(999999999.99, 'Amount too large')
  .transform((val) => Math.round(val * 100) / 100); // Round to 2 decimal places

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const searchSchema = z.object({
  q: z.string().max(100).optional(),
  filters: z.record(z.any()).optional()
});

// Common entity schemas
export const organizationSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  slug: z.string().regex(/^[a-z0-9\-]+$/, 'Invalid slug format'),
  description: descriptionSchema,
  website: urlSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: z.object({
    street: z.string().max(200),
    city: z.string().max(100),
    state: z.string().max(100),
    postalCode: z.string().max(20),
    country: z.string().max(100)
  }).optional()
});

export const userSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  fullName: nameSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  avatar: urlSchema,
  role: z.enum(['owner', 'admin', 'manager', 'producer', 'member']),
  status: z.enum(['active', 'inactive', 'pending', 'suspended'])
});

export const membershipSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  organizationId: uuidSchema,
  role: z.enum(['owner', 'admin', 'manager', 'producer', 'member']),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  invitedAt: dateSchema.optional(),
  joinedAt: dateSchema.optional()
});

// Project schemas
export const projectSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  description: descriptionSchema,
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  budget: currencySchema.optional(),
  organizationId: uuidSchema,
  managerId: uuidSchema.optional(),
  parentProjectId: uuidSchema.optional()
});

// Finance schemas
export const transactionSchema = z.object({
  id: uuidSchema,
  amount: currencySchema,
  currency: z.string().length(3, 'Invalid currency code'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().max(100),
  description: descriptionSchema,
  date: dateSchema,
  accountId: uuidSchema,
  projectId: uuidSchema.optional(),
  vendorId: uuidSchema.optional(),
  invoiceId: uuidSchema.optional()
});

export const invoiceSchema = z.object({
  id: uuidSchema,
  number: z.string().max(50),
  amount: currencySchema,
  currency: z.string().length(3, 'Invalid currency code'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  issueDate: dateSchema,
  dueDate: dateSchema,
  paidDate: dateSchema.optional(),
  clientId: uuidSchema,
  projectId: uuidSchema.optional(),
  notes: descriptionSchema
});

// People schemas
export const personSchema = z.object({
  id: uuidSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  role: z.string().max(100),
  department: z.string().max(100).optional(),
  hireDate: dateSchema.optional(),
  salary: currencySchema.optional(),
  status: z.enum(['active', 'inactive', 'terminated', 'on_leave']),
  managerId: uuidSchema.optional(),
  avatar: urlSchema
});

// Company schemas
export const companySchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  type: z.enum(['client', 'vendor', 'partner', 'competitor']),
  industry: z.string().max(100).optional(),
  website: urlSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: z.object({
    street: z.string().max(200),
    city: z.string().max(100),
    state: z.string().max(100),
    postalCode: z.string().max(20),
    country: z.string().max(100)
  }).optional(),
  taxId: z.string().max(50).optional(),
  status: z.enum(['active', 'inactive', 'prospect'])
});

// Procurement schemas
export const procurementOrderSchema = z.object({
  id: uuidSchema,
  orderNumber: z.string().max(50),
  vendorId: uuidSchema,
  status: z.enum(['draft', 'submitted', 'approved', 'ordered', 'received', 'cancelled']),
  totalAmount: currencySchema,
  currency: z.string().length(3, 'Invalid currency code'),
  orderDate: dateSchema,
  requiredDate: dateSchema.optional(),
  approvedDate: dateSchema.optional(),
  receivedDate: dateSchema.optional(),
  projectId: uuidSchema.optional(),
  approverId: uuidSchema.optional(),
  notes: descriptionSchema
});

// Programming schemas
export const eventSchema = z.object({
  id: uuidSchema,
  title: nameSchema,
  description: descriptionSchema,
  type: z.enum(['performance', 'activation', 'workshop', 'meeting', 'rehearsal', 'setup', 'breakdown', 'other']),
  status: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']),
  startTime: dateSchema,
  endTime: dateSchema,
  location: z.string().max(200),
  capacity: z.number().int().min(0).optional(),
  projectId: uuidSchema.optional(),
  budget: currencySchema.optional()
});

// Jobs schemas
export const jobSchema = z.object({
  id: uuidSchema,
  title: nameSchema,
  description: descriptionSchema,
  type: z.enum(['full_time', 'part_time', 'contract', 'freelance']),
  status: z.enum(['open', 'filled', 'cancelled', 'on_hold']),
  department: z.string().max(100),
  location: z.string().max(200),
  salaryMin: currencySchema.optional(),
  salaryMax: currencySchema.optional(),
  postedDate: dateSchema,
  closingDate: dateSchema.optional(),
  hiringManagerId: uuidSchema,
  projectId: uuidSchema.optional()
});

// Validation middleware function
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// API response helpers
export function createValidationErrorResponse(errors: z.ZodError) {
  return {
    success: false,
    error: 'Validation failed',
    details: errors.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  };
}

export function createSuccessResponse<T>(data: T, meta?: any) {
  return {
    success: true,
    data,
    ...(meta && { meta })
  };
}

export function createErrorResponse(message: string, code?: string) {
  return {
    success: false,
    error: message,
    ...(code && { code })
  };
}
