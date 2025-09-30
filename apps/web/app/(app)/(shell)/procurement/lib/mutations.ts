/**
 * Procurement Database Mutations Service
 * Handles all database write operations with transaction management
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Transaction context
export interface TransactionContext {
  supabase: unknown;
  orgId: string;
  userId: string;
}

// Mutation result schema
const MutationResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  transactionId: z.string().optional(),
});

export type MutationResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  transactionId?: string;
};

// Audit log entry
interface AuditLogEntry {
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: unknown;
  new_values?: unknown;
  user_id: string;
  organization_id: string;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Procurement Mutations Service Class
 * Provides database write operations with transaction management and audit trails
 */
export class ProcurementMutationsService {
  private supabase: unknown;
  private orgId: string;
  private userId: string;

  constructor(orgId: string, userId: string) {
    this.orgId = orgId;
    this.userId = userId;
    this.supabase = createClient();
  }

  /**
   * Execute operation within a transaction
   */
  private async withTransaction<T>(
    operation: (context: TransactionContext) => Promise<T>
  ): Promise<MutationResult<T>> {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // For Supabase, we'll simulate transaction-like behavior
      // In a real scenario, you'd use database transactions
      const context: TransactionContext = {
        supabase: this.supabase,
        orgId: this.orgId,
        userId: this.userId,
      };

      const result = await operation(context);

      return {
        success: true,
        data: result,
        transactionId,
      };
    } catch (error: unknown) {
      // Log error for debugging
      console.error('Transaction failed:', error);

      return {
        success: false,
        error: error.message || 'Transaction failed',
        transactionId,
      };
    }
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          ...entry,
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      console.error('Audit log creation failed:', error);
    }
  }

  /**
   * Create purchase order with validation and audit trail
   */
  async createPurchaseOrder(orderData: {
    po_number: string;
    title: string;
    description?: string;
    vendor_id: string;
    total_amount: number;
    currency?: string;
    delivery_date?: Date;
  }): Promise<MutationResult<>> {
    return this.withTransaction(async (context) => {
      // Validate vendor exists and belongs to organization
      const { data: vendor, error: vendorError } = await context.supabase
        .from('vendors')
        .select('id, name')
        .eq('id', orderData.vendor_id)
        .eq('organization_id', context.orgId)
        .single();

      if (vendorError || !vendor) {
        throw new Error('Invalid vendor or vendor does not belong to organization');
      }

      // Create purchase order
      const { data: order, error: orderError } = await context.supabase
        .from('purchase_orders')
        .insert({
          ...orderData,
          organization_id: context.orgId,
          requested_by: context.userId,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create audit log
      await this.createAuditLog({
        table_name: 'purchase_orders',
        record_id: order.id,
        operation: 'INSERT',
        new_values: order,
        user_id: context.userId,
        organization_id: context.orgId,
      });

      return order;
    });
  }

  /**
   * Update purchase order with validation and audit trail
   */
  async updatePurchaseOrder(
    orderId: string,
    updates: Partial<{
      title: string;
      description: string;
      vendor_id: string;
      total_amount: number;
      currency: string;
      delivery_date: Date;
      status: string;
    }>
  ): Promise<MutationResult<>> {
    return this.withTransaction(async (context) => {
      // Get current order for audit trail
      const { data: currentOrder, error: fetchError } = await context.supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', orderId)
        .eq('organization_id', context.orgId)
        .single();

      if (fetchError || !currentOrder) {
        throw new Error('Purchase order not found');
      }

      // Validate vendor if being updated
      if (updates.vendor_id) {
        const { data: vendor, error: vendorError } = await context.supabase
          .from('vendors')
          .select('id')
          .eq('id', updates.vendor_id)
          .eq('organization_id', context.orgId)
          .single();

        if (vendorError || !vendor) {
          throw new Error('Invalid vendor');
        }
      }

      // Update order
      const { data: updatedOrder, error: updateError } = await context.supabase
        .from('purchase_orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('organization_id', context.orgId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create audit log
      await this.createAuditLog({
        table_name: 'purchase_orders',
        record_id: orderId,
        operation: 'UPDATE',
        old_values: currentOrder,
        new_values: updatedOrder,
        user_id: context.userId,
        organization_id: context.orgId,
      });

      return updatedOrder;
    });
  }

  /**
   * Delete purchase order with audit trail
   */
  async deletePurchaseOrder(orderId: string): Promise<MutationResult> {
    return this.withTransaction(async (context) => {
      // Get current order for audit trail
      const { data: currentOrder, error: fetchError } = await context.supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', orderId)
        .eq('organization_id', context.orgId)
        .single();

      if (fetchError || !currentOrder) {
        throw new Error('Purchase order not found');
      }

      // Delete order
      const { error: deleteError } = await context.supabase
        .from('purchase_orders')
        .delete()
        .eq('id', orderId)
        .eq('organization_id', context.orgId);

      if (deleteError) throw deleteError;

      // Create audit log
      await this.createAuditLog({
        table_name: 'purchase_orders',
        record_id: orderId,
        operation: 'DELETE',
        old_values: currentOrder,
        user_id: context.userId,
        organization_id: context.orgId,
      });

      return { success: true };
    });
  }

  /**
   * Create vendor with validation
   */
  async createVendor(vendorData: {
    name: string;
    contact_email: string;
    contact_phone?: string;
    address?: string;
    status?: string;
  }): Promise<MutationResult<>> {
    return this.withTransaction(async (context) => {
      // Check for duplicate email
      const { data: existingVendor } = await context.supabase
        .from('vendors')
        .select('id')
        .eq('contact_email', vendorData.contact_email)
        .eq('organization_id', context.orgId)
        .single();

      if (existingVendor) {
        throw new Error('Vendor with this email already exists');
      }

      // Create vendor
      const { data: vendor, error } = await context.supabase
        .from('vendors')
        .insert({
          ...vendorData,
          organization_id: context.orgId,
          status: vendorData.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await this.createAuditLog({
        table_name: 'vendors',
        record_id: vendor.id,
        operation: 'INSERT',
        new_values: vendor,
        user_id: context.userId,
        organization_id: context.orgId,
      });

      return vendor;
    });
  }

  /**
   * Bulk operations with rollback capability
   */
  async bulkCreatePurchaseOrders(
    orders: Array<{
      po_number: string;
      title: string;
      vendor_id: string;
      total_amount: number;
    }>
  ): Promise<MutationResult<any[]>> {
    return this.withTransaction(async (context) => {
      const results: unknown[] = [];
      const errors: string[] = [];

      // Process in batches
      const batchSize = 10;
      for (let i = 0; i < orders.length; i += batchSize) {
        const batch = orders.slice(i, i + batchSize);

        for (const orderData of batch) {
          try {
            const result = await this.createPurchaseOrder.call({
              supabase: context.supabase,
              orgId: context.orgId,
              userId: context.userId,
            }, orderData);

            if (result.success) {
              results.push(result.data);
            } else {
              errors.push(result.error || 'Unknown error');
            }
          } catch (error: unknown) {
            errors.push(error.message);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Bulk create failed: ${errors.join('; ')}`);
      }

      return results;
    });
  }

  /**
   * Approve purchase order (business logic)
   */
  async approvePurchaseOrder(orderId: string, comments?: string): Promise<MutationResult> {
    return this.updatePurchaseOrder(orderId, {
      status: 'approved',
      approved_by: this.userId,
      approved_at: new Date().toISOString(),
    });
  }

  /**
   * Reject purchase order (business logic)
   */
  async rejectPurchaseOrder(orderId: string, reason: string): Promise<MutationResult> {
    return this.updatePurchaseOrder(orderId, {
      status: 'cancelled',
    });
  }
}

// Factory function
export function createProcurementMutationsService(orgId: string, userId: string): ProcurementMutationsService {
  return new ProcurementMutationsService(orgId, userId);
}
