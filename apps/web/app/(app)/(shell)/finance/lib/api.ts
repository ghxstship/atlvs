'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import type {
 Budget,
 Expense,
 Revenue,
 Transaction,
 Account,
 Invoice,
 Forecast
} from '../types';

export class FinanceAPI {
 private supabase = createBrowserClient();

 // Generic CRUD operations
 async createRecord(table: string, data: unknown, orgId: string) {
   const { data: result, error } = await this.supabase
     .from(table)
     .insert({ ...data, organization_id: orgId })
     .select()
     .single();

   if (error) throw error;
   return result;
 }

 async getRecords(table: string, orgId: string, filters?: unknown) {
   let query = this.supabase
     .from(table)
     .select('*')
     .eq('organization_id', orgId);

   if (filters) {
     Object.entries(filters).forEach(([key, value]) => {
       if (value !== undefined && value !== null && value !== '') {
         query = query.eq(key, value);
       }
     });
   }

   const { data, error } = await query;
   if (error) throw error;
   return data;
 }

 async updateRecord(table: string, id: string, data: unknown, orgId: string) {
   const { data: result, error } = await this.supabase
     .from(table)
     .update(data)
     .eq('id', id)
     .eq('organization_id', orgId)
     .select()
     .single();

   if (error) throw error;
   return result;
 }

 async deleteRecord(table: string, id: string, orgId: string) {
   const { error } = await this.supabase
     .from(table)
     .delete()
     .eq('id', id)
     .eq('organization_id', orgId);

   if (error) throw error;
   return true;
 }

 // Module-specific API methods
 async createBudget(data: Partial<Budget>, orgId: string) {
   return this.createRecord('budgets', data, orgId);
 }

 async getBudgets(orgId: string, filters?: unknown) {
   return this.getRecords('budgets', orgId, filters);
 }

 async updateBudget(id: string, data: Partial<Budget>, orgId: string) {
   return this.updateRecord('budgets', id, data, orgId);
 }

 async deleteBudget(id: string, orgId: string) {
   return this.deleteRecord('budgets', id, orgId);
 }

 async createExpense(data: Partial<Expense>, orgId: string) {
   return this.createRecord('expenses', data, orgId);
 }

 async getExpenses(orgId: string, filters?: unknown) {
   return this.getRecords('expenses', orgId, filters);
 }

 async updateExpense(id: string, data: Partial<Expense>, orgId: string) {
   return this.updateRecord('expenses', id, data, orgId);
 }

 async deleteExpense(id: string, orgId: string) {
   return this.deleteRecord('expenses', id, orgId);
 }

 async createRevenue(data: Partial<Revenue>, orgId: string) {
   return this.createRecord('revenue', data, orgId);
 }

 async getRevenue(orgId: string, filters?: unknown) {
   return this.getRecords('revenue', orgId, filters);
 }

 async updateRevenue(id: string, data: Partial<Revenue>, orgId: string) {
   return this.updateRecord('revenue', id, data, orgId);
 }

 async deleteRevenue(id: string, orgId: string) {
   return this.deleteRecord('revenue', id, orgId);
 }

 async createTransaction(data: Partial<Transaction>, orgId: string) {
   return this.createRecord('transactions', data, orgId);
 }

 async getTransactions(orgId: string, filters?: unknown) {
   return this.getRecords('transactions', orgId, filters);
 }

 async updateTransaction(id: string, data: Partial<Transaction>, orgId: string) {
   return this.updateRecord('transactions', id, data, orgId);
 }

 async deleteTransaction(id: string, orgId: string) {
   return this.deleteRecord('transactions', id, orgId);
 }

 async createAccount(data: Partial<Account>, orgId: string) {
   return this.createRecord('accounts', data, orgId);
 }

 async getAccounts(orgId: string, filters?: unknown) {
   return this.getRecords('accounts', orgId, filters);
 }

 async updateAccount(id: string, data: Partial<Account>, orgId: string) {
   return this.updateRecord('accounts', id, data, orgId);
 }

 async deleteAccount(id: string, orgId: string) {
   return this.deleteRecord('accounts', id, orgId);
 }

 async createInvoice(data: Partial<Invoice>, orgId: string) {
   return this.createRecord('invoices', data, orgId);
 }

 async getInvoices(orgId: string, filters?: unknown) {
   return this.getRecords('invoices', orgId, filters);
 }

 async updateInvoice(id: string, data: Partial<Invoice>, orgId: string) {
   return this.updateRecord('invoices', id, data, orgId);
 }

 async deleteInvoice(id: string, orgId: string) {
   return this.deleteRecord('invoices', id, orgId);
 }

 async createForecast(data: Partial<Forecast>, orgId: string) {
   return this.createRecord('forecasts', data, orgId);
 }

 async getForecasts(orgId: string, filters?: unknown) {
   return this.getRecords('forecasts', orgId, filters);
 }

 async updateForecast(id: string, data: Partial<Forecast>, orgId: string) {
   return this.updateRecord('forecasts', id, data, orgId);
 }

 async deleteForecast(id: string, orgId: string) {
   return this.deleteRecord('forecasts', id, orgId);
 }
}

export const financeAPI = new FinanceAPI();
