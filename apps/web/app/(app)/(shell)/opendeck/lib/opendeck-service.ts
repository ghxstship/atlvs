/**
 * OpenDeck Service Layer
 * Centralized business logic for OpenDeck marketplace operations
 */

import { createBrowserClient } from '@ghxstship/auth';

export interface Listing {
  id: string;
  organization_id: string;
  vendor_id?: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export class OpenDeckService {
  private supabase = createBrowserClient();

  /**
   * Get all listings for organization
   */
  async getListings(organizationId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<{ items: Listing[]; total: number }> {
    try {
      let query = this.supabase
        .from('marketplace_listings')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: (data as Listing[]) || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching listings:', error);
      return { items: [], total: 0 };
    }
  }

  /**
   * Get single listing by ID
   */
  async getListing(listingId: string, organizationId: string): Promise<Listing | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', listingId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data as Listing;
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  }

  /**
   * Create new listing
   */
  async createListing(organizationId: string, listing: Partial<Listing>): Promise<Listing | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_listings')
        .insert({
          ...listing,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as Listing;
    } catch (error) {
      console.error('Error creating listing:', error);
      return null;
    }
  }

  /**
   * Update listing
   */
  async updateListing(listingId: string, organizationId: string, updates: Partial<Listing>): Promise<Listing | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_listings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;
      return data as Listing;
    } catch (error) {
      console.error('Error updating listing:', error);
      return null;
    }
  }

  /**
   * Delete listing
   */
  async deleteListing(listingId: string, organizationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  }

  /**
   * Get all vendors
   */
  async getVendors(organizationId: string): Promise<Vendor[]> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_vendors')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true });

      if (error) throw error;
      return (data as Vendor[]) || [];
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
  }

  /**
   * Get statistics
   */
  async getStats(organizationId: string): Promise<{
    totalListings: number;
    activeListings: number;
    draftListings: number;
    totalVendors: number;
  }> {
    try {
      const [listingsResult, vendorsResult] = await Promise.all([
        this.supabase
          .from('marketplace_listings')
          .select('id, status', { count: 'exact' })
          .eq('organization_id', organizationId),
        this.supabase
          .from('marketplace_vendors')
          .select('id', { count: 'exact' })
          .eq('organization_id', organizationId)
          .eq('status', 'active'),
      ]);

      const totalListings = listingsResult.count || 0;
      const activeListings = listingsResult.data?.filter(l => l.status === 'active').length || 0;
      const draftListings = listingsResult.data?.filter(l => l.status === 'draft').length || 0;
      const totalVendors = vendorsResult.count || 0;

      return {
        totalListings,
        activeListings,
        draftListings,
        totalVendors
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalListings: 0,
        activeListings: 0,
        draftListings: 0,
        totalVendors: 0
      };
    }
  }
}

export const openDeckService = new OpenDeckService();
