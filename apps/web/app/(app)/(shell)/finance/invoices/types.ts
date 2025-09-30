import { User } from '@supabase/supabase-js';

// Base invoice interface
export interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  title: string;
  description?: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  payment_reference?: string;
  project_id?: string;
  purchase_order?: string;
  terms?: string;
  notes?: string;
  line_items: InvoiceLineItem[];
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Invoice line item interface
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  tax_rate?: number;
  discount_rate?: number;
}

// Create invoice data
export interface CreateInvoiceData {
  title: string;
  description?: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  currency?: string;
  issue_date: string;
  due_date: string;
  project_id?: string;
  purchase_order?: string;
  terms?: string;
  notes?: string;
  line_items: Omit<InvoiceLineItem, 'id'>[];
  tags?: string[];
}

// Update invoice data
export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  paid_date?: string;
  payment_method?: string;
  payment_reference?: string;
}

// Invoice filters
export interface InvoiceFilters {
  status?: string[];
  client_name?: string[];
  amount_min?: number;
  amount_max?: number;
  issue_date_from?: string;
  issue_date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  project_id?: string;
  overdue_only?: boolean;
  search?: string;
}

// Invoice statistics
export interface InvoiceStatistics {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageAmount: number;
  averagePaymentTime: number; // in days
  topClients: Array<{
    client_name: string;
    amount: number;
    count: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    issued: number;
    paid: number;
    count: number;
  }>;
}

// Component props
export interface InvoicesClientProps {
  user: User;
  orgId: string;
  translations: unknown;
}

export interface CreateInvoiceClientProps {
  user: User;
  orgId: string;
  onSuccess?: (invoice: Invoice) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateInvoiceData>;
}

export interface InvoiceDrawerProps {
  invoice?: Invoice;
  mode: 'create' | 'edit' | 'view';
  onSave?: (invoice: Invoice) => void;
  onCancel?: () => void;
  user: User;
  orgId: string;
}

// Invoice workflow actions
export interface InvoiceWorkflowActions {
  send: (invoiceId: string) => Promise<void>;
  markViewed: (invoiceId: string) => Promise<void>;
  markPaid: (invoiceId: string, paidDate?: string, paymentMethod?: string, paymentReference?: string) => Promise<void>;
  markOverdue: (invoiceId: string) => Promise<void>;
  cancel: (invoiceId: string, reason?: string) => Promise<void>;
  generatePDF: (invoiceId: string) => Promise<string>;
}

// Export/import types
export interface InvoiceExportData {
  invoice_number: string;
  title: string;
  description: string;
  client_name: string;
  client_email: string;
  status: string;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  currency: string;
  issue_date: string;
  due_date: string;
  paid_date: string;
  payment_method: string;
  project_id: string;
  purchase_order: string;
  terms: string;
  notes: string;
  tags: string;
}

export interface InvoiceImportData {
  title: string;
  description?: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  currency?: string;
  issue_date: string;
  due_date: string;
  project_id?: string;
  purchase_order?: string;
  terms?: string;
  notes?: string;
  tags?: string;
  line_items?: string; // JSON string of line items
}
