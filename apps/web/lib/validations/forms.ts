import { z } from 'zod'

// Auth form schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

// Project form schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft')
})

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending')
})

// Profile form schemas
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional()
})

// Onboarding form schemas
export const organizationSetupSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal(''))
})

export const planSelectionSchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly')
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type CreateProjectFormData = z.infer<typeof createProjectSchema>
export type CreateTaskFormData = z.infer<typeof createTaskSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type OrganizationSetupFormData = z.infer<typeof organizationSetupSchema>
export type PlanSelectionFormData = z.infer<typeof planSelectionSchema>

// Additional validation schemas for remaining forms
export const createResourceSchema = z.object({
  title: z.string().min(1, 'Resource title is required'),
  description: z.string().optional(),
  type: z.enum(['document', 'video', 'image', 'link']).default('document'),
  category: z.string().optional(),
  tags: z.string().optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal(''))
})

export const createProfessionalSchema = z.object({
  title: z.string().min(1, 'Professional title is required'),
  company: z.string().min(1, 'Company is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  skills: z.string().optional()
})

export const createUniformItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  size: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  condition: z.enum(['new', 'good', 'fair', 'poor']).default('new'),
  notes: z.string().optional()
})

export const createHealthRecordSchema = z.object({
  recordType: z.string().min(1, 'Record type is required'),
  date: z.string().min(1, 'Date is required'),
  provider: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.string().optional()
})

export const createEndorsementSchema = z.object({
  endorserName: z.string().min(1, 'Endorser name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  endorsementText: z.string().min(10, 'Endorsement must be at least 10 characters'),
  date: z.string().optional(),
  skills: z.string().optional()
})

export const createHistoryEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  outcome: z.string().optional()
})

export const createPerformanceReviewSchema = z.object({
  reviewPeriod: z.string().min(1, 'Review period is required'),
  reviewer: z.string().min(1, 'Reviewer is required'),
  overallRating: z.number().min(1).max(5),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  goals: z.string().optional(),
  comments: z.string().optional()
})

export const teamInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'member']).default('member'),
  message: z.string().optional()
})

export const onboardingTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assignee: z.string().optional()
})

export type CreateResourceFormData = z.infer<typeof createResourceSchema>
export type CreateProfessionalFormData = z.infer<typeof createProfessionalSchema>
export type CreateUniformItemFormData = z.infer<typeof createUniformItemSchema>
export type CreateHealthRecordFormData = z.infer<typeof createHealthRecordSchema>
export type CreateEndorsementFormData = z.infer<typeof createEndorsementSchema>
export type CreateHistoryEntryFormData = z.infer<typeof createHistoryEntrySchema>
export type CreatePerformanceReviewFormData = z.infer<typeof createPerformanceReviewSchema>
export type TeamInvitationFormData = z.infer<typeof teamInvitationSchema>
export type OnboardingTaskFormData = z.infer<typeof onboardingTaskSchema>

// Contract schema (was missing)
export const createContractSchema = z.object({
  title: z.string().min(1, 'Contract title is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  value: z.number().min(0, 'Contract value must be positive').optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft')
})

export type CreateContractFormData = z.infer<typeof createContractSchema>
