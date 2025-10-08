import { CompaniesService } from '../../lib/companies-service';
import type { DirectoryFilters, DirectoryStats, Company } from '../types';

export class DirectoryService extends CompaniesService {
  async getDirectoryStats(orgId: string): Promise<DirectoryStats> {
    const { data: companies } = await this.supabase
      .from('companies')
      .select('status, industry, size, country')
      .eq('organization_id', orgId);

    if (!companies) {
      return {
        totalCompanies: 0,
        activeCompanies: 0,
        pendingCompanies: 0,
        inactiveCompanies: 0,
        blacklistedCompanies: 0,
        byIndustry: {},
        bySize: {},
        byCountry: {}
      };
    }

    const stats: DirectoryStats = {
      totalCompanies: companies.length,
      activeCompanies: companies.filter(c => c.status === 'active').length,
      pendingCompanies: companies.filter(c => c.status === 'pending').length,
      inactiveCompanies: companies.filter(c => c.status === 'inactive').length,
      blacklistedCompanies: companies.filter(c => c.status === 'blacklisted').length,
      byIndustry: {},
      bySize: {},
      byCountry: {}
    };

    // Group by industry
    companies.forEach(company => {
      if (company.industry) {
        stats.byIndustry[company.industry] = (stats.byIndustry[company.industry] || 0) + 1;
      }
    });

    // Group by size
    companies.forEach(company => {
      if (company.size) {
        stats.bySize[company.size] = (stats.bySize[company.size] || 0) + 1;
      }
    });

    // Group by country
    companies.forEach(company => {
      if (company.country) {
        stats.byCountry[company.country] = (stats.byCountry[company.country] || 0) + 1;
      }
    });

    return stats;
  }

  async searchCompanies(orgId: string, query: string, limit = 10): Promise<Company[]> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('organization_id', orgId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,industry.ilike.%${query}%`)
      .limit(limit)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCompaniesWithFilters(orgId: string, filters: DirectoryFilters, page = 1, limit = 50) {
    return this.getCompanies(orgId, filters, page, limit);
  }

  async bulkUpdateStatus(orgId: string, companyIds: string[], status: Company['status']): Promise<void> {
    const { error } = await this.supabase
      .from('companies')
      .update({ status })
      .eq('organization_id', orgId)
      .in('id', companyIds);

    if (error) throw error;
  }

  async bulkDelete(orgId: string, companyIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('companies')
      .delete()
      .eq('organization_id', orgId)
      .in('id', companyIds);

    if (error) throw error;
  }

  async getIndustryOptions(orgId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('industry')
      .eq('organization_id', orgId)
      .not('industry', 'is', null);

    if (error) throw error;
    
    const industries = [...new Set(data?.map(c => c.industry).filter(Boolean))];
    return industries.sort();
  }

  async getCountryOptions(orgId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('country')
      .eq('organization_id', orgId)
      .not('country', 'is', null);

    if (error) throw error;
    
    const countries = [...new Set(data?.map(c => c.country).filter(Boolean))];
    return countries.sort();
  }
}
