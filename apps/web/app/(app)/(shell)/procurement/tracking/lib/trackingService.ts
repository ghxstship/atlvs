import { createBrowserClient } from '@ghxstship/auth';
import type {
  TrackingItem,
  TrackingEvent,
  TrackingFilters,
  TrackingSort,
  TrackingStats,
  TrackingBulkAction,
  TrackingExportConfig,
  TrackingImportConfig,
  TrackingImportResult,
  TrackingAnalytics,
  DeliveryPerformance,
} from '../types';
import { calculateDeliveryPerformance, calculateDaysToDelivery } from '../types';

export class TrackingService {
  private supabase = createBrowserClient();

  // Get tracking items with filters and pagination
  async getTrackingItems(
    organizationId: string,
    filters?: TrackingFilters,
    sort?: TrackingSort,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    items: TrackingItem[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      let query = this.supabase
        .from('procurement_orders')
        .select(`
          *,
          vendor:opendeck_vendor_profiles(id, business_name),
          tracking_events:tracking_events(*)
        `)
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters) {
        if (filters.search) {
          query = query.or(`order_number.ilike.%${filters.search}%,vendor_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tracking_number.ilike.%${filters.search}%`);
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.priority && filters.priority !== 'all') {
          query = query.eq('priority', filters.priority);
        }

        if (filters.vendor) {
          query = query.ilike('vendor_name', `%${filters.vendor}%`);
        }

        if (filters.vendor_id) {
          query = query.eq('vendor_id', filters.vendor_id);
        }

        if (filters.carrier) {
          query = query.ilike('shipping_carrier', `%${filters.carrier}%`);
        }

        if (filters.dateRange?.start) {
          query = query.gte('order_date', filters.dateRange.start);
        }

        if (filters.dateRange?.end) {
          query = query.lte('order_date', filters.dateRange.end);
        }

        if (filters.deliveryRange?.start) {
          query = query.gte('expected_delivery', filters.deliveryRange.start);
        }

        if (filters.deliveryRange?.end) {
          query = query.lte('expected_delivery', filters.deliveryRange.end);
        }

        if (filters.hasTracking !== undefined) {
          if (filters.hasTracking) {
            query = query.not('tracking_number', 'is', null);
          } else {
            query = query.is('tracking_number', null);
          }
        }

        if (filters.tags && filters.tags.length > 0) {
          query = query.contains('tags', filters.tags);
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to include calculated fields
      const items: TrackingItem[] = (data || []).map(item => ({
        ...item,
        vendor_name: item.vendor?.business_name || item.vendor_name,
        delivery_performance: calculateDeliveryPerformance(item.expected_delivery, item.actual_delivery),
        days_to_delivery: calculateDaysToDelivery(item.order_date, item.actual_delivery),
      }));

      return {
        items,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      };
    } catch (error) {
      console.error('Error fetching tracking items:', error);
      throw error;
    }
  }

  // Get tracking statistics
  async getTrackingStats(organizationId: string, filters?: TrackingFilters): Promise<TrackingStats> {
    try {
      const { items } = await this.getTrackingItems(organizationId, filters, undefined, 1, 10000);

      const totalOrders = items.length;
      const activeShipments = items.filter(item => 
        ['ordered', 'shipped', 'in_transit', 'out_for_delivery'].includes(item.status)
      ).length;
      const deliveredOrders = items.filter(item => item.status === 'delivered').length;
      const overdueOrders = items.filter(item => 
        item.expected_delivery && 
        new Date(item.expected_delivery) < new Date() && 
        !['delivered', 'cancelled'].includes(item.status)
      ).length;

      // Calculate average delivery time
      const deliveredWithTimes = items.filter(item => 
        item.status === 'delivered' && item.order_date && item.actual_delivery
      );
      const averageDeliveryTime = deliveredWithTimes.length > 0
        ? deliveredWithTimes.reduce((sum, item) => 
            sum + calculateDaysToDelivery(item.order_date, item.actual_delivery), 0
          ) / deliveredWithTimes.length
        : 0;

      // Calculate on-time delivery rate
      const deliveredWithExpected = items.filter(item => 
        item.status === 'delivered' && item.expected_delivery && item.actual_delivery
      );
      const onTimeDeliveries = deliveredWithExpected.filter(item =>
        ['on_time', 'early'].includes(calculateDeliveryPerformance(item.expected_delivery, item.actual_delivery))
      ).length;
      const onTimeDeliveryRate = deliveredWithExpected.length > 0
        ? (onTimeDeliveries / deliveredWithExpected.length) * 100
        : 0;

      // Calculate total shipping cost
      const totalShippingCost = items.reduce((sum, item) => sum + (item.shipping_cost || 0), 0);

      // Status breakdown
      const statusCounts = items.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: (count / totalOrders) * 100,
      }));

      // Carrier performance
      const carrierMap = new Map<string, { orders: number; onTime: number; totalDays: number }>();
      items.forEach(item => {
        if (item.shipping_carrier) {
          const carrier = item.shipping_carrier;
          const existing = carrierMap.get(carrier) || { orders: 0, onTime: 0, totalDays: 0 };
          existing.orders += 1;
          
          if (item.status === 'delivered' && item.expected_delivery && item.actual_delivery) {
            const performance = calculateDeliveryPerformance(item.expected_delivery, item.actual_delivery);
            if (['on_time', 'early'].includes(performance)) {
              existing.onTime += 1;
            }
            existing.totalDays += calculateDaysToDelivery(item.order_date, item.actual_delivery);
          }
          
          carrierMap.set(carrier, existing);
        }
      });

      const carrierPerformance = Array.from(carrierMap.entries()).map(([carrier, data]) => ({
        carrier,
        orders: data.orders,
        onTimeRate: data.orders > 0 ? (data.onTime / data.orders) * 100 : 0,
        avgDeliveryTime: data.orders > 0 ? data.totalDays / data.orders : 0,
      }));

      // Vendor performance
      const vendorMap = new Map<string, { orders: number; onTime: number; totalDays: number }>();
      items.forEach(item => {
        const vendor = item.vendor_name;
        const existing = vendorMap.get(vendor) || { orders: 0, onTime: 0, totalDays: 0 };
        existing.orders += 1;
        
        if (item.status === 'delivered' && item.expected_delivery && item.actual_delivery) {
          const performance = calculateDeliveryPerformance(item.expected_delivery, item.actual_delivery);
          if (['on_time', 'early'].includes(performance)) {
            existing.onTime += 1;
          }
          existing.totalDays += calculateDaysToDelivery(item.order_date, item.actual_delivery);
        }
        
        vendorMap.set(vendor, existing);
      });

      const vendorPerformance = Array.from(vendorMap.entries()).map(([vendor, data]) => ({
        vendor,
        orders: data.orders,
        onTimeRate: data.orders > 0 ? (data.onTime / data.orders) * 100 : 0,
        avgDeliveryTime: data.orders > 0 ? data.totalDays / data.orders : 0,
      }));

      // Delivery trends (last 12 months)
      const deliveryTrends = this.calculateDeliveryTrends(items);

      return {
        totalOrders,
        activeShipments,
        deliveredOrders,
        overdueOrders,
        averageDeliveryTime,
        onTimeDeliveryRate,
        totalShippingCost,
        statusBreakdown,
        carrierPerformance,
        vendorPerformance,
        deliveryTrends,
      };
    } catch (error) {
      console.error('Error calculating tracking stats:', error);
      throw error;
    }
  }

  // Update tracking item
  async updateTrackingItem(
    organizationId: string,
    itemId: string,
    updates: Partial<TrackingItem>,
    userId: string
  ): Promise<TrackingItem> {
    try {
      const { data, error } = await this.supabase
        .from('procurement_orders')
        .update({
          ...updates,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(organizationId, 'updated', 'tracking', itemId, userId, updates);

      return data;
    } catch (error) {
      console.error('Error updating tracking item:', error);
      throw error;
    }
  }

  // Add tracking event
  async addTrackingEvent(
    organizationId: string,
    trackingId: string,
    event: Omit<TrackingEvent, 'id' | 'tracking_id' | 'created_at'>,
    userId: string
  ): Promise<TrackingEvent> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_events')
        .insert({
          ...event,
          tracking_id: trackingId,
          organization_id: organizationId,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Update tracking item status if needed
      if (event.event_type === 'delivered') {
        await this.updateTrackingItem(organizationId, trackingId, {
          status: 'delivered',
          actual_delivery: new Date().toISOString(),
        }, userId);
      }

      return data;
    } catch (error) {
      console.error('Error adding tracking event:', error);
      throw error;
    }
  }

  // Get tracking events for an item
  async getTrackingEvents(trackingId: string): Promise<TrackingEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_events')
        .select('*')
        .eq('tracking_id', trackingId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching tracking events:', error);
      throw error;
    }
  }

  // Bulk update tracking items
  async bulkUpdateTrackingItems(
    organizationId: string,
    action: TrackingBulkAction,
    userId: string
  ): Promise<{ success: number; errors: string[] }> {
    try {
      let success = 0;
      const errors: string[] = [];

      for (const itemId of action.trackingIds) {
        try {
          switch (action.type) {
            case 'update_status':
              if (action.data?.status) {
                await this.updateTrackingItem(organizationId, itemId, {
                  status: action.data.status,
                }, userId);
              }
              break;

            case 'add_tracking':
              if (action.data?.tracking_number && action.data?.carrier) {
                await this.updateTrackingItem(organizationId, itemId, {
                  tracking_number: action.data.tracking_number,
                  shipping_carrier: action.data.carrier,
                }, userId);
              }
              break;

            case 'update_carrier':
              if (action.data?.carrier) {
                await this.updateTrackingItem(organizationId, itemId, {
                  shipping_carrier: action.data.carrier,
                }, userId);
              }
              break;

            case 'add_tags':
              if (action.data?.tags) {
                const { data: currentItem } = await this.supabase
                  .from('procurement_orders')
                  .select('tags')
                  .eq('id', itemId)
                  .single();

                const existingTags = currentItem?.tags || [];
                const newTags = [...new Set([...existingTags, ...action.data.tags])];

                await this.updateTrackingItem(organizationId, itemId, {
                  tags: newTags,
                }, userId);
              }
              break;

            case 'delete':
              await this.supabase
                .from('procurement_orders')
                .delete()
                .eq('id', itemId)
                .eq('organization_id', organizationId);
              break;
          }
          success++;
        } catch (error) {
          errors.push(`Failed to update item ${itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Log bulk activity
      await this.logActivity(organizationId, action.type, 'tracking', 'bulk', userId, {
        action: action.type,
        count: success,
        errors: errors.length,
      });

      return { success, errors };
    } catch (error) {
      console.error('Error performing bulk update:', error);
      throw error;
    }
  }

  // Export tracking data
  async exportTrackingData(
    organizationId: string,
    config: TrackingExportConfig
  ): Promise<Blob> {
    try {
      const { items } = await this.getTrackingItems(organizationId, config.filters, undefined, 1, 10000);

      switch (config.format) {
        case 'json':
          return this.exportToJSON(items, config);
        case 'csv':
          return this.exportToCSV(items, config);
        default:
          throw new Error(`Export format ${config.format} not supported`);
      }
    } catch (error) {
      console.error('Error exporting tracking data:', error);
      throw error;
    }
  }

  // Import tracking data
  async importTrackingData(
    organizationId: string,
    file: File,
    config: TrackingImportConfig,
    userId: string
  ): Promise<TrackingImportResult> {
    try {
      // This would implement file parsing and validation
      // For now, return a mock result
      return {
        success: true,
        imported: 0,
        updated: 0,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      console.error('Error importing tracking data:', error);
      throw error;
    }
  }

  // Get delivery performance analysis
  async getDeliveryPerformance(
    organizationId: string,
    filters?: TrackingFilters
  ): Promise<DeliveryPerformance[]> {
    try {
      const { items } = await this.getTrackingItems(organizationId, filters);

      return items
        .filter(item => item.expected_delivery)
        .map(item => ({
          tracking_id: item.id,
          order_number: item.order_number,
          vendor_name: item.vendor_name,
          expected_date: item.expected_delivery,
          actual_date: item.actual_delivery,
          performance: calculateDeliveryPerformance(item.expected_delivery, item.actual_delivery),
          delay_days: item.actual_delivery 
            ? Math.max(0, calculateDaysToDelivery(item.expected_delivery!, item.actual_delivery))
            : undefined,
          delay_reason: item.delay_reason,
        }));
    } catch (error) {
      console.error('Error getting delivery performance:', error);
      throw error;
    }
  }

  // Private helper methods
  private calculateDeliveryTrends(items: TrackingItem[]) {
    const trends: Array<{
      period: string;
      delivered: number;
      onTime: number;
      late: number;
      avgDays: number;
    }> = [];

    // Group by month for the last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = date.toISOString().slice(0, 7); // YYYY-MM format

      const monthItems = items.filter(item => {
        const itemDate = new Date(item.order_date);
        return itemDate.getFullYear() === date.getFullYear() && 
               itemDate.getMonth() === date.getMonth();
      });

      const delivered = monthItems.filter(item => item.status === 'delivered').length;
      const onTime = monthItems.filter(item => 
        ['on_time', 'early'].includes(calculateDeliveryPerformance(item.expected_delivery, item.actual_delivery))
      ).length;
      const late = monthItems.filter(item => 
        ['late', 'overdue'].includes(calculateDeliveryPerformance(item.expected_delivery, item.actual_delivery))
      ).length;

      const deliveredWithDays = monthItems.filter(item => 
        item.status === 'delivered' && item.actual_delivery
      );
      const avgDays = deliveredWithDays.length > 0
        ? deliveredWithDays.reduce((sum, item) => 
            sum + calculateDaysToDelivery(item.order_date, item.actual_delivery!), 0
          ) / deliveredWithDays.length
        : 0;

      trends.push({
        period,
        delivered,
        onTime,
        late,
        avgDays,
      });
    }

    return trends;
  }

  private async logActivity(
    organizationId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    userId: string,
    details?: unknown
  ) {
    try {
      await this.supabase
        .from('activities')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
        });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break main functionality
    }
  }

  private exportToJSON(items: TrackingItem[], config: TrackingExportConfig): Blob {
    const data = items.map(item => {
      const exported: unknown = {};
      config.fields.forEach(field => {
        exported[field] = (item as unknown)[field];
      });
      return exported;
    });

    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  private exportToCSV(items: TrackingItem[], config: TrackingExportConfig): Blob {
    const headers = config.fields.join(',');
    const rows = items.map(item => 
      config.fields.map(field => {
        const value = (item as unknown)[field];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    return new Blob([csv], { type: 'text/csv' });
  }
}
