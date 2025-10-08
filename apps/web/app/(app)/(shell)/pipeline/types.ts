import { z } from 'zod';

/**
 * Pipeline Module Types
 * Comprehensive type definitions for sales pipeline and opportunity management
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const PIPELINE_STAGES = [
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
] as const;

export const OPPORTUNITY_STATUS = ['active', 'won', 'lost', 'on_hold'] as const;

export const DEAL_SIZES = ['small', 'medium', 'large', 'enterprise'] as const;

// ============================================================================
// BASE INTERFACES
// ============================================================================

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  probability: number; // 0-100
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineOpportunity {
  id: string;
  title: string;
  description: string | null;
  stage_id: string;
  value: number;
  currency: string;
  probability: number; // 0-100
  expected_close_date: string;
  actual_close_date: string | null;
  company_id: string | null;
  contact_id: string | null;
  assigned_to: string;
  status: typeof OPPORTUNITY_STATUS[number];
  deal_size: typeof DEAL_SIZES[number];
  source: string | null;
  tags: string[];
  custom_fields: Record<string, any>;
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PipelineActivity {
  id: string;
  opportunity_id: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'task' | 'stage_change';
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  user_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineMetrics {
  total_value: number;
  weighted_value: number; // value * probability
  total_opportunities: number;
  won_opportunities: number;
  lost_opportunities: number;
  win_rate: number;
  average_deal_size: number;
  average_sales_cycle: number; // days
  conversion_rate: number;
  stage_distribution: Record<string, number>;
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const createPipelineStageSchema = z.object({
  name: z.string().min(1, 'Stage name is required').max(100),
  order: z.number().int().min(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  probability: z.number().min(0).max(100)
});

export const updatePipelineStageSchema = createPipelineStageSchema.partial();

export const createPipelineOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  stage_id: z.string().uuid('Invalid stage ID'),
  value: z.number().min(0, 'Value must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code').default('USD'),
  probability: z.number().min(0).max(100).default(50),
  expected_close_date: z.string().datetime(),
  company_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid('Invalid user ID'),
  status: z.enum(OPPORTUNITY_STATUS).default('active'),
  deal_size: z.enum(DEAL_SIZES).default('medium'),
  source: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.any()).default({})
});

export const updatePipelineOpportunitySchema = createPipelineOpportunitySchema.partial();

export const createPipelineActivitySchema = z.object({
  opportunity_id: z.string().uuid(),
  type: z.enum(['note', 'call', 'email', 'meeting', 'task', 'stage_change']),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  completed: z.boolean().default(false),
  due_date: z.string().datetime().optional().nullable()
});

export const updatePipelineActivitySchema = createPipelineActivitySchema.partial();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreatePipelineStage = z.infer<typeof createPipelineStageSchema>;
export type UpdatePipelineStage = z.infer<typeof updatePipelineStageSchema>;
export type CreatePipelineOpportunity = z.infer<typeof createPipelineOpportunitySchema>;
export type UpdatePipelineOpportunity = z.infer<typeof updatePipelineOpportunitySchema>;
export type CreatePipelineActivity = z.infer<typeof createPipelineActivitySchema>;
export type UpdatePipelineActivity = z.infer<typeof updatePipelineActivitySchema>;

// ============================================================================
// FIELD CONFIGURATION FOR ATLVS
// ============================================================================

export interface PipelineFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'currency' | 'user' | 'company';
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export const PIPELINE_OPPORTUNITY_FIELDS: PipelineFieldConfig[] = [
  {
    key: 'title',
    label: 'Opportunity Title',
    type: 'text',
    required: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'value',
    label: 'Deal Value',
    type: 'currency',
    required: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'probability',
    label: 'Win Probability',
    type: 'number',
    sortable: true,
    filterable: true
  },
  {
    key: 'expected_close_date',
    label: 'Expected Close',
    type: 'date',
    required: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    sortable: true,
    filterable: true,
    options: OPPORTUNITY_STATUS.map(s => ({ value: s, label: s.replace('_', ' ').toUpperCase() }))
  },
  {
    key: 'deal_size',
    label: 'Deal Size',
    type: 'select',
    sortable: true,
    filterable: true,
    options: DEAL_SIZES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))
  },
  {
    key: 'assigned_to',
    label: 'Owner',
    type: 'user',
    required: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'company_id',
    label: 'Company',
    type: 'company',
    sortable: true,
    filterable: true
  },
];

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PipelineFilters {
  stage_id?: string;
  status?: typeof OPPORTUNITY_STATUS[number];
  assigned_to?: string;
  company_id?: string;
  min_value?: number;
  max_value?: number;
  expected_close_from?: string;
  expected_close_to?: string;
  deal_size?: typeof DEAL_SIZES[number];
  search?: string;
}

export interface PipelineSortOptions {
  field: keyof PipelineOpportunity;
  direction: 'asc' | 'desc';
}

export interface PipelinePaginationOptions {
  page: number;
  pageSize: number;
}

export interface PipelineQueryOptions {
  filters?: PipelineFilters;
  sort?: PipelineSortOptions;
  pagination?: PipelinePaginationOptions;
}
