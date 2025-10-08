/**
 * Finance Accounts Service Layer
 * Handles all GL Accounts API interactions and business logic
 */

import { createBrowserClient } from '@ghxstship/auth';
import type { 
  GLAccount, 
  AccountFormData, 
  AccountFilters, 
  AccountsResponse,
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
  ChartOfAccounts,
  AccountType
} from '../types';

export class AccountsService {
  private supabase = createBrowserClient();

  /**
   * Fetch all GL accounts for an organization
   */
  async getAccounts(orgId: string, filters?: AccountFilters): Promise<GLAccount[]> {
    try {
      let query = this.supabase
        .from('accounts')
        .select('*')
        .eq('organization_id', orgId);

      // Apply filters
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.subtype) {
        query = query.eq('subtype', filters.subtype);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.parentAccountId) {
        query = query.eq('parent_account_id', filters.parentAccountId);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,account_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('account_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  /**
   * Get a single account by ID
   */
  async getAccount(id: string): Promise<GLAccount | null> {
    try {
      const { data, error } = await this.supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  /**
   * Create a new GL account
   */
  async createAccount(accountData: CreateAccountRequest): Promise<GLAccount> {
    try {
      const response = await fetch('/api/v1/finance/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create account');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  /**
   * Update an existing GL account
   */
  async updateAccount(accountData: UpdateAccountRequest): Promise<GLAccount> {
    try {
      const response = await fetch('/api/v1/finance/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update account');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  /**
   * Delete a GL account
   */
  async deleteAccount(id: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/finance/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  /**
   * Get Chart of Accounts organized by type
   */
  async getChartOfAccounts(orgId: string): Promise<ChartOfAccounts> {
    try {
      const accounts = await this.getAccounts(orgId);
      
      return {
        assets: accounts.filter(acc => acc.type === 'asset'),
        liabilities: accounts.filter(acc => acc.type === 'liability'),
        equity: accounts.filter(acc => acc.type === 'equity'),
        revenue: accounts.filter(acc => acc.type === 'revenue'),
        expenses: accounts.filter(acc => acc.type === 'expense')
      };
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
      throw error;
    }
  }

  /**
   * Get parent accounts for a specific type
   */
  async getParentAccounts(orgId: string, type: AccountType): Promise<GLAccount[]> {
    try {
      return await this.getAccounts(orgId, { 
        type, 
        isActive: true 
      });
    } catch (error) {
      console.error('Error fetching parent accounts:', error);
      throw error;
    }
  }

  /**
   * Calculate account balance
   */
  async getAccountBalance(accountId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('finance_transactions')
        .select('amount, kind')
        .eq('account_id', accountId)
        .eq('status', 'completed');

      if (error) throw error;

      const balance = (data || []).reduce((sum, transaction) => {
        return transaction.kind === 'debit' 
          ? sum + transaction.amount 
          : sum - transaction.amount;
      }, 0);

      return balance;
    } catch (error) {
      console.error('Error calculating account balance:', error);
      throw error;
    }
  }

  /**
   * Validate account number uniqueness
   */
  async validateAccountNumber(orgId: string, accountNumber: string, excludeId?: string): Promise<boolean> {
    try {
      let query = this.supabase
        .from('accounts')
        .select('id')
        .eq('organization_id', orgId)
        .eq('account_number', accountNumber);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).length === 0;
    } catch (error) {
      console.error('Error validating account number:', error);
      throw error;
    }
  }

  /**
   * Get account hierarchy (parent-child relationships)
   */
  async getAccountHierarchy(orgId: string): Promise<GLAccount[]> {
    try {
      const accounts = await this.getAccounts(orgId);
      
      // Build hierarchy
      const accountMap = new Map<string, GLAccount>();
      accounts.forEach(account => {
        accountMap.set(account.id, { ...account, children: [] });
      });

      const rootAccounts: GLAccount[] = [];

      accounts.forEach(account => {
        const accountWithChildren = accountMap.get(account.id)!;
        
        if (account.parent_account_id) {
          const parent = accountMap.get(account.parent_account_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(accountWithChildren);
          }
        } else {
          rootAccounts.push(accountWithChildren);
        }
      });

      return rootAccounts;
    } catch (error) {
      console.error('Error building account hierarchy:', error);
      throw error;
    }
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get account type configuration
   */
  getAccountTypeConfig(type: AccountType) {
    const configs = {
      asset: { label: 'Asset', normalBalance: 'debit' as const, icon: 'Building' },
      liability: { label: 'Liability', normalBalance: 'credit' as const, icon: 'CreditCard' },
      equity: { label: 'Equity', normalBalance: 'credit' as const, icon: 'TrendingUp' },
      revenue: { label: 'Revenue', normalBalance: 'credit' as const, icon: 'DollarSign' },
      expense: { label: 'Expense', normalBalance: 'debit' as const, icon: 'Minus' }
    };

    return configs[type];
  }

  /**
   * Export accounts to CSV
   */
  exportAccountsToCSV(accounts: GLAccount[]): string {
    const headers = ['Account Number', 'Name', 'Type', 'Subtype', 'Balance', 'Currency', 'Active'];
    const rows = accounts.map(account => [
      account.account_number,
      account.name,
      account.type,
      account.subtype || '',
      account.balance.toString(),
      account.currency,
      account.is_active ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// Export singleton instance
export const accountsService = new AccountsService();
