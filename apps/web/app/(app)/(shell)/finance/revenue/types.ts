import { User } from '@supabase/supabase-js';

// Base revenue interface
export interface Revenue {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  status: 'projected' | 'invoiced' | 'received' | 'cancelled';
  invoice_id?: string;
  project_id?: string;
  client_name?: string;
  expected_date?: string;
  received_date?: string;
  payment_method?: string;
  tax_amount?: number;
  discount_amount?: number;
  net_amount?: number;
  tags?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Create revenue data
export interface CreateRevenueData {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  category: string;
  invoice_id?: string;
  project_id?: string;
  client_name?: string;
  expected_date?: string;
  payment_method?: string;
  tax_amount?: number;
  discount_amount?: number;
  tags?: string[];
  notes?: string;
}

// Update revenue data
export interface UpdateRevenueData extends Partial<CreateRevenueData> {
  status?: 'projected' | 'invoiced' | 'received' | 'cancelled';
  received_date?: string;
  net_amount?: number;
}

// Revenue filters
export interface RevenueFilters {
  status?: string[];
  category?: string[];
  client_name?: string[];
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  project_id?: string;
  search?: string;
}

// Revenue statistics
export interface RevenueStatistics {
  totalRevenue: number;
  projectedRevenue: number;
  receivedRevenue: number;
  pendingInvoices: number;
  averageAmount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  topClients: Array<{
    client_name: string;
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
export interface RevenueClientProps {
  user: User;
  orgId: string;
  translations: unknown;
}

export interface CreateRevenueClientProps {
  user: User;
  orgId: string;
  onSuccess?: (revenue: Revenue) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateRevenueData>;
}

export interface RevenueDrawerProps {
  revenue?: Revenue;
  mode: 'create' | 'edit' | 'view';
  onSave?: (revenue: Revenue) => void;
  onCancel?: () => void;
  user: User;
  orgId: string;
}

// Revenue workflow actions
export interface RevenueWorkflowActions {
  markInvoiced: (revenueId: string, invoiceId?: string) => Promise<void>;
  markReceived: (revenueId: string, receivedDate?: string, paymentMethod?: string) => Promise<void>;
  cancel: (revenueId: string, reason?: string) => Promise<void>;
}

// Export/import types
export interface RevenueExportData {
  title: string;
  description: string;
  amount: string;
  currency: string;
  category: string;
  status: string;
  client_name: string;
  expected_date: string;
  received_date: string;
  payment_method: string;
  tax_amount: string;
  discount_amount: string;
  net_amount: string;
  project_id: string;
  tags: string;
  notes: string;
}

export interface RevenueImportData {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  category: string;
  client_name?: string;
  expected_date?: string;
  payment_method?: string;
  tax_amount?: number;
  discount_amount?: number;
  project_id?: string;
  tags?: string;
  notes?: string;
}
