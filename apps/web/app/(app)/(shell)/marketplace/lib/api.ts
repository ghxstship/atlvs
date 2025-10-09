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
  MarketplaceProposal
} from '../types';

// API service handlers for marketplace operations
export class MarketplaceAPIService {
  private baseUrl = '/api/v1/marketplace';

  // Listings API
  async getListings(orgId: string, filters?: ListingFilters): Promise<ListingsResponse> {
    return tryCatch(async () => {
      const params = new URLSearchParams();
      params.set('orgId', orgId);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.set(key, String(value));
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/listings?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.getListings');
  }

  async getListing(orgId: string, id: string): Promise<MarketplaceListing> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/listings/${id}?orgId=${orgId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch listing: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.getListing');
  }

  async createListing(orgId: string, data: UpsertListingDto): Promise<MarketplaceListing> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/listings?orgId=${orgId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to create listing: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.createListing');
  }

  async updateListing(orgId: string, id: string, data: Partial<UpsertListingDto>): Promise<MarketplaceListing> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/listings/${id}?orgId=${orgId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update listing: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.updateListing');
  }

  async deleteListing(orgId: string, id: string): Promise<void> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/listings/${id}?orgId=${orgId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete listing: ${response.statusText}`);
      }
    }, 'MarketplaceAPIService.deleteListing');
  }

  // Projects API
  async getProjects(orgId: string): Promise<MarketplaceProject[]> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/projects?orgId=${orgId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.getProjects');
  }

  async getProject(orgId: string, id: string): Promise<MarketplaceProject> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/projects/${id}?orgId=${orgId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.getProject');
  }

  // Vendors API
  async getVendors(orgId: string): Promise<VendorProfile[]> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/vendors?orgId=${orgId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vendors: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.getVendors');
  }

  async getVendor(orgId: string, id: string): Promise<VendorProfile> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/vendors/${id}?orgId=${orgId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vendor: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.getVendor');
  }

  // Statistics API
  async getStats(orgId: string): Promise<MarketplaceStats> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/stats?orgId=${orgId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.getStats');
  }

  async getDashboardStats(orgId: string, userId: string, userRole: string): Promise<MarketplaceDashboardStats> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/dashboard?orgId=${orgId}&userId=${userId}&userRole=${userRole}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.getDashboardStats');
  }

  // Bulk operations
  async bulkUpdateListings(orgId: string, ids: string[], updates: Partial<MarketplaceListing>): Promise<MarketplaceListing[]> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/listings/bulk?orgId=${orgId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids, updates })
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk update listings: ${response.statusText}`);
      }

      return response.json();
    }, 'MarketplaceAPIService.bulkUpdateListings');
  }

  async bulkDeleteListings(orgId: string, ids: string[]): Promise<void> {
    return tryCatch(async () => {
      const response = await fetch(`${this.baseUrl}/listings/bulk?orgId=${orgId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk delete listings: ${response.statusText}`);
      }
    }, 'MarketplaceAPIService.bulkDeleteListings');
  }
}

export const marketplaceAPIService = new MarketplaceAPIService();

// Export alias for backward compatibility
export { marketplaceAPIService as marketplaceService };
