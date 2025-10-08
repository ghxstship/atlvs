import { createBrowserClient } from '@ghxstship/auth';
import type { 
  Invoice, 
  CreateInvoiceData, 
  UpdateInvoiceData, 
  InvoiceFilters, 
  InvoiceStatistics,
  InvoiceExportData,
  InvoiceWorkflowActions,
  InvoiceLineItem
} from '../types';

export class InvoicesService implements InvoiceWorkflowActions {
  private supabase = createBrowserClient();

  // CRUD Operations
  async getInvoices(orgId: string, filters?: InvoiceFilters): Promise<Invoice[]> {
    try {
      let query = this.supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.client_name?.length) {
        query = query.in('client_name', filters.client_name);
      }
      if (filters?.amount_min !== undefined) {
        query = query.gte('total_amount', filters.amount_min);
      }
      if (filters?.amount_max !== undefined) {
        query = query.lte('total_amount', filters.amount_max);
      }
      if (filters?.issue_date_from) {
        query = query.gte('issue_date', filters.issue_date_from);
      }
      if (filters?.issue_date_to) {
        query = query.lte('issue_date', filters.issue_date_to);
      }
      if (filters?.due_date_from) {
        query = query.gte('due_date', filters.due_date_from);
      }
      if (filters?.due_date_to) {
        query = query.lte('due_date', filters.due_date_to);
      }
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      if (filters?.overdue_only) {
        const today = new Date().toISOString().split('T')[0];
        query = query.lt('due_date', today).neq('status', 'paid');
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoice(orgId: string, invoiceId: string): Promise<Invoice | null> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', orgId)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async createInvoice(orgId: string, invoiceData: CreateInvoiceData, userId: string): Promise<Invoice> {
    try {
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(orgId);
      
      // Calculate total amount
      const totalAmount = (invoiceData.subtotal || 0) + (invoiceData.tax_amount || 0) - (invoiceData.discount_amount || 0);

      const { data, error } = await this.supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          organization_id: orgId,
          created_by: userId,
          invoice_number: invoiceNumber,
          status: 'draft',
          currency: invoiceData.currency || 'USD',
          total_amount: totalAmount,
          tax_amount: invoiceData.tax_amount || 0,
          discount_amount: invoiceData.discount_amount || 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async updateInvoice(orgId: string, invoiceId: string, updates: UpdateInvoiceData): Promise<Invoice> {
    try {
      // Recalculate total if amounts changed
      const updateData: unknown = { ...updates };
      if (updates.subtotal !== undefined || updates.tax_amount !== undefined || updates.discount_amount !== undefined) {
        const current = await this.getInvoice(orgId, invoiceId);
        if (current) {
          const subtotal = updates.subtotal ?? current.subtotal;
          const taxAmount = updates.tax_amount ?? current.tax_amount;
          const discountAmount = updates.discount_amount ?? current.discount_amount;
          updateData.total_amount = subtotal + taxAmount - discountAmount;
        }
      }

      const { data, error } = await this.supabase
        .from('invoices')
        .update(updateData)
        .eq('organization_id', orgId)
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  async deleteInvoice(orgId: string, invoiceId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('invoices')
        .delete()
        .eq('organization_id', orgId)
        .eq('id', invoiceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  // Workflow Actions
  async send(invoiceId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoiceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  async markViewed(invoiceId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('invoices')
        .update({ status: 'viewed' })
        .eq('id', invoiceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking invoice as viewed:', error);
      throw error;
    }
  }

  async markPaid(invoiceId: string, paidDate?: string, paymentMethod?: string, paymentReference?: string): Promise<void> {
    try {
      const updates: unknown = { 
        status: 'paid',
        paid_date: paidDate || new Date().toISOString()
      };
      
      if (paymentMethod) updates.payment_method = paymentMethod;
      if (paymentReference) updates.payment_reference = paymentReference;

      const { error } = await this.supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoiceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw error;
    }
  }

  async markOverdue(invoiceId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('invoices')
        .update({ status: 'overdue' })
        .eq('id', invoiceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking invoice as overdue:', error);
      throw error;
    }
  }

  async cancel(invoiceId: string, reason?: string): Promise<void> {
    try {
      const updates: unknown = { status: 'cancelled' };
      if (reason) updates.notes = reason;

      const { error } = await this.supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoiceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      throw error;
    }
  }

  async generatePDF(invoiceId: string): Promise<string> {
    // This would integrate with a PDF generation service
    // For now, return a placeholder URL
    return `https://api.example.com/invoices/${invoiceId}/pdf`;
  }

  // Statistics
  async getInvoiceStatistics(orgId: string): Promise<InvoiceStatistics> {
    try {
      const { data: invoices, error } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;

      const totalInvoices = invoices?.length || 0;
      const totalAmount = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
      const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];
      const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      const pendingAmount = invoices?.filter(inv => ['sent', 'viewed'].includes(inv.status))
        .reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
      const overdueAmount = invoices?.filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
      const averageAmount = totalInvoices ? totalAmount / totalInvoices : 0;

      // Calculate average payment time
      const paidInvoicesWithDates = paidInvoices.filter(inv => inv.paid_date && inv.issue_date);
      const averagePaymentTime = paidInvoicesWithDates.length ? 
        paidInvoicesWithDates.reduce((sum, inv) => {
          const issueDate = new Date(inv.issue_date);
          const paidDate = new Date(inv.paid_date!);
          return sum + Math.floor((paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoicesWithDates.length : 0;

      // Calculate top clients
      const clientMap = new Map();
      invoices?.forEach(invoice => {
        const client = invoice.client_name || 'Unknown Client';
        if (!clientMap.has(client)) {
          clientMap.set(client, { amount: 0, count: 0 });
        }
        const current = clientMap.get(client);
        current.amount += invoice.total_amount;
        current.count += 1;
      });

      const topClients = Array.from(clientMap.entries())
        .map(([client_name, data]) => ({ client_name, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate status breakdown
      const statusMap = new Map();
      invoices?.forEach(invoice => {
        const status = invoice.status;
        if (!statusMap.has(status)) {
          statusMap.set(status, { count: 0, amount: 0 });
        }
        const current = statusMap.get(status);
        current.count += 1;
        current.amount += invoice.total_amount;
      });

      const statusBreakdown = Array.from(statusMap.entries())
        .map(([status, data]) => ({ status, ...data }));

      // Calculate monthly trend
      const monthlyTrend = this.calculateMonthlyTrend(invoices || []);

      return {
        totalInvoices,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        averageAmount,
        averagePaymentTime,
        topClients,
        statusBreakdown,
        monthlyTrend
      };
    } catch (error) {
      console.error('Error fetching invoice statistics:', error);
      throw error;
    }
  }

  // Export functionality
  async exportInvoices(orgId: string, format: 'csv' | 'json', filters?: InvoiceFilters): Promise<string> {
    try {
      const invoices = await this.getInvoices(orgId, filters);
      
      if (format === 'json') {
        return JSON.stringify(invoices, null, 2);
      }

      // CSV format
      const exportData: InvoiceExportData[] = invoices.map(invoice => ({
        invoice_number: invoice.invoice_number,
        title: invoice.title,
        description: invoice.description || '',
        client_name: invoice.client_name,
        client_email: invoice.client_email || '',
        status: invoice.status,
        subtotal: invoice.subtotal.toString(),
        tax_amount: invoice.tax_amount.toString(),
        discount_amount: invoice.discount_amount.toString(),
        total_amount: invoice.total_amount.toString(),
        currency: invoice.currency,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        paid_date: invoice.paid_date || '',
        payment_method: invoice.payment_method || '',
        project_id: invoice.project_id || '',
        purchase_order: invoice.purchase_order || '',
        terms: invoice.terms || '',
        notes: invoice.notes || '',
        tags: invoice.tags?.join(', ') || ''
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
      console.error('Error exporting invoices:', error);
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

  private async generateInvoiceNumber(orgId: string): Promise<string> {
    // Get the count of existing invoices for this organization
    const { count, error } = await this.supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    if (error) throw error;

    const invoiceCount = (count || 0) + 1;
    const year = new Date().getFullYear();
    return `INV-${year}-${String(invoiceCount).padStart(4, '0')}`;
  }

  private calculateMonthlyTrend(invoices: Invoice[]) {
    const monthlyData = new Map();
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, { 
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), 
        issued: 0, 
        paid: 0, 
        count: 0 
      });
    }

    // Aggregate invoice data
    invoices.forEach(invoice => {
      const issueDate = new Date(invoice.issue_date);
      const key = `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(key)) {
        const current = monthlyData.get(key);
        current.issued += invoice.total_amount;
        current.count += 1;
        
        if (invoice.status === 'paid' && invoice.paid_date) {
          const paidDate = new Date(invoice.paid_date);
          const paidKey = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyData.has(paidKey)) {
            monthlyData.get(paidKey).paid += invoice.total_amount;
          }
        }
      }
    });

    return Array.from(monthlyData.values());
  }
}

// Export alias for backward compatibility
export { InvoicesService as InvoiceService };
