import { tryCatch, reportError } from '@ghxstship/ui/utils/error-handling';
import type {
  JobContract,
  ContractsResponse,
  CreateContractData,
  UpdateContractData,
  ContractFilters,
  ContractStats,
  ContractService,
  JobInfo,
  CompanyInfo,
  ContractMilestone,
  ContractAmendment
} from '../types';

/**
 * Contracts Service - Handles all API interactions for job contracts
 * Follows the same patterns as procurement, assignments, and bids services
 */
class ContractsServiceImpl implements ContractService {
  private baseUrl = '/api/v1/jobs/contracts';

  /**
   * Get all contracts with optional filtering
   */
  async getContracts(filters?: ContractFilters): Promise<ContractsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.job_id) params.append('job_id', filters.job_id);
      if (filters?.company_id) params.append('company_id', filters.company_id);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.value_min) params.append('value_min', filters.value_min.toString());
      if (filters?.value_max) params.append('value_max', filters.value_max.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.expiring_soon) params.append('expiring_soon', 'true');

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
        throw new Error(`Failed to fetch contracts: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        contracts: data.contracts || [],
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error loading contracts:', error);
      throw error;
    }
  }

  /**
   * Get a single contract by ID
   */
  async getContract(id: string): Promise<JobContract> {
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
        throw new Error(`Failed to fetch contract: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading contract:', error);
      throw error;
    }
  }

  /**
   * Create a new contract
   */
  async createContract(data: CreateContractData): Promise<JobContract> {
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
        throw new Error(`Failed to create contract: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  /**
   * Update an existing contract
   */
  async updateContract(data: UpdateContractData): Promise<JobContract> {
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
        throw new Error(`Failed to update contract: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  /**
   * Delete a contract
   */
  async deleteContract(id: string): Promise<void> {
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
        throw new Error(`Failed to delete contract: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<ContractStats> {
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
        throw new Error(`Failed to fetch contract stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading contract stats:', error);
      // Return default stats if API fails
      return {
        total: 0,
        byStatus: {
          draft: 0,
          active: 0,
          completed: 0,
          terminated: 0
        },
        byType: {
          employment: 0,
          freelance: 0,
          nda: 0,
          vendor: 0,
          service: 0
        },
        totalValue: 0,
        averageContractValue: 0,
        activeContracts: 0,
        expiringContracts: 0,
        recentContracts: 0,
        completionRate: 0,
        renewalRate: 0
      };
    }
  }

  /**
   * Activate a contract
   */
  async activateContract(id: string): Promise<JobContract> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/activate`, {
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
        throw new Error(`Failed to activate contract: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error activating contract:', error);
      throw error;
    }
  }

  /**
   * Terminate a contract
   */
  async terminateContract(id: string, reason?: string): Promise<JobContract> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/terminate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to terminate contract: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error terminating contract:', error);
      throw error;
    }
  }

  /**
   * Renew a contract
   */
  async renewContract(id: string, newEndDate: string): Promise<JobContract> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/renew`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_end_date: newEndDate })
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to renew contract: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error renewing contract:', error);
      throw error;
    }
  }

  /**
   * Get available jobs for contracts
   */
  async getAvailableJobs(): Promise<JobInfo[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch('/api/v1/jobs?status=in_progress,open', {
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
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      console.error('Error loading jobs:', error);
      return [];
    }
  }

  /**
   * Get available companies for contracts
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
   * Get contract milestones
   */
  async getContractMilestones(contractId: string): Promise<ContractMilestone[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${contractId}/milestones`, {
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
        throw new Error(`Failed to fetch milestones: ${response.statusText}`);
      }

      const data = await response.json();
      return data.milestones || [];
    } catch (error) {
      console.error('Error loading contract milestones:', error);
      return [];
    }
  }

  /**
   * Export contracts data
   */
  async exportContracts(filters?: ContractFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.job_id) params.append('job_id', filters.job_id);
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
        throw new Error(`Failed to export contracts: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting contracts:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const contractsService = new ContractsServiceImpl();
export default contractsService;
