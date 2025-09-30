/**
 * Billing Settings Module Type Definitions
 * ATLVS Architecture Compliance
 */

// Core Billing Types
export interface BillingSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
  limits: PlanLimits;
  is_popular: boolean;
  is_enterprise: boolean;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  created_at: string;
}

export interface BillingInvoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  amount_paid: number;
  amount_due: number;
  currency: string;
  period_start: string;
  period_end: string;
  paid_at?: string;
  due_date: string;
  created_at: string;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
export type BillingInterval = 'month' | 'year';
export type PaymentType = 'card' | 'bank_account' | 'paypal';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

// Billing Record for ATLVS DataViews
export interface BillingRecord {
  id: string;
  type: BillingRecordType;
  name: string;
  amount: string;
  status: string;
  description: string;
  category: BillingCategory;
  created_at: string;
  updated_at: string;
  metadata?: unknown;
}

export type BillingRecordType = 'subscription' | 'invoice' | 'payment' | 'plan';
export type BillingCategory = 'subscriptions' | 'invoices' | 'payments' | 'plans';

// Plan Limits
export interface PlanLimits {
  users: number;
  projects: number;
  storage_gb: number;
  api_calls_per_month: number;
  integrations: number;
}

// ATLVS DataViews Configuration Types
export interface BillingFieldConfig {
  key: keyof BillingRecord;
  label: string;
  type: 'text' | 'select' | 'date' | 'textarea' | 'boolean';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface BillingViewConfig {
  id: string;
  name: string;
  viewType: 'grid' | 'list' | 'kanban';
  defaultView: string;
  fields: BillingFieldConfig[];
  data: BillingRecord[];
  onSearch?: (query: string) => Promise<void>;
  onFilter?: (filters: unknown) => Promise<void>;
  onSort?: (sorts: unknown) => Promise<void>;
  onRefresh?: () => Promise<BillingRecord[]>;
  onExport?: (data: unknown, format: string) => void;
}

// Form Types
export interface UpdatePaymentMethodFormData {
  card_number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
  name: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
}

export interface ChangePlanFormData {
  plan_id: string;
  prorate: boolean;
}

export interface BillingSettingsFormData {
  billing_email: string;
  company_name?: string;
  tax_id?: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
}

// Statistics Types
export interface BillingStatistics {
  currentPlan: string;
  monthlySpend: number;
  nextBillingDate: string;
  totalInvoices: number;
  paidInvoices: number;
  outstandingAmount: number;
  usageMetrics: UsageMetrics;
}

export interface UsageMetrics {
  users: { current: number; limit: number };
  projects: { current: number; limit: number };
  storage: { current: number; limit: number };
  apiCalls: { current: number; limit: number };
}

// Search and Filter Types
export interface BillingSearchParams {
  query?: string;
  type?: BillingRecordType;
  status?: string;
  category?: BillingCategory;
  created_after?: string;
  created_before?: string;
}

export interface BillingFilterOptions {
  types: Array<{ value: BillingRecordType; label: string; count: number }>;
  statuses: Array<{ value: string; label: string; count: number }>;
  categories: Array<{ value: BillingCategory; label: string; count: number }>;
}

// Drawer Types
export interface BillingDrawerProps {
  mode: 'create' | 'edit' | 'view';
  record?: BillingRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: unknown) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// Component Props Types
export interface BillingClientProps {
  userId: string;
  orgId: string;
}

export interface BillingGridViewProps {
  records: BillingRecord[];
  loading: boolean;
  onEdit: (record: BillingRecord) => void;
  onDelete: (id: string) => void;
  onSelect: (ids: string[]) => void;
  selectedIds: string[];
}

export interface BillingListViewProps {
  records: BillingRecord[];
  loading: boolean;
  onEdit: (record: BillingRecord) => void;
  onView: (record: BillingRecord) => void;
}

// Export Types
export interface BillingExportOptions {
  format: 'csv' | 'json';
  includeMetadata: boolean;
  categories?: BillingCategory[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Validation Types
export interface BillingValidationError {
  field: string;
  message: string;
  code: string;
}

export interface BillingValidationResult {
  valid: boolean;
  errors: BillingValidationError[];
}

// State Management Types
export interface BillingState {
  subscription: BillingSubscription | null;
  paymentMethods: PaymentMethod[];
  invoices: BillingInvoice[];
  plans: BillingPlan[];
  records: BillingRecord[];
  settings: BillingSettingsFormData | null;
  loading: boolean;
  error: string | null;
  selectedRecords: string[];
  searchQuery: string;
  filters: BillingSearchParams;
  statistics: BillingStatistics | null;
}

export interface BillingActions {
  loadSubscription: () => Promise<void>;
  loadPaymentMethods: () => Promise<void>;
  loadInvoices: () => Promise<void>;
  loadPlans: () => Promise<void>;
  updatePaymentMethod: (data: UpdatePaymentMethodFormData) => Promise<void>;
  changePlan: (data: ChangePlanFormData) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSettings: (data: BillingSettingsFormData) => Promise<void>;
  loadRecords: () => Promise<void>;
  searchRecords: (query: string) => Promise<void>;
  filterRecords: (filters: BillingSearchParams) => Promise<void>;
  exportRecords: (options: BillingExportOptions) => Promise<void>;
  loadStatistics: () => Promise<void>;
}
