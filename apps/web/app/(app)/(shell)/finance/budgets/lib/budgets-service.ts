import { createBrowserClient } from '@ghxstship/auth';
import type { Budget, BudgetFilters } from '../types';
import type { CreateBudgetData, UpdateBudgetData } from '../../types';

export class BudgetsService {
  private supabase = createBrowserClient();

  async getBudgets(orgId: string, filters?: BudgetFilters): Promise<Budget[]> {
    try {
      let query = this.supabase
        .from('budgets')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.project_id) query = query.eq('project_id', filters.project_id);

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

  async createBudget(orgId: string, budgetData: CreateBudgetData): Promise<Budget> {
    try {
      const response = await fetch('/api/v1/finance/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: budgetData.name,
          description: budgetData.description,
          amount: budgetData.amount,
          currency: budgetData.currency || 'USD',
          category: budgetData.category,
          startDate: budgetData.period_start,
          endDate: budgetData.period_end,
          projectId: budgetData.project_id,
          status: budgetData.status || 'draft'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create budget');
      }

      const { budget } = await response.json();
      return budget;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  async updateBudget(budgetData: UpdateBudgetData): Promise<Budget> {
    try {
      const response = await fetch('/api/v1/finance/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: budgetData.id,
          name: budgetData.name,
          description: budgetData.description,
          amount: budgetData.amount,
          currency: budgetData.currency,
          category: budgetData.category,
          startDate: budgetData.period_start,
          endDate: budgetData.period_end,
          projectId: budgetData.project_id,
          status: budgetData.status,
          spent: budgetData.spent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update budget');
      }

      const { budget } = await response.json();
      return budget;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  async deleteBudget(budgetId: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/finance/budgets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: budgetId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  async getBudgetStatistics(orgId: string): Promise<unknown> {
    try {
      const budgets = await this.getBudgets(orgId);
      
      const totalBudgets = budgets.length;
      const activeBudgets = budgets.filter(b => b.status === 'active').length;
      const totalAmount = budgets.reduce((sum, b) => sum + b.amount, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
      const averageUtilization = budgets.length > 0 
        ? budgets.reduce((sum, b) => sum + (b.utilization || 0), 0) / budgets.length 
        : 0;

      return {
        totalBudgets,
        activeBudgets,
        totalAmount,
        totalSpent,
        totalRemaining: totalAmount - totalSpent,
        averageUtilization,
        overBudgetCount: budgets.filter(b => (b.utilization || 0) > 100).length,
        nearLimitCount: budgets.filter(b => (b.utilization || 0) > 80 && (b.utilization || 0) <= 100).length
      };
    } catch (error) {
      console.error('Error getting budget statistics:', error);
      throw error;
    }
  }

  async exportBudgets(orgId: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const budgets = await this.getBudgets(orgId);
      
      if (format === 'json') {
        return JSON.stringify(budgets, null, 2);
      }

      // CSV format
      if (budgets.length === 0) return '';
      
      const headers = [
        'Name', 'Description', 'Category', 'Amount', 'Spent', 'Remaining', 
        'Utilization %', 'Status', 'Start Date', 'End Date', 'Created At'
      ].join(',');
      
      const rows = budgets.map(budget => [
        `"${budget.name}"`,
        `"${budget.description || ''}"`,
        `"${budget.category || ''}"`,
        budget.amount,
        budget.spent || 0,
        budget.remaining || 0,
        (budget.utilization || 0).toFixed(2),
        budget.status,
        budget.period_start || '',
        budget.period_end || '',
        budget.created_at
      ].join(','));
      
      return [headers, ...rows].join('\n');
    } catch (error) {
      console.error('Error exporting budgets:', error);
      throw error;
    }
  }

  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

// Export alias for backward compatibility
export { BudgetsService as BudgetService };
