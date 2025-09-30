/**
 * Procurement Validation Schemas
 * Zod schema validation for all procurement entities
 */

import { z } from 'zod';

// Base schemas
const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Purchase Order Schemas
export const PurchaseOrderSchema = BaseEntitySchema.extend({
  po_number: z.string().min(1, 'PO number is required').max(50),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  vendor_id: z.string().uuid('Valid vendor is required'),
  status: z.enum(['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled']),
  total_amount: z.number().positive('Total amount must be positive'),
  currency: z.string().default('USD'),
  requested_by: z.string().uuid(),
  approved_by: z.string().uuid().optional(),
  approved_at: z.date().optional(),
  delivery_date: z.date().optional(),
  notes: z.string().optional(),
});

// Vendor Schemas
export const VendorSchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Vendor name is required').max(100),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  rating: z.number().min(1).max(5).optional(),
  website: z.string().url().optional(),
  tax_id: z.string().optional(),
  payment_terms: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

// Procurement Request Schemas
export const ProcurementRequestSchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['equipment', 'supplies', 'services', 'software', 'facilities']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimated_cost: z.number().positive().optional(),
  required_date: z.date(),
  requested_by: z.string().uuid(),
  approved_by: z.string().uuid().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'fulfilled']),
  rejection_reason: z.string().optional(),
  attachments: z.array(z.string()).optional(), // File URLs
});

// Contract Schemas
export const ContractSchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Contract title is required').max(200),
  vendor_id: z.string().uuid(),
  contract_number: z.string().min(1).max(50),
  type: z.enum(['service', 'supply', 'maintenance', 'license']),
  status: z.enum(['draft', 'active', 'expired', 'terminated']),
  start_date: z.date(),
  end_date: z.date(),
  value: z.number().positive(),
  currency: z.string().default('USD'),
  terms: z.string().min(1, 'Contract terms are required'),
  auto_renewal: z.boolean().default(false),
  renewal_period_months: z.number().positive().optional(),
  created_by: z.string().uuid(),
  signed_date: z.date().optional(),
  attachments: z.array(z.string()).optional(),
});

// Approval Workflow Schemas
export const ApprovalWorkflowSchema = BaseEntitySchema.extend({
  request_id: z.string().uuid(),
  request_type: z.enum(['purchase_order', 'contract', 'request']),
  current_step: z.number().min(1),
  total_steps: z.number().min(1),
  status: z.enum(['pending', 'approved', 'rejected', 'escalated']),
  approvers: z.array(z.object({
    user_id: z.string().uuid(),
    step: z.number(),
    status: z.enum(['pending', 'approved', 'rejected']),
    approved_at: z.date().optional(),
    comments: z.string().optional(),
  })),
  required_approvals: z.number().min(1),
  current_approvals: z.number().default(0),
});

// Budget Schemas
export const BudgetSchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Budget name is required').max(100),
  description: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  category: z.enum(['equipment', 'supplies', 'services', 'travel', 'marketing', 'operations']),
  period_start: z.date(),
  period_end: z.date(),
  spent: z.number().default(0),
  status: z.enum(['active', 'inactive', 'expired']),
  project_id: z.string().uuid().optional(),
  created_by: z.string().uuid(),
});

// Form validation schemas (for create/update operations)
export const CreatePurchaseOrderSchema = PurchaseOrderSchema.omit({
  id: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
  status: true,
  requested_by: true,
  approved_by: true,
  approved_at: true,
}).extend({
  status: z.enum(['draft']).optional().default('draft'),
});

export const UpdatePurchaseOrderSchema = PurchaseOrderSchema.partial()
  .omit({
    id: true,
    organization_id: true,
    created_at: true,
    updated_at: true,
  });

export const CreateVendorSchema = VendorSchema.omit({
  id: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateVendorSchema = VendorSchema.partial()
  .omit({
    id: true,
    organization_id: true,
    created_at: true,
    updated_at: true,
  });

export const CreateProcurementRequestSchema = ProcurementRequestSchema.omit({
  id: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
  requested_by: true,
  status: true,
}).extend({
  status: z.enum(['draft']).optional().default('draft'),
});

export const CreateContractSchema = ContractSchema.omit({
  id: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  status: true,
}).extend({
  status: z.enum(['draft']).optional().default('draft'),
});

export const CreateBudgetSchema = BudgetSchema.omit({
  id: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  spent: true,
  status: true,
}).extend({
  status: z.enum(['active']).optional().default('active'),
  spent: z.number().default(0),
});

// Search and filter validation
export const ProcurementSearchSchema = z.object({
  query: z.string().min(1).max(100),
  entities: z.array(z.enum(['orders', 'vendors', 'requests', 'contracts'])).optional(),
  limit: z.number().min(1).max(100).default(50),
});

export const ProcurementFilterSchema = z.object({
  status: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  vendor_id: z.array(z.string()).optional(),
  date_from: z.date().optional(),
  date_to: z.date().optional(),
  amount_min: z.number().optional(),
  amount_max: z.number().optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
});

export const ProcurementSortSchema = z.object({
  field: z.enum(['created_at', 'updated_at', 'total_amount', 'title', 'status', 'priority']),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// Bulk operation validation
export const BulkOperationSchema = z.object({
  operation: z.enum(['delete', 'update', 'approve', 'reject']),
  ids: z.array(z.string().uuid()).min(1).max(100),
  data: z.any().optional(), // For update operations
});

// Import validation
export const ImportDataSchema = z.object({
  entity: z.enum(['orders', 'vendors', 'requests']),
  data: z.array(z.record(z.any())),
  options: z.object({
    skipDuplicates: z.boolean().default(true),
    updateExisting: z.boolean().default(false),
    validateOnly: z.boolean().default(false),
  }).optional(),
});

// Export validation
export const ExportOptionsSchema = z.object({
  entity: z.enum(['orders', 'vendors', 'requests', 'contracts']),
  format: z.enum(['csv', 'json', 'xlsx', 'pdf']),
  filters: ProcurementFilterSchema.optional(),
  fields: z.array(z.string()).optional(),
  includeRelated: z.boolean().default(false),
});

// API validation schemas
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

export const ApiQuerySchema = z.object({
  pagination: PaginationSchema.optional(),
  filters: ProcurementFilterSchema.optional(),
  sort: ProcurementSortSchema.optional(),
  search: z.string().optional(),
  includes: z.array(z.string()).optional(),
  select: z.array(z.string()).optional(),
});

// Validation helper functions
export function validatePurchaseOrder(data: unknown) {
  return PurchaseOrderSchema.safeParse(data);
}

export function validateVendor(data: unknown) {
  return VendorSchema.safeParse(data);
}

export function validateProcurementRequest(data: unknown) {
  return ProcurementRequestSchema.safeParse(data);
}

export function validateContract(data: unknown) {
  return ContractSchema.safeParse(data);
}

export function validateBudget(data: unknown) {
  return BudgetSchema.safeParse(data);
}

// Type exports
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type Vendor = z.infer<typeof VendorSchema>;
export type ProcurementRequest = z.infer<typeof ProcurementRequestSchema>;
export type Contract = z.infer<typeof ContractSchema>;
export type ApprovalWorkflow = z.infer<typeof ApprovalWorkflowSchema>;
export type Budget = z.infer<typeof BudgetSchema>;

export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof UpdatePurchaseOrderSchema>;
export type CreateVendorInput = z.infer<typeof CreateVendorSchema>;
export type CreateProcurementRequestInput = z.infer<typeof CreateProcurementRequestSchema>;
export type CreateContractInput = z.infer<typeof CreateContractSchema>;
export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;
