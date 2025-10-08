// import { z } from 'zod';

// Base tracking interface
export interface TrackingItem {
  id: string;
  organization_id: string;
  order_id: string;
  order_number: string;
  vendor_id?: string;
  vendor_name: string;
  description: string;
  total_amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  estimated_delivery?: string;
  
  // Shipping Information
  tracking_number?: string;
  shipping_carrier?: string;
  shipping_method?: string;
  shipping_cost?: number;
  
  // Address Information
  shipping_address?: TrackingAddress;
  billing_address?: TrackingAddress;
  
  // Tracking Events
  tracking_events?: TrackingEvent[];
  
  // Performance Metrics
  delivery_performance?: 'on_time' | 'early' | 'late' | 'overdue';
  days_to_delivery?: number;
  delay_reason?: string;
  
  // Additional Information
  notes?: string;
  attachments?: string[];
  tags?: string[];
  
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// Address interface
export interface TrackingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  contact_name?: string;
  contact_phone?: string;
}

// Tracking event interface
export interface TrackingEvent {
  id: string;
  tracking_id: string;
  event_type: 'order_placed' | 'order_confirmed' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned';
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  carrier_event_code?: string;
  created_at: string;
}

// Delivery performance interface
export interface DeliveryPerformance {
  tracking_id: string;
  order_number: string;
  vendor_name: string;
  expected_date?: string;
  actual_date?: string;
  performance: 'on_time' | 'early' | 'late' | 'overdue';
  delay_days?: number;
  delay_reason?: string;
}

// Filter interfaces
export interface TrackingFilters {
  search?: string;
  status?: 'all' | TrackingItem['status'];
  priority?: 'all' | TrackingItem['priority'];
  vendor?: string;
  vendor_id?: string;
  carrier?: string;
  performance?: 'all' | 'on_time' | 'early' | 'late' | 'overdue';
  dateRange?: {
    start?: string;
    end?: string;
  };
  deliveryRange?: {
    start?: string;
    end?: string;
  };
  hasTracking?: boolean;
  tags?: string[];
}

// Sort options
export type TrackingSortField = 'order_number' | 'vendor_name' | 'status' | 'priority' | 'order_date' | 'expected_delivery' | 'actual_delivery' | 'total_amount' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export interface TrackingSort {
  field: TrackingSortField;
  direction: SortDirection;
}

// View modes
export type TrackingViewMode = 'grid' | 'table' | 'kanban' | 'timeline' | 'map' | 'dashboard';

// Statistics interface
export interface TrackingStats {
  totalOrders: number;
  activeShipments: number;
  deliveredOrders: number;
  overdueOrders: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  totalShippingCost: number;
  
  // Performance by status
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  
  // Performance by carrier
  carrierPerformance: Array<{
    carrier: string;
    orders: number;
    onTimeRate: number;
    avgDeliveryTime: number;
  }>;
  
  // Performance by vendor
  vendorPerformance: Array<{
    vendor: string;
    orders: number;
    onTimeRate: number;
    avgDeliveryTime: number;
  }>;
  
  // Trends
  deliveryTrends: Array<{
    period: string;
    delivered: number;
    onTime: number;
    late: number;
    avgDays: number;
  }>;
}

// Bulk action interface
export interface TrackingBulkAction {
  type: 'update_status' | 'add_tracking' | 'update_carrier' | 'add_tags' | 'export' | 'delete';
  trackingIds: string[];
  data?: {
    status?: TrackingItem['status'];
    tracking_number?: string;
    carrier?: string;
    tags?: string[];
    notes?: string;
  };
}

// Export configuration
export interface TrackingExportConfig {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  fields: string[];
  filters?: TrackingFilters;
  includeEvents?: boolean;
  includePerformance?: boolean;
}

// Import configuration
export interface TrackingImportConfig {
  format: 'csv' | 'xlsx' | 'json';
  mapping: Record<string, string>;
  validateOnly?: boolean;
  updateExisting?: boolean;
}

// Import result
export interface TrackingImportResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}

// Field configuration
export interface TrackingFieldConfig {
  field: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
  required?: boolean;
  options?: string[];
}

// Analytics interface
export interface TrackingAnalytics {
  deliveryPerformance: {
    onTime: number;
    early: number;
    late: number;
    overdue: number;
    avgDeliveryTime: number;
  };
  
  carrierAnalytics: Array<{
    carrier: string;
    shipments: number;
    onTimeRate: number;
    avgCost: number;
    reliability: number;
  }>;
  
  vendorAnalytics: Array<{
    vendor: string;
    orders: number;
    onTimeRate: number;
    avgLeadTime: number;
    performance: number;
  }>;
  
  costAnalytics: {
    totalShippingCost: number;
    avgShippingCost: number;
    costByCarrier: Array<{
      carrier: string;
      cost: number;
      percentage: number;
    }>;
  };
  
  trendAnalytics: Array<{
    period: string;
    orders: number;
    delivered: number;
    onTimeRate: number;
    avgDeliveryTime: number;
  }>;
}

// Validation schemas
export const trackingItemSchema = z.object({
  order_number: z.string().min(1, 'Order number is required'),
  vendor_name: z.string().min(1, 'Vendor name is required'),
  description: z.string().min(1, 'Description is required'),
  total_amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().min(3, 'Currency code required'),
  status: z.enum(['draft', 'pending', 'approved', 'ordered', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  order_date: z.string(),
  expected_delivery: z.string().optional(),
  tracking_number: z.string().optional(),
  shipping_carrier: z.string().optional()
});

export const trackingFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'draft', 'pending', 'approved', 'ordered', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned']).optional(),
  priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).optional(),
  vendor: z.string().optional(),
  carrier: z.string().optional(),
  performance: z.enum(['all', 'on_time', 'early', 'late', 'overdue']).optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  hasTracking: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateDeliveryPerformance = (expected?: string, actual?: string): 'on_time' | 'early' | 'late' | 'overdue' | 'pending' => {
  if (!expected) return 'pending';
  if (!actual) {
    const now = new Date();
    const expectedDate = new Date(expected);
    return now > expectedDate ? 'overdue' : 'pending';
  }
  
  const expectedDate = new Date(expected);
  const actualDate = new Date(actual);
  const diffDays = Math.floor((actualDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'early';
  if (diffDays === 0) return 'on_time';
  if (diffDays <= 2) return 'late';
  return 'overdue';
};

export const calculateDaysToDelivery = (orderDate: string, deliveryDate?: string): number => {
  const start = new Date(orderDate);
  const end = deliveryDate ? new Date(deliveryDate) : new Date();
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (status: TrackingItem['status']): 'success' | 'warning' | 'destructive' | 'secondary' | 'default' => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'shipped':
    case 'in_transit':
    case 'out_for_delivery':
      return 'default';
    case 'ordered':
    case 'approved':
      return 'warning';
    case 'cancelled':
    case 'returned':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const getPriorityColor = (priority: TrackingItem['priority']): 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'success';
  }
};

export const getPerformanceColor = (performance: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (performance) {
    case 'on_time':
    case 'early':
      return 'success';
    case 'late':
      return 'warning';
    case 'overdue':
      return 'destructive';
    default:
      return 'secondary';
  }
};

// Default field configurations
export const defaultTrackingFields: TrackingFieldConfig[] = [
  { field: 'order_number', label: 'Order Number', type: 'text', visible: true, sortable: true, filterable: true, required: true },
  { field: 'vendor_name', label: 'Vendor', type: 'text', visible: true, sortable: true, filterable: true, required: true },
  { field: 'status', label: 'Status', type: 'select', visible: true, sortable: true, filterable: true, options: ['draft', 'pending', 'approved', 'ordered', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned'] },
  { field: 'priority', label: 'Priority', type: 'select', visible: true, sortable: true, filterable: true, options: ['low', 'medium', 'high', 'urgent'] },
  { field: 'total_amount', label: 'Amount', type: 'number', visible: true, sortable: true, filterable: false },
  { field: 'order_date', label: 'Order Date', type: 'date', visible: true, sortable: true, filterable: true },
  { field: 'expected_delivery', label: 'Expected Delivery', type: 'date', visible: true, sortable: true, filterable: true },
  { field: 'actual_delivery', label: 'Actual Delivery', type: 'date', visible: true, sortable: true, filterable: true },
  { field: 'tracking_number', label: 'Tracking Number', type: 'text', visible: true, sortable: false, filterable: true },
  { field: 'shipping_carrier', label: 'Carrier', type: 'text', visible: true, sortable: true, filterable: true },
];

// Common carriers list
export const commonCarriers = [
  'FedEx',
  'UPS',
  'DHL',
  'USPS',
  'Amazon Logistics',
  'OnTrac',
  'LaserShip',
  'Local Courier',
  'Other',
];

// Status workflow
export const statusWorkflow: Record<TrackingItem['status'], TrackingItem['status'][]> = {
  draft: ['pending', 'cancelled'],
  pending: ['approved', 'cancelled'],
  approved: ['ordered', 'cancelled'],
  ordered: ['shipped', 'cancelled'],
  shipped: ['in_transit', 'delivered', 'returned'],
  in_transit: ['out_for_delivery', 'delivered', 'returned'],
  out_for_delivery: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: []
};
