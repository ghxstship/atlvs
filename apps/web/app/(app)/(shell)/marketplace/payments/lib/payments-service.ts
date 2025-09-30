import { createClient } from '@ghxstship/auth/client';
import type { PaymentFormData, PaymentData, PaymentMethodData, EscrowData, PaymentStats, InvoiceData } from '../types';

export class PaymentsService {
  private supabase = createClient();

  async getPayments(filters: unknown = {}): Promise<PaymentData[]> {
    try {
      let query = this.supabase
        .from('marketplace_payments')
        .select(`
          *,
          payer:users!payer_id(id, name, email),
          recipient:users!recipient_id(id, name, email),
          project:opendeck_projects(id, title),
          contract:opendeck_contracts(id, title)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.payment_type) {
        query = query.eq('payment_type', filters.payment_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.currency) {
        query = query.eq('currency', filters.currency);
      }
      if (filters.amount_range?.min) {
        query = query.gte('amount', filters.amount_range.min);
      }
      if (filters.amount_range?.max) {
        query = query.lte('amount', filters.amount_range.max);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  async getPayment(id: string): Promise<PaymentData | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_payments')
        .select(`
          *,
          payer:users!payer_id(id, name, email),
          recipient:users!recipient_id(id, name, email),
          project:opendeck_projects(id, title),
          contract:opendeck_contracts(id, title)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      return null;
    }
  }

  async createPayment(paymentData: PaymentFormData): Promise<PaymentData> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_payments')
        .insert([{
          ...paymentData,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Create escrow if enabled
      if (paymentData.escrow_enabled) {
        await this.createEscrow(data.id, paymentData);
      }

      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async processPayment(id: string, paymentMethodId: string): Promise<PaymentData> {
    try {
      // Update payment status to processing
      const { data, error } = await this.supabase
        .from('marketplace_payments')
        .update({
          status: 'processing',
          payment_method_id: paymentMethodId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Here you would integrate with payment processor (Stripe, etc.)
      // For now, we'll simulate successful processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update to completed
      const { data: completedPayment, error: completeError } = await this.supabase
        .from('marketplace_payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString(),
          transaction_id: `txn_${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (completeError) throw completeError;
      return completedPayment;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async refundPayment(id: string, amount?: number, reason?: string): Promise<PaymentData> {
    try {
      const payment = await this.getPayment(id);
      if (!payment) throw new Error('Payment not found');

      const refundAmount = amount || payment.amount;

      const { data, error } = await this.supabase
        .from('marketplace_payments')
        .insert([{
          payer_id: payment.recipient_id,
          recipient_id: payment.payer_id,
          amount: refundAmount,
          currency: payment.currency,
          description: `Refund for payment ${payment.id}${reason ? `: ${reason}` : ''}`,
          payment_type: 'refund',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: { original_payment_id: id, refund_reason: reason }
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethodData[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  async addPaymentMethod(userId: string, methodData: Partial<PaymentMethodData>): Promise<PaymentMethodData> {
    try {
      const { data, error } = await this.supabase
        .from('payment_methods')
        .insert([{
          user_id: userId,
          ...methodData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  async createEscrow(paymentId: string, paymentData: PaymentFormData): Promise<EscrowData> {
    try {
      const { data, error } = await this.supabase
        .from('payment_escrow')
        .insert([{
          payment_id: paymentId,
          project_id: paymentData.project_id,
          contract_id: paymentData.contract_id,
          payer_id: paymentData.recipient_id, // Note: reversed for escrow
          recipient_id: paymentData.recipient_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'pending',
          release_conditions: [
            {
              type: 'approval',
              description: 'Manual approval required',
              completed: false
            }
          ],
          auto_release_date: paymentData.auto_release ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days
            undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating escrow:', error);
      throw error;
    }
  }

  async releaseEscrow(escrowId: string, conditions?: string[]): Promise<EscrowData> {
    try {
      const { data, error } = await this.supabase
        .from('payment_escrow')
        .update({
          status: 'released',
          updated_at: new Date().toISOString(),
          metadata: { release_conditions: conditions }
        })
        .eq('id', escrowId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw error;
    }
  }

  async createInvoice(invoiceData: Partial<InvoiceData>): Promise<InvoiceData> {
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      
      const { data, error } = await this.supabase
        .from('marketplace_invoices')
        .insert([{
          ...invoiceData,
          invoice_number: invoiceNumber,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getPaymentStats(userId: string, orgId: string): Promise<PaymentStats> {
    try {
      const { data: payments, error } = await this.supabase
        .from('marketplace_payments')
        .select('*')
        .or(`payer_id.eq.${userId},recipient_id.eq.${userId}`);

      if (error) throw error;

      const stats: PaymentStats = {
        totalPayments: payments?.length || 0,
        totalAmount: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
        totalFees: payments?.reduce((sum, p) => sum + (p.fee_amount || 0), 0) || 0,
        pendingPayments: payments?.filter(p => p.status === 'pending').length || 0,
        completedPayments: payments?.filter(p => p.status === 'completed').length || 0,
        failedPayments: payments?.filter(p => p.status === 'failed').length || 0,
        escrowBalance: 0, // Would need separate query
        averageTransactionAmount: 0,
        paymentMethodBreakdown: {},
        statusBreakdown: {},
        monthlyVolume: []
      };

      // Calculate average
      if (stats.totalPayments > 0) {
        stats.averageTransactionAmount = stats.totalAmount / stats.totalPayments;
      }

      // Calculate breakdowns
      payments?.forEach(payment => {
        stats.statusBreakdown[payment.status] = (stats.statusBreakdown[payment.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  async exportPayments(format: 'csv' | 'json' | 'excel', filters: unknown = {}): Promise<Blob> {
    try {
      const payments = await this.getPayments(filters);
      
      const exportData = payments.map(payment => ({
        id: payment.id,
        payer_name: payment.payer_name,
        recipient_name: payment.recipient_name,
        amount: payment.amount,
        currency: payment.currency,
        fee_amount: payment.fee_amount,
        net_amount: payment.net_amount,
        description: payment.description,
        payment_type: payment.payment_type,
        status: payment.status,
        created_at: payment.created_at,
        paid_at: payment.paid_at
      }));

      if (format === 'csv') {
        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(row => Object.values(row).join(','));
        const csv = [headers, ...rows].join('\n');
        return new Blob([csv], { type: 'text/csv' });
      } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        return new Blob([json], { type: 'application/json' });
      } else {
        throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting payments:', error);
      throw error;
    }
  }

  // Helper methods
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  calculateFee(amount: number, feePercentage: number = 2.9): number {
    return Math.round(amount * (feePercentage / 100) * 100) / 100;
  }

  generateId(): string {
    return crypto.randomUUID();
  }
}
