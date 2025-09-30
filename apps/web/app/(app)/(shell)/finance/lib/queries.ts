'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

export class FinanceQueries {
 private supabase = createBrowserClient();

 // Budget queries
 async getBudgetsWithUsage(orgId: string) {
   const { data, error } = await this.supabase
     .from('budgets')
     .select(`
       *,
       expenses:expenses(amount),
       projects:project_id(name)
     `)
     .eq('organization_id', orgId)
     .order('created_at', { ascending: false });

   if (error) throw error;

   // Calculate budget utilization
   return data?.map(budget => ({
     ...budget,
     total_expenses: budget.expenses?.reduce((sum: number, exp: unknown) => sum + (exp.amount || 0), 0) || 0,
     utilization_percentage: budget.amount > 0 ?
       ((budget.expenses?.reduce((sum: number, exp: unknown) => sum + (exp.amount || 0), 0) || 0) / budget.amount) * 100 : 0
   })) || [];
 }

 async getBudgetById(id: string, orgId: string) {
   const { data, error } = await this.supabase
     .from('budgets')
     .select(`
       *,
       expenses:expenses(*),
       projects:project_id(*)
     `)
     .eq('id', id)
     .eq('organization_id', orgId)
     .single();

   if (error) throw error;
   return data;
 }

 // Expense queries
 async getExpensesWithRelations(orgId: string, filters?: unknown) {
   let query = this.supabase
     .from('expenses')
     .select(`
       *,
       budgets:budget_id(name, category),
       projects:project_id(name),
       users:user_id(email)
     `)
     .eq('organization_id', orgId);

   if (filters) {
     Object.entries(filters).forEach(([key, value]) => {
       if (value !== undefined && value !== null && value !== '') {
         query = query.eq(key, value);
       }
     });
   }

   const { data, error } = await query.order('expense_date', { ascending: false });
   if (error) throw error;
   return data;
 }

 // Revenue queries
 async getRevenueWithAnalytics(orgId: string, filters?: unknown) {
   let query = this.supabase
     .from('revenue')
     .select(`
       *,
       clients:client_id(name),
       projects:project_id(name)
     `)
     .eq('organization_id', orgId);

   if (filters) {
     Object.entries(filters).forEach(([key, value]) => {
       if (value !== undefined && value !== null && value !== '') {
         query = query.eq(key, value);
       }
     });
   }

   const { data, error } = await query.order('recognition_date', { ascending: false });
   if (error) throw error;
   return data;
 }

 // Transaction queries
 async getTransactionsWithAccounts(orgId: string, filters?: unknown) {
   let query = this.supabase
     .from('transactions')
     .select(`
       *,
       accounts:account_id(name, type, balance),
       projects:project_id(name)
     `)
     .eq('organization_id', orgId);

   if (filters) {
     Object.entries(filters).forEach(([key, value]) => {
       if (value !== undefined && value !== null && value !== '') {
         query = query.eq(key, value);
       }
     });
   }

   const { data, error } = await query.order('transaction_date', { ascending: false });
   if (error) throw error;
   return data;
 }

 // Account queries
 async getAccountsWithBalance(orgId: string) {
   const { data, error } = await this.supabase
     .from('accounts')
     .select(`
       *,
       transactions:transactions(amount, type)
     `)
     .eq('organization_id', orgId)
     .order('created_at', { ascending: false });

   if (error) throw error;

   // Calculate current balances
   return data?.map(account => {
     const transactions = account.transactions || [];
     const balance = transactions.reduce((sum: number, tx: unknown) => {
       return tx.type === 'credit' ? sum + tx.amount : sum - tx.amount;
     }, account.initial_balance || 0);

     return { ...account, current_balance: balance };
   }) || [];
 }

 // Invoice queries
 async getInvoicesWithDetails(orgId: string, filters?: unknown) {
   let query = this.supabase
     .from('invoices')
     .select(`
       *,
       clients:client_id(name),
       projects:project_id(name)
     `)
     .eq('organization_id', orgId);

   if (filters) {
     Object.entries(filters).forEach(([key, value]) => {
       if (value !== undefined && value !== null && value !== '') {
         query = query.eq(key, value);
       }
     });
   }

   const { data, error } = await query.order('issue_date', { ascending: false });
   if (error) throw error;
   return data;
 }

 // Forecast queries
 async getForecastsWithAccuracy(orgId: string, filters?: unknown) {
   let query = this.supabase
     .from('forecasts')
     .select(`
       *,
       projects:project_id(name)
     `)
     .eq('organization_id', orgId);

   if (filters) {
     Object.entries(filters).forEach(([key, value]) => {
       if (value !== undefined && value !== null && value !== '') {
         query = query.eq(key, value);
       }
     });
   }

   const { data, error } = await query.order('forecast_date', { ascending: false });
   if (error) throw error;

   // Calculate forecast accuracy if actual data exists
   return data?.map(forecast => ({
     ...forecast,
     accuracy_percentage: forecast.actual_amount && forecast.forecasted_amount ?
       Math.abs(1 - (forecast.actual_amount / forecast.forecasted_amount)) * 100 : null
   })) || [];
 }

 // Analytics queries
 async getFinancialAnalytics(orgId: string, dateRange?: { start: Date; end: Date }) {
   const startDate = dateRange?.start || new Date(new Date().getFullYear(), 0, 1);
   const endDate = dateRange?.end || new Date();

   const [budgets, expenses, revenue, transactions] = await Promise.all([
     this.getBudgetsWithUsage(orgId),
     this.getExpensesWithRelations(orgId),
     this.getRevenueWithAnalytics(orgId),
     this.getTransactionsWithAccounts(orgId)
   ]);

   return {
     budgets,
     expenses: expenses.filter(exp => {
       const expDate = new Date(exp.expense_date);
       return expDate >= startDate && expDate <= endDate;
     }),
     revenue: revenue.filter(rev => {
       const revDate = new Date(rev.recognition_date);
       return revDate >= startDate && revDate <= endDate;
     }),
     transactions: transactions.filter(tx => {
       const txDate = new Date(tx.transaction_date);
       return txDate >= startDate && txDate <= endDate;
     }),
     summary: {
       total_budget: budgets.reduce((sum, b) => sum + b.amount, 0),
       total_expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
       total_revenue: revenue.reduce((sum, r) => sum + r.amount, 0),
       net_income: revenue.reduce((sum, r) => sum + r.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
       budget_utilization: budgets.length > 0 ?
         (budgets.reduce((sum, b) => sum + b.total_expenses, 0) / budgets.reduce((sum, b) => sum + b.amount, 0)) * 100 : 0
     }
   };
 }
}

export const financeQueries = new FinanceQueries();
