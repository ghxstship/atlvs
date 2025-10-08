import { createBrowserClient } from '@ghxstship/auth';
import type { 
  Revenue, 
  CreateRevenueData, 
  UpdateRevenueData, 
  RevenueFilters, 
  RevenueStatistics,
  RevenueExportData,
  RevenueWorkflowActions
} from '../types';

export class RevenueService implements RevenueWorkflowActions {
  private supabase = createBrowserClient();

  // CRUD Operations
  async getRevenue(orgId: string, filters?: RevenueFilters): Promise<Revenue[]> {
    try {
      let query = this.supabase
        .from('revenue')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.client_name?.length) {
        query = query.in('client_name', filters.client_name);
      }
      if (filters?.amount_min !== undefined) {
        query = query.gte('amount', filters.amount_min);
      }
      if (filters?.amount_max !== undefined) {
        query = query.lte('amount', filters.amount_max);
      }
      if (filters?.date_from) {
        query = query.gte('expected_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('expected_date', filters.date_to);
      }
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching revenue:', error);
      throw error;
    }
  }

  async getRevenueItem(orgId: string, revenueId: string): Promise<Revenue | null> {
    try {
      const { data, error } = await this.supabase
        .from('revenue')
        .select('*')
        .eq('organization_id', orgId)
        .eq('id', revenueId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching revenue item:', error);
      throw error;
    }
  }

  async createRevenue(orgId: string, revenueData: CreateRevenueData, userId: string): Promise<Revenue> {
    try {
      // Calculate net amount
      const netAmount = revenueData.amount - (revenueData.tax_amount || 0) - (revenueData.discount_amount || 0);

      const { data, error } = await this.supabase
        .from('revenue')
        .insert({
          ...revenueData,
          organization_id: orgId,
          created_by: userId,
          status: 'projected',
          currency: revenueData.currency || 'USD',
          net_amount: netAmount
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating revenue:', error);
      throw error;
    }
  }

  async updateRevenue(orgId: string, revenueId: string, updates: UpdateRevenueData): Promise<Revenue> {
    try {
      // Recalculate net amount if amount or tax/discount changed
      const updateData: unknown = { ...updates };
      if (updates.amount !== undefined || updates.tax_amount !== undefined || updates.discount_amount !== undefined) {
        const current = await this.getRevenueItem(orgId, revenueId);
        if (current) {
          const amount = updates.amount ?? current.amount;
          const taxAmount = updates.tax_amount ?? (current.tax_amount || 0);
          const discountAmount = updates.discount_amount ?? (current.discount_amount || 0);
          updateData.net_amount = amount - taxAmount - discountAmount;
        }
      }

      const { data, error } = await this.supabase
        .from('revenue')
        .update(updateData)
        .eq('organization_id', orgId)
        .eq('id', revenueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating revenue:', error);
      throw error;
    }
  }

  async deleteRevenue(orgId: string, revenueId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('revenue')
        .delete()
        .eq('organization_id', orgId)
        .eq('id', revenueId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting revenue:', error);
      throw error;
    }
  }

  // Workflow Actions
  async markInvoiced(revenueId: string, invoiceId?: string): Promise<void> {
    try {
      const updates: unknown = { 
        status: 'invoiced'
      };
      
      if (invoiceId) {
        updates.invoice_id = invoiceId;
      }

      const { error } = await this.supabase
        .from('revenue')
        .update(updates)
        .eq('id', revenueId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking revenue as invoiced:', error);
      throw error;
    }
  }

  async markReceived(revenueId: string, receivedDate?: string, paymentMethod?: string): Promise<void> {
    try {
      const updates: unknown = { 
        status: 'received',
        received_date: receivedDate || new Date().toISOString()
      };
      
      if (paymentMethod) {
        updates.payment_method = paymentMethod;
      }

      const { error } = await this.supabase
        .from('revenue')
        .update(updates)
        .eq('id', revenueId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking revenue as received:', error);
      throw error;
    }
  }

  async cancel(revenueId: string, reason?: string): Promise<void> {
    try {
      const updates: unknown = { 
        status: 'cancelled'
      };
      
      if (reason) {
        updates.notes = reason;
      }

      const { error } = await this.supabase
        .from('revenue')
        .update(updates)
        .eq('id', revenueId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling revenue:', error);
      throw error;
    }
  }

  // Statistics
  async getRevenueStatistics(orgId: string): Promise<RevenueStatistics> {
    try {
      const { data: revenue, error } = await this.supabase
        .from('revenue')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;

      const totalRevenue = revenue?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const projectedRevenue = revenue?.filter(r => r.status === 'projected')
        .reduce((sum, item) => sum + item.amount, 0) || 0;
      const receivedRevenue = revenue?.filter(r => r.status === 'received')
        .reduce((sum, item) => sum + item.amount, 0) || 0;
      const pendingInvoices = revenue?.filter(r => r.status === 'invoiced').length || 0;
      const averageAmount = revenue?.length ? totalRevenue / revenue.length : 0;

      // Calculate top categories
      const categoryMap = new Map();
      revenue?.forEach(item => {
        const category = item.category || 'Uncategorized';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { amount: 0, count: 0 });
        }
        const current = categoryMap.get(category);
        current.amount += item.amount;
        current.count += 1;
      });

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate top clients
      const clientMap = new Map();
      revenue?.forEach(item => {
        const client = item.client_name || 'Unknown Client';
        if (!clientMap.has(client)) {
          clientMap.set(client, { amount: 0, count: 0 });
        }
        const current = clientMap.get(client);
        current.amount += item.amount;
        current.count += 1;
      });

      const topClients = Array.from(clientMap.entries())
        .map(([client_name, data]) => ({ client_name, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate monthly trend (last 12 months)
      const monthlyTrend = this.calculateMonthlyTrend(revenue || []);

      return {
        totalRevenue,
        projectedRevenue,
        receivedRevenue,
        pendingInvoices,
        averageAmount,
        topCategories,
        topClients,
        monthlyTrend
      };
    } catch (error) {
      console.error('Error fetching revenue statistics:', error);
      throw error;
    }
  }

  // Export functionality
  async exportRevenue(orgId: string, format: 'csv' | 'json', filters?: RevenueFilters): Promise<string> {
    try {
      const revenue = await this.getRevenue(orgId, filters);
      
      if (format === 'json') {
        return JSON.stringify(revenue, null, 2);
      }

      // CSV format
      const exportData: RevenueExportData[] = revenue.map(item => ({
        title: item.title,
        description: item.description || '',
        amount: item.amount.toString(),
        currency: item.currency,
        category: item.category,
        status: item.status,
        client_name: item.client_name || '',
        expected_date: item.expected_date || '',
        received_date: item.received_date || '',
        payment_method: item.payment_method || '',
        tax_amount: (item.tax_amount || 0).toString(),
        discount_amount: (item.discount_amount || 0).toString(),
        net_amount: (item.net_amount || 0).toString(),
        project_id: item.project_id || '',
        tags: item.tags?.join(', ') || '',
        notes: item.notes || ''
      }));

      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${(row as unknown)[header] || ''}"`).join(',')
        )
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting revenue:', error);
      throw error;
    }
  }

  // Utility methods
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private calculateMonthlyTrend(revenue: Revenue[]) {
    const monthlyData = new Map();
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, { month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), amount: 0, count: 0 });
    }

    // Aggregate revenue data
    revenue.forEach(item => {
      const date = new Date(item.expected_date || item.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(key)) {
        const current = monthlyData.get(key);
        current.amount += item.amount;
        current.count += 1;
      }
    });

    return Array.from(monthlyData.values());
  }
}
