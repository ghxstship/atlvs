import { CompaniesService } from '../../lib/companies-service';
import type {
  CompanyContract,
  ContractFilters,
  ContractStats,
  CreateContractForm,
} from '../types';

export class ContractsService extends CompaniesService {
  // Get contracts with enhanced filtering
  async getContracts(orgId: string, filters?: ContractFilters, page = 1, limit = 50) {
    let query = (this as unknown).supabase
      .from('company_contracts')
      .select(`
        *,
        company:companies(
          id,
          name,
          industry,
          status
        )
      `, { count: 'exact' })
      .eq('organization_id', orgId);

    // Apply filters
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    if (filters?.type?.length) {
      query = query.in('type', filters.type);
    }
    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.value_min) {
      query = query.gte('value', filters.value_min);
    }
    if (filters?.value_max) {
      query = query.lte('value', filters.value_max);
    }
    if (filters?.start_date_from) {
      query = query.gte('start_date', filters.start_date_from);
    }
    if (filters?.start_date_to) {
      query = query.lte('start_date', filters.start_date_to);
    }
    if (filters?.end_date_from) {
      query = query.gte('end_date', filters.end_date_from);
    }
    if (filters?.end_date_to) {
      query = query.lte('end_date', filters.end_date_to);
    }
    if (filters?.expiring_soon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0]);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by end date (soonest first)
    query = query.order('end_date', { ascending: true, nullsFirst: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  }

  // Get contract statistics
  async getContractStats(orgId: string): Promise<ContractStats> {
    const { data: contracts, error } = await (this as unknown).supabase
      .from('company_contracts')
      .select('type, status, value, end_date')
      .eq('organization_id', orgId);

    if (error) throw error;

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const stats: ContractStats = {
      totalContracts: contracts?.length || 0,
      activeContracts: contracts?.filter(c => c.status === 'active').length || 0,
      expiredContracts: contracts?.filter(c => c.status === 'expired').length || 0,
      expiringContracts: contracts?.filter(c => 
        c.status === 'active' && 
        c.end_date && 
        new Date(c.end_date) <= thirtyDaysFromNow
      ).length || 0,
      totalValue: contracts?.reduce((sum, c) => sum + (c.value || 0), 0) || 0,
      averageValue: 0,
      renewalRate: 0,
      contractsByType: {},
      contractsByStatus: {},
    };

    // Calculate average value
    const contractsWithValue = contracts?.filter(c => c.value && c.value > 0) || [];
    stats.averageValue = contractsWithValue.length > 0 
      ? contractsWithValue.reduce((sum, c) => sum + (c.value || 0), 0) / contractsWithValue.length
      : 0;

    // Calculate renewal rate (renewed contracts / expired contracts)
    const renewedContracts = contracts?.filter(c => c.status === 'renewed').length || 0;
    const expiredContracts = stats.expiredContracts;
    stats.renewalRate = expiredContracts > 0 ? renewedContracts / (renewedContracts + expiredContracts) : 0;

    // Group by type
    contracts?.forEach(contract => {
      stats.contractsByType[contract.type] = (stats.contractsByType[contract.type] || 0) + 1;
    });

    // Group by status
    contracts?.forEach(contract => {
      stats.contractsByStatus[contract.status] = (stats.contractsByStatus[contract.status] || 0) + 1;
    });

    return stats;
  }

  // Renew contract
  async renewContract(id: string, orgId: string, renewalData: {
    end_date?: string;
    renewal_date?: string;
    value?: number;
    notes?: string;
  }): Promise<CompanyContract> {
    const { data, error } = await this.supabase
      .from('company_contracts')
      .update({
        ...renewalData,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Terminate contract
  async terminateContract(id: string, orgId: string, reason?: string): Promise<CompanyContract> {
    const { data, error } = await this.supabase
      .from('company_contracts')
      .update({
        status: 'terminated',
        notes: reason ? `Terminated: ${reason}` : 'Contract terminated',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get expiring contracts
  async getExpiringContracts(orgId: string, days = 30): Promise<CompanyContract[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await this.supabase
      .from('company_contracts')
      .select(`
        *,
        company:companies(
          id,
          name,
          email,
          phone
        )
      `)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .lte('end_date', futureDate.toISOString().split('T')[0])
      .order('end_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Export contracts data
  async exportContracts(orgId: string, filters?: ContractFilters, format: 'csv' | 'json' = 'csv') {
    const { data } = await this.getContracts(orgId, filters, 1, 1000);
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format
    const headers = [
      'Company Name',
      'Title',
      'Type',
      'Status',
      'Value',
      'Currency',
      'Start Date',
      'End Date',
      'Auto Renew',
      'Created Date',
    ];

    const rows = data.map((contract: unknown) => [
      contract.company?.name || '',
      contract.title,
      contract.type,
      contract.status,
      contract.value || '',
      contract.currency,
      contract.start_date || '',
      contract.end_date || '',
      contract.auto_renew ? 'Yes' : 'No',
      new Date(contract.created_at).toLocaleDateString(),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
