import { z } from 'zod';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Receipt, 
  CreditCard,
  PieChart,
  Calculator,
  Target,
  FileText,
  Banknote,
  BarChart3,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

// Schemas
const BudgetSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Budget name is required'),
  category: z.enum(['operations', 'marketing', 'development', 'production', 'other']),
  amount: z.number().positive('Amount must be positive'),
  spent: z.number().default(0),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  fiscal_year: z.number().int().min(2020).max(2030),
  status: z.enum(['active', 'inactive', 'exceeded']),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const ExpenseSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string(),
  vendor: z.string().optional(),
  project_id: z.string().uuid().optional(),
  receipt_url: z.string().url().optional(),
  expense_date: z.date(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'paid']),
  submitted_by: z.string().uuid(),
  approved_by: z.string().uuid().optional(),
  paid_at: z.date().optional(),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const RevenueSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  source: z.string().min(1, 'Revenue source is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['sales', 'services', 'subscriptions', 'licensing', 'other']),
  project_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  recognition_date: z.date(),
  status: z.enum(['projected', 'invoiced', 'received']),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const InvoiceSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  amount: z.number().positive('Amount must be positive'),
  tax_amount: z.number().default(0),
  discount_amount: z.number().default(0),
  total_amount: z.number().positive(),
  currency: z.string().default('USD'),
  issue_date: z.date(),
  due_date: z.date(),
  paid_date: z.date().optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled']),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    amount: z.number(),
  })).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const TransactionSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  account_id: z.string().uuid(),
  type: z.enum(['debit', 'credit']),
  amount: z.number().positive('Amount must be positive'),
  balance_after: z.number(),
  category: z.string(),
  description: z.string(),
  reference_type: z.enum(['expense', 'revenue', 'invoice', 'transfer', 'adjustment']).optional(),
  reference_id: z.string().uuid().optional(),
  transaction_date: z.date(),
  status: z.enum(['pending', 'completed', 'failed', 'reversed']),
  created_at: z.date(),
  updated_at: z.date(),
});

export const financeModuleConfig: ModuleConfig = {
  id: 'finance',
  name: 'Finance',
  description: 'Manage budgets, expenses, revenue, and financial reporting',
  icon: DollarSign,
  color: 'green',
  path: '/finance',
  
  entities: {
    budgets: {
      table: 'budgets',
      singular: 'Budget',
      plural: 'Budgets',
      schema: BudgetSchema,
      includes: ['category:categories(name,color)'],
      searchFields: ['name', 'category'],
      orderBy: 'created_at.desc',
      
      fields: [
        { 
          key: 'name', 
          label: 'Budget Name', 
          type: 'text', 
          required: true,
          placeholder: 'e.g., Q1 Marketing Budget'
        },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select', 
          required: true,
          options: [
            { label: 'Operations', value: 'operations' },
            { label: 'Marketing', value: 'marketing' },
            { label: 'Development', value: 'development' },
            { label: 'Production', value: 'production' },
            { label: 'Other', value: 'other' },
          ]
        },
        { 
          key: 'amount', 
          label: 'Budget Amount', 
          type: 'currency', 
          required: true,
          min: 0,
          placeholder: '0.00'
        },
        { 
          key: 'period', 
          label: 'Period', 
          type: 'select', 
          required: true,
          options: [
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Yearly', value: 'yearly' },
          ]
        },
        {
          key: 'fiscal_year',
          label: 'Fiscal Year',
          type: 'number',
          required: true,
          min: 2020,
          max: 2030,
          defaultValue: new Date().getFullYear()
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Exceeded', value: 'exceeded' },
          ]
        },
        {
          key: 'notes',
          label: 'Notes',
          type: 'textarea',
          rows: 3,
          placeholder: 'Additional notes or comments...'
        }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      deleteConfirmation: true,
      
      defaultViews: ['grid', 'list', 'kanban'],
      
      filters: [
        {
          key: 'category',
          label: 'Category',
          type: 'multiselect',
          options: ['operations', 'marketing', 'development', 'production', 'other']
        },
        {
          key: 'period',
          label: 'Period',
          type: 'select',
          options: ['monthly', 'quarterly', 'yearly']
        },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: ['active', 'inactive', 'exceeded']
        }
      ],
      
      emptyState: {
        title: 'No budgets yet',
        description: 'Create your first budget to start tracking finances',
        icon: Calculator,
        action: {
          label: 'Create Budget',
          onClick: () => console.log('Create budget')
        }
      }
    },
    
    expenses: {
      table: 'expenses',
      singular: 'Expense',
      plural: 'Expenses',
      schema: ExpenseSchema,
      includes: ['vendor:vendors(name)', 'submitted_by:users(name,avatar)', 'project:projects(name)'],
      searchFields: ['description', 'vendor', 'category'],
      orderBy: 'expense_date.desc',
      
      fields: [
        { 
          key: 'description', 
          label: 'Description', 
          type: 'text', 
          required: true,
          placeholder: 'What was this expense for?',
          group: 'details'
        },
        { 
          key: 'amount', 
          label: 'Amount', 
          type: 'currency', 
          required: true,
          placeholder: '0.00',
          group: 'details'
        },
        { 
          key: 'expense_date',
          label: 'Expense Date',
          type: 'date',
          required: true,
          defaultValue: new Date(),
          group: 'details'
        },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: async () => {
            // Fetch categories from API
            return [
              { label: 'Travel', value: 'travel' },
              { label: 'Meals', value: 'meals' },
              { label: 'Office Supplies', value: 'office' },
              { label: 'Software', value: 'software' },
              { label: 'Equipment', value: 'equipment' },
              { label: 'Other', value: 'other' },
            ];
          },
          group: 'details'
        },
        { 
          key: 'vendor', 
          label: 'Vendor', 
          type: 'text',
          placeholder: 'Vendor or merchant name',
          group: 'details'
        },
        {
          key: 'project_id',
          label: 'Project',
          type: 'select',
          options: async () => {
            // This would fetch projects from API
            return [
              { label: 'Project Alpha', value: 'project-1' },
              { label: 'Project Beta', value: 'project-2' },
              { label: 'Project Gamma', value: 'project-3' }
            ];
          },
          placeholder: 'Select a project (optional)',
          group: 'allocation'
        },
        { 
          key: 'receipt_url', 
          label: 'Receipt', 
          type: 'file',
          accept: 'image/*,application/pdf',
          maxSize: 5 * 1024 * 1024, // 5MB
          group: 'documentation'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Submitted', value: 'submitted' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Paid', value: 'paid' },
          ],
          group: 'approval'
        },
        {
          key: 'notes',
          label: 'Notes',
          type: 'textarea',
          rows: 3,
          placeholder: 'Additional notes or justification...',
          group: 'documentation'
        }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      deleteConfirmation: true,
      
      defaultViews: ['list', 'kanban', 'calendar'],
      
      bulkActions: {
        approve: async (ids: string[]) => {
          console.log('Approving expenses:', ids);
        },
        reject: async (ids: string[]) => {
          console.log('Rejecting expenses:', ids);
        },
        export: async (ids: string[]) => {
          console.log('Exporting expenses:', ids);
        }
      }
    },
    
    revenue: {
      table: 'revenue',
      singular: 'Revenue',
      plural: 'Revenue',
      schema: RevenueSchema,
      includes: ['client:companies(name)', 'project:projects(name)'],
      searchFields: ['source', 'category'],
      orderBy: 'recognition_date.desc',
      
      fields: [
        { key: 'source', label: 'Revenue Source', type: 'text', required: true },
        { key: 'amount', label: 'Amount', type: 'currency', required: true },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: [
            { label: 'Sales', value: 'sales' },
            { label: 'Services', value: 'services' },
            { label: 'Subscriptions', value: 'subscriptions' },
            { label: 'Licensing', value: 'licensing' },
            { label: 'Other', value: 'other' },
          ]
        },
        { key: 'recognition_date', label: 'Recognition Date', type: 'date', required: true },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'projected',
          options: [
            { label: 'Projected', value: 'projected' },
            { label: 'Invoiced', value: 'invoiced' },
            { label: 'Received', value: 'received' },
          ]
        },
        { 
          key: 'client_id', 
          label: 'Client', 
          type: 'select', 
          options: async () => {
            // This would fetch clients from API
            return [
              { label: 'Client A', value: 'client-1' },
              { label: 'Client B', value: 'client-2' },
              { label: 'Client C', value: 'client-3' }
            ];
          }
        },
        { 
          key: 'project_id', 
          label: 'Project', 
          type: 'select', 
          options: async () => {
            // This would fetch projects from API
            return [
              { label: 'Project Alpha', value: 'project-1' },
              { label: 'Project Beta', value: 'project-2' },
              { label: 'Project Gamma', value: 'project-3' }
            ];
          }
        },
        { key: 'invoice_number', label: 'Invoice Number', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list', 'timeline']
    },
    
    invoices: {
      table: 'invoices',
      singular: 'Invoice',
      plural: 'Invoices',
      schema: InvoiceSchema,
      includes: ['client:companies(name,email)', 'project:projects(name)'],
      searchFields: ['invoice_number', 'client_id'],
      orderBy: 'issue_date.desc',
      
      fields: [
        { key: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
        { 
          key: 'client_id', 
          label: 'Client', 
          type: 'select', 
          required: true, 
          options: async () => {
            // This would fetch clients from API
            return [
              { label: 'Client A', value: 'client-1' },
              { label: 'Client B', value: 'client-2' },
              { label: 'Client C', value: 'client-3' }
            ];
          }
        },
        { key: 'amount', label: 'Amount', type: 'currency', required: true },
        { key: 'issue_date', label: 'Issue Date', type: 'date', required: true },
        { key: 'due_date', label: 'Due Date', type: 'date', required: true },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Sent', value: 'sent' },
            { label: 'Viewed', value: 'viewed' },
            { label: 'Partial', value: 'partial' },
            { label: 'Paid', value: 'paid' },
            { label: 'Overdue', value: 'overdue' },
            { label: 'Cancelled', value: 'cancelled' },
          ]
        },
        { key: 'payment_terms', label: 'Payment Terms', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'xl',
      
      defaultViews: ['list', 'kanban'],
      
      customActions: [
        {
          id: 'send',
          label: 'Send Invoice',
          onClick: async (invoice) => {
            console.log('Sending invoice:', invoice);
          },
          condition: (invoice) => invoice.status === 'draft'
        },
        {
          id: 'download',
          label: 'Download PDF',
          icon: Download,
          onClick: async (invoice) => {
            console.log('Downloading invoice:', invoice);
          }
        }
      ]
    },
    
    transactions: {
      table: 'finance_transactions',
      singular: 'Transaction',
      plural: 'Transactions',
      schema: TransactionSchema,
      includes: ['account:finance_accounts(name,type)'],
      searchFields: ['description', 'category'],
      orderBy: 'transaction_date.desc',
      
      fields: [
        { key: 'description', label: 'Description', type: 'text', required: true },
        { key: 'amount', label: 'Amount', type: 'currency', required: true },
        { 
          key: 'type', 
          label: 'Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Debit', value: 'debit' },
            { label: 'Credit', value: 'credit' },
          ]
        },
        { 
          key: 'account_id', 
          label: 'Account', 
          type: 'select', 
          required: true, 
          options: async () => {
            // This would fetch accounts from API
            return [
              { label: 'Checking Account', value: 'account-1' },
              { label: 'Savings Account', value: 'account-2' },
              { label: 'Business Account', value: 'account-3' }
            ];
          }
        },
        { key: 'category', label: 'Category', type: 'text', required: true },
        { key: 'transaction_date', label: 'Date', type: 'date', required: true },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Completed', value: 'completed' },
            { label: 'Failed', value: 'failed' },
            { label: 'Reversed', value: 'reversed' },
          ]
        }
      ],
      
      permissions: {
        create: false, // Transactions are typically created by the system
        update: false,
        delete: false
      },
      
      defaultViews: ['list', 'timeline']
    }
  },
  
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: PieChart,
      type: 'overview',
      config: {
        widgets: [
          {
            id: 'total-budget',
            type: 'metric',
            title: 'Total Budget',
            metric: 'total_budget',
            icon: Calculator,
            color: 'primary',
            span: 3
          },
          {
            id: 'total-spent',
            type: 'metric',
            title: 'Total Spent',
            metric: 'total_spent',
            icon: TrendingDown,
            color: 'warning',
            span: 3
          },
          {
            id: 'remaining',
            type: 'metric',
            title: 'Remaining',
            metric: 'remaining_budget',
            icon: Banknote,
            color: 'success',
            span: 3
          },
          {
            id: 'revenue',
            type: 'metric',
            title: 'Total Revenue',
            metric: 'total_revenue',
            icon: TrendingUp,
            color: 'success',
            span: 3
          },
          {
            id: 'spending-trend',
            type: 'chart',
            title: 'Spending Trend',
            chart: 'spending_trend',
            chartType: 'line',
            span: 6
          },
          {
            id: 'budget-utilization',
            type: 'chart',
            title: 'Budget Utilization',
            chart: 'budget_utilization',
            chartType: 'donut',
            span: 6
          },
          {
            id: 'recent-expenses',
            type: 'list',
            title: 'Recent Expenses',
            entity: 'expenses',
            limit: 5,
            span: 6
          },
          {
            id: 'pending-invoices',
            type: 'list',
            title: 'Pending Invoices',
            entity: 'invoices',
            filters: { status: 'sent' },
            limit: 5,
            span: 6
          }
        ],
        layout: 'grid',
        columns: 12,
        gap: 'md',
        refresh: true,
        refreshInterval: 60000 // 1 minute
      }
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: Calculator,
      entity: 'budgets',
      views: ['grid', 'list', 'kanban']
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: Receipt,
      entity: 'expenses',
      views: ['list', 'kanban', 'calendar']
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: TrendingUp,
      entity: 'revenue',
      views: ['list', 'timeline']
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileText,
      entity: 'invoices',
      views: ['list', 'kanban']
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      entity: 'transactions',
      views: ['list', 'timeline']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      type: 'custom',
      component: () => null // Will be implemented separately
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      variant: 'outline',
      onClick: () => console.log('Export finance data')
    },
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      variant: 'outline',
      onClick: () => console.log('Import finance data')
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      variant: 'ghost',
      size: 'sm',
      onClick: () => console.log('Refresh finance data')
    }
  ],
  
  features: {
    search: true,
    filters: true,
    sort: true,
    export: true,
    import: true,
    bulkActions: true,
    realtime: true,
    audit: true,
    notifications: true
  },
  
  onCreateSuccess: (data) => {
    console.log('Created:', data);
  },
  
  onUpdateSuccess: (data) => {
    console.log('Updated:', data);
  },
  
  onDeleteSuccess: (id) => {
    console.log('Deleted:', id);
  }
};

export default financeModuleConfig;
