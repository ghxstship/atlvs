import { createBrowserClient } from '@ghxstship/auth';
import type { 
  Transaction, 
  CreateTransactionData, 
  UpdateTransactionData, 
  TransactionFilters, 
  TransactionStatistics,
  TransactionExportData,
  TransactionWorkflowActions
} from '../types';

export class TransactionsService implements TransactionWorkflowActions {
  private supabase = createBrowserClient();

  // CRUD Operations
  async getTransactions(orgId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = this.supabase
        .from('finance_transactions')
        .select('*')
        .eq('organization_id', orgId)
        .order('transaction_date', { ascending: false });

      // Apply filters
      if (filters?.type?.length) {
        query = query.in('type', filters.type);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.account_id) {
        query = query.eq('account_id', filters.account_id);
      }
      if (filters?.reference_type?.length) {
        query = query.in('reference_type', filters.reference_type);
      }
      if (filters?.amount_min !== undefined) {
        query = query.gte('amount', filters.amount_min);
      }
      if (filters?.amount_max !== undefined) {
        query = query.lte('amount', filters.amount_max);
      }
      if (filters?.date_from) {
        query = query.gte('transaction_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('transaction_date', filters.date_to);
      }
      if (filters?.reconciled !== undefined) {
        query = query.eq('reconciled', filters.reconciled);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,external_reference.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransaction(orgId: string, transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await this.supabase
        .from('finance_transactions')
        .select('*')
        .eq('organization_id', orgId)
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async createTransaction(orgId: string, transactionData: CreateTransactionData, userId: string): Promise<Transaction> {
    try {
      const { data, error } = await this.supabase
        .from('finance_transactions')
        .insert({
          ...transactionData,
          organization_id: orgId,
          created_by: userId,
          status: 'pending',
          currency: transactionData.currency || 'USD',
          reconciled: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async updateTransaction(orgId: string, transactionId: string, updates: UpdateTransactionData): Promise<Transaction> {
    try {
      const { data, error } = await this.supabase
        .from('finance_transactions')
        .update(updates)
        .eq('organization_id', orgId)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(orgId: string, transactionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('finance_transactions')
        .delete()
        .eq('organization_id', orgId)
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Workflow Actions
  async markCompleted(transactionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('finance_transactions')
        .update({ 
          status: 'completed',
          processed_date: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking transaction as completed:', error);
      throw error;
    }
  }

  async markFailed(transactionId: string, reason?: string): Promise<void> {
    try {
      const updates: unknown = { 
        status: 'failed',
        processed_date: new Date().toISOString()
      };
      
      if (reason) {
        updates.notes = reason;
      }

      const { error } = await this.supabase
        .from('finance_transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking transaction as failed:', error);
      throw error;
    }
  }

  async reconcile(transactionId: string, reconciledDate?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('finance_transactions')
        .update({ 
          reconciled: true,
          reconciled_date: reconciledDate || new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error reconciling transaction:', error);
      throw error;
    }
  }

  async cancel(transactionId: string, reason?: string): Promise<void> {
    try {
      const updates: unknown = { 
        status: 'cancelled'
      };
      
      if (reason) {
        updates.notes = reason;
      }

      const { error } = await this.supabase
        .from('finance_transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw error;
    }
  }

  // Statistics
  async getTransactionStatistics(orgId: string): Promise<TransactionStatistics> {
    try {
      const { data: transactions, error } = await this.supabase
        .from('finance_transactions')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;

      const totalTransactions = transactions?.length || 0;
      const debits = transactions?.filter(t => t.type === 'debit') || [];
      const credits = transactions?.filter(t => t.type === 'credit') || [];
      
      const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);
      const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
      const netAmount = totalCredits - totalDebits;
      
      const pendingTransactions = transactions?.filter(t => t.status === 'pending').length || 0;
      const reconciledTransactions = transactions?.filter(t => t.reconciled).length || 0;
      const averageAmount = totalTransactions ? (totalDebits + totalCredits) / totalTransactions : 0;

      // Calculate top categories
      const categoryMap = new Map();
      transactions?.forEach(transaction => {
        const category = transaction.category || 'Uncategorized';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { amount: 0, count: 0 });
        }
        const current = categoryMap.get(category);
        current.amount += transaction.amount;
        current.count += 1;
      });

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate monthly trend (last 12 months)
      const monthlyTrend = this.calculateMonthlyTrend(transactions || []);

      // Calculate account breakdown
      const accountMap = new Map();
      transactions?.forEach(transaction => {
        const accountId = transaction.account_id || 'unassigned';
        if (!accountMap.has(accountId)) {
          accountMap.set(accountId, { balance: 0, transaction_count: 0 });
        }
        const current = accountMap.get(accountId);
        current.balance += transaction.type === 'credit' ? transaction.amount : -transaction.amount;
        current.transaction_count += 1;
      });

      const accountBreakdown = Array.from(accountMap.entries())
        .map(([account_id, data]) => ({ account_id, ...data }))
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

      return {
        totalTransactions,
        totalDebits,
        totalCredits,
        netAmount,
        pendingTransactions,
        reconciledTransactions,
        averageAmount,
        topCategories,
        monthlyTrend,
        accountBreakdown
      };
    } catch (error) {
      console.error('Error fetching transaction statistics:', error);
      throw error;
    }
  }

  // Export functionality
  async exportTransactions(orgId: string, format: 'csv' | 'json', filters?: TransactionFilters): Promise<string> {
    try {
      const transactions = await this.getTransactions(orgId, filters);
      
      if (format === 'json') {
        return JSON.stringify(transactions, null, 2);
      }

      // CSV format
      const exportData: TransactionExportData[] = transactions.map(transaction => ({
        title: transaction.title,
        description: transaction.description || '',
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        type: transaction.type,
        category: transaction.category,
        status: transaction.status,
        account_id: transaction.account_id || '',
        reference_id: transaction.reference_id || '',
        reference_type: transaction.reference_type || '',
        transaction_date: transaction.transaction_date,
        processed_date: transaction.processed_date || '',
        payment_method: transaction.payment_method || '',
        external_reference: transaction.external_reference || '',
        reconciled: transaction.reconciled ? 'Yes' : 'No',
        reconciled_date: transaction.reconciled_date || '',
        tags: transaction.tags?.join(', ') || '',
        notes: transaction.notes || ''
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
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }

  // Utility methods
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private calculateMonthlyTrend(transactions: Transaction[]) {
    const monthlyData = new Map();
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, { 
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), 
        debits: 0, 
        credits: 0, 
        net: 0, 
        count: 0 
      });
    }

    // Aggregate transaction data
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(key)) {
        const current = monthlyData.get(key);
        if (transaction.type === 'debit') {
          current.debits += transaction.amount;
        } else {
          current.credits += transaction.amount;
        }
        current.net = current.credits - current.debits;
        current.count += 1;
      }
    });

    return Array.from(monthlyData.values());
  }
}
