import { FieldConfig } from '@ghxstship/ui';

// Budget Field Configuration
export const BUDGET_FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'name',
    label: 'Budget Name',
    type: 'text',
    required: true,
    searchable: true,
    sortable: true,
    width: 200,
    visible: true,
    order: 1
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'Operations', value: 'operations' },
      { label: 'Marketing', value: 'marketing' },
      { label: 'Technology', value: 'technology' },
      { label: 'Travel', value: 'travel' },
      { label: 'Equipment', value: 'equipment' },
      { label: 'Other', value: 'other' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 120,
    visible: true,
    order: 2
  },
  {
    key: 'amount',
    label: 'Budget Amount',
    type: 'currency',
    required: true,
    sortable: true,
    width: 130,
    visible: true,
    order: 3
  },
  {
    key: 'spent',
    label: 'Spent',
    type: 'currency',
    sortable: true,
    width: 120,
    visible: true,
    order: 4
  },
  {
    key: 'remaining',
    label: 'Remaining',
    type: 'currency',
    sortable: true,
    width: 120,
    visible: true,
    order: 5
  },
  {
    key: 'utilization',
    label: 'Utilization %',
    type: 'percentage',
    sortable: true,
    width: 120,
    visible: true,
    order: 6
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 100,
    visible: true,
    order: 7
  },
  {
    key: 'period_start',
    label: 'Start Date',
    type: 'date',
    sortable: true,
    width: 120,
    visible: true,
    order: 8
  },
  {
    key: 'period_end',
    label: 'End Date',
    type: 'date',
    sortable: true,
    width: 120,
    visible: true,
    order: 9
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'datetime',
    sortable: true,
    width: 150,
    visible: false,
    order: 10
  }
];

// Expense Field Configuration
export const EXPENSE_FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    required: true,
    searchable: true,
    sortable: true,
    width: 250,
    visible: true,
    order: 1
  },
  {
    key: 'amount',
    label: 'Amount',
    type: 'currency',
    required: true,
    sortable: true,
    width: 120,
    visible: true,
    order: 2
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'Travel', value: 'travel' },
      { label: 'Equipment', value: 'equipment' },
      { label: 'Marketing', value: 'marketing' },
      { label: 'Operations', value: 'operations' },
      { label: 'Technology', value: 'technology' },
      { label: 'Other', value: 'other' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 120,
    visible: true,
    order: 3
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Submitted', value: 'submitted' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
      { label: 'Paid', value: 'paid' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 120,
    visible: true,
    order: 4
  },
  {
    key: 'expense_date',
    label: 'Expense Date',
    type: 'date',
    required: true,
    sortable: true,
    width: 130,
    visible: true,
    order: 5
  },
  {
    key: 'receipt_url',
    label: 'Receipt',
    type: 'file',
    width: 100,
    visible: true,
    order: 6
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'datetime',
    sortable: true,
    width: 150,
    visible: false,
    order: 7
  }
];

// Revenue Field Configuration
export const REVENUE_FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    required: true,
    searchable: true,
    sortable: true,
    width: 250,
    visible: true,
    order: 1
  },
  {
    key: 'amount',
    label: 'Amount',
    type: 'currency',
    required: true,
    sortable: true,
    width: 130,
    visible: true,
    order: 2
  },
  {
    key: 'source',
    label: 'Source',
    type: 'text',
    required: true,
    searchable: true,
    sortable: true,
    width: 150,
    visible: true,
    order: 3
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Projected', value: 'projected' },
      { label: 'Invoiced', value: 'invoiced' },
      { label: 'Received', value: 'received' },
      { label: 'Cancelled', value: 'cancelled' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 120,
    visible: true,
    order: 4
  },
  {
    key: 'recognition_date',
    label: 'Recognition Date',
    type: 'date',
    sortable: true,
    width: 140,
    visible: true,
    order: 5
  },
  {
    key: 'received_date',
    label: 'Received Date',
    type: 'date',
    sortable: true,
    width: 130,
    visible: true,
    order: 6
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'datetime',
    sortable: true,
    width: 150,
    visible: false,
    order: 7
  }
];

// Transaction Field Configuration
export const TRANSACTION_FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    required: true,
    searchable: true,
    sortable: true,
    width: 250,
    visible: true,
    order: 1
  },
  {
    key: 'amount',
    label: 'Amount',
    type: 'currency',
    required: true,
    sortable: true,
    width: 130,
    visible: true,
    order: 2
  },
  {
    key: 'kind',
    label: 'Type',
    type: 'select',
    options: [
      { label: 'Revenue', value: 'revenue' },
      { label: 'Expense', value: 'expense' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 100,
    visible: true,
    order: 3
  },
  {
    key: 'account_name',
    label: 'Account',
    type: 'text',
    searchable: true,
    sortable: true,
    width: 150,
    visible: true,
    order: 4
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Completed', value: 'completed' },
      { label: 'Failed', value: 'failed' },
      { label: 'Cancelled', value: 'cancelled' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 120,
    visible: true,
    order: 5
  },
  {
    key: 'occurred_at',
    label: 'Date',
    type: 'datetime',
    required: true,
    sortable: true,
    width: 150,
    visible: true,
    order: 6
  },
  {
    key: 'reference_number',
    label: 'Reference',
    type: 'text',
    searchable: true,
    width: 120,
    visible: true,
    order: 7
  }
];

// Account Field Configuration
export const ACCOUNT_FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'name',
    label: 'Account Name',
    type: 'text',
    required: true,
    searchable: true,
    sortable: true,
    width: 200,
    visible: true,
    order: 1
  },
  {
    key: 'account_type',
    label: 'Type',
    type: 'select',
    options: [
      { label: 'Checking', value: 'checking' },
      { label: 'Savings', value: 'savings' },
      { label: 'Credit Card', value: 'credit_card' },
      { label: 'Investment', value: 'investment' },
      { label: 'Other', value: 'other' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 120,
    visible: true,
    order: 2
  },
  {
    key: 'balance',
    label: 'Balance',
    type: 'currency',
    sortable: true,
    width: 130,
    visible: true,
    order: 3
  },
  {
    key: 'bank_name',
    label: 'Bank',
    type: 'text',
    searchable: true,
    sortable: true,
    width: 150,
    visible: true,
    order: 4
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Closed', value: 'closed' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 100,
    visible: true,
    order: 5
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'datetime',
    sortable: true,
    width: 150,
    visible: false,
    order: 6
  }
];

// Invoice Field Configuration
export const INVOICE_FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'invoice_number',
    label: 'Invoice #',
    type: 'text',
    required: true,
    searchable: true,
    sortable: true,
    width: 130,
    visible: true,
    order: 1
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    searchable: true,
    sortable: true,
    width: 200,
    visible: true,
    order: 2
  },
  {
    key: 'total_amount',
    label: 'Total Amount',
    type: 'currency',
    required: true,
    sortable: true,
    width: 130,
    visible: true,
    order: 3
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Sent', value: 'sent' },
      { label: 'Paid', value: 'paid' },
      { label: 'Overdue', value: 'overdue' },
      { label: 'Cancelled', value: 'cancelled' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 120,
    visible: true,
    order: 4
  },
  {
    key: 'issued_date',
    label: 'Issued Date',
    type: 'date',
    sortable: true,
    width: 130,
    visible: true,
    order: 5
  },
  {
    key: 'due_date',
    label: 'Due Date',
    type: 'date',
    sortable: true,
    width: 120,
    visible: true,
    order: 6
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'datetime',
    sortable: true,
    width: 150,
    visible: false,
    order: 7
  }
];

// Forecast Field Configuration
export const FORECAST_FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'name',
    label: 'Forecast Name',
    type: 'text',
    required: true,
    searchable: true,
    sortable: true,
    width: 200,
    visible: true,
    order: 1
  },
  {
    key: 'projected_amount',
    label: 'Projected Amount',
    type: 'currency',
    required: true,
    sortable: true,
    width: 150,
    visible: true,
    order: 2
  },
  {
    key: 'actual_amount',
    label: 'Actual Amount',
    type: 'currency',
    sortable: true,
    width: 140,
    visible: true,
    order: 3
  },
  {
    key: 'variance',
    label: 'Variance',
    type: 'currency',
    sortable: true,
    width: 120,
    visible: true,
    order: 4
  },
  {
    key: 'confidence_level',
    label: 'Confidence',
    type: 'select',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' }
    ],
    searchable: true,
    sortable: true,
    filterable: true,
    width: 120,
    visible: true,
    order: 5
  },
  {
    key: 'forecast_date',
    label: 'Forecast Date',
    type: 'date',
    required: true,
    sortable: true,
    width: 140,
    visible: true,
    order: 6
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'datetime',
    sortable: true,
    width: 150,
    visible: false,
    order: 7
  }
];
