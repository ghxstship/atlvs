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

export class FinanceMutations {
 private supabase = createBrowserClient();

 // Budget mutations
 async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>, userId: string) {
   const { data, error } = await this.supabase
     .from('budgets')
     .insert({
       ...budget,
       created_by: userId,
       updated_by: userId
     })
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 async updateBudget(id: string, updates: Partial<Budget>, userId: string, orgId: string) {
   const { data, error } = await this.supabase
     .from('budgets')
     .update({
       ...updates,
       updated_by: userId
     })
     .eq('id', id)
     .eq('organization_id', orgId)
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 async deleteBudget(id: string, orgId: string) {
   // Soft delete - update status instead of hard delete
   const { data, error } = await this.supabase
     .from('budgets')
     .update({ status: 'deleted' })
     .eq('id', id)
     .eq('organization_id', orgId)
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 async bulkUpdateBudgets(ids: string[], updates: Partial<Budget>, userId: string, orgId: string) {
   const { data, error } = await this.supabase
     .from('budgets')
     .update({
       ...updates,
       updated_by: userId
     })
     .in('id', ids)
     .eq('organization_id', orgId)
     .select();

   if (error) throw error;
   return data;
 }

 // Expense mutations
 async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>, userId: string) {
   const { data, error } = await this.supabase
     .from('expenses')
     .insert({
       ...expense,
       submitted_by: userId,
       created_by: userId,
       updated_by: userId
     })
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 async approveExpense(id: string, approverId: string, orgId: string) {
   const { data, error } = await this.supabase
     .from('expenses')
     .update({
       status: 'approved',
       approved_by: approverId,
       approved_at: new Date().toISOString()
     })
     .eq('id', id)
     .eq('organization_id', orgId)
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 async rejectExpense(id: string, approverId: string, reason: string, orgId: string) {
   const { data, error } = await this.supabase
     .from('expenses')
     .update({
       status: 'rejected',
       approved_by: approverId,
       rejected_reason: reason,
       approved_at: new Date().toISOString()
     })
     .eq('id', id)
     .eq('organization_id', orgId)
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 // Revenue mutations
 async createRevenue(revenue: Omit<Revenue, 'id' | 'created_at' | 'updated_at'>, userId: string) {
   const { data, error } = await this.supabase
     .from('revenue')
     .insert({
       ...revenue,
       created_by: userId,
       updated_by: userId
     })
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 // Transaction mutations
 async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>, userId: string) {
   const { data, error } = await this.supabase
     .from('transactions')
     .insert({
       ...transaction,
       created_by: userId,
       updated_by: userId
     })
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 // Account mutations
 async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>, userId: string) {
   const { data, error } = await this.supabase
     .from('accounts')
     .insert({
       ...account,
       created_by: userId,
       updated_by: userId
     })
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 async updateAccountBalance(accountId: string, amount: number, type: 'credit' | 'debit', orgId: string) {
   // Create transaction and update account balance
   const { data: account } = await this.supabase
     .from('accounts')
     .select('current_balance')
     .eq('id', accountId)
     .eq('organization_id', orgId)
     .single();

   if (!account) throw new Error('Account not found');

   const newBalance = type === 'credit'
     ? account.current_balance + amount
     : account.current_balance - amount;

   const { data, error } = await this.supabase
     .from('accounts')
     .update({ current_balance: newBalance })
     .eq('id', accountId)
     .eq('organization_id', orgId)
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 // Invoice mutations
 async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, userId: string) {
   const { data, error } = await this.supabase
     .from('invoices')
     .insert({
       ...invoice,
       created_by: userId,
       updated_by: userId
     })
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 async updateInvoiceStatus(id: string, status: Invoice['status'], orgId: string) {
   const updates: unknown = { status };

   if (status === 'paid') {
     updates.paid_date = new Date().toISOString();
   }

   const { data, error } = await this.supabase
     .from('invoices')
     .update(updates)
     .eq('id', id)
     .eq('organization_id', orgId)
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 // Forecast mutations
 async createForecast(forecast: Omit<Forecast, 'id' | 'created_at' | 'updated_at'>, userId: string) {
   const { data, error } = await this.supabase
     .from('forecasts')
     .insert({
       ...forecast,
       created_by: userId,
       updated_by: userId
     })
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 async updateForecastAccuracy(id: string, actualAmount: number, orgId: string) {
   const { data, error } = await this.supabase
     .from('forecasts')
     .update({
       actual_amount: actualAmount,
       updated_at: new Date().toISOString()
     })
     .eq('id', id)
     .eq('organization_id', orgId)
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 // Bulk operations
 async bulkDeleteRecords(table: string, ids: string[], orgId: string) {
   const { data, error } = await this.supabase
     .from(table)
     .update({ status: 'deleted' })
     .in('id', ids)
     .eq('organization_id', orgId)
     .select();

   if (error) throw error;
   return data;
 }

 async bulkUpdateRecords(table: string, ids: string[], updates: unknown, userId: string, orgId: string) {
   const { data, error } = await this.supabase
     .from(table)
     .update({
       ...updates,
       updated_by: userId
     })
     .in('id', ids)
     .eq('organization_id', orgId)
     .select();

   if (error) throw error;
   return data;
 }
}

export const financeMutations = new FinanceMutations();
