import { tryCatch, reportError } from '@ghxstship/ui/utils/error-handling';
import type {
  JobBid,
  BidsResponse,
  CreateBidData,
  UpdateBidData,
  BidFilters,
  BidStats,
  BidService,
  OpportunityInfo,
  CompanyInfo
} from '../types';

/**
 * Bids Service - Handles all API interactions for job bids
 * Follows the same patterns as procurement and assignments services
 */
class BidsServiceImpl implements BidService {
  private baseUrl = '/api/v1/jobs/bids';

  /**
   * Get all bids with optional filtering
   */
  async getBids(filters?: BidFilters): Promise<BidsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.opportunity_id) params.append('opportunity_id', filters.opportunity_id);
      if (filters?.company_id) params.append('company_id', filters.company_id);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.currency) params.append('currency', filters.currency);
      if (filters?.amount_min) params.append('amount_min', filters.amount_min.toString());
      if (filters?.amount_max) params.append('amount_max', filters.amount_max.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch bids: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        bids: data.bids || [],
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error loading bids:', error);
      throw error;
    }
  }

  /**
   * Get a single bid by ID
   */
  async getBid(id: string): Promise<JobBid> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch bid: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading bid:', error);
      throw error;
    }
  }

  /**
   * Create a new bid
   */
  async createBid(data: CreateBidData): Promise<JobBid> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(this.baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to create bid: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating bid:', error);
      throw error;
    }
  }

  /**
   * Update an existing bid
   */
  async updateBid(data: UpdateBidData): Promise<JobBid> {
    try {
      const { id, ...updateData } = data;
      
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to update bid: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating bid:', error);
      throw error;
    }
  }

  /**
   * Delete a bid
   */
  async deleteBid(id: string): Promise<void> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to delete bid: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting bid:', error);
      throw error;
    }
  }

  /**
   * Get bid statistics
   */
  async getBidStats(): Promise<BidStats> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/stats`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch bid stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading bid stats:', error);
      // Return default stats if API fails
      return {
        total: 0,
        byStatus: {
          submitted: 0,
          under_review: 0,
          accepted: 0,
          rejected: 0,
          withdrawn: 0
        },
        byType: {
          fixed_price: 0,
          hourly: 0,
          milestone_based: 0,
          retainer: 0
        },
        totalValue: 0,
        averageBidValue: 0,
        winRate: 0,
        recentBids: 0,
        activeBids: 0,
        pendingBids: 0,
        acceptedBids: 0,
        rejectedBids: 0
      };
    }
  }

  /**
   * Withdraw a bid
   */
  async withdrawBid(id: string): Promise<JobBid> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/withdraw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to withdraw bid: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error withdrawing bid:', error);
      throw error;
    }
  }

  /**
   * Submit a bid
   */
  async submitBid(id: string): Promise<JobBid> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to submit bid: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting bid:', error);
      throw error;
    }
  }

  /**
   * Get available opportunities for bidding
   */
  async getAvailableOpportunities(): Promise<OpportunityInfo[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch('/api/v1/jobs/opportunities?status=open', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
      }

      const data = await response.json();
      return data.opportunities || [];
    } catch (error) {
      console.error('Error loading opportunities:', error);
      return [];
    }
  }

  /**
   * Get available companies for bidding
   */
  async getAvailableCompanies(): Promise<CompanyInfo[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch('/api/v1/companies?active=true', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }

      const data = await response.json();
      return data.companies || [];
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  }

  /**
   * Export bids data
   */
  async exportBids(filters?: BidFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.opportunity_id) params.append('opportunity_id', filters.opportunity_id);
      if (filters?.company_id) params.append('company_id', filters.company_id);

      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/export?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to export bids: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting bids:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bidsService = new BidsServiceImpl();
export default bidsService;
