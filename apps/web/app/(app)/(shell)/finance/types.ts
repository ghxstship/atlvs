import { User } from '@supabase/supabase-js';

// Base Finance Record Interface
export interface FinanceRecord {
  id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Budget Interfaces
export interface Budget extends FinanceRecord {
  name: string;
  description?: string;
  amount: number;
  spent: number;
  currency: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  category?: string;
  period_start?: string;
  period_end?: string;
  project_id?: string;
  approved_by?: string;
  approved_at?: string;
  // Computed fields
  remaining?: number;
  utilization?: number;
}

export interface CreateBudgetData {
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  category?: string;
  period_start?: string;
  period_end?: string;
  project_id?: string;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  id: string;
  spent?: number;
}

// Expense Interfaces
export interface Expense extends FinanceRecord {
  description: string;
  amount: number;
  currency: string;
  category: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  expense_date: string;
  receipt_url?: string;
  budget_id?: string;
  project_id?: string;
  vendor_id?: string;
  submitted_by?: string;
  approved_by?: string;
  submitted_at?: string;
  approved_at?: string;
  paid_at?: string;
  notes?: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  currency?: string;
  category: string;
  expense_date: string;
  receipt_url?: string;
  budget_id?: string;
  project_id?: string;
  vendor_id?: string;
  notes?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  id: string;
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
}

// Revenue Interfaces
export interface Revenue extends FinanceRecord {
  description: string;
  amount: number;
  currency: string;
  source: string;
  status: 'projected' | 'invoiced' | 'received' | 'cancelled';
  recognition_date?: string;
  received_date?: string;
  project_id?: string;
  invoice_id?: string;
}

export interface CreateRevenueData {
  description: string;
  amount: number;
  currency?: string;
  source: string;
  status?: 'projected' | 'invoiced' | 'received' | 'cancelled';
  recognition_date?: string;
  received_date?: string;
  project_id?: string;
  invoice_id?: string;
}

export interface UpdateRevenueData extends Partial<CreateRevenueData> {
  id: string;
}

// Transaction Interfaces
export interface Transaction extends FinanceRecord {
  description: string;
  amount: number;
  currency: string;
  kind: 'revenue' | 'expense';
  account_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  occurred_at: string;
  reference_number?: string;
  // Enriched fields
  account_name?: string;
}

export interface CreateTransactionData {
  description: string;
  amount: number;
  currency?: string;
  kind: 'revenue' | 'expense';
  account_id: string;
  occurred_at: string;
  reference_number?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: string;
}

// Account Interfaces
export interface Account extends FinanceRecord {
  name: string;
  description?: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'other';
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'closed';
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
}

export interface CreateAccountData {
  name: string;
  description?: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'other';
  balance?: number;
  currency?: string;
  status?: 'active' | 'inactive' | 'closed';
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
}

export interface UpdateAccountData extends Partial<CreateAccountData> {
  id: string;
}

// Invoice Interfaces
export interface Invoice extends FinanceRecord {
  invoice_number: string;
  description?: string;
  amount_due: number;
  total_amount?: number;
  tax_amount?: number;
  discount_amount?: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issued_date?: string;
  due_date?: string;
  line_items?: InvoiceLineItem[];
  client_company_id?: string;
  purchase_order_id?: string;
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface CreateInvoiceData {
  invoice_number: string;
  description?: string;
  amount_due: number;
  total_amount?: number;
  tax_amount?: number;
  discount_amount?: number;
  currency?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issued_date?: string;
  due_date?: string;
  line_items?: InvoiceLineItem[];
  client_company_id?: string;
  purchase_order_id?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  id: string;
}

// Forecast Interfaces
export interface Forecast extends FinanceRecord {
  name: string;
  description?: string;
  projected_amount: number;
  actual_amount?: number;
  variance?: number;
  confidence_level: 'low' | 'medium' | 'high';
  forecast_date: string;
  period_start?: string;
  period_end?: string;
}

export interface CreateForecastData {
  name: string;
  description?: string;
  projected_amount: number;
  actual_amount?: number;
  confidence_level: 'low' | 'medium' | 'high';
  forecast_date: string;
  period_start?: string;
  period_end?: string;
}

export interface UpdateForecastData extends Partial<CreateForecastData> {
  id: string;
  variance?: number;
}

// Statistics and Analytics
export interface FinanceStatistics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalBudgets: number;
  budgetUtilization: number;
  pendingInvoices: number;
  overdueInvoices: number;
  accountsBalance: number;
  activeAccounts: number;
  completedTransactions: number;
  forecastAccuracy: number;
  currency: string;
}

export interface FinanceTrend {
  period: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  budgetUtilization: number;
}

export interface BudgetAlert {
  id: string;
  budgetName: string;
  spent: number;
  amount: number;
  utilization: number;
  status: 'warning' | 'critical';
}

export interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  kind: 'revenue' | 'expense';
  occurredAt: string;
  accountName: string;
}

// Filter and Search Interfaces
export interface FinanceFilters {
  status?: string;
  category?: string;
  projectId?: string;
  budgetId?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

export interface FinanceSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FinancePagination {
  page: number;
  limit: number;
  total: number;
}

// Component Props Interfaces
export interface FinanceClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

export interface FinanceDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  data?: unknown;
  onSave?: (data: unknown) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// Form Interfaces
export interface FinanceFormData {
  [key: string]: unknown;
}

export interface FinanceFormErrors {
  [key: string]: string;
}

export interface FinanceFormState {
  data: FinanceFormData;
  errors: FinanceFormErrors;
  loading: boolean;
  submitting: boolean;
}

// Export/Import Interfaces
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  entityType: 'budgets' | 'expenses' | 'revenue' | 'transactions' | 'accounts' | 'invoices' | 'forecasts';
  filters?: FinanceFilters;
  fields?: string[];
}

export interface ImportOptions {
  format: 'csv' | 'json' | 'xlsx';
  entityType: 'budgets' | 'expenses' | 'revenue' | 'transactions' | 'accounts' | 'invoices' | 'forecasts';
  mapping?: { [key: string]: string };
  validateOnly?: boolean;
}

// API Response Interfaces
export interface FinanceApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface FinanceListResponse<T = any> extends FinanceApiResponse<T[]> {
  pagination?: FinancePagination;
  filters?: FinanceFilters;
  sort?: FinanceSortOptions;
}

// Workflow Interfaces
export interface ExpenseApprovalWorkflow {
  expenseId: string;
  action: 'approve' | 'reject';
  notes?: string;
  approvedBy: string;
}

export interface RevenueRecognitionWorkflow {
  revenueId: string;
  action: 'recognize' | 'defer' | 'cancel';
  recognitionDate?: string;
  notes?: string;
}

export interface InvoiceWorkflow {
  invoiceId: string;
  action: 'send' | 'mark_paid' | 'mark_overdue' | 'cancel';
  paidDate?: string;
  notes?: string;
}

// Audit and Compliance
export interface FinanceAuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: unknown;
  occurred_at: string;
}

export interface ComplianceReport {
  period: string;
  totalTransactions: number;
  auditedTransactions: number;
  complianceScore: number;
  issues: ComplianceIssue[];
}

export interface ComplianceIssue {
  id: string;
  type: 'missing_receipt' | 'approval_required' | 'duplicate_entry' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resourceId: string;
  resourceType: string;
  detectedAt: string;
}
