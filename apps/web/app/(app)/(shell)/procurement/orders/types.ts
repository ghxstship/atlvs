// import { z } from 'zod';

// Base order interface
export interface ProcurementOrder {
  id: string;
  organization_id: string;
  order_number: string;
  vendor_id?: string;
  vendor_name: string;
  vendor_company_id?: string;
  project_id?: string;
  description: string;
  notes?: string;
  total_amount: number;
  currency: string;
  tax_amount?: number;
  shipping_amount?: number;
  discount_amount?: number;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'partially_received' | 'received' | 'delivered' | 'cancelled' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  delivery_address?: OrderAddress;
  billing_address?: OrderAddress;
  payment_terms?: string;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  tracking_number?: string;
  carrier?: string;
  tags?: string[];
  attachments?: OrderAttachment[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Order address interface
export interface OrderAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  contact_name?: string;
  contact_phone?: string;
}

// Order item interface
export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  service_id?: string;
  catalog_item_id?: string;
  name: string;
  description?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit?: string;
  specifications?: string;
  notes?: string;
  received_quantity?: number;
  created_at: string;
  updated_at: string;
}

// Order attachment interface
export interface OrderAttachment {
  id: string;
  order_id: string;
  name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by: string;
  created_at: string;
}

// Order activity/history interface
export interface OrderActivity {
  id: string;
  order_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'cancelled' | 'ordered' | 'shipped' | 'delivered' | 'received';
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Order approval interface
export interface OrderApproval {
  id: string;
  order_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
  created_at: string;
}

// Filter interfaces
export interface OrderFilters {
  search?: string;
  status?: 'all' | ProcurementOrder['status'];
  priority?: 'all' | ProcurementOrder['priority'];
  payment_status?: 'all' | ProcurementOrder['payment_status'];
  vendor_name?: string;
  vendor_id?: string;
  project_id?: string;
  created_by?: string;
  approved_by?: string;
  amount_range?: {
    min?: number;
    max?: number;
  };
  date_range?: {
    start?: string;
    end?: string;
  };
  delivery_date_range?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
  approval_required?: boolean;
  has_attachments?: boolean;
}

// Sort options
export type OrderSortField = 
  | 'order_number' 
  | 'vendor_name' 
  | 'total_amount' 
  | 'status' 
  | 'priority'
  | 'payment_status'
  | 'order_date' 
  | 'expected_delivery'
  | 'actual_delivery'
  | 'created_at' 
  | 'updated_at';

export type SortDirection = 'asc' | 'desc';

export interface OrderSort {
  field: OrderSortField;
  direction: SortDirection;
}

// View modes
export type OrderViewMode = 'grid' | 'list' | 'table' | 'kanban' | 'calendar' | 'dashboard';

// Bulk action types
export type OrderBulkActionType = 
  | 'delete' 
  | 'update_status' 
  | 'update_priority'
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'export'
  | 'assign_project'
  | 'add_tags';

export interface OrderBulkAction {
  type: OrderBulkActionType;
  orderIds: string[];
  data?: Record<string, unknown>;
}

// Statistics and analytics
export interface OrderStats {
  totalOrders: number;
  draftOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  orderedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalValue: number;
  averageOrderValue: number;
  pendingApprovals: number;
  overdueOrders: number;
  recentOrders: number;
  topVendors: Array<{ vendor: string; count: number; value: number }>;
  ordersByStatus: Array<{ status: string; count: number; value: number }>;
  ordersByPriority: Array<{ priority: string; count: number; value: number }>;
  monthlyTrends: Array<{
    month: string;
    orders: number;
    value: number;
    avgValue: number;
  }>;
}

export interface OrderAnalytics {
  ordersByStatus: Array<{ status: string; count: number; value: number }>;
  ordersByPriority: Array<{ priority: string; count: number; value: number }>;
  ordersByVendor: Array<{ vendor: string; count: number; value: number; avgDeliveryTime: number }>;
  ordersByProject: Array<{ project: string; count: number; value: number }>;
  paymentStatusDistribution: Array<{ status: string; count: number; value: number }>;
  deliveryPerformance: Array<{
    period: string;
    onTime: number;
    late: number;
    avgDeliveryTime: number;
  }>;
  spendingTrends: Array<{
    date: string;
    amount: number;
    orders: number;
    avgOrderValue: number;
  }>;
  approvalMetrics: {
    avgApprovalTime: number;
    approvalRate: number;
    pendingApprovals: number;
    rejectionReasons: Array<{ reason: string; count: number }>;
  };
}

// Field configuration for dynamic forms and tables
export interface OrderFieldConfig {
  key: keyof ProcurementOrder;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date' | 'currency' | 'address' | 'tags';
  required?: boolean;
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: number;
  options?: Array<{ value: string; label: string }>;
  validation?: z.ZodSchema;
  placeholder?: string;
  helpText?: string;
}

// Export/Import interfaces
export interface OrderExportConfig {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  fields: string[];
  filters?: OrderFilters;
  includeHeaders?: boolean;
  includeItems?: boolean;
  includeAttachments?: boolean;
  includeActivities?: boolean;
  filename?: string;
}

export interface OrderImportConfig {
  format: 'csv' | 'xlsx' | 'json';
  mapping: Record<string, string>;
  skipFirstRow?: boolean;
  validateOnly?: boolean;
  updateExisting?: boolean;
  createVendors?: boolean;
}

export interface OrderImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  updatedRows: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  data?: ProcurementOrder[];
}

// Workflow and approval interfaces
export interface OrderWorkflow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  conditions: OrderWorkflowCondition[];
  actions: OrderWorkflowAction[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderWorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: unknown;
}

export interface OrderWorkflowAction {
  type: 'require_approval' | 'auto_approve' | 'assign_project' | 'send_notification' | 'update_status';
  parameters: Record<string, unknown>;
}

// Validation schemas
export const orderSchema = z.object({
  order_number: z.string().min(1, 'Order number is required').max(100, 'Order number too long'),
  vendor_name: z.string().min(1, 'Vendor name is required').max(255, 'Vendor name too long'),
  vendor_id: z.string().uuid().optional(),
  vendor_company_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  notes: z.string().optional(),
  total_amount: z.number().min(0, 'Total amount must be non-negative'),
  currency: z.string().min(3, 'Currency code required').max(3, 'Invalid currency code'),
  tax_amount: z.number().min(0).optional(),
  shipping_amount: z.number().min(0).optional(),
  discount_amount: z.number().min(0).optional(),
  status: z.enum(['draft', 'pending', 'approved', 'ordered', 'partially_received', 'received', 'delivered', 'cancelled', 'rejected']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  order_date: z.string(),
  expected_delivery: z.string().optional(),
  actual_delivery: z.string().optional(),
  delivery_address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
    contact_name: z.string().optional(),
    contact_phone: z.string().optional()
  }).optional(),
  billing_address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
    contact_name: z.string().optional(),
    contact_phone: z.string().optional()
  }).optional(),
  payment_terms: z.string().optional(),
  payment_method: z.string().optional(),
  payment_status: z.enum(['pending', 'paid', 'partially_paid', 'overdue', 'cancelled']),
  approval_required: z.boolean().default(false),
  tracking_number: z.string().optional(),
  carrier: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const orderItemSchema = z.object({
  product_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  catalog_item_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Item name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  unit: z.string().optional(),
  specifications: z.string().optional(),
  notes: z.string().optional()
});

export const orderFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'draft', 'pending', 'approved', 'ordered', 'partially_received', 'received', 'delivered', 'cancelled', 'rejected']).optional(),
  priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).optional(),
  payment_status: z.enum(['all', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled']).optional(),
  vendor_name: z.string().optional(),
  vendor_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  approved_by: z.string().uuid().optional(),
  amount_range: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  date_range: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  delivery_date_range: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  tags: z.array(z.string()).optional(),
  approval_required: z.boolean().optional(),
  has_attachments: z.boolean().optional()
});

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status: string): 'success' | 'warning' | 'destructive' | 'secondary' | 'default' => {
  switch (status) {
    case 'approved': return 'success';
    case 'delivered': return 'success';
    case 'received': return 'success';
    case 'pending': return 'warning';
    case 'ordered': return 'default';
    case 'partially_received': return 'warning';
    case 'cancelled': return 'destructive';
    case 'rejected': return 'destructive';
    case 'draft': return 'secondary';
    default: return 'secondary';
  }
};

export const getPriorityColor = (priority: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (priority) {
    case 'urgent': return 'destructive';
    case 'high': return 'warning';
    case 'medium': return 'secondary';
    case 'low': return 'success';
    default: return 'secondary';
  }
};

export const getPaymentStatusColor = (status: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (status) {
    case 'paid': return 'success';
    case 'partially_paid': return 'warning';
    case 'overdue': return 'destructive';
    case 'cancelled': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'secondary';
  }
};

export const calculateOrderTotal = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + item.total_price, 0);
};

export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  return subtotal * (taxRate / 100);
};

export const formatAddress = (address?: OrderAddress): string => {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

export const getOrderStatusFlow = (currentStatus: ProcurementOrder['status']): ProcurementOrder['status'][] => {
  const statusFlow: Record<ProcurementOrder['status'], ProcurementOrder['status'][]> = {
    draft: ['pending', 'cancelled'],
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['ordered', 'cancelled'],
    ordered: ['partially_received', 'received', 'delivered', 'cancelled'],
    partially_received: ['received', 'delivered'],
    received: ['delivered'],
    delivered: [],
    cancelled: [],
    rejected: ['draft', 'pending']
  };
  
  return statusFlow[currentStatus] || [];
};

// Default field configurations
export const defaultOrderFields: OrderFieldConfig[] = [
  {
    key: 'order_number',
    label: 'Order Number',
    type: 'text',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    searchable: true,
    width: 150
  },
  {
    key: 'vendor_name',
    label: 'Vendor',
    type: 'text',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    searchable: true,
    width: 200
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    width: 120,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'ordered', label: 'Ordered' },
      { value: 'partially_received', label: 'Partially Received' },
      { value: 'received', label: 'Received' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'rejected', label: 'Rejected' },
    ]
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    width: 100,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ]
  },
  {
    key: 'total_amount',
    label: 'Total Amount',
    type: 'currency',
    visible: true,
    sortable: true,
    filterable: true,
    width: 120
  },
  {
    key: 'payment_status',
    label: 'Payment Status',
    type: 'select',
    visible: true,
    sortable: true,
    filterable: true,
    width: 130,
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'paid', label: 'Paid' },
      { value: 'partially_paid', label: 'Partially Paid' },
      { value: 'overdue', label: 'Overdue' },
      { value: 'cancelled', label: 'Cancelled' },
    ]
  },
  {
    key: 'order_date',
    label: 'Order Date',
    type: 'date',
    visible: true,
    sortable: true,
    filterable: true,
    width: 120
  },
  {
    key: 'expected_delivery',
    label: 'Expected Delivery',
    type: 'date',
    visible: true,
    sortable: true,
    filterable: true,
    width: 140
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date',
    visible: true,
    sortable: true,
    filterable: true,
    width: 120
  },
];
