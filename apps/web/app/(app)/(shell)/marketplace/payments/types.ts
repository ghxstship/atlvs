import type { DataRecord } from '@ghxstship/ui';

export interface PaymentFormData {
  recipient_id: string;
  amount: number;
  currency: string;
  description: string;
  payment_type: 'invoice' | 'escrow' | 'direct' | 'refund';
  project_id?: string;
  contract_id?: string;
  due_date?: string;
  payment_terms?: string;
  late_fee_percentage?: number;
  escrow_enabled?: boolean;
  auto_release?: boolean;
  milestone_id?: string;
}

export interface PaymentData extends DataRecord {
  id: string;
  payer_id: string;
  payer_name?: string;
  recipient_id: string;
  recipient_name?: string;
  amount: number;
  currency: string;
  fee_amount?: number;
  net_amount?: number;
  description: string;
  payment_type: 'invoice' | 'escrow' | 'direct' | 'refund';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  payment_method_id?: string;
  transaction_id?: string;
  project_id?: string;
  contract_id?: string;
  milestone_id?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethodData extends DataRecord {
  id: string;
  user_id: string;
  type: 'card' | 'bank' | 'paypal' | 'crypto' | 'wire';
  provider: 'stripe' | 'paypal' | 'bank' | 'crypto';
  last_four?: string;
  brand?: string;
  bank_name?: string;
  account_type?: string;
  is_default: boolean;
  is_verified: boolean;
  status: 'active' | 'expired' | 'pending' | 'blocked';
  expires_at?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface EscrowData extends DataRecord {
  id: string;
  payment_id: string;
  project_id?: string;
  contract_id?: string;
  payer_id: string;
  recipient_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released' | 'disputed' | 'refunded';
  funded_at?: string;
  release_conditions: Array<{
    type: 'milestone' | 'approval' | 'time_based';
    description: string;
    completed: boolean;
    completed_at?: string;
  }>;
  auto_release_date?: string;
  dispute_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  totalFees: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  escrowBalance: number;
  averageTransactionAmount: number;
  paymentMethodBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  monthlyVolume: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export interface PaymentActivity extends DataRecord {
  id: string;
  payment_id: string;
  type: 'created' | 'processed' | 'completed' | 'failed' | 'refunded' | 'disputed';
  description: string;
  amount?: number;
  currency?: string;
  user_id?: string;
  user_name?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface InvoiceData extends DataRecord {
  id: string;
  payment_id: string;
  invoice_number: string;
  client_id: string;
  client_name?: string;
  vendor_id: string;
  vendor_name?: string;
  project_id?: string;
  contract_id?: string;
  amount: number;
  currency: string;
  tax_amount?: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  sent_at?: string;
  paid_at?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  payment_terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentSearchFilters {
  query?: string;
  payment_type?: 'invoice' | 'escrow' | 'direct' | 'refund';
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  amount_range?: {
    min?: number;
    max?: number;
  };
  date_range?: {
    start?: string;
    end?: string;
  };
  currency?: string;
  project_id?: string;
  contract_id?: string;
  sortBy?: 'created_at' | 'amount' | 'due_date' | 'paid_at';
  sortOrder?: 'asc' | 'desc';
}
