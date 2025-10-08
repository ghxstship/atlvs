import { z } from 'zod';

/**
 * Procurement Module Types
 * Comprehensive type definitions for procurement, purchasing, and vendor management
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const PURCHASE_ORDER_STATUS = [
  'draft',
  'pending_approval',
  'approved',
  'sent_to_vendor',
  'partially_received',
  'received',
  'cancelled',
] as const;

export const PROCUREMENT_REQUEST_STATUS = [
  'draft',
  'submitted',
  'approved',
  'rejected',
  'converted_to_po',
] as const;

export const VENDOR_STATUS = ['active', 'inactive', 'pending', 'blacklisted'] as const;

export const PAYMENT_TERMS = [
  'net_15',
  'net_30',
  'net_45',
  'net_60',
  'net_90',
  'due_on_receipt',
  'prepaid',
] as const;

export const PROCUREMENT_CATEGORY = [
  'equipment',
  'materials',
  'services',
  'software',
  'catering',
  'travel',
  'marketing',
  'facilities',
  'other',
] as const;

// ============================================================================
// BASE INTERFACES
// ============================================================================

export interface PurchaseOrder {
  id: string;
  po_number: string;
  title: string;
  description: string | null;
  vendor_id: string;
  project_id: string | null;
  status: typeof PURCHASE_ORDER_STATUS[number];
  total_amount: number;
  currency: string;
  tax_amount: number;
  shipping_cost: number;
  payment_terms: typeof PAYMENT_TERMS[number];
  delivery_date: string | null;
  delivery_address: string | null;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
  received_at: string | null;
  line_items: PurchaseOrderLineItem[];
  attachments: string[];
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PurchaseOrderLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: typeof PROCUREMENT_CATEGORY[number];
  notes: string | null;
}

export interface ProcurementRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  requester_id: string;
  department: string | null;
  project_id: string | null;
  category: typeof PROCUREMENT_CATEGORY[number];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_cost: number;
  currency: string;
  justification: string | null;
  status: typeof PROCUREMENT_REQUEST_STATUS[number];
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  purchase_order_id: string | null;
  needed_by: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  legal_name: string | null;
  vendor_code: string;
  status: typeof VENDOR_STATUS[number];
  category: typeof PROCUREMENT_CATEGORY[number][];
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  address: VendorAddress | null;
  payment_terms: typeof PAYMENT_TERMS[number];
  tax_id: string | null;
  rating: number | null; // 1-5
  notes: string | null;
  certifications: string[];
  insurance_expiry: string | null;
  contract_start: string | null;
  contract_end: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface VendorAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ProcurementApproval {
  id: string;
  request_id: string | null;
  purchase_order_id: string | null;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  approved_at: string | null;
  organization_id: string;
  created_at: string;
}

export interface ProcurementMetrics {
  total_spend: number;
  total_orders: number;
  pending_approvals: number;
  active_vendors: number;
  average_order_value: number;
  spend_by_category: Record<string, number>;
  spend_by_vendor: Record<string, number>;
  on_time_delivery_rate: number;
  cost_savings: number;
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

const vendorAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().min(1)
});

const purchaseOrderLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be positive'),
  total_price: z.number().min(0),
  category: z.enum(PROCUREMENT_CATEGORY),
  notes: z.string().max(500).optional().nullable()
});

export const createPurchaseOrderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  vendor_id: z.string().uuid('Invalid vendor ID'),
  project_id: z.string().uuid().optional().nullable(),
  status: z.enum(PURCHASE_ORDER_STATUS).default('draft'),
  total_amount: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  tax_amount: z.number().min(0).default(0),
  shipping_cost: z.number().min(0).default(0),
  payment_terms: z.enum(PAYMENT_TERMS).default('net_30'),
  delivery_date: z.string().datetime().optional().nullable(),
  delivery_address: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  line_items: z.array(purchaseOrderLineItemSchema).min(1, 'At least one line item required'),
  attachments: z.array(z.string().url()).default([])
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial();

export const createProcurementRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  department: z.string().max(100).optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  category: z.enum(PROCUREMENT_CATEGORY),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimated_cost: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  justification: z.string().max(1000).optional().nullable(),
  needed_by: z.string().datetime().optional().nullable()
});

export const updateProcurementRequestSchema = createProcurementRequestSchema.partial();

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(200),
  legal_name: z.string().max(200).optional().nullable(),
  status: z.enum(VENDOR_STATUS).default('pending'),
  category: z.array(z.enum(PROCUREMENT_CATEGORY)).min(1, 'At least one category required'),
  contact_name: z.string().max(100).optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(20).optional().nullable(),
  website: z.string().url().optional().nullable(),
  address: vendorAddressSchema.optional().nullable(),
  payment_terms: z.enum(PAYMENT_TERMS).default('net_30'),
  tax_id: z.string().max(50).optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  certifications: z.array(z.string()).default([]),
  insurance_expiry: z.string().datetime().optional().nullable(),
  contract_start: z.string().datetime().optional().nullable(),
  contract_end: z.string().datetime().optional().nullable()
});

export const updateVendorSchema = createVendorSchema.partial();

export const createProcurementApprovalSchema = z.object({
  request_id: z.string().uuid().optional().nullable(),
  purchase_order_id: z.string().uuid().optional().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  comments: z.string().max(1000).optional().nullable()
}).refine(data => data.request_id || data.purchase_order_id, {
  message: 'Either request_id or purchase_order_id must be provided'
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreatePurchaseOrder = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrder = z.infer<typeof updatePurchaseOrderSchema>;
export type CreateProcurementRequest = z.infer<typeof createProcurementRequestSchema>;
export type UpdateProcurementRequest = z.infer<typeof updateProcurementRequestSchema>;
export type CreateVendor = z.infer<typeof createVendorSchema>;
export type UpdateVendor = z.infer<typeof updateVendorSchema>;
export type CreateProcurementApproval = z.infer<typeof createProcurementApprovalSchema>;

// ============================================================================
// FIELD CONFIGURATION FOR ATLVS
// ============================================================================

export interface ProcurementFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'currency' | 'multiselect' | 'vendor';
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export const PURCHASE_ORDER_FIELDS: ProcurementFieldConfig[] = [
  {
    key: 'po_number',
    label: 'PO Number',
    type: 'text',
    sortable: true,
    filterable: true
  },
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'vendor_id',
    label: 'Vendor',
    type: 'vendor',
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
    options: PURCHASE_ORDER_STATUS.map(s => ({ 
      value: s, 
      label: s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
    }))
  },
  {
    key: 'total_amount',
    label: 'Total Amount',
    type: 'currency',
    sortable: true,
    filterable: true
  },
  {
    key: 'delivery_date',
    label: 'Delivery Date',
    type: 'date',
    sortable: true,
    filterable: true
  },
  {
    key: 'payment_terms',
    label: 'Payment Terms',
    type: 'select',
    sortable: true,
    filterable: true,
    options: PAYMENT_TERMS.map(t => ({ 
      value: t, 
      label: t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
    }))
  },
];

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ProcurementFilters {
  status?: typeof PURCHASE_ORDER_STATUS[number];
  vendor_id?: string;
  project_id?: string;
  category?: typeof PROCUREMENT_CATEGORY[number];
  min_amount?: number;
  max_amount?: number;
  delivery_from?: string;
  delivery_to?: string;
  search?: string;
}

export interface ProcurementSortOptions {
  field: keyof PurchaseOrder;
  direction: 'asc' | 'desc';
}

export interface ProcurementPaginationOptions {
  page: number;
  pageSize: number;
}

export interface ProcurementQueryOptions {
  filters?: ProcurementFilters;
  sort?: ProcurementSortOptions;
  pagination?: ProcurementPaginationOptions;
}
