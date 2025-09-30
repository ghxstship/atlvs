import { createBrowserClient } from '@ghxstship/auth';

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

export interface FinanceRecord {
  id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

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
  created_by: string;
  // Computed fields
  remaining?: number;
  utilization?: number;
}

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
  created_by: string;
  submitted_by?: string;
  approved_by?: string;
  submitted_at?: string;
  approved_at?: string;
  paid_at?: string;
  notes?: string;
}

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
  created_by: string;
}

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
  created_by: string;
}

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
  line_items?: unknown[];
  client_company_id?: string;
  purchase_order_id?: string;
  created_by: string;
}

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
  created_by: string;
}

export class FinanceService {
  private supabase = createBrowserClient();

  // Statistics and Analytics
  async getFinanceStatistics(orgId: string): Promise<FinanceStatistics> {
    try {
      const [
        revenueData,
        expensesData,
        budgetsData,
        invoicesData,
        accountsData,
        transactionsData,
        forecastsData
      ] = await Promise.all([
        this.supabase.from('revenue').select('amount, currency').eq('organization_id', orgId).eq('status', 'received'),
        this.supabase.from('expenses').select('amount, currency').eq('organization_id', orgId).eq('status', 'approved'),
        this.supabase.from('budgets').select('amount, spent, currency').eq('organization_id', orgId).eq('status', 'active'),
        this.supabase.from('invoices').select('amount_due, status').eq('organization_id', orgId),
        this.supabase.from('finance_accounts').select('balance, currency, status').eq('organization_id', orgId),
        this.supabase.from('finance_transactions').select('status').eq('organization_id', orgId),
        this.supabase.from('forecasts').select('projected_amount, actual_amount').eq('organization_id', orgId)
      ]);

      const totalRevenue = (revenueData.data || []).reduce((sum, item) => sum + Number(item.amount), 0);
      const totalExpenses = (expensesData.data || []).reduce((sum, item) => sum + Number(item.amount), 0);
      const totalBudgets = (budgetsData.data || []).reduce((sum, item) => sum + Number(item.amount), 0);
      const budgetSpent = (budgetsData.data || []).reduce((sum, item) => sum + Number(item.spent || 0), 0);
      const accountsBalance = (accountsData.data || []).reduce((sum, item) => sum + Number(item.balance || 0), 0);
      
      const pendingInvoices = (invoicesData.data || []).filter(inv => inv.status === 'sent').length;
      const overdueInvoices = (invoicesData.data || []).filter(inv => inv.status === 'overdue').length;
      const activeAccounts = (accountsData.data || []).filter(acc => acc.status === 'active').length;
      const completedTransactions = (transactionsData.data || []).filter(tx => tx.status === 'completed').length;

      // Calculate forecast accuracy
      const forecastsWithActuals = (forecastsData.data || []).filter(f => f.actual_amount > 0);
      const forecastAccuracy = forecastsWithActuals.length > 0 
        ? forecastsWithActuals.reduce((sum, f) => {
            const accuracy = Math.max(0, 100 - Math.abs((f.actual_amount - f.projected_amount) / f.projected_amount * 100));
            return sum + accuracy;
          }, 0) / forecastsWithActuals.length
        : 0;

      return {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        totalBudgets,
        budgetUtilization: totalBudgets > 0 ? (budgetSpent / totalBudgets) * 100 : 0,
        pendingInvoices,
        overdueInvoices,
        accountsBalance,
        activeAccounts,
        completedTransactions,
        forecastAccuracy,
        currency: 'USD'
      };
    } catch (error) {
      console.error('Error getting finance statistics:', error);
      throw error;
    }
  }

  // Budget Operations
  async getBudgets(orgId: string, filters?: unknown): Promise<Budget[]> {
    try {
      let query = this.supabase
        .from('budgets')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.projectId) query = query.eq('project_id', filters.projectId);

      const { data, error } = await query;
      if (error) throw error;

      // Add computed fields
      return (data || []).map(budget => ({
        ...budget,
        remaining: budget.amount - (budget.spent || 0),
        utilization: budget.amount > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0
      }));
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  }

  async createBudget(orgId: string, budgetData: Partial<Budget>): Promise<Budget> {
    try {
      const { data, error } = await this.supabase
        .from('budgets')
        .insert({
          ...budgetData,
          organization_id: orgId,
          spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  // Expense Operations
  async getExpenses(orgId: string, filters?: unknown): Promise<Expense[]> {
    try {
      let query = this.supabase
        .from('expenses')
        .select('*')
        .eq('organization_id', orgId)
        .order('expense_date', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.budgetId) query = query.eq('budget_id', filters.budgetId);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  }

  async createExpense(orgId: string, expenseData: Partial<Expense>): Promise<Expense> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .insert({
          ...expenseData,
          organization_id: orgId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // Revenue Operations
  async getRevenue(orgId: string, filters?: unknown): Promise<Revenue[]> {
    try {
      let query = this.supabase
        .from('revenue')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.source) query = query.ilike('source', `%${filters.source}%`);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting revenue:', error);
      throw error;
    }
  }

  // Transaction Operations
  async getTransactions(orgId: string, filters?: unknown): Promise<Transaction[]> {
    try {
      let query = this.supabase
        .from('finance_transactions')
        .select('*, finance_accounts(name)')
        .eq('organization_id', orgId)
        .order('occurred_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.kind) query = query.eq('kind', filters.kind);
      if (filters?.accountId) query = query.eq('account_id', filters.accountId);

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with account names
      return (data || []).map(tx => ({
        ...tx,
        account_name: tx.finance_accounts?.name || 'Unknown Account'
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  // Account Operations
  async getAccounts(orgId: string, filters?: unknown): Promise<Account[]> {
    try {
      let query = this.supabase
        .from('finance_accounts')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.accountType) query = query.eq('account_type', filters.accountType);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  // Invoice Operations
  async getInvoices(orgId: string, filters?: unknown): Promise<Invoice[]> {
    try {
      let query = this.supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw error;
    }
  }

  // Forecast Operations
  async getForecasts(orgId: string, filters?: unknown): Promise<Forecast[]> {
    try {
      let query = this.supabase
        .from('forecasts')
        .select('*')
        .eq('organization_id', orgId)
        .order('forecast_date', { ascending: false });

      if (filters?.confidenceLevel) query = query.eq('confidence_level', filters.confidenceLevel);

      const { data, error } = await query;
      if (error) throw error;

      // Add computed variance
      return (data || []).map(forecast => ({
        ...forecast,
        variance: (forecast.actual_amount || 0) - forecast.projected_amount
      }));
    } catch (error) {
      console.error('Error getting forecasts:', error);
      throw error;
    }
  }

  // Export Operations
  async exportData(orgId: string, entityType: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      let data: unknown[] = [];
      
      switch (entityType) {
        case 'budgets':
          data = await this.getBudgets(orgId);
          break;
        case 'expenses':
          data = await this.getExpenses(orgId);
          break;
        case 'revenue':
          data = await this.getRevenue(orgId);
          break;
        case 'transactions':
          data = await this.getTransactions(orgId);
          break;
        case 'accounts':
          data = await this.getAccounts(orgId);
          break;
        case 'invoices':
          data = await this.getInvoices(orgId);
          break;
        case 'forecasts':
          data = await this.getForecasts(orgId);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      }

      // CSV format
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      
      return [headers, ...rows].join('\n');
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkDeleteBudgets(orgId: string, budgetIds: string[]): Promise<void> {
    try {
      for (const budgetId of budgetIds) {
        const response = await fetch('/api/v1/finance/budgets', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: budgetId })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to delete budget ${budgetId}`);
        }
      }
    } catch (error) {
      console.error('Error bulk deleting budgets:', error);
      throw error;
    }
  }

  async bulkUpdateBudgets(orgId: string, updates: Array<{id: string, data: unknown}>): Promise<void> {
    try {
      for (const update of updates) {
        const response = await fetch('/api/v1/finance/budgets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: update.id, ...update.data })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to update budget ${update.id}`);
        }
      }
    } catch (error) {
      console.error('Error bulk updating budgets:', error);
      throw error;
    }
  }

  // Utility Methods
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
