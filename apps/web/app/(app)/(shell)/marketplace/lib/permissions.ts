import { createClient } from '@/lib/supabase/client';
import type { MarketplaceListing, VendorProfile, MarketplaceProject } from '../types';

// RLS permission handlers for marketplace operations
export class MarketplacePermissionsService {
  private supabase = createClient();

  // User role checking
  async getUserRole(orgId: string, userId: string): Promise<'owner' | 'admin' | 'manager' | 'member' | null> {
    const { data, error } = await this.supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data?.role as 'owner' | 'admin' | 'manager' | 'member' | null;
  }

  async isVendor(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('opendeck_vendor_profiles')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  async getUserRoles(orgId: string, userId: string): Promise<{
    orgRole: 'owner' | 'admin' | 'manager' | 'member' | null;
    isVendor: boolean;
    vendorId: string | null;
  }> {
    const [orgRoleResult, vendorResult] = await Promise.all([
      this.getUserRole(orgId, userId),
      this.supabase
        .from('opendeck_vendor_profiles')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()
    ]);

    return {
      orgRole: orgRoleResult,
      isVendor: !!vendorResult.data,
      vendorId: vendorResult.data?.id || null,
    };
  }

  // Listing permissions
  async canCreateListing(orgId: string, userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);
    // Any active member can create listings
    return roles.orgRole !== null;
  }

  async canUpdateListing(orgId: string, userId: string, listing: MarketplaceListing): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);

    // Owners and admins can update any listing
    if (roles.orgRole === 'owner' || roles.orgRole === 'admin') {
      return true;
    }

    // Managers can update listings in their organization
    if (roles.orgRole === 'manager') {
      return true;
    }

    // Users can only update their own listings
    return listing.created_by === userId;
  }

  async canDeleteListing(orgId: string, userId: string, listing: MarketplaceListing): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);

    // Owners and admins can delete any listing
    if (roles.orgRole === 'owner' || roles.orgRole === 'admin') {
      return true;
    }

    // Users can only delete their own listings
    return listing.created_by === userId;
  }

  async canViewListing(orgId: string, userId: string, listing: MarketplaceListing): Promise<boolean> {
    // All organization members can view listings
    const roles = await this.getUserRoles(orgId, userId);
    return roles.orgRole !== null;
  }

  async canFeatureListing(orgId: string, userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);
    // Only owners and admins can feature listings
    return roles.orgRole === 'owner' || roles.orgRole === 'admin';
  }

  // Project permissions
  async canCreateProject(orgId: string, userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);
    // Any active member can create projects
    return roles.orgRole !== null;
  }

  async canUpdateProject(orgId: string, userId: string, project: MarketplaceProject): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);

    // Owners and admins can update any project
    if (roles.orgRole === 'owner' || roles.orgRole === 'admin') {
      return true;
    }

    // Users can only update their own projects
    return project.client_id === userId;
  }

  async canDeleteProject(orgId: string, userId: string, project: MarketplaceProject): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);

    // Owners and admins can delete any project
    if (roles.orgRole === 'owner' || roles.orgRole === 'admin') {
      return true;
    }

    // Users can only delete their own projects
    return project.client_id === userId;
  }

  // Vendor permissions
  async canCreateVendorProfile(orgId: string, userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);
    // Any active member can create a vendor profile
    return roles.orgRole !== null;
  }

  async canUpdateVendorProfile(orgId: string, userId: string, profile: VendorProfile): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);

    // Owners and admins can update any vendor profile
    if (roles.orgRole === 'owner' || roles.orgRole === 'admin') {
      return true;
    }

    // Users can only update their own vendor profile
    return profile.user_id === userId;
  }

  async canVerifyVendor(orgId: string, userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);
    // Only owners and admins can verify vendors
    return roles.orgRole === 'owner' || roles.orgRole === 'admin';
  }

  async canViewVendorProfiles(orgId: string, userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);
    // All organization members can view vendor profiles
    return roles.orgRole !== null;
  }

  // Proposal permissions
  async canCreateProposal(orgId: string, userId: string, projectId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);

    // Must be a vendor to create proposals
    if (!roles.isVendor) {
      return false;
    }

    // Check if project is open for proposals
    const { data: project, error } = await this.supabase
      .from('marketplace_projects')
      .select('status, visibility')
      .eq('organization_id', orgId)
      .eq('id', projectId)
      .single();

    if (error) return false;

    // Can only propose on open projects
    if (project.status !== 'open') {
      return false;
    }

    // Check visibility rules
    if (project.visibility === 'private') {
      // For private projects, need invitation (not implemented yet)
      return false;
    }

    return true;
  }

  async canUpdateProposal(orgId: string, userId: string, proposal: unknown): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);

    // Must be a vendor and proposal owner
    return roles.isVendor && proposal.vendor_id === userId && proposal.status === 'draft';
  }

  async canAcceptProposal(orgId: string, userId: string, project: MarketplaceProject): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);

    // Owners and admins can accept any proposal for their projects
    if (roles.orgRole === 'owner' || roles.orgRole === 'admin') {
      return true;
    }

    // Project owners can accept proposals for their projects
    return project.client_id === userId;
  }

  // Bulk operation permissions
  async canBulkUpdateListings(orgId: string, userId: string, listingIds: string[]): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);

    // Owners and admins can bulk update any listings
    if (roles.orgRole === 'owner' || roles.orgRole === 'admin') {
      return true;
    }

    // For regular users, check if they own all the listings
    if (roles.orgRole && listingIds.length > 0) {
      const { data: listings, error } = await this.supabase
        .from('marketplace_listings')
        .select('created_by')
        .eq('organization_id', orgId)
        .in('id', listingIds);

      if (error) return false;

      // All listings must be created by the user
      return listings.every(listing => listing.created_by === userId);
    }

    return false;
  }

  async canBulkDeleteListings(orgId: string, userId: string, listingIds: string[]): Promise<boolean> {
    // Same permissions as bulk update
    return this.canBulkUpdateListings(orgId, userId, listingIds);
  }

  // Import/Export permissions
  async canImportListings(orgId: string, userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);
    // Only owners and admins can import data
    return roles.orgRole === 'owner' || roles.orgRole === 'admin';
  }

  async canExportListings(orgId: string, userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);
    // All members can export data (with appropriate filters)
    return roles.orgRole !== null;
  }

  // Settings permissions
  async canManageMarketplaceSettings(orgId: string, userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(orgId, userId);
    // Only owners and admins can manage marketplace settings
    return roles.orgRole === 'owner' || roles.orgRole === 'admin';
  }

  // Utility methods
  async filterListingsByPermissions(orgId: string, userId: string, listings: MarketplaceListing[]): Promise<MarketplaceListing[]> {
    const roles = await this.getUserRoles(orgId, userId);

    if (roles.orgRole === 'owner' || roles.orgRole === 'admin') {
      // Owners and admins can see all listings
      return listings;
    }

    // Regular users can see all active listings plus their own drafts
    return listings.filter(listing =>
      listing.status === 'active' ||
      (listing.status === 'draft' && listing.created_by === userId)
    );
  }

  async filterProjectsByPermissions(orgId: string, userId: string, projects: MarketplaceProject[]): Promise<MarketplaceProject[]> {
    const roles = await this.getUserRoles(orgId, userId);

    if (roles.orgRole === 'owner' || roles.orgRole === 'admin') {
      // Owners and admins can see all projects
      return projects;
    }

    // Regular users can see public projects plus their own projects
    return projects.filter(project =>
      project.visibility === 'public' ||
      project.client_id === userId
    );
  }
}

export const marketplacePermissionsService = new MarketplacePermissionsService();
