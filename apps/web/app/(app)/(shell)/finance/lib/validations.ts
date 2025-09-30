'use client';

import { z } from 'zod';

// Budget validation schemas
export const createBudgetSchema = z.object({
 name: z.string().min(1, 'Budget name is required').max(100, 'Name too long'),
 category: z.enum(['operations', 'marketing', 'development', 'production', 'other']),
 amount: z.number().positive('Amount must be positive').max(10000000, 'Amount too large'),
 currency: z.string().default('USD'),
 period: z.enum(['monthly', 'quarterly', 'yearly']),
 fiscal_year: z.number().int().min(2020).max(2030),
 status: z.enum(['active', 'inactive', 'exceeded']).default('active'),
 notes: z.string().max(500).optional(),
 project_id: z.string().uuid().optional(),
 period_start: z.string().optional(),
 period_end: z.string().optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Expense validation schemas
export const createExpenseSchema = z.object({
 description: z.string().min(1, 'Description is required').max(200),
 amount: z.number().positive('Amount must be positive').max(1000000),
 currency: z.string().default('USD'),
 category: z.string().min(1, 'Category is required'),
 expense_date: z.string().min(1, 'Expense date is required'),
 vendor: z.string().max(100).optional(),
 receipt_url: z.string().url().optional(),
 project_id: z.string().uuid().optional(),
 budget_id: z.string().uuid().optional(),
 notes: z.string().max(500).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseApprovalSchema = z.object({
 action: z.enum(['approve', 'reject']),
 reason: z.string().max(500).optional(),
});

// Revenue validation schemas
export const createRevenueSchema = z.object({
 source: z.string().min(1, 'Revenue source is required').max(100),
 amount: z.number().positive('Amount must be positive').max(10000000),
 currency: z.string().default('USD'),
 category: z.enum(['sales', 'services', 'subscriptions', 'licensing', 'other']),
 recognition_date: z.string().min(1, 'Recognition date is required'),
 status: z.enum(['projected', 'invoiced', 'received']).default('projected'),
 client_id: z.string().uuid().optional(),
 project_id: z.string().uuid().optional(),
 invoice_number: z.string().max(50).optional(),
 notes: z.string().max(500).optional(),
});

export const updateRevenueSchema = createRevenueSchema.partial();

// Transaction validation schemas
export const createTransactionSchema = z.object({
 description: z.string().min(1, 'Description is required').max(200),
 amount: z.number().positive('Amount must be positive').max(10000000),
 currency: z.string().default('USD'),
 type: z.enum(['credit', 'debit']),
 transaction_date: z.string().min(1, 'Transaction date is required'),
 account_id: z.string().uuid(),
 category: z.string().min(1, 'Category is required'),
 project_id: z.string().uuid().optional(),
 reference_number: z.string().max(50).optional(),
 notes: z.string().max(500).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

// Account validation schemas
export const createAccountSchema = z.object({
 name: z.string().min(1, 'Account name is required').max(100),
 type: z.enum(['checking', 'savings', 'credit', 'investment', 'other']),
 account_number: z.string().max(50).optional(),
 institution: z.string().max(100).optional(),
 initial_balance: z.number().default(0),
 currency: z.string().default('USD'),
 status: z.enum(['active', 'inactive', 'closed']).default('active'),
 notes: z.string().max(500).optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

// Invoice validation schemas
export const createInvoiceSchema = z.object({
 invoice_number: z.string().min(1, 'Invoice number is required').max(50),
 client_id: z.string().uuid(),
 project_id: z.string().uuid().optional(),
 amount: z.number().positive('Amount must be positive').max(10000000),
 tax_amount: z.number().min(0).default(0),
 discount_amount: z.number().min(0).default(0),
 currency: z.string().default('USD'),
 issue_date: z.string().min(1, 'Issue date is required'),
 due_date: z.string().min(1, 'Due date is required'),
 payment_terms: z.string().max(200).optional(),
 status: z.enum(['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled']).default('draft'),
 notes: z.string().max(500).optional(),
 line_items: z.array(z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().positive(),
  amount: z.number().positive(),
 })).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

// Forecast validation schemas
export const createForecastSchema = z.object({
 title: z.string().min(1, 'Title is required').max(100),
 category: z.enum(['revenue', 'expenses', 'profit', 'cash_flow', 'other']),
 forecasted_amount: z.number().min(0).max(100000000),
 currency: z.string().default('USD'),
 forecast_date: z.string().min(1, 'Forecast date is required'),
 confidence_level: z.number().min(0).max(100).default(75),
 scenario: z.enum(['best_case', 'worst_case', 'most_likely']).default('most_likely'),
 project_id: z.string().uuid().optional(),
 notes: z.string().max(500).optional(),
 assumptions: z.string().max(1000).optional(),
});

export const updateForecastSchema = createForecastSchema.partial();

// Search and filter validation schemas
export const financeSearchSchema = z.object({
 query: z.string().max(100).optional(),
 module: z.enum(['budgets', 'expenses', 'revenue', 'transactions', 'accounts', 'invoices', 'forecasts']).optional(),
 date_from: z.string().optional(),
 date_to: z.string().optional(),
 amount_min: z.number().optional(),
 amount_max: z.number().optional(),
 status: z.string().optional(),
 category: z.string().optional(),
});

export const financeFilterSchema = z.object({
 status: z.array(z.string()).optional(),
 category: z.array(z.string()).optional(),
 date_range: z.object({
  start: z.string(),
  end: z.string(),
 }).optional(),
 amount_range: z.object({
  min: z.number(),
  max: z.number(),
 }).optional(),
 project_id: z.array(z.string()).optional(),
 client_id: z.array(z.string()).optional(),
});

export const financeSortSchema = z.object({
 field: z.string(),
 direction: z.enum(['asc', 'desc']),
});

// Bulk operations validation schemas
export const bulkUpdateSchema = z.object({
 ids: z.array(z.string().uuid()),
 updates: z.record(z.any()),
});

export const bulkDeleteSchema = z.object({
 ids: z.array(z.string().uuid()),
 confirm_deletion: z.boolean().refine(val => val === true, 'Deletion must be confirmed'),
});

// Import/Export validation schemas
export const importFinanceSchema = z.object({
 format: z.enum(['csv', 'xlsx', 'json']),
 module: z.enum(['budgets', 'expenses', 'revenue', 'transactions', 'accounts', 'invoices', 'forecasts']),
 file: z.any(), // File object
 options: z.object({
  skip_duplicates: z.boolean().default(true),
  update_existing: z.boolean().default(false),
  validate_data: z.boolean().default(true),
 }).optional(),
});

export const exportFinanceSchema = z.object({
 format: z.enum(['csv', 'xlsx', 'json', 'pdf']),
 module: z.enum(['budgets', 'expenses', 'revenue', 'transactions', 'accounts', 'invoices', 'forecasts']),
 filters: financeFilterSchema.optional(),
 include_related: z.boolean().default(false),
});

// Real-time subscription schemas
export const realtimeSubscriptionSchema = z.object({
 table: z.enum(['budgets', 'expenses', 'revenue', 'transactions', 'accounts', 'invoices', 'forecasts']),
 event: z.enum(['INSERT', 'UPDATE', 'DELETE', '*']),
 filter: z.record(z.any()).optional(),
});

// Type exports for use in components
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseApprovalInput = z.infer<typeof expenseApprovalSchema>;
export type CreateRevenueInput = z.infer<typeof createRevenueSchema>;
export type UpdateRevenueInput = z.infer<typeof updateRevenueSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type CreateForecastInput = z.infer<typeof createForecastSchema>;
export type UpdateForecastInput = z.infer<typeof updateForecastSchema>;
export type FinanceSearchInput = z.infer<typeof financeSearchSchema>;
export type FinanceFilterInput = z.infer<typeof financeFilterSchema>;
export type FinanceSortInput = z.infer<typeof financeSortSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type ImportFinanceInput = z.infer<typeof importFinanceSchema>;
export type ExportFinanceInput = z.infer<typeof exportFinanceSchema>;
export type RealtimeSubscriptionInput = z.infer<typeof realtimeSubscriptionSchema>;
