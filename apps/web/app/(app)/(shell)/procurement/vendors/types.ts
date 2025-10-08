// import { z } from 'zod';

// Base vendor interface
export interface Vendor {
  id: string;
  organization_id: string;
  user_id?: string;
  business_name: string;
  display_name: string;
  business_type: 'individual' | 'company' | 'agency';
  email: string;
  phone?: string;
  website?: string;
  address?: VendorAddress;
  primary_category: string;
  categories?: string[];
  skills?: string[];
  hourly_rate?: number;
  currency: string;
  payment_terms?: string;
  tax_id?: string;
  vat_number?: string;
  bio?: string;
  notes?: string;
  rating?: number;
  total_reviews?: number;
  total_projects?: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  availability_status?: 'available' | 'busy' | 'unavailable';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Address interface
export interface VendorAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

// Contact information interface
export interface VendorContact {
  id: string;
  vendor_id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Vendor document interface
export interface VendorDocument {
  id: string;
  vendor_id: string;
  name: string;
  type: 'contract' | 'insurance' | 'certification' | 'tax_form' | 'other';
  file_url: string;
  file_size?: number;
  mime_type?: string;
  expires_at?: string;
  status: 'active' | 'expired' | 'pending_review';
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

// Vendor performance metrics
export interface VendorPerformance {
  id: string;
  vendor_id: string;
  project_id?: string;
  quality_score: number;
  delivery_score: number;
  communication_score: number;
  overall_score: number;
  feedback?: string;
  created_by: string;
  created_at: string;
}

// Filter interfaces
export interface VendorFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'pending' | 'suspended';
  business_type?: 'all' | 'individual' | 'company' | 'agency';
  primary_category?: string;
  categories?: string[];
  skills?: string[];
  availability_status?: 'all' | 'available' | 'busy' | 'unavailable';
  rating_min?: number;
  rating_max?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  location?: string;
  has_insurance?: boolean;
  has_certifications?: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// Sort options
export type VendorSortField = 
  | 'business_name' 
  | 'display_name' 
  | 'rating' 
  | 'hourly_rate' 
  | 'total_projects' 
  | 'total_reviews'
  | 'primary_category' 
  | 'status' 
  | 'created_at' 
  | 'updated_at';

export type SortDirection = 'asc' | 'desc';

export interface VendorSort {
  field: VendorSortField;
  direction: SortDirection;
}

// View modes
export type VendorViewMode = 'grid' | 'list' | 'table' | 'kanban' | 'dashboard' | 'map';

// Bulk action types
export type VendorBulkActionType = 
  | 'delete' 
  | 'update_status' 
  | 'update_category' 
  | 'send_message' 
  | 'export'
  | 'assign_project';

export interface VendorBulkAction {
  type: VendorBulkActionType;
  vendorIds: string[];
  data?: Record<string, unknown>;
}

// Statistics and analytics
export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  pendingVendors: number;
  suspendedVendors: number;
  averageRating: number;
  totalProjects: number;
  totalReviews: number;
  categoriesCount: number;
  averageHourlyRate: number;
  topCategories: Array<{ category: string; count: number }>;
  recentlyAdded: number;
  recentlyUpdated: number;
}

export interface VendorAnalytics {
  vendorsByCategory: Array<{ category: string; count: number; avgRating: number }>;
  vendorsByStatus: Array<{ status: string; count: number }>;
  vendorsByBusinessType: Array<{ type: string; count: number }>;
  vendorsByLocation: Array<{ location: string; count: number }>;
  ratingDistribution: Array<{ rating: number; count: number }>;
  hourlyRateDistribution: Array<{ range: string; count: number; avgRate: number }>;
  performanceTrends: Array<{
    date: string;
    newVendors: number;
    activeProjects: number;
    avgRating: number;
  }>;
  topPerformers: Array<{
    vendor: Vendor;
    score: number;
    projectsCompleted: number;
    avgRating: number;
  }>;
}

// Field configuration for dynamic forms and tables
export interface VendorFieldConfig {
  key: keyof Vendor;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date' | 'currency' | 'rating' | 'address';
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
export interface VendorExportConfig {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  fields: string[];
  filters?: VendorFilters;
  includeHeaders?: boolean;
  includeContacts?: boolean;
  includeDocuments?: boolean;
  includePerformance?: boolean;
  filename?: string;
}

export interface VendorImportConfig {
  format: 'csv' | 'xlsx' | 'json';
  mapping: Record<string, string>;
  skipFirstRow?: boolean;
  validateOnly?: boolean;
  updateExisting?: boolean;
}

export interface VendorImportResult {
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
  data?: Vendor[];
}

// Activity tracking
export interface VendorActivity {
  id: string;
  organization_id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete' | 'bulk_update' | 'import' | 'export' | 'contact' | 'assign_project';
  resource_type: 'vendor' | 'vendor_contact' | 'vendor_document' | 'vendor_performance';
  resource_id?: string;
  details: Record<string, unknown>;
  created_at: string;
}

// Communication interfaces
export interface VendorMessage {
  id: string;
  vendor_id: string;
  sender_id: string;
  subject: string;
  message: string;
  message_type: 'inquiry' | 'proposal' | 'contract' | 'general';
  status: 'sent' | 'delivered' | 'read' | 'replied';
  created_at: string;
  updated_at: string;
}

// Project assignment interface
export interface VendorProjectAssignment {
  id: string;
  vendor_id: string;
  project_id: string;
  role: string;
  start_date?: string;
  end_date?: string;
  hourly_rate?: number;
  total_budget?: number;
  status: 'proposed' | 'accepted' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Validation schemas
export const vendorSchema = z.object({
  business_name: z.string().min(1, 'Business name is required').max(255, 'Name too long'),
  display_name: z.string().min(1, 'Display name is required').max(255, 'Name too long'),
  business_type: z.enum(['individual', 'company', 'agency']),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  primary_category: z.string().min(1, 'Primary category is required'),
  categories: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  hourly_rate: z.number().positive('Rate must be positive').optional(),
  currency: z.string().min(3, 'Currency code required').max(3, 'Invalid currency code'),
  payment_terms: z.string().optional(),
  tax_id: z.string().optional(),
  vat_number: z.string().optional(),
  bio: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  availability_status: z.enum(['available', 'busy', 'unavailable']).optional()
});

export const vendorContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required').max(255, 'Name too long'),
  title: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  is_primary: z.boolean().default(false)
});

export const vendorDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255, 'Name too long'),
  type: z.enum(['contract', 'insurance', 'certification', 'tax_form', 'other']),
  file_url: z.string().url('Invalid file URL'),
  file_size: z.number().positive().optional(),
  mime_type: z.string().optional(),
  expires_at: z.string().optional(),
  status: z.enum(['active', 'expired', 'pending_review']).default('active')
});

export const vendorPerformanceSchema = z.object({
  project_id: z.string().uuid().optional(),
  quality_score: z.number().min(1).max(5),
  delivery_score: z.number().min(1).max(5),
  communication_score: z.number().min(1).max(5),
  overall_score: z.number().min(1).max(5),
  feedback: z.string().optional()
});

export const vendorFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive', 'pending', 'suspended']).optional(),
  business_type: z.enum(['all', 'individual', 'company', 'agency']).optional(),
  primary_category: z.string().optional(),
  categories: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  availability_status: z.enum(['all', 'available', 'busy', 'unavailable']).optional(),
  rating_min: z.number().min(1).max(5).optional(),
  rating_max: z.number().min(1).max(5).optional(),
  hourly_rate_min: z.number().min(0).optional(),
  hourly_rate_max: z.number().min(0).optional(),
  location: z.string().optional(),
  has_insurance: z.boolean().optional(),
  has_certifications: z.boolean().optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
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

export const getStatusColor = (status: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'secondary';
    case 'pending': return 'warning';
    case 'suspended': return 'destructive';
    default: return 'secondary';
  }
};

export const getBusinessTypeColor = (type: string): string => {
  switch (type) {
    case 'individual': return 'bg-primary/10 text-primary';
    case 'company': return 'bg-success/10 text-success';
    case 'agency': return 'bg-info/10 text-info';
    default: return 'bg-secondary/10 text-secondary';
  }
};

export const getAvailabilityColor = (status: string): 'success' | 'warning' | 'destructive' => {
  switch (status) {
    case 'available': return 'success';
    case 'busy': return 'warning';
    case 'unavailable': return 'destructive';
    default: return 'secondary';
  }
};

export const formatRating = (rating?: number): string => {
  if (!rating) return 'No rating';
  return `${rating.toFixed(1)} / 5.0`;
};

export const formatAddress = (address?: VendorAddress): string => {
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

// Default field configurations
export const defaultVendorFields: VendorFieldConfig[] = [
  {
    key: 'business_name',
    label: 'Business Name',
    type: 'text',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    searchable: true,
    width: 200
  },
  {
    key: 'display_name',
    label: 'Display Name',
    type: 'text',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    searchable: true,
    width: 180
  },
  {
    key: 'business_type',
    label: 'Business Type',
    type: 'select',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    width: 120,
    options: [
      { value: 'individual', label: 'Individual' },
      { value: 'company', label: 'Company' },
      { value: 'agency', label: 'Agency' },
    ]
  },
  {
    key: 'primary_category',
    label: 'Primary Category',
    type: 'select',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    width: 150
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    width: 100,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'suspended', label: 'Suspended' },
    ]
  },
  {
    key: 'rating',
    label: 'Rating',
    type: 'rating',
    visible: true,
    sortable: true,
    filterable: true,
    width: 120
  },
  {
    key: 'hourly_rate',
    label: 'Hourly Rate',
    type: 'currency',
    visible: true,
    sortable: true,
    filterable: true,
    width: 120
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    searchable: true,
    width: 200
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'text',
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
