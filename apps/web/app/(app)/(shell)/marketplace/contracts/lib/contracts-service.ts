import { createClient } from '@/lib/supabase/client';
import type { ContractFormData, ContractData, ContractStats, ContractActivity, ContractTemplate, ContractDispute, SignatureRequest } from '../types';

export class ContractsService {
  private supabase = createClient();

  async getContracts(filters: unknown = {}): Promise<ContractData[]> {
    try {
      let query = this.supabase
        .from('opendeck_contracts')
        .select(`
          *,
          client:users!client_id(id, name, email),
          vendor:opendeck_vendor_profiles!vendor_id(id, display_name, business_name),
          project:opendeck_projects(id, title)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.contract_type) {
        query = query.eq('contract_type', filters.contract_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.role && filters.user_id) {
        if (filters.role === 'client') {
          query = query.eq('client_id', filters.user_id);
        } else {
          query = query.eq('vendor_id', filters.user_id);
        }
      }
      if (filters.escrow_enabled !== undefined) {
        query = query.eq('escrow_enabled', filters.escrow_enabled);
      }
      if (filters.signatures_pending) {
        query = query.or('client_signed.eq.false,vendor_signed.eq.false');
      }
      if (filters.amount_range?.min) {
        query = query.gte('total_amount', filters.amount_range.min);
      }
      if (filters.amount_range?.max) {
        query = query.lte('total_amount', filters.amount_range.max);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  async getContract(id: string): Promise<ContractData | null> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_contracts')
        .select(`
          *,
          client:users!client_id(id, name, email),
          vendor:opendeck_vendor_profiles!vendor_id(id, display_name, business_name),
          project:opendeck_projects(id, title),
          activities:contract_activities(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  }

  async createContract(contractData: ContractFormData): Promise<ContractData> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_contracts')
        .insert([{
          ...contractData,
          status: 'draft',
          client_signed: false,
          vendor_signed: false,
          escrow_released: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Create escrow if enabled
      if (contractData.escrow_enabled && contractData.escrow_amount) {
        await this.createEscrow(data.id, contractData.escrow_amount, contractData.currency);
      }

      return data;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  async updateContract(id: string, contractData: Partial<ContractFormData>): Promise<ContractData> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_contracts')
        .update({
          ...contractData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  async deleteContract(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('opendeck_contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }

  async signContract(id: string, signerRole: 'client' | 'vendor', signatureData: unknown): Promise<ContractData> {
    try {
      const updateData: unknown = {
        updated_at: new Date().toISOString()
      };

      if (signerRole === 'client') {
        updateData.client_signed = true;
        updateData.client_signed_at = new Date().toISOString();
      } else {
        updateData.vendor_signed = true;
        updateData.vendor_signed_at = new Date().toISOString();
      }

      // Check if both parties have signed
      const contract = await this.getContract(id);
      if (contract) {
        const bothSigned = (signerRole === 'client' ? true : contract.client_signed) && 
                          (signerRole === 'vendor' ? true : contract.vendor_signed);
        
        if (bothSigned) {
          updateData.status = 'active';
        }
      }

      const { data, error } = await this.supabase
        .from('opendeck_contracts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(id, 'signed', `Contract signed by ${signerRole}`);

      return data;
    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  }

  async terminateContract(id: string, reason: string, terminatedBy: string): Promise<ContractData> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_contracts')
        .update({
          status: 'terminated',
          updated_at: new Date().toISOString(),
          metadata: { termination_reason: reason, terminated_by: terminatedBy }
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity(id, 'terminated', `Contract terminated: ${reason}`);

      return data;
    } catch (error) {
      console.error('Error terminating contract:', error);
      throw error;
    }
  }

  async completeMilestone(contractId: string, milestoneIndex: number): Promise<void> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract || !contract.milestones) return;

      const updatedMilestones = [...contract.milestones];
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        status: 'completed'
      };

      await this.supabase
        .from('opendeck_contracts')
        .update({
          milestones: updatedMilestones,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      // Log activity
      const milestone = updatedMilestones[milestoneIndex];
      await this.logActivity(
        contractId, 
        'milestone_completed', 
        `Milestone completed: ${milestone.title}`,
        milestone.amount,
        contract.currency
      );
    } catch (error) {
      console.error('Error completing milestone:', error);
      throw error;
    }
  }

  async createEscrow(contractId: string, amount: number, currency: string): Promise<void> {
    try {
      await this.supabase
        .from('contract_escrow')
        .insert([{
          contract_id: contractId,
          amount,
          currency,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error creating escrow:', error);
      throw error;
    }
  }

  async releaseEscrow(contractId: string, amount: number): Promise<void> {
    try {
      // First get current escrow_released value
      const { data: contract } = await this.supabase
        .from('opendeck_contracts')
        .select('escrow_released')
        .eq('id', contractId)
        .single();

      const currentReleased = contract?.escrow_released || 0;
      
      await this.supabase
        .from('opendeck_contracts')
        .update({
          escrow_released: currentReleased + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      // Log activity
      await this.logActivity(contractId, 'payment_made', `Escrow released: ${amount}`);
    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw error;
    }
  }

  async createDispute(contractId: string, disputeData: Partial<ContractDispute>): Promise<ContractDispute> {
    try {
      const { data, error } = await this.supabase
        .from('contract_disputes')
        .insert([{
          contract_id: contractId,
          ...disputeData,
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update contract status
      await this.supabase
        .from('opendeck_contracts')
        .update({
          status: 'disputed',
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      // Log activity
      await this.logActivity(contractId, 'disputed', `Dispute raised: ${disputeData.dispute_type}`);

      return data;
    } catch (error) {
      console.error('Error creating dispute:', error);
      throw error;
    }
  }

  async getContractTemplates(category?: string): Promise<ContractTemplate[]> {
    try {
      let query = this.supabase
        .from('contract_templates')
        .select('*')
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contract templates:', error);
      return [];
    }
  }

  async generateContractFromTemplate(templateId: string, variables: Record<string, unknown>): Promise<string> {
    try {
      const { data: template, error } = await this.supabase
        .from('contract_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      let contractContent = template.template_content;

      // Replace variables
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        contractContent = contractContent.replace(regex, value);
      });

      return contractContent;
    } catch (error) {
      console.error('Error generating contract from template:', error);
      throw error;
    }
  }

  async sendSignatureRequest(signatureRequest: SignatureRequest): Promise<string> {
    try {
      // This would integrate with a digital signature service like DocuSign or HelloSign
      // For now, we'll simulate the process
      
      const { data, error } = await this.supabase
        .from('signature_requests')
        .insert([{
          ...signatureRequest,
          status: 'sent',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Return signature URL (would be provided by signature service)
      return `https://signature-service.com/sign/${data.id}`;
    } catch (error) {
      console.error('Error sending signature request:', error);
      throw error;
    }
  }

  async getContractStats(userId: string, orgId: string): Promise<ContractStats> {
    try {
      const { data: contracts, error } = await this.supabase
        .from('opendeck_contracts')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;

      const stats: ContractStats = {
        totalContracts: contracts?.length || 0,
        activeContracts: contracts?.filter((c: unknown) => c.status === 'active').length || 0,
        completedContracts: contracts?.filter((c: unknown) => c.status === 'completed').length || 0,
        pendingSignatures: contracts?.filter((c: unknown) => !c.client_signed || !c.vendor_signed).length || 0,
        totalValue: contracts?.reduce((sum: number, c: unknown) => sum + c.total_amount, 0) || 0,
        escrowBalance: contracts?.reduce((sum: number, c: unknown) => sum + (c.escrow_amount || 0) - (c.escrow_released || 0), 0) || 0,
        averageContractValue: 0,
        contractTypeBreakdown: {},
        statusBreakdown: {},
        monthlySignings: []
      };

      // Calculate average
      if (stats.totalContracts > 0) {
        stats.averageContractValue = stats.totalValue / stats.totalContracts;
      }

      // Calculate breakdowns
      contracts?.forEach((contract: unknown) => {
        stats.contractTypeBreakdown[contract.contract_type] = (stats.contractTypeBreakdown[contract.contract_type] || 0) + 1;
        stats.statusBreakdown[contract.status] = (stats.statusBreakdown[contract.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      throw error;
    }
  }

  async logActivity(contractId: string, type: string, description: string, amount?: number, currency?: string): Promise<void> {
    try {
      await this.supabase
        .from('contract_activities')
        .insert([{
          contract_id: contractId,
          type,
          description,
          amount,
          currency,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error logging contract activity:', error);
    }
  }

  async exportContracts(format: 'csv' | 'json' | 'excel', filters: unknown = {}): Promise<Blob> {
    try {
      const contracts = await this.getContracts(filters);
      
      const exportData = contracts.map(contract => ({
        id: contract.id,
        title: contract.title,
        client_name: contract.client_name,
        vendor_name: contract.vendor_name,
        contract_type: contract.contract_type,
        total_amount: contract.total_amount,
        currency: contract.currency,
        status: contract.status,
        start_date: contract.start_date,
        end_date: contract.end_date,
        client_signed: contract.client_signed,
        vendor_signed: contract.vendor_signed,
        escrow_enabled: contract.escrow_enabled,
        created_at: contract.created_at
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
      console.error('Error exporting contracts:', error);
      throw error;
    }
  }

  // Helper methods
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  calculateProgress(milestones: unknown[]): number {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return (completed / milestones.length) * 100;
  }

  generateId(): string {
    return crypto.randomUUID();
  }
}
