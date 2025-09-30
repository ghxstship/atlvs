import { createBrowserClient } from '@ghxstship/auth';
// import { z } from 'zod';
import type {
  Vendor,
  VendorContact,
  VendorDocument,
  VendorPerformance,
  VendorFilters,
  VendorSort,
  VendorStats,
  VendorAnalytics,
  VendorBulkAction,
  VendorExportConfig,
  VendorImportConfig,
  VendorImportResult,
  VendorActivity,
  VendorMessage,
  VendorProjectAssignment,
} from '../types';
import {
  vendorSchema,
  vendorContactSchema,
  vendorDocumentSchema,
  vendorPerformanceSchema,
  vendorFiltersSchema,
} from '../types';

export class VendorService {
  private supabase = createBrowserClient();

  // Vendor CRUD Operations
  async getVendors(
    organizationId: string,
    filters?: VendorFilters,
    sort?: VendorSort,
    page: number = 1,
    limit: number = 50
  ): Promise<{ vendors: Vendor[]; total: number; hasMore: boolean }> {
    try {
      let query = this.supabase
        .from('opendeck_vendor_profiles')
        .select(`
          id,
          organization_id,
          user_id,
          business_name,
          display_name,
          business_type,
          email,
          phone,
          website,
          address,
          primary_category,
          categories,
          skills,
          hourly_rate,
          currency,
          tax_id,
          vat_number,
          bio,
          rating,
          total_reviews,
          total_projects,
          status,
          availability_status,
          created_at,
          updated_at
        `)
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters) {
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          query = query.or(`business_name.ilike.${searchTerm},display_name.ilike.${searchTerm},email.ilike.${searchTerm}`);
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.business_type && filters.business_type !== 'all') {
          query = query.eq('business_type', filters.business_type);
        }

        if (filters.primary_category) {
          query = query.eq('primary_category', filters.primary_category);
        }

        if (filters.availability_status && filters.availability_status !== 'all') {
          query = query.eq('availability_status', filters.availability_status);
        }

        if (filters.rating_min !== undefined) {
          query = query.gte('rating', filters.rating_min);
        }

        if (filters.rating_max !== undefined) {
          query = query.lte('rating', filters.rating_max);
        }

        if (filters.hourly_rate_min !== undefined) {
          query = query.gte('hourly_rate', filters.hourly_rate_min);
        }

        if (filters.hourly_rate_max !== undefined) {
          query = query.lte('hourly_rate', filters.hourly_rate_max);
        }

        if (filters.categories && filters.categories.length > 0) {
          query = query.overlaps('categories', filters.categories);
        }

        if (filters.skills && filters.skills.length > 0) {
          query = query.overlaps('skills', filters.skills);
        }

        if (filters.dateRange) {
          if (filters.dateRange.start) {
            query = query.gte('created_at', filters.dateRange.start);
          }
          if (filters.dateRange.end) {
            query = query.lte('created_at', filters.dateRange.end);
          }
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
        vendors: data || [],
        total,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  async getVendor(organizationId: string, vendorId: string): Promise<Vendor | null> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('id', vendorId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  }

  async createVendor(
    organizationId: string,
    vendorData: Partial<Vendor>,
    userId: string
  ): Promise<Vendor> {
    try {
      // Validate input
      const validatedData = vendorSchema.parse(vendorData);
      
      const payload = {
        organization_id: organizationId,
        user_id: userId,
        business_name: validatedData.business_name,
        display_name: validatedData.display_name,
        business_type: validatedData.business_type,
        email: validatedData.email,
        phone: validatedData.phone,
        website: validatedData.website,
        address: validatedData.address,
        primary_category: validatedData.primary_category,
        categories: validatedData.categories || [],
        skills: validatedData.skills || [],
        hourly_rate: validatedData.hourly_rate,
        currency: validatedData.currency,
        tax_id: validatedData.tax_id,
        vat_number: validatedData.vat_number,
        bio: validatedData.bio,
        status: validatedData.status,
        availability_status: validatedData.availability_status || 'available',
      };

      const { data, error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(organizationId, userId, 'create', 'vendor', data.id, {
        business_name: validatedData.business_name,
        primary_category: validatedData.primary_category,
      });

      return data;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  async updateVendor(
    organizationId: string,
    vendorId: string,
    updates: Partial<Vendor>,
    userId: string
  ): Promise<Vendor> {
    try {
      // Validate input
      const validatedData = vendorSchema.partial().parse(updates);
      
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
        .from('opendeck_vendor_profiles')
        .update(payload)
        .eq('organization_id', organizationId)
        .eq('id', vendorId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(organizationId, userId, 'update', 'vendor', vendorId, {
        updates: Object.keys(payload),
      });

      return data;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  async deleteVendor(
    organizationId: string,
    vendorId: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .delete()
        .eq('organization_id', organizationId)
        .eq('id', vendorId);

      if (error) throw error;

      // Log activity
      await this.logActivity(organizationId, userId, 'delete', 'vendor', vendorId, {});
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  // Vendor Contacts Management
  async getVendorContacts(vendorId: string): Promise<VendorContact[]> {
    try {
      const { data, error } = await this.supabase
        .from('vendor_contacts')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendor contacts:', error);
      throw error;
    }
  }

  async createVendorContact(
    vendorId: string,
    contactData: Partial<VendorContact>,
    userId: string
  ): Promise<VendorContact> {
    try {
      const validatedData = vendorContactSchema.parse(contactData);
      
      const { data, error } = await this.supabase
        .from('vendor_contacts')
        .insert({
          vendor_id: vendorId,
          ...validatedData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating vendor contact:', error);
      throw error;
    }
  }

  // Vendor Documents Management
  async getVendorDocuments(vendorId: string): Promise<VendorDocument[]> {
    try {
      const { data, error } = await this.supabase
        .from('vendor_documents')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendor documents:', error);
      throw error;
    }
  }

  async createVendorDocument(
    vendorId: string,
    documentData: Partial<VendorDocument>,
    userId: string
  ): Promise<VendorDocument> {
    try {
      const validatedData = vendorDocumentSchema.parse(documentData);
      
      const { data, error } = await this.supabase
        .from('vendor_documents')
        .insert({
          vendor_id: vendorId,
          uploaded_by: userId,
          ...validatedData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating vendor document:', error);
      throw error;
    }
  }

  // Vendor Performance Management
  async getVendorPerformance(vendorId: string): Promise<VendorPerformance[]> {
    try {
      const { data, error } = await this.supabase
        .from('vendor_performance')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendor performance:', error);
      throw error;
    }
  }

  async createVendorPerformance(
    vendorId: string,
    performanceData: Partial<VendorPerformance>,
    userId: string
  ): Promise<VendorPerformance> {
    try {
      const validatedData = vendorPerformanceSchema.parse(performanceData);
      
      const { data, error } = await this.supabase
        .from('vendor_performance')
        .insert({
          vendor_id: vendorId,
          created_by: userId,
          ...validatedData,
        })
        .select()
        .single();

      if (error) throw error;

      // Update vendor's overall rating
      await this.updateVendorRating(vendorId);

      return data;
    } catch (error) {
      console.error('Error creating vendor performance:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdateVendors(
    organizationId: string,
    action: VendorBulkAction,
    userId: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const vendorId of action.vendorIds) {
        try {
          switch (action.type) {
            case 'delete':
              await this.deleteVendor(organizationId, vendorId, userId);
              break;
            case 'update_status':
              await this.updateVendor(organizationId, vendorId, { status: action.data?.status }, userId);
              break;
            case 'update_category':
              await this.updateVendor(organizationId, vendorId, { primary_category: action.data?.category }, userId);
              break;
            // Add more bulk actions as needed
          }
          success++;
        } catch (error) {
          failed++;
          errors.push(`Vendor ${vendorId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Log bulk activity
      await this.logActivity(organizationId, userId, 'bulk_update', 'vendor', undefined, {
        action: action.type,
        vendorCount: action.vendorIds.length,
        success,
        failed,
      });

      return { success, failed, errors };
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw error;
    }
  }

  // Analytics and statistics
  async getVendorStats(organizationId: string): Promise<VendorStats> {
    try {
      const { data: vendors, error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .select('status, rating, total_projects, total_reviews, primary_category, hourly_rate, created_at')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const allVendors = vendors || [];
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: VendorStats = {
        totalVendors: allVendors.length,
        activeVendors: allVendors.filter(v => v.status === 'active').length,
        inactiveVendors: allVendors.filter(v => v.status === 'inactive').length,
        pendingVendors: allVendors.filter(v => v.status === 'pending').length,
        suspendedVendors: allVendors.filter(v => v.status === 'suspended').length,
        averageRating: 0,
        totalProjects: 0,
        totalReviews: 0,
        categoriesCount: 0,
        averageHourlyRate: 0,
        topCategories: [],
        recentlyAdded: allVendors.filter(v => new Date(v.created_at) > weekAgo).length,
        recentlyUpdated: 0,
      };

      // Calculate averages
      const vendorsWithRating = allVendors.filter(v => v.rating);
      if (vendorsWithRating.length > 0) {
        stats.averageRating = vendorsWithRating.reduce((sum, v) => sum + (v.rating || 0), 0) / vendorsWithRating.length;
      }

      const vendorsWithRate = allVendors.filter(v => v.hourly_rate);
      if (vendorsWithRate.length > 0) {
        stats.averageHourlyRate = vendorsWithRate.reduce((sum, v) => sum + (v.hourly_rate || 0), 0) / vendorsWithRate.length;
      }

      stats.totalProjects = allVendors.reduce((sum, v) => sum + (v.total_projects || 0), 0);
      stats.totalReviews = allVendors.reduce((sum, v) => sum + (v.total_reviews || 0), 0);

      // Calculate top categories
      const categoryMap = new Map<string, number>();
      allVendors.forEach(v => {
        if (v.primary_category) {
          categoryMap.set(v.primary_category, (categoryMap.get(v.primary_category) || 0) + 1);
        }
      });

      stats.topCategories = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      stats.categoriesCount = categoryMap.size;

      return stats;
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      throw error;
    }
  }

  // Private helper methods
  private async updateVendorRating(vendorId: string): Promise<void> {
    try {
      const { data: performances } = await this.supabase
        .from('vendor_performance')
        .select('overall_score')
        .eq('vendor_id', vendorId);

      if (performances && performances.length > 0) {
        const avgRating = performances.reduce((sum, p) => sum + p.overall_score, 0) / performances.length;
        
        await this.supabase
          .from('opendeck_vendor_profiles')
          .update({ 
            rating: Math.round(avgRating * 10) / 10,
            total_reviews: performances.length 
          })
          .eq('id', vendorId);
      }
    } catch (error) {
      console.error('Error updating vendor rating:', error);
    }
  }

  private async logActivity(
    organizationId: string,
    userId: string,
    action: VendorActivity['action'],
    resourceType: VendorActivity['resource_type'],
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
          details,
        });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break main operations
    }
  }

  // Export functionality
  async exportVendors(organizationId: string, config: VendorExportConfig): Promise<Blob> {
    try {
      const { vendors } = await this.getVendors(organizationId, config.filters, undefined, 1, 10000);
      
      switch (config.format) {
        case 'csv':
          return this.exportToCSV(vendors, config);
        case 'json':
          return this.exportToJSON(vendors, config);
        default:
          throw new Error(`Export format ${config.format} not supported`);
      }
    } catch (error) {
      console.error('Error exporting vendors:', error);
      throw error;
    }
  }

  private exportToCSV(vendors: Vendor[], config: VendorExportConfig): Blob {
    const fields = config.fields.length > 0 ? config.fields : [
      'business_name', 'display_name', 'business_type', 'email', 'phone', 
      'primary_category', 'status', 'rating', 'hourly_rate'
    ];
    
    let csv = '';
    if (config.includeHeaders !== false) {
      csv += fields.join(',') + '\n';
    }

    for (const vendor of vendors) {
      const row = fields.map(field => {
        const value = vendor[field as keyof Vendor];
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

  private exportToJSON(vendors: Vendor[], config: VendorExportConfig): Blob {
    const filteredVendors = vendors.map(vendor => {
      if (config.fields.length === 0) return vendor;
      
      const filtered: unknown = {};
      for (const field of config.fields) {
        filtered[field] = vendor[field as keyof Vendor];
      }
      return filtered;
    });

    return new Blob([JSON.stringify(filteredVendors, null, 2)], { type: 'application/json' });
  }
}
