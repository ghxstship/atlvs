/**
 * Finance Budgets Module - Type Definitions
 * Budget Management and Tracking System
 */

export interface Budget {
  id: string;
  name: string;
  description?: string;
  amount: number;
  spent: number;
  currency: string;
  category: BudgetCategory;
  status: BudgetStatus;
  period_start: string;
  period_end: string;
  project_id?: string;
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  // Computed fields
  remaining?: number;
  utilization?: number;
  project_name?: string;
  days_remaining?: number;
}

export type BudgetStatus = 
  | 'draft' 
  | 'active' 
  | 'completed' 
  | 'cancelled'
  | 'on_hold';

export type BudgetCategory = 
  | 'equipment'
  | 'construction'
  | 'catering'
  | 'travel'
  | 'marketing'
  | 'operations'
  | 'personnel'
  | 'facilities'
  | 'technology'
  | 'other';

export interface BudgetFormData {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  category: BudgetCategory;
  status: BudgetStatus;
  period_start: string;
  period_end: string;
  project_id?: string;
  notes?: string;
}

export interface BudgetAllocation {
  id: string;
  budget_id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  description?: string;
}

export interface BudgetExpense {
  id: string;
  budget_id: string;
  expense_id: string;
  amount: number;
  description: string;
  date: string;
}

export interface BudgetSummary {
  total_budgets: number;
  total_allocated: number;
  total_spent: number;
  total_remaining: number;
  average_utilization: number;
  active_budgets: number;
  overbudget_count: number;
}

export interface BudgetClientProps {
  user: unknown;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

export interface CreateBudgetClientProps {
  user: unknown;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editBudget?: Budget | null;
}

// API Response Types
export interface BudgetsResponse {
  budgets: Budget[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BudgetResponse {
  budget: Budget;
}

// Filter and Search Types
export interface BudgetFilters {
  status?: BudgetStatus;
  category?: BudgetCategory;
  project_id?: string;
  period?: 'current' | 'past' | 'future';
  search?: string;
}

export interface BudgetSortOptions {
  field: keyof Budget;
  direction: 'asc' | 'desc';
}

// Validation Schemas (Zod-compatible types)
export interface CreateBudgetRequest {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  category: BudgetCategory;
  status: BudgetStatus;
  periodStart: string;
  periodEnd: string;
  projectId?: string;
}

export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {
  id: string;
}

export interface DeleteBudgetRequest {
  id: string;
}

// Budget Analytics Types
export interface BudgetAnalytics {
  utilization_trend: Array<{
    date: string;
    utilization: number;
  }>;
  category_breakdown: Array<{
    category: BudgetCategory;
    allocated: number;
    spent: number;
    count: number;
  }>;
  monthly_spending: Array<{
    month: string;
    budgeted: number;
    actual: number;
  }>;
}

export const BUDGET_CATEGORIES: Record<BudgetCategory, { 
  label: string; 
  icon: string; 
  color: string;
}> = {
  equipment: {
    label: 'Equipment',
    icon: 'Wrench',
    color: 'bg-blue-100 text-blue-800'
  },
  construction: {
    label: 'Construction',
    icon: 'Hammer',
    color: 'bg-orange-100 text-orange-800'
  },
  catering: {
    label: 'Catering',
    icon: 'Coffee',
    color: 'bg-green-100 text-green-800'
  },
  travel: {
    label: 'Travel',
    icon: 'Plane',
    color: 'bg-purple-100 text-purple-800'
  },
  marketing: {
    label: 'Marketing',
    icon: 'Megaphone',
    color: 'bg-pink-100 text-pink-800'
  },
  operations: {
    label: 'Operations',
    icon: 'Settings',
    color: 'bg-gray-100 text-gray-800'
  },
  personnel: {
    label: 'Personnel',
    icon: 'Users',
    color: 'bg-indigo-100 text-indigo-800'
  },
  facilities: {
    label: 'Facilities',
    icon: 'Building',
    color: 'bg-teal-100 text-teal-800'
  },
  technology: {
    label: 'Technology',
    icon: 'Monitor',
    color: 'bg-cyan-100 text-cyan-800'
  },
  other: {
    label: 'Other',
    icon: 'MoreHorizontal',
    color: 'bg-yellow-100 text-yellow-800'
  }
};

export const BUDGET_STATUSES: Record<BudgetStatus, { 
  label: string; 
  icon: string; 
  color: string;
}> = {
  draft: {
    label: 'Draft',
    icon: 'FileText',
    color: 'bg-gray-100 text-gray-800'
  },
  active: {
    label: 'Active',
    icon: 'CheckCircle',
    color: 'bg-green-100 text-green-800'
  },
  completed: {
    label: 'Completed',
    icon: 'Check',
    color: 'bg-blue-100 text-blue-800'
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'XCircle',
    color: 'bg-red-100 text-red-800'
  },
  on_hold: {
    label: 'On Hold',
    icon: 'Pause',
    color: 'bg-yellow-100 text-yellow-800'
  }
};
