/**
 * Billing Service Layer
 * ATLVS Architecture Compliance
 */

import { createBrowserClient } from '@ghxstship/auth';
import type {
  BillingSubscription,
  BillingPlan,
  PaymentMethod,
  BillingInvoice,
  BillingRecord,
  UpdatePaymentMethodFormData,
  ChangePlanFormData,
  BillingSettingsFormData,
  BillingSearchParams,
  BillingStatistics,
  BillingExportOptions,
  UsageMetrics
} from '../types';

class BillingService {
  private supabase = createBrowserClient();

  /**
   * Subscription Management
   */
  async getSubscription(): Promise<BillingSubscription | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { data, error } = await this.supabase
        .from('billing_subscriptions')
        .select(`
          *,
          plan:billing_plans(name)
        `)
        .eq('organization_id', membership.organization_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data ? {
        ...data,
        plan_name: data.plan?.name || 'Unknown Plan'
      } : null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw new Error('Failed to fetch subscription');
    }
  }

  async changePlan(data: ChangePlanFormData): Promise<BillingSubscription> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      // In a real implementation, this would integrate with Stripe/payment processor
      const { data: updatedSubscription, error } = await this.supabase
        .from('billing_subscriptions')
        .update({
          plan_id: data.plan_id,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', membership.organization_id)
        .select(`
          *,
          plan:billing_plans(name)
        `)
        .single();

      if (error) throw error;

      return {
        ...updatedSubscription,
        plan_name: updatedSubscription.plan?.name || 'Unknown Plan'
      };
    } catch (error) {
      console.error('Error changing plan:', error);
      throw new Error('Failed to change plan');
    }
  }

  async cancelSubscription(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { error } = await this.supabase
        .from('billing_subscriptions')
        .update({
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', membership.organization_id);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Payment Methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { data, error } = await this.supabase
        .from('payment_methods')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  }

  async updatePaymentMethod(data: UpdatePaymentMethodFormData): Promise<PaymentMethod> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      // In a real implementation, this would integrate with Stripe/payment processor
      // For now, we'll create a mock payment method
      const { data: newPaymentMethod, error } = await this.supabase
        .from('payment_methods')
        .insert([{
          organization_id: membership.organization_id,
          type: 'card',
          brand: this.detectCardBrand(data.card_number),
          last4: data.card_number.slice(-4),
          exp_month: data.exp_month,
          exp_year: data.exp_year,
          is_default: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Set other payment methods as non-default
      await this.supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('organization_id', membership.organization_id)
        .neq('id', newPaymentMethod.id);

      return newPaymentMethod;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw new Error('Failed to update payment method');
    }
  }

  /**
   * Invoices
   */
  async getInvoices(): Promise<BillingInvoice[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { data, error } = await this.supabase
        .from('billing_invoices')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Failed to fetch invoices');
    }
  }

  /**
   * Plans
   */
  async getPlans(): Promise<BillingPlan[]> {
    try {
      const { data, error } = await this.supabase
        .from('billing_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw new Error('Failed to fetch billing plans');
    }
  }

  /**
   * Billing Settings
   */
  async getBillingSettings(): Promise<BillingSettingsFormData | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { data, error } = await this.supabase
        .from('billing_settings')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching billing settings:', error);
      throw new Error('Failed to fetch billing settings');
    }
  }

  async updateBillingSettings(data: BillingSettingsFormData): Promise<BillingSettingsFormData> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { data: updatedSettings, error } = await this.supabase
        .from('billing_settings')
        .upsert({
          organization_id: membership.organization_id,
          ...data,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return updatedSettings;
    } catch (error) {
      console.error('Error updating billing settings:', error);
      throw new Error('Failed to update billing settings');
    }
  }

  /**
   * Billing Records for ATLVS DataViews
   */
  async getBillingRecords(params?: BillingSearchParams): Promise<BillingRecord[]> {
    try {
      const [subscription, invoices, paymentMethods, plans] = await Promise.all([
        this.getSubscription(),
        this.getInvoices(),
        this.getPaymentMethods(),
        this.getPlans(),
      ]);

      const records: BillingRecord[] = [];

      // Subscription record
      if (subscription) {
        records.push({
          id: `subscription-${subscription.id}`,
          type: 'subscription',
          name: subscription.plan_name,
          amount: `$${(subscription.plan_id ? 29.99 : 0).toFixed(2)}/month`, // Mock pricing
          status: subscription.status,
          description: `Active subscription - Next billing: ${new Date(subscription.current_period_end).toLocaleDateString()}`,
          category: 'subscriptions',
          created_at: subscription.created_at,
          updated_at: subscription.updated_at,
          metadata: subscription
        });
      }

      // Invoice records
      invoices.forEach(invoice => {
        records.push({
          id: `invoice-${invoice.id}`,
          type: 'invoice',
          name: `Invoice ${invoice.number}`,
          amount: `$${(invoice.amount_due / 100).toFixed(2)}`,
          status: invoice.status,
          description: `Period: ${new Date(invoice.period_start).toLocaleDateString()} - ${new Date(invoice.period_end).toLocaleDateString()}`,
          category: 'invoices',
          created_at: invoice.created_at,
          updated_at: invoice.created_at,
          metadata: invoice
        });
      });

      // Payment method records
      paymentMethods.forEach(method => {
        records.push({
          id: `payment-${method.id}`,
          type: 'payment',
          name: `${method.brand || 'Card'} ending in ${method.last4}`,
          amount: method.is_default ? 'Default' : 'Backup',
          status: 'active',
          description: `Expires ${method.exp_month}/${method.exp_year}`,
          category: 'payments',
          created_at: method.created_at,
          updated_at: method.created_at,
          metadata: method
        });
      });

      // Plan records
      plans.forEach(plan => {
        records.push({
          id: `plan-${plan.id}`,
          type: 'plan',
          name: plan.name,
          amount: `$${plan.price.toFixed(2)}/${plan.interval}`,
          status: subscription?.plan_id === plan.id ? 'current' : 'available',
          description: plan.description,
          category: 'plans',
          created_at: plan.created_at,
          updated_at: plan.created_at,
          metadata: plan
        });
      });

      // Apply filters
      let filteredRecords = records;

      if (params?.query) {
        filteredRecords = filteredRecords.filter(record =>
          record.name.toLowerCase().includes(params.query!.toLowerCase()) ||
          record.description.toLowerCase().includes(params.query!.toLowerCase())
        );
      }

      if (params?.type) {
        filteredRecords = filteredRecords.filter(record => record.type === params.type);
      }

      if (params?.status) {
        filteredRecords = filteredRecords.filter(record => record.status === params.status);
      }

      if (params?.category) {
        filteredRecords = filteredRecords.filter(record => record.category === params.category);
      }

      return filteredRecords.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching billing records:', error);
      throw new Error('Failed to fetch billing records');
    }
  }

  /**
   * Statistics
   */
  async getStatistics(): Promise<BillingStatistics> {
    try {
      const [subscription, invoices] = await Promise.all([
        this.getSubscription(),
        this.getInvoices(),
      ]);

      const paidInvoices = invoices.filter(i => i.status === 'paid').length;
      const outstandingAmount = invoices
        .filter(i => i.status === 'open')
        .reduce((sum, i) => sum + i.amount_due, 0) / 100;

      // Mock usage metrics - in real implementation, this would come from actual usage tracking
      const usageMetrics: UsageMetrics = {
        users: { current: 12, limit: 25 },
        projects: { current: 8, limit: 50 },
        storage: { current: 2.3, limit: 10 },
        apiCalls: { current: 15420, limit: 100000 }
      };

      return {
        currentPlan: subscription?.plan_name || 'No Plan',
        monthlySpend: 29.99, // Mock value
        nextBillingDate: subscription?.current_period_end || '',
        totalInvoices: invoices.length,
        paidInvoices,
        outstandingAmount,
        usageMetrics
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Failed to fetch billing statistics');
    }
  }

  /**
   * Export
   */
  async exportRecords(options: BillingExportOptions): Promise<Blob> {
    try {
      const records = await this.getBillingRecords();

      if (options.format === 'json') {
        const exportData = options.includeMetadata 
          ? records 
          : records.map(({ id, name, type, amount, status, description, category }) => ({
              id, name, type, amount, status, description, category
            }));

        return new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
      } else if (options.format === 'csv') {
        const headers = options.includeMetadata
          ? ['ID', 'Name', 'Type', 'Amount', 'Status', 'Description', 'Category', 'Created', 'Updated']
          : ['ID', 'Name', 'Type', 'Amount', 'Status', 'Description', 'Category'];

        const rows = records.map(record => {
          const baseRow = [
            record.id,
            record.name,
            record.type,
            record.amount,
            record.status,
            record.description,
            record.category,
          ];

          if (options.includeMetadata) {
            return [...baseRow, record.created_at, record.updated_at];
          }

          return baseRow;
        });

        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');

        return new Blob([csvContent], { type: 'text/csv' });
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Error exporting records:', error);
      throw new Error('Failed to export billing records');
    }
  }

  /**
   * Private helper methods
   */
  private detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6/.test(number)) return 'Discover';
    
    return 'Unknown';
  }
}

export const billingService = new BillingService();
