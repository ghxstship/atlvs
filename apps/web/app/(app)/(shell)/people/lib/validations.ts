/**
 * PEOPLE MODULE - INPUT VALIDATION SCHEMAS
 * Comprehensive Zod validation schemas for all People module inputs
 * Enterprise-grade validation with custom error messages and business rules
 */

import { z } from 'zod';

// Base validation rules
const emailRule = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

const phoneRule = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
  .optional();

const urlRule = z.string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

// Person validation schemas
export const PersonBaseSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),

  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),

  email: emailRule,

  title: z.string()
    .max(100, 'Title must be less than 100 characters')
    .optional(),

  department: z.string()
    .max(100, 'Department must be less than 100 characters')
    .optional(),

  bio: z.string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),

  avatar_url: urlRule,

  phone: phoneRule,

  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),

  start_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),

  manager_id: z.string()
    .uuid('Invalid manager ID')
    .optional(),

  status: z.enum(['active', 'inactive', 'pending'], {
    errorMap: () => ({ message: 'Status must be active, inactive, or pending' })
  }).default('active')
});

export const CreatePersonSchema = PersonBaseSchema.extend({
  email: emailRule.refine(async (email) => {
    // Additional email validation can be added here
    return true;
  }, 'Email address is not available')
});

export const UpdatePersonSchema = PersonBaseSchema.partial();

// Role validation schemas
export const RoleSchema = z.object({
  name: z.string()
    .min(1, 'Role name is required')
    .max(50, 'Role name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-_]+$/, 'Role name can only contain letters, spaces, hyphens, and underscores'),

  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  permissions: z.array(z.string())
    .default([])
    .refine((perms) => perms.length <= 100, 'Cannot have more than 100 permissions'),

  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF0000)')
    .optional()
});

export const CreateRoleSchema = RoleSchema;
export const UpdateRoleSchema = RoleSchema.partial();

// Competency validation schemas
export const CompetencySchema = z.object({
  name: z.string()
    .min(1, 'Competency name is required')
    .max(100, 'Competency name must be less than 100 characters'),

  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),

  level_definitions: z.record(
    z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    z.string().max(200, 'Level definition must be less than 200 characters')
  ).optional()
});

export const CreateCompetencySchema = CompetencySchema;
export const UpdateCompetencySchema = CompetencySchema.partial();

// Person competency assignment schema
export const PersonCompetencySchema = z.object({
  person_id: z.string()
    .uuid('Invalid person ID'),

  competency_id: z.string()
    .uuid('Invalid competency ID'),

  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    errorMap: () => ({ message: 'Level must be beginner, intermediate, advanced, or expert' })
  }),

  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),

  assigned_by: z.string()
    .uuid('Invalid assigner ID'),

  assigned_at: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Invalid timestamp format')
    .optional()
});

export const AssignCompetencySchema = PersonCompetencySchema;
export const UpdatePersonCompetencySchema = PersonCompetencySchema.partial();

// Endorsement validation schemas
export const EndorsementSchema = z.object({
  recipient_id: z.string()
    .uuid('Invalid recipient ID'),

  competency_id: z.string()
    .uuid('Invalid competency ID'),

  endorser_id: z.string()
    .uuid('Invalid endorser ID'),

  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    errorMap: () => ({ message: 'Level must be beginner, intermediate, advanced, or expert' })
  }),

  comment: z.string()
    .max(500, 'Comment must be less than 500 characters')
    .optional(),

  is_public: z.boolean()
    .default(true)
});

export const CreateEndorsementSchema = EndorsementSchema.refine(
  (data) => data.recipient_id !== data.endorser_id,
  {
    message: 'Cannot endorse yourself',
    path: ['endorser_id']
  }
);

// Assignment validation schemas
export const AssignmentSchema = z.object({
  person_id: z.string()
    .uuid('Invalid person ID'),

  title: z.string()
    .min(1, 'Assignment title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),

  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be assigned, in_progress, completed, or cancelled' })
  }).default('assigned'),

  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Priority must be low, medium, high, or urgent' })
  }).default('medium'),

  assigned_by: z.string()
    .uuid('Invalid assigner ID'),

  due_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .optional(),

  project_id: z.string()
    .uuid('Invalid project ID')
    .optional(),

  tags: z.array(z.string()
    .max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Cannot have more than 10 tags')
    .default([])
});

export const CreateAssignmentSchema = AssignmentSchema;
export const UpdateAssignmentSchema = AssignmentSchema.partial();

// Network connection validation schemas
export const NetworkConnectionSchema = z.object({
  person_id: z.string()
    .uuid('Invalid person ID'),

  connected_person_id: z.string()
    .uuid('Invalid connected person ID'),

  connection_type: z.enum(['colleague', 'mentor', 'mentee', 'friend', 'acquaintance'], {
    errorMap: () => ({ message: 'Connection type must be colleague, mentor, mentee, friend, or acquaintance' })
  }),

  strength: z.number()
    .min(1, 'Strength must be at least 1')
    .max(10, 'Strength cannot exceed 10')
    .default(5),

  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
});

export const CreateNetworkConnectionSchema = NetworkConnectionSchema.refine(
  (data) => data.person_id !== data.connected_person_id,
  {
    message: 'Cannot connect to yourself',
    path: ['connected_person_id']
  }
);

// Contract validation schemas
export const ContractSchema = z.object({
  person_id: z.string()
    .uuid('Invalid person ID'),

  contract_type: z.enum(['employment', 'consulting', 'freelance', 'internship'], {
    errorMap: () => ({ message: 'Contract type must be employment, consulting, freelance, or internship' })
  }),

  title: z.string()
    .min(1, 'Contract title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),

  status: z.enum(['draft', 'active', 'expired', 'terminated'], {
    errorMap: () => ({ message: 'Status must be draft, active, expired, or terminated' })
  }).default('draft'),

  start_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),

  end_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),

  salary: z.number()
    .positive('Salary must be positive')
    .optional(),

  currency: z.string()
    .length(3, 'Currency must be 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .default('USD'),

  terms_url: urlRule,

  signed_at: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Invalid timestamp format')
    .optional()
});

export const CreateContractSchema = ContractSchema;
export const UpdateContractSchema = ContractSchema.partial();

// Training validation schemas
export const TrainingSchema = z.object({
  person_id: z.string()
    .uuid('Invalid person ID'),

  title: z.string()
    .min(1, 'Training title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),

  training_type: z.enum(['course', 'certification', 'workshop', 'conference', 'self_study'], {
    errorMap: () => ({ message: 'Training type must be course, certification, workshop, conference, or self_study' })
  }),

  provider: z.string()
    .max(100, 'Provider must be less than 100 characters')
    .optional(),

  status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be not_started, in_progress, completed, or cancelled' })
  }).default('not_started'),

  start_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),

  completed_at: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Invalid completion timestamp format')
    .optional(),

  certificate_url: urlRule,

  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
});

export const CreateTrainingSchema = TrainingSchema;
export const UpdateTrainingSchema = TrainingSchema.partial();

// Search and filter validation schemas
export const PeopleSearchSchema = z.object({
  query: z.string()
    .max(100, 'Search query must be less than 100 characters')
    .optional(),

  department: z.array(z.string())
    .max(10, 'Cannot filter by more than 10 departments')
    .optional(),

  role: z.array(z.string())
    .max(10, 'Cannot filter by more than 10 roles')
    .optional(),

  status: z.array(z.enum(['active', 'inactive', 'pending']))
    .max(3, 'Cannot filter by more than 3 statuses')
    .optional(),

  competencies: z.array(z.string().uuid())
    .max(20, 'Cannot filter by more than 20 competencies')
    .optional(),

  dateRange: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }).optional(),

  sortBy: z.enum(['first_name', 'last_name', 'email', 'department', 'title', 'created_at'])
    .optional(),

  sortOrder: z.enum(['asc', 'desc'])
    .default('asc'),

  page: z.number()
    .int()
    .positive()
    .max(1000)
    .default(1),

  limit: z.number()
    .int()
    .positive()
    .max(100)
    .default(50)
});

export const BulkOperationSchema = z.object({
  ids: z.array(z.string().uuid())
    .min(1, 'At least one ID is required')
    .max(100, 'Cannot operate on more than 100 items at once'),

  operation: z.enum(['update', 'delete', 'activate', 'deactivate'], {
    errorMap: () => ({ message: 'Operation must be update, delete, activate, or deactivate' })
  }),

  data: z.record(z.any()).optional()
});

// Export/import validation schemas
export const ExportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx'], {
    errorMap: () => ({ message: 'Format must be csv, json, or xlsx' })
  }).default('csv'),

  fields: z.array(z.string())
    .min(1, 'At least one field must be selected')
    .max(50, 'Cannot export more than 50 fields'),

  filters: PeopleSearchSchema.omit({ page: true, limit: true, sortBy: true, sortOrder: true })
    .optional(),

  includeRelations: z.boolean()
    .default(false)
});

export const ImportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx'], {
    errorMap: () => ({ message: 'Format must be csv, json, or xlsx' })
  }),

  data: z.array(z.record(z.any()))
    .min(1, 'At least one record is required')
    .max(1000, 'Cannot import more than 1000 records at once'),

  updateExisting: z.boolean()
    .default(false),

  validateOnly: z.boolean()
    .default(false)
});

// Real-time subscription validation schemas
export const SubscriptionSchema = z.object({
  table: z.enum(['people', 'people_roles', 'people_competencies', 'person_competencies', 'people_endorsements', 'people_assignments'], {
    errorMap: () => ({ message: 'Invalid table for subscription' })
  }),

  event: z.enum(['INSERT', 'UPDATE', 'DELETE', '*'], {
    errorMap: () => ({ message: 'Event must be INSERT, UPDATE, DELETE, or *' })
  }).default('*'),

  filter: z.record(z.any()).optional()
});

// Validation helper functions
export function validatePersonData(data: unknown) {
  return CreatePersonSchema.safeParse(data);
}

export function validateUpdatePersonData(data: unknown) {
  return UpdatePersonSchema.safeParse(data);
}

export function validateBulkOperation(data: unknown) {
  return BulkOperationSchema.safeParse(data);
}

export function validateSearchParams(params: unknown) {
  return PeopleSearchSchema.safeParse(params);
}

export function validateExportRequest(request: unknown) {
  return ExportSchema.safeParse(request);
}

export function validateImportData(data: unknown) {
  return ImportSchema.safeParse(data);
}

// Custom error formatter
export function formatValidationError(error: z.ZodError) {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}
