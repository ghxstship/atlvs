import { createClient } from '@/lib/supabase/client';
import type {
  MarketplaceListing,
  UpsertListingDto,
  VendorProfile,
  MarketplaceProject,
  MarketplaceProposal
} from '../types';

// Data mutation handlers for marketplace operations
export class MarketplaceMutationService {
  private supabase = createClient();

  // Listings mutations
  async createListing(orgId: string, userId: string, data: UpsertListingDto): Promise<MarketplaceListing> {
    // Start transaction
    const { data: listing, error } = await this.supabase.rpc('create_marketplace_listing', {
      p_org_id: orgId,
      p_user_id: userId,
      p_data: data
    });

    if (error) throw error;
    return listing;
  }

  async updateListing(orgId: string, id: string, updates: Partial<UpsertListingDto>): Promise<MarketplaceListing> {
    // Start transaction
    const { data: listing, error } = await this.supabase.rpc('update_marketplace_listing', {
      p_org_id: orgId,
      p_listing_id: id,
      p_updates: updates
    });

    if (error) throw error;
    return listing;
  }

  async deleteListing(orgId: string, id: string): Promise<void> {
    // Start transaction
    const { error } = await this.supabase.rpc('delete_marketplace_listing', {
      p_org_id: orgId,
      p_listing_id: id
    });

    if (error) throw error;
  }

  async archiveListing(orgId: string, id: string): Promise<MarketplaceListing> {
    const { data, error } = await this.supabase
      .from('marketplace_listings')
      .update({ status: 'archived' })
      .eq('organization_id', orgId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async featureListing(orgId: string, id: string, featured: boolean): Promise<MarketplaceListing> {
    const { data, error } = await this.supabase
      .from('marketplace_listings')
      .update({ featured })
      .eq('organization_id', orgId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Projects mutations
  async createProject(orgId: string, userId: string, data: Omit<MarketplaceProject, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<MarketplaceProject> {
    const projectData = {
      ...data,
      organization_id: orgId,
      client_id: userId,
    };

    const { data: project, error } = await this.supabase
      .from('marketplace_projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    return project;
  }

  async updateProject(orgId: string, id: string, updates: Partial<MarketplaceProject>): Promise<MarketplaceProject> {
    const { data, error } = await this.supabase
      .from('marketplace_projects')
      .update(updates)
      .eq('organization_id', orgId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(orgId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from('marketplace_projects')
      .delete()
      .eq('organization_id', orgId)
      .eq('id', id);

    if (error) throw error;
  }

  // Vendor mutations
  async createVendorProfile(orgId: string, userId: string, data: Omit<VendorProfile, 'id' | 'user_id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<VendorProfile> {
    const profileData = {
      ...data,
      user_id: userId,
      organization_id: orgId,
      status: 'pending' as const,
    };

    const { data: profile, error } = await this.supabase
      .from('opendeck_vendor_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  async updateVendorProfile(orgId: string, id: string, updates: Partial<VendorProfile>): Promise<VendorProfile> {
    const { data, error } = await this.supabase
      .from('opendeck_vendor_profiles')
      .update(updates)
      .eq('organization_id', orgId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async verifyVendor(orgId: string, id: string): Promise<VendorProfile> {
    const { data, error } = await this.supabase
      .from('opendeck_vendor_profiles')
      .update({
        verified: true,
        verification_date: new Date().toISOString()
      })
      .eq('organization_id', orgId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Proposals mutations
  async createProposal(orgId: string, userId: string, projectId: string, data: Omit<MarketplaceProposal, 'id' | 'project_id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<MarketplaceProposal> {
    const proposalData = {
      ...data,
      project_id: projectId,
      organization_id: orgId,
      vendor_id: userId,
      status: 'submitted' as const,
    };

    const { data: proposal, error } = await this.supabase
      .from('marketplace_proposals')
      .insert(proposalData)
      .select()
      .single();

    if (error) throw error;
    return proposal;
  }

  async updateProposal(orgId: string, id: string, updates: Partial<MarketplaceProposal>): Promise<MarketplaceProposal> {
    const { data, error } = await this.supabase
      .from('marketplace_proposals')
      .update(updates)
      .eq('organization_id', orgId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async acceptProposal(orgId: string, id: string): Promise<MarketplaceProposal> {
    const { data, error } = await this.supabase
      .from('marketplace_proposals')
      .update({ status: 'accepted' })
      .eq('organization_id', orgId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async rejectProposal(orgId: string, id: string, reason?: string): Promise<MarketplaceProposal> {
    const updates: unknown = { status: 'rejected' };
    if (reason) updates.rejection_reason = reason;

    const { data, error } = await this.supabase
      .from('marketplace_proposals')
      .update(updates)
      .eq('organization_id', orgId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Bulk operations with transaction management
  async bulkUpdateListings(orgId: string, ids: string[], updates: Partial<MarketplaceListing>): Promise<MarketplaceListing[]> {
    // Use a transaction for bulk updates
    const { data, error } = await this.supabase.rpc('bulk_update_marketplace_listings', {
      p_org_id: orgId,
      p_listing_ids: ids,
      p_updates: updates
    });

    if (error) throw error;
    return data || [];
  }

  async bulkDeleteListings(orgId: string, ids: string[]): Promise<void> {
    // Use a transaction for bulk deletes
    const { error } = await this.supabase.rpc('bulk_delete_marketplace_listings', {
      p_org_id: orgId,
      p_listing_ids: ids
    });

    if (error) throw error;
  }

  async bulkArchiveListings(orgId: string, ids: string[]): Promise<MarketplaceListing[]> {
    const { data, error } = await this.supabase
      .from('marketplace_listings')
      .update({ status: 'archived' })
      .eq('organization_id', orgId)
      .in('id', ids)
      .select();

    if (error) throw error;
    return data || [];
  }

  // Optimistic updates helper
  async optimisticUpdate<T>(
    operation: () => Promise<T>,
    rollback: () => Promise<void>
  ): Promise<T> {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      // Attempt rollback on failure
      try {
        await rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
      throw error;
    }
  }
}

export const marketplaceMutationService = new MarketplaceMutationService();
