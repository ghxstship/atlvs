import { z as zod } from 'zod';

// Procurement Request Status Enum
export const RequestStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted', 
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  CONVERTED: 'converted' // Converted to purchase order
} as const;

export type RequestStatusType = typeof RequestStatus[keyof typeof RequestStatus];

// Priority Levels
export const RequestPriority = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type RequestPriorityType = typeof RequestPriority[keyof typeof RequestPriority];

// Request Categories
export const RequestCategory = {
  EQUIPMENT: 'equipment',
  SUPPLIES: 'supplies',
  SERVICES: 'services',
  MATERIALS: 'materials',
  SOFTWARE: 'software',
  MAINTENANCE: 'maintenance',
  OTHER: 'other'
} as const;

export type RequestCategoryType = typeof RequestCategory[keyof typeof RequestCategory];

// Procurement Request Item Schema
export const ProcurementRequestItemSchema = zod.object({
  id: zod.string().uuid().optional(),
  request_id: zod.string().uuid().optional(),
  product_id: zod.string().uuid().optional(),
  service_id: zod.string().uuid().optional(),
  name: zod.string().min(1, 'Item name is required'),
  description: zod.string().optional(),
  category: zod.enum(['equipment', 'supplies', 'services', 'materials', 'software', 'maintenance', 'other']),
  quantity: zod.number().min(1, 'Quantity must be at least 1'),
  unit: zod.string().default('each'),
  estimated_unit_price: zod.number().min(0, 'Price must be non-negative'),
  estimated_total_price: zod.number().min(0, 'Total price must be non-negative'),
  preferred_vendor: zod.string().optional(),
  specifications: zod.string().optional(),
  justification: zod.string().optional(),
  created_at: zod.string().optional(),
  updated_at: zod.string().optional()
});

// Procurement Request Schema
export const ProcurementRequestSchema = zod.object({
  id: zod.string().uuid().optional(),
  organization_id: zod.string().uuid(),
  project_id: zod.string().uuid().optional(),
  requester_id: zod.string().uuid(),
  title: zod.string().min(1, 'Request title is required'),
  description: zod.string().optional(),
  business_justification: zod.string().min(10, 'Business justification is required (minimum 10 characters)'),
  category: zod.enum(['equipment', 'supplies', 'services', 'materials', 'software', 'maintenance', 'other']),
  priority: zod.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: zod.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled', 'converted']).default('draft'),
  estimated_total: zod.number().min(0, 'Estimated total must be non-negative'),
  currency: zod.string().default('USD'),
  requested_delivery_date: zod.string().optional(),
  budget_code: zod.string().optional(),
  department: zod.string().optional(),
  approval_notes: zod.string().optional(),
  rejected_reason: zod.string().optional(),
  approved_by: zod.string().uuid().optional(),
  approved_at: zod.string().optional(),
  submitted_at: zod.string().optional(),
  created_at: zod.string().optional(),
  updated_at: zod.string().optional(),
  // Relations
  items: zod.array(ProcurementRequestItemSchema).optional(),
  requester: zod.object({
    id: zod.string().uuid(),
    name: zod.string(),
    email: zod.string().email()
  }).optional(),
  project: zod.object({
    id: zod.string().uuid(),
    name: zod.string()
  }).optional(),
  approver: zod.object({
    id: zod.string().uuid(),
    name: zod.string(),
    email: zod.string().email()
  }).optional()
});

// Type exports
export type ProcurementRequest = zod.infer<typeof ProcurementRequestSchema>;
export type ProcurementRequestItem = zod.infer<typeof ProcurementRequestItemSchema>;

// Create Request Schema (for forms)
export const CreateProcurementRequestSchema = ProcurementRequestSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  approved_by: true,
  approved_at: true,
  submitted_at: true,
  requester: true,
  project: true,
  approver: true
});

export type CreateProcurementRequest = zod.infer<typeof CreateProcurementRequestSchema>;

// Update Request Schema
export const UpdateProcurementRequestSchema = ProcurementRequestSchema.partial().extend({
  id: zod.string().uuid()
});

export type UpdateProcurementRequest = zod.infer<typeof UpdateProcurementRequestSchema>;

// Request Filters
export interface RequestFilters {
  status?: RequestStatusType[];
  priority?: RequestPriorityType[];
  category?: RequestCategoryType[];
  requester_id?: string;
  project_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  estimated_total_range?: {
    min: number;
    max: number;
  };
}

// Request Sort Options
export interface RequestSortOptions {
  field: 'created_at' | 'updated_at' | 'estimated_total' | 'requested_delivery_date' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}

// Request Statistics
export interface RequestStatistics {
  total_requests: number;
  by_status: Record<RequestStatusType, number>;
  by_priority: Record<RequestPriorityType, number>;
  by_category: Record<RequestCategoryType, number>;
  total_estimated_value: number;
  average_approval_time: number; // in hours
  approval_rate: number; // percentage
}

// Approval Workflow Step
export interface ApprovalStep {
  id: string;
  request_id: string;
  approver_id: string;
  step_order: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approved_at?: string;
  notes?: string;
  approver: {
    id: string;
    name: string;
    email: string;
  };
}

// Request Activity Log
export interface RequestActivity {
  id: string;
  request_id: string;
  user_id: string;
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'cancelled' | 'updated' | 'converted';
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
