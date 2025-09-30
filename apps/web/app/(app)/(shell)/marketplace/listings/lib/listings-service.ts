import { createClient } from '@ghxstship/auth/client';
import type { MarketplaceListing, ListingFilters } from '../../types';
import type { ListingFormData, ListingStats, ListingActivity, ListingResponse } from '../types';

export class ListingsService {
  private supabase = createClient();

  async getListings(filters: ListingFilters = {}): Promise<MarketplaceListing[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);
      if (filters.featured) params.append('featured', 'true');
      if (filters.showMine) params.append('showMine', 'true');
      if (filters.active) params.append('active', 'true');

      const response = await fetch(`/api/v1/marketplace/listings?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch listings');
      }

      return data.listings || [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  async getListing(id: string): Promise<MarketplaceListing | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_listings')
        .select(`
          *,
          organization:organizations(id, name, slug),
          creator:users(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  }

  async createListing(listingData: ListingFormData): Promise<MarketplaceListing> {
    try {
      const response = await fetch('/api/v1/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      return data.listing;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  async updateListing(id: string, listingData: Partial<ListingFormData>): Promise<MarketplaceListing> {
    try {
      const response = await fetch('/api/v1/marketplace/listings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...listingData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update listing');
      }

      return data.listing;
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  async deleteListing(id: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/marketplace/listings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  }

  async getListingStats(orgId: string): Promise<ListingStats> {
    try {
      const { data: listings, error } = await this.supabase
        .from('marketplace_listings')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;

      const stats: ListingStats = {
        totalListings: listings?.length || 0,
        activeListings: listings?.filter(l => l.status === 'active').length || 0,
        featuredListings: listings?.filter(l => l.featured).length || 0,
        totalViews: listings?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0,
        totalResponses: listings?.reduce((sum, l) => sum + (l.response_count || 0), 0) || 0,
        averageResponseRate: 0,
        categoryBreakdown: {},
        typeBreakdown: {}
      };

      // Calculate category breakdown
      listings?.forEach(listing => {
        stats.categoryBreakdown[listing.category] = (stats.categoryBreakdown[listing.category] || 0) + 1;
        stats.typeBreakdown[listing.type] = (stats.typeBreakdown[listing.type] || 0) + 1;
      });

      // Calculate average response rate
      if (stats.totalViews > 0) {
        stats.averageResponseRate = (stats.totalResponses / stats.totalViews) * 100;
      }

      return stats;
    } catch (error) {
      console.error('Error fetching listing stats:', error);
      throw error;
    }
  }

  async getListingActivity(listingId: string): Promise<ListingActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('listing_activity')
        .select(`
          *,
          user:users(id, name, email)
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching listing activity:', error);
      return [];
    }
  }

  async getListingResponses(listingId: string): Promise<ListingResponse[]> {
    try {
      const { data, error } = await this.supabase
        .from('listing_responses')
        .select(`
          *,
          responder:users(id, name, email)
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching listing responses:', error);
      return [];
    }
  }

  async respondToListing(listingId: string, message: string, contactInfo?: unknown): Promise<ListingResponse> {
    try {
      const { data, error } = await this.supabase
        .from('listing_responses')
        .insert({
          listing_id: listingId,
          message,
          contact_info: contactInfo,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Increment response count
      await this.supabase
        .from('marketplace_listings')
        .update({ response_count: this.supabase.sql`response_count + 1` })
        .eq('id', listingId);

      return data;
    } catch (error) {
      console.error('Error responding to listing:', error);
      throw error;
    }
  }

  async trackListingView(listingId: string): Promise<void> {
    try {
      // Increment view count
      await this.supabase
        .from('marketplace_listings')
        .update({ view_count: this.supabase.sql`view_count + 1` })
        .eq('id', listingId);

      // Track activity
      await this.supabase
        .from('listing_activity')
        .insert({
          listing_id: listingId,
          type: 'view',
          metadata: { timestamp: new Date().toISOString() }
        });
    } catch (error) {
      console.error('Error tracking listing view:', error);
    }
  }

  async featureListing(id: string, featured: boolean): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('marketplace_listings')
        .update({ featured })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error featuring listing:', error);
      throw error;
    }
  }

  async bulkUpdateListings(ids: string[], updates: Partial<MarketplaceListing>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('marketplace_listings')
        .update(updates)
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk updating listings:', error);
      throw error;
    }
  }

  async exportListings(format: 'csv' | 'json' | 'excel', filters: ListingFilters = {}): Promise<Blob> {
    try {
      const listings = await this.getListings(filters);
      
      const exportData = listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        type: listing.type,
        category: listing.category,
        subcategory: listing.subcategory,
        status: listing.status,
        price: listing.pricing?.amount || 0,
        currency: listing.pricing?.currency || 'USD',
        negotiable: listing.pricing?.negotiable || false,
        city: listing.location?.city || '',
        state: listing.location?.state || '',
        country: listing.location?.country || '',
        remote: listing.location?.isRemote || false,
        featured: listing.featured,
        views: listing.view_count || 0,
        responses: listing.response_count || 0,
        created_at: listing.created_at,
        updated_at: listing.updated_at,
        expires_at: listing.expires_at
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
      console.error('Error exporting listings:', error);
      throw error;
    }
  }

  // Helper methods
  generateId(): string {
    return crypto.randomUUID();
  }

  getCurrentOrganizationId(): string {
    // This would typically come from auth context
    return 'current-org-id';
  }

  getCurrentUserId(): string {
    // This would typically come from auth context
    return 'current-user-id';
  }
}
