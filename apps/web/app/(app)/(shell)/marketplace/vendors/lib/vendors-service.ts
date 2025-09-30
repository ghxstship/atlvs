import { createClient } from '@ghxstship/auth/client';
import type { VendorProfile } from '../../types';
import type { VendorFormData, VendorStats, VendorActivity, VendorReview } from '../types';

export class VendorsService {
  private supabase = createClient();

  async getVendors(filters: unknown = {}): Promise<VendorProfile[]> {
    try {
      let query = this.supabase
        .from('opendeck_vendor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.category) {
        query = query.eq('primary_category', filters.category);
      }
      if (filters.availability_status) {
        query = query.eq('availability_status', filters.availability_status);
      }
      if (filters.business_type) {
        query = query.eq('business_type', filters.business_type);
      }
      if (filters.verified_only) {
        query = query.eq('verified', true);
      }
      if (filters.rating_min) {
        query = query.gte('rating', filters.rating_min);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  async getVendor(id: string): Promise<VendorProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .select(`
          *,
          user:users(id, name, email),
          organization:organizations(id, name, slug)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }
  }

  async createVendor(vendorData: VendorFormData): Promise<VendorProfile> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .insert([{
          ...vendorData,
          status: 'pending',
          verified: false,
          rating: 0,
          total_reviews: 0,
          total_projects: 0,
          total_earnings: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  async updateVendor(id: string, vendorData: Partial<VendorFormData>): Promise<VendorProfile> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .update(vendorData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  async deleteVendor(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  async getVendorStats(orgId: string): Promise<VendorStats> {
    try {
      const { data: vendors, error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;

      const stats: VendorStats = {
        totalVendors: vendors?.length || 0,
        activeVendors: vendors?.filter(v => v.status === 'active').length || 0,
        verifiedVendors: vendors?.filter(v => v.verified).length || 0,
        averageRating: 0,
        totalProjects: vendors?.reduce((sum, v) => sum + (v.total_projects || 0), 0) || 0,
        totalEarnings: vendors?.reduce((sum, v) => sum + (v.total_earnings || 0), 0) || 0,
        categoryBreakdown: {},
        availabilityBreakdown: {}
      };

      // Calculate average rating
      const vendorsWithRating = vendors?.filter(v => v.rating && v.rating > 0) || [];
      if (vendorsWithRating.length > 0) {
        stats.averageRating = vendorsWithRating.reduce((sum, v) => sum + (v.rating || 0), 0) / vendorsWithRating.length;
      }

      // Calculate breakdowns
      vendors?.forEach(vendor => {
        if (vendor.primary_category) {
          stats.categoryBreakdown[vendor.primary_category] = (stats.categoryBreakdown[vendor.primary_category] || 0) + 1;
        }
        stats.availabilityBreakdown[vendor.availability_status] = (stats.availabilityBreakdown[vendor.availability_status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      throw error;
    }
  }

  async getVendorActivity(vendorId: string): Promise<VendorActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('vendor_activity')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendor activity:', error);
      return [];
    }
  }

  async getVendorReviews(vendorId: string): Promise<VendorReview[]> {
    try {
      const { data, error } = await this.supabase
        .from('vendor_reviews')
        .select(`
          *,
          client:users(id, name, email)
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendor reviews:', error);
      return [];
    }
  }

  async verifyVendor(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .update({ 
          verified: true, 
          verification_date: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error verifying vendor:', error);
      throw error;
    }
  }

  async updateAvailability(id: string, status: 'available' | 'busy' | 'unavailable'): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('opendeck_vendor_profiles')
        .update({ availability_status: status })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  }

  async exportVendors(format: 'csv' | 'json' | 'excel', filters: unknown = {}): Promise<Blob> {
    try {
      const vendors = await this.getVendors(filters);
      
      const exportData = vendors.map(vendor => ({
        id: vendor.id,
        business_name: vendor.business_name,
        display_name: vendor.display_name,
        business_type: vendor.business_type,
        primary_category: vendor.primary_category,
        availability_status: vendor.availability_status,
        rating: vendor.rating,
        total_reviews: vendor.total_reviews,
        total_projects: vendor.total_projects,
        hourly_rate: vendor.hourly_rate,
        currency: vendor.currency,
        years_experience: vendor.years_experience,
        status: vendor.status,
        verified: vendor.verified,
        created_at: vendor.created_at
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
      console.error('Error exporting vendors:', error);
      throw error;
    }
  }

  // Helper methods
  generateId(): string {
    return crypto.randomUUID();
  }

  getCurrentOrganizationId(): string {
    return 'current-org-id';
  }

  getCurrentUserId(): string {
    return 'current-user-id';
  }
}
