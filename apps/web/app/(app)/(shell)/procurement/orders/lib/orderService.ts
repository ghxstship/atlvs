import { createBrowserClient } from '@ghxstship/auth';
// import { z } from 'zod';
import type {
  ProcurementOrder,
  OrderItem,
  OrderAttachment,
  OrderActivity,
  OrderApproval,
  OrderFilters,
  OrderSort,
  OrderStats,
  OrderAnalytics,
  OrderBulkAction,
  OrderExportConfig,
  OrderImportConfig,
  OrderImportResult,
  OrderWorkflow,
} from '../types';
import {
  orderSchema,
  orderItemSchema,
  orderFiltersSchema,
} from '../types';

export class OrderService {
  private supabase = createBrowserClient();

  // Order CRUD Operations
  async getOrders(
    organizationId: string,
    filters?: OrderFilters,
    sort?: OrderSort,
    page: number = 1,
    limit: number = 50
  ): Promise<{ orders: ProcurementOrder[]; total: number; hasMore: boolean }> {
    try {
      let query = this.supabase
        .from('procurement_orders')
        .select(`
          *,
          created_by:users(id, name),
          approved_by:users(id, name),
          project:projects(id, name),
          vendor_company:companies(id, name)
        `)
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters) {
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          query = query.or(`order_number.ilike.${searchTerm},vendor_name.ilike.${searchTerm},description.ilike.${searchTerm}`);
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.priority && filters.priority !== 'all') {
          query = query.eq('priority', filters.priority);
        }

        if (filters.payment_status && filters.payment_status !== 'all') {
          query = query.eq('payment_status', filters.payment_status);
        }

        if (filters.vendor_name) {
          query = query.ilike('vendor_name', `%${filters.vendor_name}%`);
        }

        if (filters.vendor_id) {
          query = query.eq('vendor_id', filters.vendor_id);
        }

        if (filters.project_id) {
          query = query.eq('project_id', filters.project_id);
        }

        if (filters.created_by) {
          query = query.eq('created_by', filters.created_by);
        }

        if (filters.approved_by) {
          query = query.eq('approved_by', filters.approved_by);
        }

        if (filters.amount_range) {
          if (filters.amount_range.min !== undefined) {
            query = query.gte('total_amount', filters.amount_range.min);
          }
          if (filters.amount_range.max !== undefined) {
            query = query.lte('total_amount', filters.amount_range.max);
          }
        }

        if (filters.date_range) {
          if (filters.date_range.start) {
            query = query.gte('order_date', filters.date_range.start);
          }
          if (filters.date_range.end) {
            query = query.lte('order_date', filters.date_range.end);
          }
        }

        if (filters.delivery_date_range) {
          if (filters.delivery_date_range.start) {
            query = query.gte('expected_delivery', filters.delivery_date_range.start);
          }
          if (filters.delivery_date_range.end) {
            query = query.lte('expected_delivery', filters.delivery_date_range.end);
          }
        }

        if (filters.tags && filters.tags.length > 0) {
          query = query.overlaps('tags', filters.tags);
        }

        if (filters.approval_required !== undefined) {
          query = query.eq('approval_required', filters.approval_required);
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      query = query.range(startIndex, startIndex + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const total = count || 0;
      const hasMore = startIndex + limit < total;

      return {
        orders: data || [],
        total,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getOrder(organizationId: string, orderId: string): Promise<ProcurementOrder | null> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_orders')
        .select(`
          *,
          created_by:users(id, name),
          approved_by:users(id, name),
          project:projects(id, name),
          vendor_company:companies(id, name)
        `)
        .eq('organization_id', organizationId)
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async createOrder(
    organizationId: string,
    orderData: Partial<ProcurementOrder>,
    userId: string
  ): Promise<ProcurementOrder> {
    try {
      // Validate input
      const validatedData = orderSchema.parse(orderData);
      
      // Generate order number if not provided
      const orderNumber = validatedData.order_number || await this.generateOrderNumber(organizationId);
      
      const payload = {
        organization_id: organizationId,
        order_number: orderNumber,
        vendor_name: validatedData.vendor_name,
        vendor_id: validatedData.vendor_id,
        vendor_company_id: validatedData.vendor_company_id,
        project_id: validatedData.project_id,
        description: validatedData.description,
        notes: validatedData.notes,
        total_amount: validatedData.total_amount,
        currency: validatedData.currency,
        tax_amount: validatedData.tax_amount,
        shipping_amount: validatedData.shipping_amount,
        discount_amount: validatedData.discount_amount,
        status: validatedData.status,
        priority: validatedData.priority,
        order_date: validatedData.order_date,
        expected_delivery: validatedData.expected_delivery,
        actual_delivery: validatedData.actual_delivery,
        delivery_address: validatedData.delivery_address,
        billing_address: validatedData.billing_address,
        payment_terms: validatedData.payment_terms,
        payment_method: validatedData.payment_method,
        payment_status: validatedData.payment_status,
        approval_required: validatedData.approval_required,
        tracking_number: validatedData.tracking_number,
        carrier: validatedData.carrier,
        tags: validatedData.tags,
        created_by: userId,
      };

      const { data, error } = await this.supabase
        .from('procurement_orders')
        .insert(payload)
        .select(`
          *,
          created_by:users(id, name),
          approved_by:users(id, name),
          project:projects(id, name),
          vendor_company:companies(id, name)
        `)
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(data.id, userId, 'created', 'Order created', {
        order_number: orderNumber,
        vendor_name: validatedData.vendor_name,
        total_amount: validatedData.total_amount,
      });

      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrder(
    organizationId: string,
    orderId: string,
    updates: Partial<ProcurementOrder>,
    userId: string
  ): Promise<ProcurementOrder> {
    try {
      // Validate input
      const validatedData = orderSchema.partial().parse(updates);
      
      const payload: unknown = {
        updated_at: new Date().toISOString(),
      };

      // Map validated fields
      Object.keys(validatedData).forEach(key => {
        if (validatedData[key as keyof typeof validatedData] !== undefined) {
          payload[key] = validatedData[key as keyof typeof validatedData];
        }
      });

      const { data, error } = await this.supabase
        .from('procurement_orders')
        .update(payload)
        .eq('organization_id', organizationId)
        .eq('id', orderId)
        .select(`
          *,
          created_by:users(id, name),
          approved_by:users(id, name),
          project:projects(id, name),
          vendor_company:companies(id, name)
        `)
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(orderId, userId, 'updated', 'Order updated', {
        updates: Object.keys(payload),
      });

      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async deleteOrder(
    organizationId: string,
    orderId: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('procurement_orders')
        .delete()
        .eq('organization_id', organizationId)
        .eq('id', orderId);

      if (error) throw error;

      // Log activity
      await this.logActivity(orderId, userId, 'deleted', 'Order deleted', {});
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Order Items Management
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  }

  async createOrderItem(
    orderId: string,
    itemData: Partial<OrderItem>,
    userId: string
  ): Promise<OrderItem> {
    try {
      const validatedData = orderItemSchema.parse(itemData);
      
      const totalPrice = validatedData.quantity * validatedData.unit_price;
      
      const { data, error } = await this.supabase
        .from('procurement_order_items')
        .insert({
          order_id: orderId,
          ...validatedData,
          total_price: totalPrice,
        })
        .select()
        .single();

      if (error) throw error;

      // Update order total
      await this.updateOrderTotal(orderId);

      return data;
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }

  async updateOrderItem(
    itemId: string,
    updates: Partial<OrderItem>,
    userId: string
  ): Promise<OrderItem> {
    try {
      const validatedData = orderItemSchema.partial().parse(updates);
      
      // Recalculate total price if quantity or unit_price changed
      if (validatedData.quantity !== undefined || validatedData.unit_price !== undefined) {
        const { data: currentItem } = await this.supabase
          .from('procurement_order_items')
          .select('quantity, unit_price')
          .eq('id', itemId)
          .single();

        if (currentItem) {
          const quantity = validatedData.quantity ?? currentItem.quantity;
          const unitPrice = validatedData.unit_price ?? currentItem.unit_price;
          validatedData.total_price = quantity * unitPrice;
        }
      }

      const { data, error } = await this.supabase
        .from('procurement_order_items')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      // Update order total
      await this.updateOrderTotal(data.order_id);

      return data;
    } catch (error) {
      console.error('Error updating order item:', error);
      throw error;
    }
  }

  async deleteOrderItem(itemId: string, userId: string): Promise<void> {
    try {
      // Get order_id before deletion
      const { data: item } = await this.supabase
        .from('procurement_order_items')
        .select('order_id')
        .eq('id', itemId)
        .single();

      const { error } = await this.supabase
        .from('procurement_order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Update order total
      if (item) {
        await this.updateOrderTotal(item.order_id);
      }
    } catch (error) {
      console.error('Error deleting order item:', error);
      throw error;
    }
  }

  // Order Activities
  async getOrderActivities(orderId: string): Promise<OrderActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('order_activities')
        .select(`
          *,
          user:users(id, name)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching order activities:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdateOrders(
    organizationId: string,
    action: OrderBulkAction,
    userId: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const orderId of action.orderIds) {
        try {
          switch (action.type) {
            case 'delete':
              await this.deleteOrder(organizationId, orderId, userId);
              break;
            case 'update_status':
              await this.updateOrder(organizationId, orderId, { status: action.data?.status }, userId);
              break;
            case 'update_priority':
              await this.updateOrder(organizationId, orderId, { priority: action.data?.priority }, userId);
              break;
            case 'approve':
              await this.approveOrder(organizationId, orderId, userId, action.data?.comments);
              break;
            case 'reject':
              await this.rejectOrder(organizationId, orderId, userId, action.data?.reason);
              break;
            case 'cancel':
              await this.updateOrder(organizationId, orderId, { status: 'cancelled' }, userId);
              break;
            case 'assign_project':
              await this.updateOrder(organizationId, orderId, { project_id: action.data?.project_id }, userId);
              break;
            case 'add_tags':
              const order = await this.getOrder(organizationId, orderId);
              if (order) {
                const newTags = [...(order.tags || []), ...(action.data?.tags || [])];
                await this.updateOrder(organizationId, orderId, { tags: [...new Set(newTags)] }, userId);
              }
              break;
          }
          success++;
        } catch (error) {
          failed++;
          errors.push(`Order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Log bulk activity
      await this.logActivity(undefined, userId, 'bulk_update', `Bulk ${action.type}`, {
        action: action.type,
        orderCount: action.orderIds.length,
        success,
        failed,
      });

      return { success, failed, errors };
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw error;
    }
  }

  // Order approval methods
  async approveOrder(
    organizationId: string,
    orderId: string,
    userId: string,
    comments?: string
  ): Promise<ProcurementOrder> {
    try {
      const updatedOrder = await this.updateOrder(
        organizationId,
        orderId,
        {
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString(),
        },
        userId
      );

      // Create approval record
      await this.supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          approver_id: userId,
          status: 'approved',
          comments,
          approved_at: new Date().toISOString(),
        });

      await this.logActivity(orderId, userId, 'approved', 'Order approved', { comments });

      return updatedOrder;
    } catch (error) {
      console.error('Error approving order:', error);
      throw error;
    }
  }

  async rejectOrder(
    organizationId: string,
    orderId: string,
    userId: string,
    reason?: string
  ): Promise<ProcurementOrder> {
    try {
      const updatedOrder = await this.updateOrder(
        organizationId,
        orderId,
        {
          status: 'rejected',
          rejection_reason: reason,
        },
        userId
      );

      // Create approval record
      await this.supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          approver_id: userId,
          status: 'rejected',
          comments: reason,
        });

      await this.logActivity(orderId, userId, 'rejected', 'Order rejected', { reason });

      return updatedOrder;
    } catch (error) {
      console.error('Error rejecting order:', error);
      throw error;
    }
  }

  // Analytics and statistics
  async getOrderStats(organizationId: string): Promise<OrderStats> {
    try {
      const { data: orders, error } = await this.supabase
        .from('procurement_orders')
        .select('status, priority, total_amount, vendor_name, created_at, expected_delivery, approval_required')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const allOrders = orders || [];
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: OrderStats = {
        totalOrders: allOrders.length,
        draftOrders: allOrders.filter(o => o.status === 'draft').length,
        pendingOrders: allOrders.filter(o => o.status === 'pending').length,
        approvedOrders: allOrders.filter(o => o.status === 'approved').length,
        orderedOrders: allOrders.filter(o => o.status === 'ordered').length,
        deliveredOrders: allOrders.filter(o => o.status === 'delivered').length,
        cancelledOrders: allOrders.filter(o => o.status === 'cancelled').length,
        totalValue: allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        averageOrderValue: 0,
        pendingApprovals: allOrders.filter(o => o.approval_required && o.status === 'pending').length,
        overdueOrders: allOrders.filter(o => 
          o.expected_delivery && new Date(o.expected_delivery) < now && 
          !['delivered', 'cancelled'].includes(o.status)
        ).length,
        recentOrders: allOrders.filter(o => new Date(o.created_at) > weekAgo).length,
        topVendors: [],
        ordersByStatus: [],
        ordersByPriority: [],
        monthlyTrends: [],
      };

      if (stats.totalOrders > 0) {
        stats.averageOrderValue = stats.totalValue / stats.totalOrders;
      }

      // Calculate top vendors
      const vendorMap = new Map<string, { count: number; value: number }>();
      allOrders.forEach(order => {
        if (order.vendor_name) {
          const existing = vendorMap.get(order.vendor_name) || { count: 0, value: 0 };
          vendorMap.set(order.vendor_name, {
            count: existing.count + 1,
            value: existing.value + (order.total_amount || 0),
          });
        }
      });

      stats.topVendors = Array.from(vendorMap.entries())
        .map(([vendor, data]) => ({ vendor, ...data }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }

  // Private helper methods
  private async generateOrderNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const { count } = await this.supabase
      .from('procurement_orders')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`);

    const orderCount = (count || 0) + 1;
    return `PO-${year}-${orderCount.toString().padStart(4, '0')}`;
  }

  private async updateOrderTotal(orderId: string): Promise<void> {
    try {
      const { data: items } = await this.supabase
        .from('procurement_order_items')
        .select('total_price')
        .eq('order_id', orderId);

      if (items) {
        const totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
        
        await this.supabase
          .from('procurement_orders')
          .update({ total_amount: totalAmount })
          .eq('id', orderId);
      }
    } catch (error) {
      console.error('Error updating order total:', error);
    }
  }

  private async logActivity(
    orderId: string | undefined,
    userId: string,
    action: OrderActivity['action'],
    description: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      if (!orderId) return; // Skip logging for bulk operations without specific order

      await this.supabase
        .from('order_activities')
        .insert({
          order_id: orderId,
          user_id: userId,
          action,
          description,
          metadata,
        });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break main operations
    }
  }

  // Export functionality
  async exportOrders(organizationId: string, config: OrderExportConfig): Promise<Blob> {
    try {
      const { orders } = await this.getOrders(organizationId, config.filters, undefined, 1, 10000);
      
      switch (config.format) {
        case 'csv':
          return this.exportToCSV(orders, config);
        case 'json':
          return this.exportToJSON(orders, config);
        default:
          throw new Error(`Export format ${config.format} not supported`);
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  }

  private exportToCSV(orders: ProcurementOrder[], config: OrderExportConfig): Blob {
    const fields = config.fields.length > 0 ? config.fields : [
      'order_number', 'vendor_name', 'status', 'priority', 'total_amount', 
      'currency', 'order_date', 'expected_delivery'
    ];
    
    let csv = '';
    if (config.includeHeaders !== false) {
      csv += fields.join(',') + '\n';
    }

    for (const order of orders) {
      const row = fields.map(field => {
        const value = order[field as keyof ProcurementOrder];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csv += row.join(',') + '\n';
    }

    return new Blob([csv], { type: 'text/csv' });
  }

  private exportToJSON(orders: ProcurementOrder[], config: OrderExportConfig): Blob {
    const filteredOrders = orders.map(order => {
      if (config.fields.length === 0) return order;
      
      const filtered: unknown = {};
      for (const field of config.fields) {
        filtered[field] = order[field as keyof ProcurementOrder];
      }
      return filtered;
    });

    return new Blob([JSON.stringify(filteredOrders, null, 2)], { type: 'application/json' });
  }
}
