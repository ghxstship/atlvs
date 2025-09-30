import { User } from '@supabase/supabase-js';

// Base expense interface
export interface Expense {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  receipt_url?: string;
  submitted_by: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  due_date?: string;
  project_id?: string;
  vendor?: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Create expense data
export interface CreateExpenseData {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  category: string;
  receipt_url?: string;
  due_date?: string;
  project_id?: string;
  vendor?: string;
  tags?: string[];
  notes?: string;
}

// Update expense data
export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
}

// Expense filters
export interface ExpenseFilters {
  status?: string[];
  category?: string[];
  submitted_by?: string[];
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  project_id?: string;
  search?: string;
}

// Expense statistics
export interface ExpenseStatistics {
  totalExpenses: number;
  pendingApproval: number;
  approvedAmount: number;
  rejectedCount: number;
  averageAmount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

// Component props
export interface ExpensesClientProps {
  user: User;
  orgId: string;
  translations: unknown;
}

export interface CreateExpenseClientProps {
  user: User;
  orgId: string;
  onSuccess?: (expense: Expense) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateExpenseData>;
}

export interface ExpenseDrawerProps {
  expense?: Expense;
  mode: 'create' | 'edit' | 'view';
  onSave?: (expense: Expense) => void;
  onCancel?: () => void;
  user: User;
  orgId: string;
}

// Expense workflow actions
export interface ExpenseWorkflowActions {
  submit: (expenseId: string) => Promise<void>;
  approve: (expenseId: string, approvedBy: string) => Promise<void>;
  reject: (expenseId: string, reason?: string) => Promise<void>;
  markPaid: (expenseId: string) => Promise<void>;
}

// Export/import types
export interface ExpenseExportData {
  title: string;
  description: string;
  amount: string;
  currency: string;
  category: string;
  status: string;
  vendor: string;
  submitted_by: string;
  submitted_at: string;
  approved_at: string;
  paid_at: string;
  due_date: string;
  project_id: string;
  tags: string;
  notes: string;
}

export interface ExpenseImportData {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  category: string;
  vendor?: string;
  due_date?: string;
  project_id?: string;
  tags?: string;
  notes?: string;
}
