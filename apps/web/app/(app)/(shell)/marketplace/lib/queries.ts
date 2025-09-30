import { createClient } from '@/lib/supabase/client';
import type {
  MarketplaceListing,
  ListingFilters,
  UpsertListingDto,
  MarketplaceStats,
  MarketplaceDashboardStats,
  VendorProfile,
  MarketplaceProject,
  MarketplaceProposal
} from '../types';

// Database query handlers for marketplace operations
export class MarketplaceQueryService {
  private supabase = createClient();

  // Listings queries
  async getListings(orgId: string, filters: ListingFilters = {}): Promise<MarketplaceListing[]> {
    let query = this.supabase
      .from('marketplace_listings')
      .select(`
        *,
        organization:organizations(id, name, slug),
        creator:users!marketplace_listings_created_by_fkey(id, name, email)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.minPrice) {
      query = query.gte('pricing->amount', parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      query = query.lte('pricing->amount', parseFloat(filters.maxPrice));
    }
    if (filters.showMine) {
      // This would need to be handled at the API level with user context
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getListing(orgId: string, id: string): Promise<MarketplaceListing | null> {
    const { data, error } = await this.supabase
      .from('marketplace_listings')
      .select(`
        *,
        organization:organizations(id, name, slug),
        creator:users!marketplace_listings_created_by_fkey(id, name, email)
      `)
      .eq('organization_id', orgId)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  async createListing(orgId: string, userId: string, data: UpsertListingDto): Promise<MarketplaceListing> {
    const listingData = {
      ...data,
      organization_id: orgId,
      created_by: userId,
    };

    const { data: listing, error } = await this.supabase
      .from('marketplace_listings')
      .insert(listingData)
      .select(`
        *,
        organization:organizations(id, name, slug),
        creator:users!marketplace_listings_created_by_fkey(id, name, email)
      `)
      .single();

    if (error) throw error;
    return listing;
  }

  async updateListing(orgId: string, id: string, updates: Partial<UpsertListingDto>): Promise<MarketplaceListing> {
    const { data, error } = await this.supabase
      .from('marketplace_listings')
      .update(updates)
      .eq('organization_id', orgId)
      .eq('id', id)
      .select(`
        *,
        organization:organizations(id, name, slug),
        creator:users!marketplace_listings_created_by_fkey(id, name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteListing(orgId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from('marketplace_listings')
      .delete()
      .eq('organization_id', orgId)
      .eq('id', id);

    if (error) throw error;
  }

  // Projects queries
  async getProjects(orgId: string): Promise<MarketplaceProject[]> {
    const { data, error } = await this.supabase
      .from('marketplace_projects')
      .select(`
        *,
        client:users!marketplace_projects_client_id_fkey(id, name, email),
        proposals(count)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getProject(orgId: string, id: string): Promise<MarketplaceProject | null> {
    const { data, error } = await this.supabase
      .from('marketplace_projects')
      .select(`
        *,
        client:users!marketplace_projects_client_id_fkey(id, name, email),
        proposals:marketplace_proposals(count)
      `)
      .eq('organization_id', orgId)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Vendors queries
  async getVendors(orgId: string): Promise<VendorProfile[]> {
    const { data, error } = await this.supabase
      .from('opendeck_vendor_profiles')
      .select(`
        *,
        user:users!opendeck_vendor_profiles_user_id_fkey(id, name, email),
        organization:organizations(id, name, slug)
      `)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getVendor(orgId: string, id: string): Promise<VendorProfile | null> {
    const { data, error } = await this.supabase
      .from('opendeck_vendor_profiles')
      .select(`
        *,
        user:users!opendeck_vendor_profiles_user_id_fkey(id, name, email),
        organization:organizations(id, name, slug)
      `)
      .eq('organization_id', orgId)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Statistics queries
  async getStats(orgId: string): Promise<MarketplaceStats> {
    // Get listings stats
    const { data: listings, error: listingsError } = await this.supabase
      .from('marketplace_listings')
      .select('type, featured, response_count')
      .eq('organization_id', orgId)
      .eq('status', 'active');

    if (listingsError) throw listingsError;

    // Get vendors count
    const { count: vendorsCount, error: vendorsError } = await this.supabase
      .from('opendeck_vendor_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active');

    if (vendorsError) throw vendorsError;

    // Get projects count
    const { count: projectsCount, error: projectsError } = await this.supabase
      .from('marketplace_projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    if (projectsError) throw projectsError;

    // Calculate stats
    const stats = (listings || []).reduce(
      (acc, listing) => {
        acc.totalResponses += listing.response_count || 0;
        if (listing.featured) acc.featuredListings += 1;
        if (listing.type === 'offer') acc.activeOffers += 1;
        if (listing.type === 'request') acc.activeRequests += 1;
        if (listing.type === 'exchange') acc.activeExchanges += 1;
        return acc;
      },
      {
        totalResponses: 0,
        featuredListings: 0,
        activeOffers: 0,
        activeRequests: 0,
        activeExchanges: 0,
      }
    );

    return {
      totalListings: listings?.length || 0,
      ...stats,
      totalVendors: vendorsCount || 0,
      totalProjects: projectsCount || 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Bulk operations
  async bulkUpdateListings(orgId: string, ids: string[], updates: Partial<MarketplaceListing>): Promise<MarketplaceListing[]> {
    const { data, error } = await this.supabase
      .from('marketplace_listings')
      .update(updates)
      .eq('organization_id', orgId)
      .in('id', ids)
      .select(`
        *,
        organization:organizations(id, name, slug),
        creator:users!marketplace_listings_created_by_fkey(id, name, email)
      `);

    if (error) throw error;
    return data || [];
  }

  async bulkDeleteListings(orgId: string, ids: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('marketplace_listings')
      .delete()
      .eq('organization_id', orgId)
      .in('id', ids);

    if (error) throw error;
  }
}

export const marketplaceQueryService = new MarketplaceQueryService();
