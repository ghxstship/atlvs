import { User } from '@supabase/supabase-js';

// Base transaction interface
export interface Transaction {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  type: 'debit' | 'credit';
  category: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  account_id?: string;
  reference_id?: string;
  reference_type?: 'expense' | 'revenue' | 'invoice' | 'budget' | 'other';
  transaction_date: string;
  processed_date?: string;
  occurred_at?: string;
  kind?: string;
  payment_method?: string;
  external_reference?: string;
  reconciled: boolean;
  reconciled_date?: string;
  tags?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at: string;
}

// Create transaction data
export interface CreateTransactionData {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  type: 'debit' | 'credit';
  category: string;
  account_id?: string;
  reference_id?: string;
  reference_type?: 'expense' | 'revenue' | 'invoice' | 'budget' | 'other';
  transaction_date: string;
  payment_method?: string;
  external_reference?: string;
  tags?: string[];
  notes?: string;
}

// Update transaction data
export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  processed_date?: string;
  reconciled?: boolean;
  reconciled_date?: string;
  updated_by?: string;
}

// Transaction filters
export interface TransactionFilters {
  type?: ('debit' | 'credit')[];
  status?: string[];
  category?: string[];
  account_id?: string;
  reference_type?: string[];
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  reconciled?: boolean;
  search?: string;
}

// Transaction statistics
export interface TransactionStatistics {
  totalTransactions: number;
  totalDebits: number;
  totalCredits: number;
  netAmount: number;
  pendingTransactions: number;
  reconciledTransactions: number;
  averageAmount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    debits: number;
    credits: number;
    net: number;
    count: number;
  }>;
  accountBreakdown: Array<{
    account_id: string;
    account_name?: string;
    balance: number;
    transaction_count: number;
  }>;
}

// Component props
export interface TransactionsClientProps {
  user: User;
  orgId: string;
  translations: unknown;
}

export interface CreateTransactionClientProps {
  user: User;
  orgId: string;
  onSuccess?: (transaction: Transaction) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateTransactionData>;
}

export interface TransactionDrawerProps {
  transaction?: Transaction;
  mode: 'create' | 'edit' | 'view';
  onSave?: (transaction: Transaction) => void;
  onCancel?: () => void;
  user: User;
  orgId: string;
}

// Transaction workflow actions
export interface TransactionWorkflowActions {
  markCompleted: (transactionId: string) => Promise<void>;
  markFailed: (transactionId: string, reason?: string) => Promise<void>;
  reconcile: (transactionId: string, reconciledDate?: string) => Promise<void>;
  cancel: (transactionId: string, reason?: string) => Promise<void>;
}

// Export/import types
export interface TransactionExportData {
  title: string;
  description: string;
  amount: string;
  currency: string;
  type: string;
  category: string;
  status: string;
  account_id: string;
  reference_id: string;
  reference_type: string;
  transaction_date: string;
  processed_date: string;
  payment_method: string;
  external_reference: string;
  reconciled: string;
  reconciled_date: string;
  tags: string;
  notes: string;
}

export interface TransactionImportData {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  type: 'debit' | 'credit';
  category: string;
  account_id?: string;
  reference_id?: string;
  reference_type?: 'expense' | 'revenue' | 'invoice' | 'budget' | 'other';
  transaction_date: string;
  payment_method?: string;
  external_reference?: string;
  tags?: string;
  notes?: string;
}
