import { createBrowserClient } from '@ghxstship/auth';
import type { 
  Expense, 
  CreateExpenseData, 
  UpdateExpenseData, 
  ExpenseFilters, 
  ExpenseStatistics,
  ExpenseExportData,
  ExpenseWorkflowActions
} from '../types';

export class ExpensesService implements ExpenseWorkflowActions {
  private supabase = createBrowserClient();

  // CRUD Operations
  async getExpenses(orgId: string, filters?: ExpenseFilters): Promise<Expense[]> {
    try {
      let query = this.supabase
        .from('expenses')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.submitted_by?.length) {
        query = query.in('submitted_by', filters.submitted_by);
      }
      if (filters?.amount_min !== undefined) {
        query = query.gte('amount', filters.amount_min);
      }
      if (filters?.amount_max !== undefined) {
        query = query.lte('amount', filters.amount_max);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,vendor.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  async getExpense(orgId: string, expenseId: string): Promise<Expense | null> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('organization_id', orgId)
        .eq('id', expenseId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching expense:', error);
      throw error;
    }
  }

  async createExpense(orgId: string, expenseData: CreateExpenseData, userId: string): Promise<Expense> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .insert({
          ...expenseData,
          organization_id: orgId,
          submitted_by: userId,
          status: 'draft',
          currency: expenseData.currency || 'USD'
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

  async updateExpense(orgId: string, expenseId: string, updates: UpdateExpenseData): Promise<Expense> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .update(updates)
        .eq('organization_id', orgId)
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(orgId: string, expenseId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('expenses')
        .delete()
        .eq('organization_id', orgId)
        .eq('id', expenseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Workflow Actions
  async submit(expenseId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('expenses')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', expenseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error submitting expense:', error);
      throw error;
    }
  }

  async approve(expenseId: string, approvedBy: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('expenses')
        .update({ 
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', expenseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error approving expense:', error);
      throw error;
    }
  }

  async reject(expenseId: string, reason?: string): Promise<void> {
    try {
      const updates: unknown = { 
        status: 'rejected',
        approved_by: null,
        approved_at: null
      };
      
      if (reason) {
        updates.notes = reason;
      }

      const { error } = await this.supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting expense:', error);
      throw error;
    }
  }

  async markPaid(expenseId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('expenses')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', expenseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      throw error;
    }
  }

  // Statistics
  async getExpenseStatistics(orgId: string): Promise<ExpenseStatistics> {
    try {
      const { data: expenses, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;

      const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const pendingApproval = expenses?.filter(e => e.status === 'submitted').length || 0;
      const approvedAmount = expenses?.filter(e => e.status === 'approved' || e.status === 'paid')
        .reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const rejectedCount = expenses?.filter(e => e.status === 'rejected').length || 0;
      const averageAmount = expenses?.length ? totalExpenses / expenses.length : 0;

      // Calculate top categories
      const categoryMap = new Map();
      expenses?.forEach(expense => {
        const category = expense.category || 'Uncategorized';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { amount: 0, count: 0 });
        }
        const current = categoryMap.get(category);
        current.amount += expense.amount;
        current.count += 1;
      });

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate monthly trend (last 12 months)
      const monthlyTrend = this.calculateMonthlyTrend(expenses || []);

      return {
        totalExpenses,
        pendingApproval,
        approvedAmount,
        rejectedCount,
        averageAmount,
        topCategories,
        monthlyTrend
      };
    } catch (error) {
      console.error('Error fetching expense statistics:', error);
      throw error;
    }
  }

  // Export functionality
  async exportExpenses(orgId: string, format: 'csv' | 'json', filters?: ExpenseFilters): Promise<string> {
    try {
      const expenses = await this.getExpenses(orgId, filters);
      
      if (format === 'json') {
        return JSON.stringify(expenses, null, 2);
      }

      // CSV format
      const exportData: ExpenseExportData[] = expenses.map(expense => ({
        title: expense.title,
        description: expense.description || '',
        amount: expense.amount.toString(),
        currency: expense.currency,
        category: expense.category,
        status: expense.status,
        vendor: expense.vendor || '',
        submitted_by: expense.submitted_by,
        submitted_at: expense.submitted_at || '',
        approved_at: expense.approved_at || '',
        paid_at: expense.paid_at || '',
        due_date: expense.due_date || '',
        project_id: expense.project_id || '',
        tags: expense.tags?.join(', ') || '',
        notes: expense.notes || ''
      }));

      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${(row as unknown)[header] || ''}"`).join(',')
        )
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting expenses:', error);
      throw error;
    }
  }

  // Utility methods
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private calculateMonthlyTrend(expenses: Expense[]) {
    const monthlyData = new Map();
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, { month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), amount: 0, count: 0 });
    }

    // Aggregate expense data
    expenses.forEach(expense => {
      const date = new Date(expense.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(key)) {
        const current = monthlyData.get(key);
        current.amount += expense.amount;
        current.count += 1;
      }
    });

    return Array.from(monthlyData.values());
  }
}
