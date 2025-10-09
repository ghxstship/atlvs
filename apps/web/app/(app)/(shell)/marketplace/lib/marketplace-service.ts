import { tryCatch, reportError } from '@ghxstship/ui';
import type {
  ListingFilters,
  ListingsResponse,
  MarketplaceListing,
  MarketplaceStats,
  MarketplaceDashboardStats,
  UpsertListingDto,
  VendorProfile,
  MarketplaceProject,
  MarketplaceProposal,
  OpenDeckStats
} from '../types';
import { marketplaceAPIService } from './api';
import { marketplaceQueryService } from './queries';
import { marketplaceMutationService } from './mutations';
import { marketplacePermissionsService } from './permissions';
import { marketplaceExportService } from './export';
import { marketplaceImportService } from './import';
import { marketplaceRealtimeService } from './realtime';

// Main marketplace service that combines all marketplace operations
export class MarketplaceService {
  private api = marketplaceAPIService;
  private queries = marketplaceQueryService;
  private mutations = marketplaceMutationService;
  private permissions = marketplacePermissionsService;
  private export = marketplaceExportService;
  private import = marketplaceImportService;
  private realtime = marketplaceRealtimeService;

  // Listings operations
  async getListings(orgId: string, filters?: ListingFilters): Promise<ListingsResponse> {
    return tryCatch(async () => {
      const listings = await this.queries.getListings(orgId, filters);
      const stats = await this.getStats(orgId);

      return {
        listings
      };
    }, 'MarketplaceService.getListings');
  }

  async getListing(orgId: string, id: string): Promise<MarketplaceListing | null> {
    return this.queries.getListing(orgId, id);
  }

  async createListing(orgId: string, userId: string, data: UpsertListingDto): Promise<MarketplaceListing> {
    // Check permissions
    const canCreate = await this.permissions.canCreateListing(orgId, userId);
    if (!canCreate) {
      throw new Error('Insufficient permissions to create listings');
    }

    return this.mutations.createListing(orgId, userId, data);
  }

  async updateListing(orgId: string, userId: string, id: string, updates: Partial<UpsertListingDto>): Promise<MarketplaceListing> {
    // Check permissions
    const canUpdate = await this.permissions.canUpdateListing(orgId, userId, await this.getListing(orgId, id) as MarketplaceListing);
    if (!canUpdate) {
      throw new Error('Insufficient permissions to update this listing');
    }

    return this.mutations.updateListing(orgId, id, updates);
  }

  async deleteListing(orgId: string, userId: string, id: string): Promise<void> {
    // Check permissions
    const canDelete = await this.permissions.canDeleteListing(orgId, userId, await this.getListing(orgId, id) as MarketplaceListing);
    if (!canDelete) {
      throw new Error('Insufficient permissions to delete this listing');
    }

    return this.mutations.deleteListing(orgId, id);
  }

  async archiveListing(orgId: string, userId: string, id: string): Promise<MarketplaceListing> {
    const canUpdate = await this.permissions.canUpdateListing(orgId, userId, await this.getListing(orgId, id) as MarketplaceListing);
    if (!canUpdate) {
      throw new Error('Insufficient permissions to archive this listing');
    }

    return this.mutations.archiveListing(orgId, id);
  }

  async featureListing(orgId: string, userId: string, id: string, featured: boolean): Promise<MarketplaceListing> {
    const canFeature = await this.permissions.canFeatureListing(orgId, userId);
    if (!canFeature) {
      throw new Error('Insufficient permissions to feature listings');
    }

    return this.mutations.featureListing(orgId, id, featured);
  }

  // Projects operations
  async getProjects(orgId: string): Promise<MarketplaceProject[]> {
    return this.queries.getProjects(orgId);
  }

  async getProject(orgId: string, id: string): Promise<MarketplaceProject | null> {
    return this.queries.getProject(orgId, id);
  }

  async createProject(orgId: string, userId: string, data: Omit<MarketplaceProject, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<MarketplaceProject> {
    const canCreate = await this.permissions.canCreateProject(orgId, userId);
    if (!canCreate) {
      throw new Error('Insufficient permissions to create projects');
    }

    return this.mutations.createProject(orgId, userId, data);
  }

  async updateProject(orgId: string, userId: string, id: string, updates: Partial<MarketplaceProject>): Promise<MarketplaceProject> {
    const project = await this.getProject(orgId, id);
    if (!project) throw new Error('Project not found');

    const canUpdate = await this.permissions.canUpdateProject(orgId, userId, project);
    if (!canUpdate) {
      throw new Error('Insufficient permissions to update this project');
    }

    return this.mutations.updateProject(orgId, id, updates);
  }

  async deleteProject(orgId: string, userId: string, id: string): Promise<void> {
    const project = await this.getProject(orgId, id);
    if (!project) throw new Error('Project not found');

    const canDelete = await this.permissions.canDeleteProject(orgId, userId, project);
    if (!canDelete) {
      throw new Error('Insufficient permissions to delete this project');
    }

    return this.mutations.deleteProject(orgId, id);
  }

  // Vendors operations
  async getVendors(orgId: string): Promise<VendorProfile[]> {
    const canView = await this.permissions.canViewVendorProfiles(orgId, ''); // User ID not needed for basic view check
    if (!canView) {
      throw new Error('Insufficient permissions to view vendors');
    }

    return this.queries.getVendors(orgId);
  }

  async getVendor(orgId: string, id: string): Promise<VendorProfile | null> {
    const canView = await this.permissions.canViewVendorProfiles(orgId, '');
    if (!canView) {
      throw new Error('Insufficient permissions to view vendors');
    }

    return this.queries.getVendor(orgId, id);
  }

  async createVendorProfile(orgId: string, userId: string, data: Omit<VendorProfile, 'id' | 'user_id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<VendorProfile> {
    const canCreate = await this.permissions.canCreateVendorProfile(orgId, userId);
    if (!canCreate) {
      throw new Error('Insufficient permissions to create vendor profile');
    }

    return this.mutations.createVendorProfile(orgId, userId, data);
  }

  async updateVendorProfile(orgId: string, userId: string, id: string, updates: Partial<VendorProfile>): Promise<VendorProfile> {
    const profile = await this.getVendor(orgId, id);
    if (!profile) throw new Error('Vendor profile not found');

    const canUpdate = await this.permissions.canUpdateVendorProfile(orgId, userId, profile);
    if (!canUpdate) {
      throw new Error('Insufficient permissions to update this vendor profile');
    }

    return this.mutations.updateVendorProfile(orgId, id, updates);
  }

  async verifyVendor(orgId: string, userId: string, id: string): Promise<VendorProfile> {
    const canVerify = await this.permissions.canVerifyVendor(orgId, userId);
    if (!canVerify) {
      throw new Error('Insufficient permissions to verify vendors');
    }

    return this.mutations.verifyVendor(orgId, id);
  }

  // Statistics operations
  async getStats(orgId: string): Promise<MarketplaceStats> {
    return this.queries.getStats(orgId);
  }

  async getDashboardStats(orgId: string, userId: string, userRole: string): Promise<MarketplaceDashboardStats> {
    return tryCatch(async () => {
      // This would typically aggregate data from multiple sources
      // For now, returning mock data structure
      const baseStats: MarketplaceDashboardStats = {
        vendor: {
          totalEarnings: 0,
          activeProjects: 0,
          completedProjects: 0,
          avgRating: 0,
          totalReviews: 0,
          responseRate: 0,
          profileViews: 0,
          proposalsSent: 0,
          successRate: 0
        },
        client: {
          totalSpent: 0,
          activeProjects: 0,
          completedProjects: 0,
          vendorsHired: 0,
          avgProjectValue: 0,
          totalSaved: 0,
          proposalsReceived: 0,
          avgCompletionTime: 0
        }
      };

      // In a real implementation, you would fetch this data from the database
      // based on the user's role and history

      return baseStats;
    }, 'MarketplaceService.getDashboardStats');
  }

  // Bulk operations
  async bulkUpdateListings(orgId: string, userId: string, ids: string[], updates: Partial<MarketplaceListing>): Promise<MarketplaceListing[]> {
    const canBulkUpdate = await this.permissions.canBulkUpdateListings(orgId, userId, ids);
    if (!canBulkUpdate) {
      throw new Error('Insufficient permissions for bulk update');
    }

    return this.mutations.bulkUpdateListings(orgId, ids, updates);
  }

  async bulkDeleteListings(orgId: string, userId: string, ids: string[]): Promise<void> {
    const canBulkDelete = await this.permissions.canBulkDeleteListings(orgId, userId, ids);
    if (!canBulkDelete) {
      throw new Error('Insufficient permissions for bulk delete');
    }

    return this.mutations.bulkDeleteListings(orgId, ids);
  }

  async bulkArchiveListings(orgId: string, userId: string, ids: string[]): Promise<MarketplaceListing[]> {
    const canBulkUpdate = await this.permissions.canBulkUpdateListings(orgId, userId, ids);
    if (!canBulkUpdate) {
      throw new Error('Insufficient permissions for bulk archive');
    }

    return this.mutations.bulkArchiveListings(orgId, ids);
  }

  // Export operations
  async exportListings(orgId: string, userId: string, format: 'csv' | 'json' | 'excel' | 'pdf', filters?: ListingFilters, fields?: string[]): Promise<unknown> {
    const canExport = await this.permissions.canExportListings(orgId, userId);
    if (!canExport) {
      throw new Error('Insufficient permissions to export listings');
    }

    return this.export.exportToCSV(orgId, filters, fields);
  }

  async exportListingsBulk(orgId: string, userId: string, format: 'csv' | 'json' | 'excel' | 'pdf', filters?: ListingFilters, fields?: string[]): Promise<unknown> {
    const canExport = await this.permissions.canExportListings(orgId, userId);
    if (!canExport) {
      throw new Error('Insufficient permissions to export listings');
    }

    return this.export.exportBulk(orgId, format, filters, fields);
  }

  // Import operations
  async importListings(orgId: string, userId: string, format: 'csv' | 'json' | 'excel', data: string | any[], options?: unknown): Promise<unknown> {
    const canImport = await this.permissions.canImportListings(orgId, userId);
    if (!canImport) {
      throw new Error('Insufficient permissions to import listings');
    }

    if (format === 'csv' && typeof data === 'string') {
      return this.import.importFromCSV(orgId, userId, data, options);
    } else if (format === 'json' && typeof data === 'string') {
      return this.import.importFromJSON(orgId, userId, data, options);
    } else if (format === 'excel' && Array.isArray(data)) {
      return this.import.importFromExcelData(orgId, userId, data, options);
    }

    throw new Error(`Unsupported import format: ${format}`);
  }

  async previewImport(format: 'csv' | 'json' | 'excel', data: string | any[], maxRows?: number): Promise<unknown> {
    return this.import.previewImport(format, data, maxRows);
  }

  // Real-time subscriptions
  subscribeToListings(orgId: string, callbacks: unknown): () => void {
    return this.realtime.subscribeToListings(orgId, callbacks);
  }

  subscribeToProjects(orgId: string, callbacks: unknown): () => void {
    return this.realtime.subscribeToProjects(orgId, callbacks);
  }

  subscribeToVendors(orgId: string, callbacks: unknown): () => void {
    return this.realtime.subscribeToVendors(orgId, callbacks);
  }

  subscribeToMarketplace(orgId: string, userId: string, callbacks: unknown): () => void {
    return this.realtime.subscribeToMarketplace(orgId, userId, callbacks);
  }

  subscribeToPresence(channelName: string, callbacks: unknown): () => void {
    return this.realtime.subscribeToPresence(channelName, callbacks);
  }

  // Utility methods
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    return this.realtime.getConnectionStatus();
  }

  cleanup(): void {
    this.realtime.cleanup();
  }

  // Permission checking utilities
  async getUserPermissions(orgId: string, userId: string): Promise<unknown> {
    return this.permissions.getUserRoles(orgId, userId);
  }

  async filterListingsByPermissions(orgId: string, userId: string, listings: MarketplaceListing[]): Promise<MarketplaceListing[]> {
    return this.permissions.filterListingsByPermissions(orgId, userId, listings);
  }

  async filterProjectsByPermissions(orgId: string, userId: string, projects: MarketplaceProject[]): Promise<MarketplaceProject[]> {
    return this.permissions.filterProjectsByPermissions(orgId, userId, projects);
  }

  // Export/Import templates and metadata
  getExportTemplates() {
    return this.export.getExportTemplates();
  }

  getImportTemplates() {
    return this.import.getImportTemplates();
  }

  async getExportMetadata(orgId: string, filters?: ListingFilters) {
    return this.export.getExportMetadata(orgId, filters);
  }
}

export const marketplaceService = new MarketplaceService();

// Helper functions exported for convenience
export async function fetchMarketplaceListings(orgId: string, filters?: ListingFilters): Promise<ListingsResponse> {
  return marketplaceService.getListings(orgId, filters);
}

export async function createMarketplaceListing(orgId: string, userId: string, data: UpsertListingDto): Promise<MarketplaceListing> {
  return marketplaceService.createListing(orgId, userId, data);
}

export async function updateMarketplaceListing(orgId: string, userId: string, id: string, data: UpsertListingDto): Promise<MarketplaceListing> {
  return marketplaceService.updateListing(orgId, userId, id, data);
}

export async function deleteMarketplaceListings(orgId: string, userId: string, ids: string[]): Promise<void> {
  // Delete listings one by one (no bulk delete method exists)
  await Promise.all(ids.map(id => marketplaceService.deleteListing(orgId, userId, id)));
}

export function normalizeListingForDataView(listing: MarketplaceListing) {
  return {
    ...listing,
    id: listing.id,
    title: listing.title,
    description: listing.description,
    status: listing.status,
    created_at: listing.created_at,
    updated_at: listing.updated_at
  };
}
