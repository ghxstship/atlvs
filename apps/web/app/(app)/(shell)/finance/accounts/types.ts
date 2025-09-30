/**
 * Finance Accounts Module - Type Definitions
 * GL (General Ledger) Accounts Management System
 */

export interface GLAccount {
  id: string;
  account_number: string;
  name: string;
  description?: string;
  type: AccountType;
  subtype?: string;
  parent_account_id?: string;
  is_active: boolean;
  normal_balance: 'debit' | 'credit';
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by?: string;
  // Computed fields
  children?: GLAccount[];
  parent_account?: GLAccount;
  balance_formatted?: string;
  depth?: number;
}

export type AccountType = 
  | 'asset' 
  | 'liability' 
  | 'equity' 
  | 'revenue' 
  | 'expense';

export interface AccountSubtype {
  asset: string[];
  liability: string[];
  equity: string[];
  revenue: string[];
  expense: string[];
}

export const ASSET_SUBTYPES = [
  'current_assets',
  'fixed_assets',
  'intangible_assets',
  'investments',
  'other_assets'
] as const;

export const LIABILITY_SUBTYPES = [
  'current_liabilities',
  'long_term_liabilities',
  'other_liabilities'
] as const;

export const EQUITY_SUBTYPES = [
  'owners_equity',
  'retained_earnings',
  'capital_stock',
  'other_equity'
] as const;

export const REVENUE_SUBTYPES = [
  'operating_revenue',
  'non_operating_revenue',
  'other_income'
] as const;

export const EXPENSE_SUBTYPES = [
  'operating_expenses',
  'cost_of_goods_sold',
  'administrative_expenses',
  'other_expenses'
] as const;

export const ACCOUNT_TYPES: Record<AccountType, { 
  label: string; 
  icon: string; 
  normalBalance: 'debit' | 'credit';
  subtypes: readonly string[];
}> = {
  asset: {
    label: 'Asset',
    icon: 'Building',
    normalBalance: 'debit',
    subtypes: ASSET_SUBTYPES
  },
  liability: {
    label: 'Liability',
    icon: 'CreditCard',
    normalBalance: 'credit',
    subtypes: LIABILITY_SUBTYPES
  },
  equity: {
    label: 'Equity',
    icon: 'TrendingUp',
    normalBalance: 'credit',
    subtypes: EQUITY_SUBTYPES
  },
  revenue: {
    label: 'Revenue',
    icon: 'DollarSign',
    normalBalance: 'credit',
    subtypes: REVENUE_SUBTYPES
  },
  expense: {
    label: 'Expense',
    icon: 'Minus',
    normalBalance: 'debit',
    subtypes: EXPENSE_SUBTYPES
  }
};

export interface AccountFormData {
  account_number: string;
  name: string;
  description?: string;
  type: AccountType;
  subtype?: string;
  parent_account_id?: string;
  is_active: boolean;
  currency: string;
  opening_balance?: number;
  notes?: string;
}

export interface AccountBalance {
  account_id: string;
  debit_balance: number;
  credit_balance: number;
  net_balance: number;
  currency: string;
  as_of_date: string;
}

export interface AccountTransaction {
  id: string;
  account_id: string;
  transaction_id: string;
  debit_amount?: number;
  credit_amount?: number;
  description: string;
  reference_number?: string;
  occurred_at: string;
}

export interface ChartOfAccounts {
  assets: GLAccount[];
  liabilities: GLAccount[];
  equity: GLAccount[];
  revenue: GLAccount[];
  expenses: GLAccount[];
}

export interface AccountsClientProps {
  user: unknown;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

export interface CreateAccountClientProps {
  user: unknown;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAccount?: GLAccount | null;
}

// API Response Types
export interface AccountsResponse {
  accounts: GLAccount[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AccountResponse {
  account: GLAccount;
}

// Filter and Search Types
export interface AccountFilters {
  type?: AccountType;
  subtype?: string;
  isActive?: boolean;
  parentAccountId?: string;
  search?: string;
}

export interface AccountSortOptions {
  field: keyof GLAccount;
  direction: 'asc' | 'desc';
}

// Validation Schemas (Zod-compatible types)
export interface CreateAccountRequest {
  accountNumber: string;
  name: string;
  description?: string;
  type: AccountType;
  subtype?: string;
  parentAccountId?: string;
  isActive: boolean;
  currency: string;
  openingBalance?: number;
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {
  id: string;
}

export interface DeleteAccountRequest {
  id: string;
}
