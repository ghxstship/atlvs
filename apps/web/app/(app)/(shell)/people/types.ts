import { z } from 'zod';

/**
 * People Module Types
 * Comprehensive type definitions for HR, team management, and personnel tracking
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const PERSON_STATUS = ['active', 'inactive', 'on_leave', 'terminated'] as const;

export const EMPLOYMENT_TYPE = [
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'intern',
] as const;

export const SKILL_LEVEL = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

export const DEPARTMENT = [
  'engineering',
  'design',
  'product',
  'marketing',
  'sales',
  'operations',
  'finance',
  'hr',
  'legal',
  'executive',
] as const;

// ============================================================================
// BASE INTERFACES
// ============================================================================

export interface Person {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  department: typeof DEPARTMENT[number] | null;
  employment_type: typeof EMPLOYMENT_TYPE[number];
  status: typeof PERSON_STATUS[number];
  start_date: string;
  end_date: string | null;
  manager_id: string | null;
  location: string | null;
  timezone: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[];
  certifications: string[];
  languages: string[];
  emergency_contact: EmergencyContact | null;
  salary_band: string | null;
  performance_rating: number | null; // 1-5
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface PersonSkill {
  id: string;
  person_id: string;
  skill_name: string;
  skill_level: typeof SKILL_LEVEL[number];
  years_experience: number;
  certified: boolean;
  last_used: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface PersonAssignment {
  id: string;
  person_id: string;
  project_id: string;
  role: string;
  allocation_percentage: number; // 0-100
  start_date: string;
  end_date: string | null;
  billable: boolean;
  rate: number | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface PersonEndorsement {
  id: string;
  person_id: string;
  endorsed_by: string;
  skill_name: string;
  comment: string | null;
  rating: number; // 1-5
  organization_id: string;
  created_at: string;
}

export interface PersonPerformanceReview {
  id: string;
  person_id: string;
  reviewer_id: string;
  review_period_start: string;
  review_period_end: string;
  overall_rating: number; // 1-5
  strengths: string[];
  areas_for_improvement: string[];
  goals: string[];
  comments: string | null;
  status: 'draft' | 'submitted' | 'reviewed' | 'acknowledged';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMetrics {
  total_people: number;
  active_people: number;
  by_department: Record<string, number>;
  by_employment_type: Record<string, number>;
  average_tenure: number; // months
  skill_coverage: Record<string, number>;
  utilization_rate: number; // percentage
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional(),
});

export const createPersonSchema = z.object({
  user_id: z.string().uuid().optional().nullable(),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  department: z.enum(DEPARTMENT).optional().nullable(),
  employment_type: z.enum(EMPLOYMENT_TYPE).default('full_time'),
  status: z.enum(PERSON_STATUS).default('active'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional().nullable(),
  manager_id: z.string().uuid().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  emergency_contact: emergencyContactSchema.optional().nullable(),
  salary_band: z.string().max(50).optional().nullable(),
  performance_rating: z.number().min(1).max(5).optional().nullable(),
});

export const updatePersonSchema = createPersonSchema.partial();

export const createPersonSkillSchema = z.object({
  person_id: z.string().uuid(),
  skill_name: z.string().min(1).max(100),
  skill_level: z.enum(SKILL_LEVEL),
  years_experience: z.number().min(0).max(50),
  certified: z.boolean().default(false),
  last_used: z.string().datetime().optional().nullable(),
});

export const updatePersonSkillSchema = createPersonSkillSchema.partial().omit({ person_id: true });

export const createPersonAssignmentSchema = z.object({
  person_id: z.string().uuid(),
  project_id: z.string().uuid(),
  role: z.string().min(1).max(100),
  allocation_percentage: z.number().min(0).max(100),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional().nullable(),
  billable: z.boolean().default(true),
  rate: z.number().min(0).optional().nullable(),
});

export const updatePersonAssignmentSchema = createPersonAssignmentSchema.partial().omit({ person_id: true });

export const createPersonEndorsementSchema = z.object({
  person_id: z.string().uuid(),
  skill_name: z.string().min(1).max(100),
  comment: z.string().max(500).optional().nullable(),
  rating: z.number().min(1).max(5),
});

export const createPerformanceReviewSchema = z.object({
  person_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  review_period_start: z.string().datetime(),
  review_period_end: z.string().datetime(),
  overall_rating: z.number().min(1).max(5),
  strengths: z.array(z.string()).default([]),
  areas_for_improvement: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
  comments: z.string().max(2000).optional().nullable(),
  status: z.enum(['draft', 'submitted', 'reviewed', 'acknowledged']).default('draft'),
});

export const updatePerformanceReviewSchema = createPerformanceReviewSchema.partial().omit({ person_id: true });

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreatePerson = z.infer<typeof createPersonSchema>;
export type UpdatePerson = z.infer<typeof updatePersonSchema>;
export type CreatePersonSkill = z.infer<typeof createPersonSkillSchema>;
export type UpdatePersonSkill = z.infer<typeof updatePersonSkillSchema>;
export type CreatePersonAssignment = z.infer<typeof createPersonAssignmentSchema>;
export type UpdatePersonAssignment = z.infer<typeof updatePersonAssignmentSchema>;
export type CreatePersonEndorsement = z.infer<typeof createPersonEndorsementSchema>;
export type CreatePerformanceReview = z.infer<typeof createPerformanceReviewSchema>;
export type UpdatePerformanceReview = z.infer<typeof updatePerformanceReviewSchema>;

// ============================================================================
// FIELD CONFIGURATION FOR ATLVS
// ============================================================================

export interface PeopleFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'date' | 'number' | 'multiselect' | 'user';
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export const PEOPLE_FIELDS: PeopleFieldConfig[] = [
  {
    key: 'first_name',
    label: 'First Name',
    type: 'text',
    required: true,
    sortable: true,
    filterable: true,
  },
  {
    key: 'last_name',
    label: 'Last Name',
    type: 'text',
    required: true,
    sortable: true,
    filterable: true,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    sortable: true,
    filterable: true,
  },
  {
    key: 'title',
    label: 'Job Title',
    type: 'text',
    sortable: true,
    filterable: true,
  },
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    sortable: true,
    filterable: true,
    options: DEPARTMENT.map(d => ({ 
      value: d, 
      label: d.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
    })),
  },
  {
    key: 'employment_type',
    label: 'Employment Type',
    type: 'select',
    required: true,
    sortable: true,
    filterable: true,
    options: EMPLOYMENT_TYPE.map(t => ({ 
      value: t, 
      label: t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
    })),
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    sortable: true,
    filterable: true,
    options: PERSON_STATUS.map(s => ({ 
      value: s, 
      label: s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
    })),
  },
  {
    key: 'start_date',
    label: 'Start Date',
    type: 'date',
    required: true,
    sortable: true,
    filterable: true,
  },
  {
    key: 'manager_id',
    label: 'Manager',
    type: 'user',
    sortable: true,
    filterable: true,
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    sortable: true,
    filterable: true,
  },
  {
    key: 'skills',
    label: 'Skills',
    type: 'multiselect',
    filterable: true,
  },
  {
    key: 'performance_rating',
    label: 'Performance Rating',
    type: 'number',
    sortable: true,
    filterable: true,
  },
];

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PeopleFilters {
  status?: typeof PERSON_STATUS[number];
  department?: typeof DEPARTMENT[number];
  employment_type?: typeof EMPLOYMENT_TYPE[number];
  manager_id?: string;
  location?: string;
  skills?: string[];
  min_performance_rating?: number;
  search?: string;
}

export interface PeopleSortOptions {
  field: keyof Person;
  direction: 'asc' | 'desc';
}

export interface PeoplePaginationOptions {
  page: number;
  pageSize: number;
}

export interface PeopleQueryOptions {
  filters?: PeopleFilters;
  sort?: PeopleSortOptions;
  pagination?: PeoplePaginationOptions;
}
