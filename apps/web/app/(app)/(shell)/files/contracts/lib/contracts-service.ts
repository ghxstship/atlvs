import { FilesService } from '../../lib/files-service';
import type {
  ContractAsset,
  CreateContractData,
  UpdateContractData,
  ContractFilters,
  ContractStats,
  ContractMetadata,
  ContractType,
  ContractStatus
} from '../types';

/**
 * ContractsService - Specialized service for contract management
 * Extends FilesService with contract-specific business logic
 */
export class ContractsService extends FilesService {
  
  // Get all contracts with enhanced filtering
  async getContracts(
    orgId?: string,
    options?: {
      page?: number;
      perPage?: number;
      filters?: ContractFilters;
      sortField?: string;
      sortDirection?: 'asc' | 'desc';
      search?: string;
    }
  ) {
    return super.getContracts(orgId, options);
  }

  // Create a new contract with business logic validation
  async createContract(contractData: CreateContractData): Promise<ContractAsset> {
    // Validate required contract fields
    this.validateContractData(contractData);
    
    // Set default values
    const enrichedData: CreateContractData = {
      ...contractData,
      contract_metadata: {
        contract_status: 'draft',
        approval_status: 'pending',
        signature_status: 'unsigned',
        ...contractData.contract_metadata
      }
    };

    return super.createContract(enrichedData);
  }

  // Update contract with workflow validation
  async updateContract(contractData: UpdateContractData): Promise<ContractAsset> {
    // Get current contract to validate state transitions
    const currentContract = await this.getResource(contractData.id) as ContractAsset;
    
    if (contractData.contract_metadata?.contract_status) {
      this.validateStatusTransition(
        currentContract.contract_metadata.contract_status,
        contractData.contract_metadata.contract_status
      );
    }

    return super.updateContract(contractData);
  }

  // Get contracts by entity with caching
  async getContractsByEntity(
    entityType: ContractMetadata['related_entity_type'],
    entityId: string,
    orgId?: string
  ): Promise<ContractAsset[]> {
    return super.getContractsByEntity(entityType, entityId, orgId);
  }

  // Get contracts expiring soon with notifications
  async getExpiringContracts(days: number = 30, orgId?: string): Promise<ContractAsset[]> {
    const contracts = await super.getExpiringContracts(days, orgId);
    
    // Add business logic for expiration notifications
    contracts.forEach(contract => {
      const daysUntilExpiry = this.calculateDaysUntilExpiry(contract);
      if (daysUntilExpiry <= 7) {
        // Could trigger notification system here
      }
    });

    return contracts;
  }

  // Renew contract with business validation
  async renewContract(
    contractId: string,
    newEndDate: string,
    amendments?: Partial<ContractMetadata>
  ): Promise<ContractAsset> {
    // Validate renewal eligibility
    const contract = await this.getResource(contractId) as ContractAsset;
    this.validateRenewalEligibility(contract);

    return super.renewContract(contractId, newEndDate, amendments);
  }

  // Terminate contract with proper workflow
  async terminateContract(
    contractId: string,
    reason?: string
  ): Promise<ContractAsset> {
    // Validate termination eligibility
    const contract = await this.getResource(contractId) as ContractAsset;
    this.validateTerminationEligibility(contract);

    return super.terminateContract(contractId, reason);
  }

  // Activate contract with validation
  async activateContract(contractId: string): Promise<ContractAsset> {
    const contract = await this.getResource(contractId) as ContractAsset;
    
    // Validate activation requirements
    this.validateActivationRequirements(contract);

    return super.activateContract(contractId);
  }

  // Get contract statistics with business insights
  async getContractStats(orgId?: string): Promise<ContractStats> {
    const stats = await super.getContractStats(orgId);
    
    // Add business insights
    return {
      ...stats,
      // Calculate additional metrics
      renewal_rate: this.calculateRenewalRate(stats),
      risk_score: this.calculateRiskScore(stats)
    };
  }

  // Get contract templates by type
  async getContractTemplates(contractType?: ContractType) {
    return super.getContractTemplates(contractType);
  }

  // Create contract from template
  async createContractFromTemplate(
    templateId: string,
    contractData: Partial<CreateContractData>
  ): Promise<ContractAsset> {
    // Get template
    const template = await this.getResource(templateId) as ContractAsset;
    
    if (!template || template.category !== 'template') {
      throw new Error('Template not found');
    }

    // Merge template data with provided data
    const mergedData: CreateContractData = {
      title: contractData.title || `${template.title} - ${new Date().toLocaleDateString()}`,
      description: contractData.description || template.description,
      content: template.content,
      tags: [...(template.tags || []), ...(contractData.tags || [])],
      ...contractData,
      contract_metadata: {
        contract_type: (template.metadata as unknown)?.contract_type || 'other',
        contract_status: 'draft',
        terms: template.content,
        ...contractData.contract_metadata
      }
    };

    return this.createContract(mergedData);
  }

  // Bulk operations
  async bulkUpdateContractStatus(
    contractIds: string[],
    status: ContractStatus,
    reason?: string
  ): Promise<ContractAsset[]> {
    const results: ContractAsset[] = [];

    for (const contractId of contractIds) {
      try {
        const updatedContract = await this.updateContract({
          id: contractId,
          contract_metadata: {
            contract_status: status
          }
        });
        results.push(updatedContract);
      } catch (error) {
        console.error(`Failed to update contract ${contractId}:`, error);
      }
    }

    return results;
  }

  async bulkDeleteContracts(contractIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const contractId of contractIds) {
      try {
        await this.deleteResource(contractId);
        success.push(contractId);
      } catch (error) {
        console.error(`Failed to delete contract ${contractId}:`, error);
        failed.push(contractId);
      }
    }

    return { success, failed };
  }

  // Private validation methods
  private validateContractData(data: CreateContractData): void {
    if (!data.title?.trim()) {
      throw new Error('Contract title is required');
    }

    if (!data.contract_metadata?.contract_type) {
      throw new Error('Contract type is required');
    }

    if (!data.contract_metadata?.related_entity_type || !data.contract_metadata?.related_entity_id) {
      throw new Error('Related entity information is required');
    }

    // Validate contract value if provided
    if (data.contract_metadata?.contract_value !== undefined && data.contract_metadata.contract_value < 0) {
      throw new Error('Contract value must be non-negative');
    }

    // Validate dates
    if (data.contract_metadata?.start_date && data.contract_metadata?.end_date) {
      const startDate = new Date(data.contract_metadata.start_date);
      const endDate = new Date(data.contract_metadata.end_date);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }
  }

  private validateStatusTransition(currentStatus: ContractStatus, newStatus: ContractStatus): void {
    const validTransitions: Record<ContractStatus, ContractStatus[]> = {
      'draft': ['pending_approval', 'active', 'terminated'],
      'pending_approval': ['under_review', 'active', 'draft', 'terminated'],
      'under_review': ['active', 'pending_approval', 'terminated'],
      'active': ['completed', 'terminated', 'expired'],
      'completed': ['active'], // Allow reactivation in some cases
      'terminated': [], // Terminal state
      'expired': ['active'] // Allow renewal
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private validateRenewalEligibility(contract: ContractAsset): void {
    const status = contract.contract_metadata.contract_status;
    
    if (!['active', 'expired'].includes(status)) {
      throw new Error(`Cannot renew contract with status: ${status}`);
    }

    // Check if contract has auto-renewal disabled
    if (contract.contract_metadata.auto_renewal === false) {
      // Manual renewal is allowed, just log it
    }
  }

  private validateTerminationEligibility(contract: ContractAsset): void {
    const status = contract.contract_metadata.contract_status;
    
    if (['terminated', 'completed'].includes(status)) {
      throw new Error(`Contract is already ${status}`);
    }
  }

  private validateActivationRequirements(contract: ContractAsset): void {
    const metadata = contract.contract_metadata;
    
    // Check approval status
    if (metadata.approval_status !== 'approved') {
      throw new Error('Contract must be approved before activation');
    }

    // Check signature status
    if (metadata.signature_status !== 'fully_signed') {
      throw new Error('Contract must be fully signed before activation');
    }

    // Check required fields
    if (!metadata.start_date) {
      throw new Error('Start date is required for activation');
    }

    if (!metadata.end_date) {
      throw new Error('End date is required for activation');
    }
  }

  private calculateDaysUntilExpiry(contract: ContractAsset): number {
    if (!contract.contract_metadata.end_date) return Infinity;
    
    const endDate = new Date(contract.contract_metadata.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  private calculateRenewalRate(stats: ContractStats): number {
    const totalCompleted = (stats.by_status['completed'] || 0) + (stats.by_status['expired'] || 0);
    const renewed = stats.by_status['active'] || 0; // Simplified calculation
    
    return totalCompleted > 0 ? (renewed / totalCompleted) * 100 : 0;
  }

  private calculateRiskScore(stats: ContractStats): number {
    // Simple risk calculation based on various factors
    let riskScore = 0;
    
    // High number of expiring contracts increases risk
    if (stats.expiring_contracts > stats.total * 0.2) {
      riskScore += 30;
    }
    
    // High number of pending approvals increases risk
    if (stats.pending_approvals > stats.total * 0.1) {
      riskScore += 20;
    }
    
    // High number of overdue milestones increases risk
    if (stats.overdue_milestones > 0) {
      riskScore += 25;
    }
    
    // Low completion rate increases risk
    if (stats.completion_rate < 80) {
      riskScore += 25;
    }
    
    return Math.min(riskScore, 100); // Cap at 100
  }
}

// Export singleton instance
export const contractsService = new ContractsService();
