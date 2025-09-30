// Jobs Validations Service
// Input validation schemas for Jobs module

import { z } from 'zod';

// ============================================================================
// JOB VALIDATION SCHEMAS
// ============================================================================

export const CreateJobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary']),
  category: z.enum(['production', 'technical', 'creative', 'management', 'support', 'other']),
  status: z.enum(['draft', 'open', 'in-progress', 'completed', 'cancelled', 'on-hold']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  project_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  location: z.string().optional(),
  remote_allowed: z.boolean().default(false),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  hourly_rate: z.number().positive().optional(),
  total_budget: z.number().positive().optional(),
  currency: z.string().default('USD'),
  requirements: z.array(z.string()).optional(),
  skills_required: z.array(z.string()).optional(),
  experience_level: z.enum(['entry', 'mid', 'senior', 'expert']).optional(),
  assigned_to: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateJobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary']).optional(),
  category: z.enum(['production', 'technical', 'creative', 'management', 'support', 'other']).optional(),
  status: z.enum(['draft', 'open', 'in-progress', 'completed', 'cancelled', 'on-hold']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  project_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  location: z.string().optional(),
  remote_allowed: z.boolean().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  hourly_rate: z.number().positive().optional(),
  total_budget: z.number().positive().optional(),
  currency: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  skills_required: z.array(z.string()).optional(),
  experience_level: z.enum(['entry', 'mid', 'senior', 'expert']).optional(),
  assigned_to: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// JOB ASSIGNMENT VALIDATION SCHEMAS
// ============================================================================

export const CreateAssignmentSchema = z.object({
  job_id: z.string().uuid('Valid job ID is required'),
  assignee_user_id: z.string().uuid('Valid assignee ID is required'),
  role: z.string().max(100, 'Role must be less than 100 characters').optional(),
  status: z.enum(['pending', 'accepted', 'declined', 'in-progress', 'completed']).default('pending'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const UpdateAssignmentSchema = z.object({
  job_id: z.string().uuid('Valid job ID is required').optional(),
  assignee_user_id: z.string().uuid('Valid assignee ID is required').optional(),
  role: z.string().max(100, 'Role must be less than 100 characters').optional(),
  status: z.enum(['pending', 'accepted', 'declined', 'in-progress', 'completed']).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// ============================================================================
// OPPORTUNITY VALIDATION SCHEMAS
// ============================================================================

export const CreateOpportunitySchema = z.object({
  title: z.string().min(1, 'Opportunity title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  project_id: z.string().uuid().optional(),
  status: z.enum(['open', 'closed', 'awarded', 'cancelled']).default('open'),
  budget: z.number().positive('Budget must be positive').optional(),
  currency: z.string().default('USD'),
  stage: z.string().optional(),
  probability: z.number().min(0).max(100, 'Probability must be between 0 and 100').optional(),
  opens_at: z.string().datetime().optional(),
  closes_at: z.string().datetime().optional(),
});

export const UpdateOpportunitySchema = z.object({
  title: z.string().min(1, 'Opportunity title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().optional(),
  project_id: z.string().uuid().optional(),
  status: z.enum(['open', 'closed', 'awarded', 'cancelled']).optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  currency: z.string().optional(),
  stage: z.string().optional(),
  probability: z.number().min(0).max(100, 'Probability must be between 0 and 100').optional(),
  opens_at: z.string().datetime().optional(),
  closes_at: z.string().datetime().optional(),
});

// ============================================================================
// BID VALIDATION SCHEMAS
// ============================================================================

export const CreateBidSchema = z.object({
  opportunity_id: z.string().uuid('Valid opportunity ID is required'),
  company_id: z.string().uuid('Valid company ID is required'),
  amount: z.number().positive('Bid amount must be positive'),
  currency: z.string().default('USD'),
  proposed_timeline: z.string().max(500, 'Timeline must be less than 500 characters').optional(),
  cover_letter: z.string().max(2000, 'Cover letter must be less than 2000 characters').optional(),
});

export const UpdateBidSchema = z.object({
  amount: z.number().positive('Bid amount must be positive').optional(),
  currency: z.string().optional(),
  status: z.enum(['submitted', 'under-review', 'accepted', 'rejected', 'withdrawn']).optional(),
  proposed_timeline: z.string().max(500, 'Timeline must be less than 500 characters').optional(),
  cover_letter: z.string().max(2000, 'Cover letter must be less than 2000 characters').optional(),
});

// ============================================================================
// CONTRACT VALIDATION SCHEMAS
// ============================================================================

export const CreateContractSchema = z.object({
  job_id: z.string().uuid('Valid job ID is required'),
  company_id: z.string().uuid('Valid company ID is required'),
  title: z.string().min(1, 'Contract title is required').max(200, 'Title must be less than 200 characters'),
  contract_type: z.enum(['fixed-price', 'hourly', 'milestone-based', 'retainer']),
  status: z.enum(['draft', 'pending', 'active', 'completed', 'terminated', 'expired']).default('draft'),
  start_date: z.string().datetime('Valid start date is required'),
  end_date: z.string().datetime().optional(),
  total_value: z.number().positive('Total value must be positive'),
  currency: z.string().default('USD'),
  payment_terms: z.string().max(1000, 'Payment terms must be less than 1000 characters').optional(),
  deliverables: z.array(z.string()).optional(),
  terms_and_conditions: z.string().max(5000, 'Terms must be less than 5000 characters').optional(),
});

export const UpdateContractSchema = z.object({
  title: z.string().min(1, 'Contract title is required').max(200, 'Title must be less than 200 characters').optional(),
  contract_type: z.enum(['fixed-price', 'hourly', 'milestone-based', 'retainer']).optional(),
  status: z.enum(['draft', 'pending', 'active', 'completed', 'terminated', 'expired']).optional(),
  start_date: z.string().datetime('Valid start date is required').optional(),
  end_date: z.string().datetime().optional(),
  total_value: z.number().positive('Total value must be positive').optional(),
  currency: z.string().optional(),
  payment_terms: z.string().max(1000, 'Payment terms must be less than 1000 characters').optional(),
  deliverables: z.array(z.string()).optional(),
  terms_and_conditions: z.string().max(5000, 'Terms must be less than 5000 characters').optional(),
});

// ============================================================================
// COMPLIANCE VALIDATION SCHEMAS
// ============================================================================

export const CreateComplianceSchema = z.object({
  job_id: z.string().uuid('Valid job ID is required'),
  kind: z.enum(['regulatory', 'safety', 'quality', 'security', 'environmental', 'legal', 'financial']),
  title: z.string().min(1, 'Compliance title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'submitted', 'approved', 'rejected']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  due_at: z.string().datetime().optional(),
  assigned_to: z.string().uuid().optional(),
  reviewer: z.string().uuid().optional(),
  evidence_url: z.string().url('Valid URL is required').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const UpdateComplianceSchema = z.object({
  kind: z.enum(['regulatory', 'safety', 'quality', 'security', 'environmental', 'legal', 'financial']).optional(),
  title: z.string().min(1, 'Compliance title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'submitted', 'approved', 'rejected']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  due_at: z.string().datetime().optional(),
  assigned_to: z.string().uuid().optional(),
  reviewer: z.string().uuid().optional(),
  evidence_url: z.string().url('Valid URL is required').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// ============================================================================
// RFP VALIDATION SCHEMAS
// ============================================================================

export const CreateRfpSchema = z.object({
  title: z.string().min(1, 'RFP title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  project_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled']).default('draft'),
  budget: z.number().positive('Budget must be positive').optional(),
  currency: z.string().default('USD'),
  submission_deadline: z.string().datetime().optional(),
  evaluation_criteria: z.string().max(2000, 'Criteria must be less than 2000 characters').optional(),
  requirements: z.string().max(5000, 'Requirements must be less than 5000 characters').optional(),
  contact_email: z.string().email('Valid email is required').optional(),
});

export const UpdateRfpSchema = z.object({
  title: z.string().min(1, 'RFP title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().optional(),
  project_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled']).optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  currency: z.string().optional(),
  submission_deadline: z.string().datetime().optional(),
  evaluation_criteria: z.string().max(2000, 'Criteria must be less than 2000 characters').optional(),
  requirements: z.string().max(5000, 'Requirements must be less than 5000 characters').optional(),
  contact_email: z.string().email('Valid email is required').optional(),
});

// ============================================================================
// FILTER VALIDATION SCHEMAS
// ============================================================================

export const JobsFiltersSchema = z.object({
  status: z.string().optional(),
  project_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  due_before: z.string().datetime().optional(),
  due_after: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const AssignmentsFiltersSchema = z.object({
  job_id: z.string().uuid().optional(),
  assignee_user_id: z.string().uuid().optional(),
  status: z.string().optional(),
  assigned_after: z.string().datetime().optional(),
  assigned_before: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const OpportunitiesFiltersSchema = z.object({
  status: z.string().optional(),
  project_id: z.string().uuid().optional(),
  stage: z.string().optional(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  closes_after: z.string().datetime().optional(),
  closes_before: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const BidsFiltersSchema = z.object({
  opportunity_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  status: z.string().optional(),
  amount_min: z.number().positive().optional(),
  amount_max: z.number().positive().optional(),
  submitted_after: z.string().datetime().optional(),
  submitted_before: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const ContractsFiltersSchema = z.object({
  job_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  status: z.string().optional(),
  contract_type: z.string().optional(),
  value_min: z.number().positive().optional(),
  value_max: z.number().positive().optional(),
  start_after: z.string().datetime().optional(),
  start_before: z.string().datetime().optional(),
  end_after: z.string().datetime().optional(),
  end_before: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const ComplianceFiltersSchema = z.object({
  job_id: z.string().uuid().optional(),
  kind: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  reviewer: z.string().uuid().optional(),
  due_after: z.string().datetime().optional(),
  due_before: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const RfpsFiltersSchema = z.object({
  status: z.string().optional(),
  project_id: z.string().uuid().optional(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  deadline_after: z.string().datetime().optional(),
  deadline_before: z.string().datetime().optional(),
  search: z.string().optional(),
});

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

export function validateJobCreate(data: unknown) {
  return CreateJobSchema.safeParse(data);
}

export function validateJobUpdate(data: unknown) {
  return UpdateJobSchema.safeParse(data);
}

export function validateAssignmentCreate(data: unknown) {
  return CreateAssignmentSchema.safeParse(data);
}

export function validateAssignmentUpdate(data: unknown) {
  return UpdateAssignmentSchema.safeParse(data);
}

export function validateOpportunityCreate(data: unknown) {
  return CreateOpportunitySchema.safeParse(data);
}

export function validateOpportunityUpdate(data: unknown) {
  return UpdateOpportunitySchema.safeParse(data);
}

export function validateBidCreate(data: unknown) {
  return CreateBidSchema.safeParse(data);
}

export function validateBidUpdate(data: unknown) {
  return UpdateBidSchema.safeParse(data);
}

export function validateContractCreate(data: unknown) {
  return CreateContractSchema.safeParse(data);
}

export function validateContractUpdate(data: unknown) {
  return UpdateContractSchema.safeParse(data);
}

export function validateComplianceCreate(data: unknown) {
  return CreateComplianceSchema.safeParse(data);
}

export function validateComplianceUpdate(data: unknown) {
  return UpdateComplianceSchema.safeParse(data);
}

export function validateRfpCreate(data: unknown) {
  return CreateRfpSchema.safeParse(data);
}

export function validateRfpUpdate(data: unknown) {
  return UpdateRfpSchema.safeParse(data);
}
