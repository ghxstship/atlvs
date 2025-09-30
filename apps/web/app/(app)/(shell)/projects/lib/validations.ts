import { z } from 'zod';

// Project Validation Schemas
export const ProjectStatusSchema = z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']);
export const ProjectPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required').max(255, 'Project name must be less than 255 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  status: ProjectStatusSchema,
  priority: ProjectPrioritySchema,
  budget: z.number().min(0, 'Budget must be positive').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  client_id: z.string().uuid().optional(),
  manager_id: z.string().uuid().optional(),
  location: z.string().max(500, 'Location must be less than 500 characters').optional(),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),
  notes: z.string().max(10000, 'Notes must be less than 10000 characters').optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name must be less than 255 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  status: ProjectStatusSchema.default('planning'),
  priority: ProjectPrioritySchema.default('medium'),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  client_id: z.string().uuid().optional(),
  manager_id: z.string().uuid().optional(),
  location: z.string().max(500, 'Location must be less than 500 characters').optional(),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),
  notes: z.string().max(10000, 'Notes must be less than 10000 characters').optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// Task Validation Schemas
export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']);
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const ProjectTaskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required').max(255, 'Task title must be less than 255 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  assignee_id: z.string().uuid().optional(),
  reporter_id: z.string().uuid().optional(),
  parent_task_id: z.string().uuid().optional(),
  estimated_hours: z.number().min(0, 'Estimated hours must be positive').optional(),
  actual_hours: z.number().min(0, 'Actual hours must be positive').optional(),
  start_date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
  dependencies: z.array(z.string().uuid()).max(20, 'Maximum 20 dependencies allowed').optional(),
  attachments: z.array(z.string().url()).max(50, 'Maximum 50 attachments allowed').optional(),
  position: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
});

export const CreateTaskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required').max(255, 'Task title must be less than 255 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  status: TaskStatusSchema.default('todo'),
  priority: TaskPrioritySchema.default('medium'),
  assignee_id: z.string().uuid().optional(),
  reporter_id: z.string().uuid().optional(),
  parent_task_id: z.string().uuid().optional(),
  estimated_hours: z.number().min(0, 'Estimated hours must be positive').optional(),
  actual_hours: z.number().min(0, 'Actual hours must be positive').optional(),
  start_date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
  dependencies: z.array(z.string().uuid()).max(20, 'Maximum 20 dependencies allowed').optional(),
  attachments: z.array(z.string().url()).max(50, 'Maximum 50 attachments allowed').optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

// File Validation Schemas
export const FileCategorySchema = z.enum(['document', 'image', 'video', 'audio', 'drawing', 'specification', 'report', 'template', 'policy', 'other']);
export const AccessLevelSchema = z.enum(['public', 'team', 'restricted', 'private']);

export const ProjectFileSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'File name is required').max(255, 'File name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  file_url: z.string().url(),
  file_size: z.number().min(0, 'File size must be positive'),
  file_type: z.string().max(100),
  category: FileCategorySchema,
  version: z.string().max(50).default('1.0'),
  is_latest: z.boolean().default(true),
  uploaded_by: z.string().uuid(),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),
  access_level: AccessLevelSchema.default('team'),
  download_count: z.number().min(0).default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateFileSchema = z.object({
  project_id: z.string().uuid().optional(),
  name: z.string().min(1, 'File name is required').max(255, 'File name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  file_url: z.string().url(),
  file_size: z.number().min(0, 'File size must be positive'),
  file_type: z.string().max(100),
  category: FileCategorySchema,
  version: z.string().max(50).default('1.0'),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),
  access_level: AccessLevelSchema.default('team'),
});

// Activation Validation Schemas
export const ActivationTypeSchema = z.enum(['soft_launch', 'beta', 'full_launch', 'pilot', 'rollout']);
export const ActivationStatusSchema = z.enum(['planning', 'ready', 'active', 'completed', 'cancelled']);

export const ProjectActivationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Activation name is required').max(255),
  description: z.string().max(5000).optional(),
  status: ActivationStatusSchema,
  activation_type: ActivationTypeSchema,
  project_id: z.string().uuid().optional(),
  scheduled_date: z.string().datetime().optional(),
  actual_date: z.string().datetime().optional(),
  completion_date: z.string().datetime().optional(),
  location: z.string().max(500).optional(),
  budget: z.number().min(0).optional(),
  actual_cost: z.number().min(0).optional(),
  success_metrics: z.record(z.any()).optional(),
  stakeholders: z.array(z.string()).max(50).optional(),
  dependencies: z.array(z.string()).max(50).optional(),
  risks: z.array(z.string()).max(50).optional(),
  notes: z.string().max(10000).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  organization_id: z.string().uuid(),
});

export const CreateActivationSchema = z.object({
  name: z.string().min(1, 'Activation name is required').max(255),
  description: z.string().max(5000).optional(),
  status: ActivationStatusSchema.default('planning'),
  activation_type: ActivationTypeSchema,
  project_id: z.string().uuid().optional(),
  scheduled_date: z.string().datetime().optional(),
  location: z.string().max(500).optional(),
  budget: z.number().min(0).optional(),
  success_metrics: z.record(z.any()).optional(),
  stakeholders: z.array(z.string()).max(50).optional(),
  dependencies: z.array(z.string()).max(50).optional(),
  risks: z.array(z.string()).max(50).optional(),
  notes: z.string().max(10000).optional(),
});

export const UpdateActivationSchema = CreateActivationSchema.partial();

// Risk Validation Schemas
export const RiskCategorySchema = z.enum(['technical', 'financial', 'operational', 'strategic', 'compliance', 'external']);
export const RiskProbabilitySchema = z.enum(['very_low', 'low', 'medium', 'high', 'very_high']);
export const RiskImpactSchema = z.enum(['very_low', 'low', 'medium', 'high', 'very_high']);
export const RiskStatusSchema = z.enum(['identified', 'assessed', 'mitigating', 'monitoring', 'closed']);

export const ProjectRiskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  title: z.string().min(1, 'Risk title is required').max(255),
  description: z.string().min(1, 'Risk description is required').max(5000),
  category: RiskCategorySchema,
  probability: RiskProbabilitySchema,
  impact: RiskImpactSchema,
  risk_score: z.number().min(1).max(25),
  status: RiskStatusSchema,
  owner_id: z.string().uuid().optional(),
  mitigation_plan: z.string().max(5000).optional(),
  contingency_plan: z.string().max(5000).optional(),
  review_date: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid(),
});

export const CreateRiskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1, 'Risk title is required').max(255),
  description: z.string().min(1, 'Risk description is required').max(5000),
  category: RiskCategorySchema,
  probability: RiskProbabilitySchema,
  impact: RiskImpactSchema,
  status: RiskStatusSchema.default('identified'),
  owner_id: z.string().uuid().optional(),
  mitigation_plan: z.string().max(5000).optional(),
  contingency_plan: z.string().max(5000).optional(),
  review_date: z.string().datetime().optional(),
});

export const UpdateRiskSchema = CreateRiskSchema.partial();

// Inspection Validation Schemas
export const InspectionTypeSchema = z.enum(['safety', 'quality', 'compliance', 'progress', 'final', 'other']);
export const InspectionStatusSchema = z.enum(['scheduled', 'in_progress', 'completed', 'failed', 'cancelled']);
export const ChecklistStatusSchema = z.enum(['pending', 'passed', 'failed', 'na']);

export const InspectionChecklistItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Item title is required').max(255),
  description: z.string().max(1000).optional(),
  category: z.string().max(100),
  required: z.boolean().default(true),
  status: ChecklistStatusSchema,
  notes: z.string().max(1000).optional(),
  photos: z.array(z.string().url()).max(10).optional(),
});

export const ProjectInspectionSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  title: z.string().min(1, 'Inspection title is required').max(255),
  description: z.string().max(5000).optional(),
  type: InspectionTypeSchema,
  status: InspectionStatusSchema,
  inspector_id: z.string().uuid().optional(),
  scheduled_date: z.string().datetime(),
  completed_date: z.string().datetime().optional(),
  location: z.string().max(500).optional(),
  checklist_items: z.array(InspectionChecklistItemSchema).optional(),
  findings: z.string().max(10000).optional(),
  recommendations: z.string().max(10000).optional(),
  photos: z.array(z.string().url()).max(20).optional(),
  documents: z.array(z.string().url()).max(20).optional(),
  score: z.number().min(0).max(100).optional(),
  passed: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid(),
});

export const CreateInspectionSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1, 'Inspection title is required').max(255),
  description: z.string().max(5000).optional(),
  type: InspectionTypeSchema,
  status: InspectionStatusSchema.default('scheduled'),
  inspector_id: z.string().uuid().optional(),
  scheduled_date: z.string().datetime(),
  location: z.string().max(500).optional(),
  checklist_items: z.array(InspectionChecklistItemSchema).optional(),
  findings: z.string().max(10000).optional(),
  recommendations: z.string().max(10000).optional(),
  photos: z.array(z.string().url()).max(20).optional(),
  documents: z.array(z.string().url()).max(20).optional(),
});

export const UpdateInspectionSchema = CreateInspectionSchema.partial();

// Location Validation Schemas
export const LocationTypeSchema = z.enum(['venue', 'office', 'warehouse', 'site', 'remote', 'other']);

export const ProjectLocationSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Location name is required').max(255),
  description: z.string().max(1000).optional(),
  type: LocationTypeSchema,
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  capacity: z.number().min(0).optional(),
  facilities: z.array(z.string()).max(50).optional(),
  contact_name: z.string().max(255).optional(),
  contact_phone: z.string().max(50).optional(),
  contact_email: z.string().email().optional(),
  notes: z.string().max(2000).optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid(),
});

export const CreateLocationSchema = z.object({
  project_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Location name is required').max(255),
  description: z.string().max(1000).optional(),
  type: LocationTypeSchema,
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  capacity: z.number().min(0).optional(),
  facilities: z.array(z.string()).max(50).optional(),
  contact_name: z.string().max(255).optional(),
  contact_phone: z.string().max(50).optional(),
  contact_email: z.string().email().optional(),
  notes: z.string().max(2000).optional(),
});

export const UpdateLocationSchema = CreateLocationSchema.partial();

// Milestone Validation Schemas
export const MilestoneStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'overdue']);

export const ProjectMilestoneSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  title: z.string().min(1, 'Milestone title is required').max(255),
  description: z.string().max(5000).optional(),
  due_date: z.string().datetime(),
  completed_date: z.string().datetime().optional(),
  status: MilestoneStatusSchema,
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  owner_id: z.string().uuid().optional(),
  dependencies: z.array(z.string().uuid()).max(20).optional(),
  deliverables: z.array(z.string()).max(50).optional(),
  success_criteria: z.string().max(2000).optional(),
  notes: z.string().max(5000).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid(),
});

export const CreateMilestoneSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1, 'Milestone title is required').max(255),
  description: z.string().max(5000).optional(),
  due_date: z.string().datetime(),
  status: MilestoneStatusSchema.default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  owner_id: z.string().uuid().optional(),
  dependencies: z.array(z.string().uuid()).max(20).optional(),
  deliverables: z.array(z.string()).max(50).optional(),
  success_criteria: z.string().max(2000).optional(),
  notes: z.string().max(5000).optional(),
});

export const UpdateMilestoneSchema = CreateMilestoneSchema.partial();

// Filter and Search Validation Schemas
export const FilterOperatorSchema = z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'in']);
export const SortDirectionSchema = z.enum(['asc', 'desc']);

export const FilterConfigSchema = z.object({
  field: z.string(),
  operator: FilterOperatorSchema,
  value: z.any(),
});

export const SortConfigSchema = z.object({
  field: z.string(),
  direction: SortDirectionSchema,
});

export const ProjectFiltersSchema = z.object({
  status: z.array(ProjectStatusSchema).optional(),
  priority: z.array(ProjectPrioritySchema).optional(),
  client_id: z.string().uuid().optional(),
  manager_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  date_range: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
  budget_range: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  search: z.string().optional(),
});

// Export all schemas for use in service layer
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type ProjectPriority = z.infer<typeof ProjectPrioritySchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type FileCategory = z.infer<typeof FileCategorySchema>;
export type AccessLevel = z.infer<typeof AccessLevelSchema>;
export type ActivationType = z.infer<typeof ActivationTypeSchema>;
export type ActivationStatus = z.infer<typeof ActivationStatusSchema>;
export type RiskCategory = z.infer<typeof RiskCategorySchema>;
export type RiskProbability = z.infer<typeof RiskProbabilitySchema>;
export type RiskImpact = z.infer<typeof RiskImpactSchema>;
export type RiskStatus = z.infer<typeof RiskStatusSchema>;
export type InspectionType = z.infer<typeof InspectionTypeSchema>;
export type InspectionStatus = z.infer<typeof InspectionStatusSchema>;
export type ChecklistStatus = z.infer<typeof ChecklistStatusSchema>;
export type LocationType = z.infer<typeof LocationTypeSchema>;
export type MilestoneStatus = z.infer<typeof MilestoneStatusSchema>;
export type FilterOperator = z.infer<typeof FilterOperatorSchema>;
export type SortDirection = z.infer<typeof SortDirectionSchema>;
