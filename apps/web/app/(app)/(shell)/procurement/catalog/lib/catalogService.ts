import { createBrowserClient } from '@ghxstship/auth';
// import { z } from 'zod';
import type {
  CatalogItem,
  Product,
  Service,
  Category,
  Vendor,
  CatalogFilters,
  CatalogSort,
  CatalogStats,
  CatalogAnalytics,
  BulkAction,
  ExportConfig,
  ImportConfig,
  ImportResult,
  CatalogActivity
} from '../types';
import {
  catalogItemSchema,
  categorySchema,
  vendorSchema,
  catalogFiltersSchema
} from '../types';

export class CatalogService {
  private supabase = createBrowserClient();

  // Catalog Items CRUD Operations
  async getCatalogItems(
    organizationId: string,
    filters?: CatalogFilters,
    sort?: CatalogSort,
    page: number = 1,
    limit: number = 50
  ): Promise<{ items: CatalogItem[]; total: number; hasMore: boolean }> {
    try {
      // Build products query
      let productsQuery = this.supabase
        .from('products')
        .select('*, created_by:users(id, name)')
        .eq('organization_id', organizationId);

      // Build services query
      let servicesQuery = this.supabase
        .from('services')
        .select('*, created_by:users(id, name)')
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters) {
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          productsQuery = productsQuery.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},supplier.ilike.${searchTerm}`);
          servicesQuery = servicesQuery.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},supplier.ilike.${searchTerm}`);
        }

        if (filters.status && filters.status !== 'all') {
          productsQuery = productsQuery.eq('status', filters.status);
          servicesQuery = servicesQuery.eq('status', filters.status);
        }

        if (filters.category) {
          productsQuery = productsQuery.eq('category', filters.category);
          servicesQuery = servicesQuery.eq('category', filters.category);
        }

        if (filters.supplier) {
          productsQuery = productsQuery.eq('supplier', filters.supplier);
          servicesQuery = servicesQuery.eq('supplier', filters.supplier);
        }

        if (filters.priceRange) {
          if (filters.priceRange.min !== undefined) {
            productsQuery = productsQuery.gte('price', filters.priceRange.min);
            servicesQuery = servicesQuery.gte('rate', filters.priceRange.min);
          }
          if (filters.priceRange.max !== undefined) {
            productsQuery = productsQuery.lte('price', filters.priceRange.max);
            servicesQuery = servicesQuery.lte('rate', filters.priceRange.max);
          }
        }

        if (filters.dateRange) {
          if (filters.dateRange.start) {
            productsQuery = productsQuery.gte('created_at', filters.dateRange.start);
            servicesQuery = servicesQuery.gte('created_at', filters.dateRange.start);
          }
          if (filters.dateRange.end) {
            productsQuery = productsQuery.lte('created_at', filters.dateRange.end);
            servicesQuery = servicesQuery.lte('created_at', filters.dateRange.end);
          }
        }
      }

      // Execute queries based on type filter
      let products: unknown[] = [];
      let services: unknown[] = [];

      if (!filters?.type || filters.type === 'all' || filters.type === 'product') {
        const { data: productsData, error: productsError } = await productsQuery;
        if (productsError) throw productsError;
        products = (productsData || []).map((item: unknown) => ({ ...item, type: 'product' }));
      }

      if (!filters?.type || filters.type === 'all' || filters.type === 'service') {
        const { data: servicesData, error: servicesError } = await servicesQuery;
        if (servicesError) throw servicesError;
        services = (servicesData || []).map((item: unknown) => ({ 
          ...item, 
          type: 'service',
          price: item.rate // Normalize rate to price for unified interface
        }));
      }

      // Combine and sort results
      let allItems = [...products, ...services];

      // Apply sorting
      if (sort) {
        allItems.sort((a, b) => {
          const aValue = a[sort.field];
          const bValue = b[sort.field];
          
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;
          
          let comparison = 0;
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else {
            comparison = String(aValue).localeCompare(String(bValue));
          }
          
          return sort.direction === 'desc' ? -comparison : comparison;
        });
      } else {
        // Default sort by created_at desc
        allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      // Apply pagination
      const total = allItems.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = allItems.slice(startIndex, endIndex);
      const hasMore = endIndex < total;

      return {
        items: paginatedItems,
        total,
        hasMore
      };
    } catch (error) {
      console.error('Error fetching catalog items:', error);
      throw error;
    }
  }

  async getCatalogItem(organizationId: string, itemId: string, type: 'product' | 'service'): Promise<CatalogItem | null> {
    try {
      const table = type === 'product' ? 'products' : 'services';
      const { data, error } = await this.supabase
        .from(table)
        .select('*, created_by:users(id, name)')
        .eq('organization_id', organizationId)
        .eq('id', itemId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return {
        ...data,
        type,
        price: type === 'service' ? data.rate : data.price
      };
    } catch (error) {
      console.error('Error fetching catalog item:', error);
      throw error;
    }
  }

  async createCatalogItem(
    organizationId: string,
    itemData: Partial<CatalogItem>,
    userId: string
  ): Promise<CatalogItem> {
    try {
      // Validate input
      const validatedData = catalogItemSchema.parse(itemData);
      
      const table = validatedData.type === 'product' ? 'products' : 'services';
      const payload = {
        organization_id: organizationId,
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        currency: validatedData.currency,
        supplier: validatedData.supplier,
        status: validatedData.status,
        specifications: validatedData.specifications,
        tags: validatedData.tags,
        created_by: userId,
        ...(validatedData.type === 'product' 
          ? { 
              price: validatedData.price || 0,
              sku: validatedData.sku
            }
          : { 
              rate: validatedData.rate || 0,
              unit: validatedData.unit || 'hour'
            }
        )
      };

      const { data, error } = await this.supabase
        .from(table)
        .insert(payload)
        .select('*, created_by:users(id, name)')
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(organizationId, userId, 'create', validatedData.type, data.id, {
        name: validatedData.name,
        type: validatedData.type
      });

      return {
        ...data,
        type: validatedData.type,
        price: validatedData.type === 'service' ? data.rate : data.price
      };
    } catch (error) {
      console.error('Error creating catalog item:', error);
      throw error;
    }
  }

  async updateCatalogItem(
    organizationId: string,
    itemId: string,
    type: 'product' | 'service',
    updates: Partial<CatalogItem>,
    userId: string
  ): Promise<CatalogItem> {
    try {
      // Validate input
      const validatedData = catalogItemSchema.partial().parse(updates);
      
      const table = type === 'product' ? 'products' : 'services';
      const payload: unknown = {
        updated_at: new Date().toISOString()
      };

      // Map common fields
      if (validatedData.name !== undefined) payload.name = validatedData.name;
      if (validatedData.description !== undefined) payload.description = validatedData.description;
      if (validatedData.category !== undefined) payload.category = validatedData.category;
      if (validatedData.currency !== undefined) payload.currency = validatedData.currency;
      if (validatedData.supplier !== undefined) payload.supplier = validatedData.supplier;
      if (validatedData.status !== undefined) payload.status = validatedData.status;
      if (validatedData.specifications !== undefined) payload.specifications = validatedData.specifications;
      if (validatedData.tags !== undefined) payload.tags = validatedData.tags;

      // Map type-specific fields
      if (type === 'product') {
        if (validatedData.price !== undefined) payload.price = validatedData.price;
        if (validatedData.sku !== undefined) payload.sku = validatedData.sku;
      } else {
        if (validatedData.rate !== undefined) payload.rate = validatedData.rate;
        if (validatedData.unit !== undefined) payload.unit = validatedData.unit;
      }

      const { data, error } = await this.supabase
        .from(table)
        .update(payload)
        .eq('organization_id', organizationId)
        .eq('id', itemId)
        .select('*, created_by:users(id, name)')
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(organizationId, userId, 'update', type, itemId, {
        updates: Object.keys(payload)
      });

      return {
        ...data,
        type,
        price: type === 'service' ? data.rate : data.price
      };
    } catch (error) {
      console.error('Error updating catalog item:', error);
      throw error;
    }
  }

  async deleteCatalogItem(
    organizationId: string,
    itemId: string,
    type: 'product' | 'service',
    userId: string
  ): Promise<void> {
    try {
      const table = type === 'product' ? 'products' : 'services';
      
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('organization_id', organizationId)
        .eq('id', itemId);

      if (error) throw error;

      // Log activity
      await this.logActivity(organizationId, userId, 'delete', type, itemId, {});
    } catch (error) {
      console.error('Error deleting catalog item:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdateCatalogItems(
    organizationId: string,
    action: BulkAction,
    userId: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const itemId of action.itemIds) {
        try {
          // Determine item type first
          const productExists = await this.supabase
            .from('products')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('id', itemId)
            .single();

          const type = productExists.data ? 'product' : 'service';

          switch (action.type) {
            case 'delete':
              await this.deleteCatalogItem(organizationId, itemId, type, userId);
              break;
            case 'update_status':
              await this.updateCatalogItem(organizationId, itemId, type, { status: action.data?.status }, userId);
              break;
            case 'update_category':
              await this.updateCatalogItem(organizationId, itemId, type, { category: action.data?.category }, userId);
              break;
            case 'update_supplier':
              await this.updateCatalogItem(organizationId, itemId, type, { supplier: action.data?.supplier }, userId);
              break;
          }
          success++;
        } catch (error) {
          failed++;
          errors.push(`Item ${itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Log bulk activity
      await this.logActivity(organizationId, userId, 'bulk_update', 'catalog_item', undefined, {
        action: action.type,
        itemCount: action.itemIds.length,
        success,
        failed
      });

      return { success, failed, errors };
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw error;
    }
  }

  // Categories management
  async getCategories(organizationId: string): Promise<Category[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async createCategory(organizationId: string, categoryData: Partial<Category>, userId: string): Promise<Category> {
    try {
      const validatedData = categorySchema.parse(categoryData);
      
      const { data, error } = await this.supabase
        .from('categories')
        .insert({
          organization_id: organizationId,
          ...validatedData
        })
        .select()
        .single();

      if (error) throw error;

      await this.logActivity(organizationId, userId, 'create', 'category', data.id, {
        name: validatedData.name,
        type: validatedData.type
      });

      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Vendors management
  async getVendors(organizationId: string): Promise<Vendor[]> {
    try {
      const { data, error } = await this.supabase
        .from('vendors')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  async createVendor(organizationId: string, vendorData: Partial<Vendor>, userId: string): Promise<Vendor> {
    try {
      const validatedData = vendorSchema.parse(vendorData);
      
      const { data, error } = await this.supabase
        .from('vendors')
        .insert({
          organization_id: organizationId,
          ...validatedData
        })
        .select()
        .single();

      if (error) throw error;

      await this.logActivity(organizationId, userId, 'create', 'vendor', data.id, {
        name: validatedData.name
      });

      return data;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  // Analytics and statistics
  async getCatalogStats(
    organizationId: string,
    params?: {
      timeframe?: '7d' | '30d' | '90d' | '1y';
      compare?: boolean;
      category?: string;
      supplier?: string;
      status?: 'all' | 'active' | 'inactive' | 'discontinued';
      type?: 'all' | 'product' | 'service';
    }
  ): Promise<CatalogStats> {
    try {
      const timeframe = params?.timeframe ?? '30d';
      const statusFilter = params?.status && params.status !== 'all' ? params.status : undefined;
      const typeFilter = params?.type ?? 'all';

      const dateCutoff = (() => {
        const now = new Date();
        switch (timeframe) {
          case '7d':
            now.setDate(now.getDate() - 7);
            break;
          case '30d':
            now.setDate(now.getDate() - 30);
            break;
          case '90d':
            now.setDate(now.getDate() - 90);
            break;
          case '1y':
            now.setFullYear(now.getFullYear() - 1);
            break;
        }
        return now.toISOString();
      })();

      const productQuery = this.supabase
        .from('products')
        .select('price, status, created_at, category, supplier')
        .eq('organization_id', organizationId)
        .gte('created_at', dateCutoff);

      const serviceQuery = this.supabase
        .from('services')
        .select('rate, status, created_at, category, supplier')
        .eq('organization_id', organizationId)
        .gte('created_at', dateCutoff);

      if (statusFilter) {
        productQuery.eq('status', statusFilter);
        serviceQuery.eq('status', statusFilter);
      }

      if (params?.category) {
        productQuery.eq('category', params.category);
        serviceQuery.eq('category', params.category);
      }

      if (params?.supplier) {
        productQuery.eq('supplier', params.supplier);
        serviceQuery.eq('supplier', params.supplier);
      }

      const [productsResult, servicesResult] = await Promise.all([
        typeFilter === 'service'
          ? { data: [], error: null }
          : productQuery,
        typeFilter === 'product'
          ? { data: [], error: null }
          : serviceQuery,
      ]);

      if (productsResult.error) throw productsResult.error;
      if (servicesResult.error) throw servicesResult.error;

      const products = productsResult.data || [];
      const services = servicesResult.data || [];
      const allItems = [...products, ...services];

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: CatalogStats = {
        totalItems: allItems.length,
        totalProducts: products.length,
        totalServices: services.length,
        activeItems: allItems.filter(item => item.status === 'active').length,
        inactiveItems: allItems.filter(item => item.status === 'inactive').length,
        discontinuedItems: allItems.filter(item => item.status === 'discontinued').length,
        categoriesCount: 0, // Will be updated below
        suppliersCount: 0, // Will be updated below
        averagePrice: 0,
        totalValue: 0,
        recentlyAdded: allItems.filter(item => new Date(item.created_at) > weekAgo).length,
        recentlyUpdated: 0, // Would need updated_at tracking
      };

      // Calculate financial metrics
      const prices = products.map(p => p.price || 0).concat(services.map(s => s.rate || 0));
      if (prices.length > 0) {
        stats.totalValue = prices.reduce((sum, price) => sum + price, 0);
        stats.averagePrice = stats.totalValue / prices.length;
      }

      // Get categories and suppliers count
      const [categoriesResult, suppliersResult] = await Promise.all([
        this.supabase
          .from('categories')
          .select('id')
          .eq('organization_id', organizationId),
        this.supabase
          .from('vendors')
          .select('id')
          .eq('organization_id', organizationId),
      ]);

      stats.categoriesCount = categoriesResult.data?.length || 0;
      stats.suppliersCount = suppliersResult.data?.length || 0;

      return stats;
    } catch (error) {
      console.error('Error fetching catalog stats:', error);
      throw error;
    }
  }

  // Activity logging
  private async logActivity(
    organizationId: string,
    userId: string,
    action: CatalogActivity['action'],
    resourceType: CatalogActivity['resource_type'],
    resourceId?: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await this.supabase
        .from('activities')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break main operations
    }
  }

  // Export functionality
  async exportCatalogItems(organizationId: string, config: ExportConfig): Promise<Blob> {
    try {
      const { items } = await this.getCatalogItems(organizationId, config.filters, undefined, 1, 10000);
      
      switch (config.format) {
        case 'csv':
          return this.exportToCSV(items, config);
        case 'json':
          return this.exportToJSON(items, config);
        default:
          throw new Error(`Export format ${config.format} not supported`);
      }
    } catch (error) {
      console.error('Error exporting catalog items:', error);
      throw error;
    }
  }

  private exportToCSV(items: CatalogItem[], config: ExportConfig): Blob {
    const fields = config.fields.length > 0 ? config.fields : ['name', 'type', 'category', 'price', 'status'];
    
    let csv = '';
    if (config.includeHeaders !== false) {
      csv += fields.join(',') + '\n';
    }

    for (const item of items) {
      const row = fields.map(field => {
        const value = item[field as keyof CatalogItem];
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

  private exportToJSON(items: CatalogItem[], config: ExportConfig): Blob {
    const filteredItems = items.map(item => {
      if (config.fields.length === 0) return item;
      
      const filtered: unknown = {};
      for (const field of config.fields) {
        filtered[field] = item[field as keyof CatalogItem];
      }
      return filtered;
    });

    return new Blob([JSON.stringify(filteredItems, null, 2)], { type: 'application/json' });
  }
}
