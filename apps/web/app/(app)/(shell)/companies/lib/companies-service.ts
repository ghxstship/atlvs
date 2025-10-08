import { createBrowserClient } from '@supabase/ssr';
import type {
  Company,
  CompanyContact,
  CompanyContract,
  CompanyQualification,
  CompanyRating,
  CreateCompanyForm,
  UpdateCompanyForm,
  CreateContactForm,
  CreateContractForm,
  CreateQualificationForm,
  CreateRatingForm,
  CompanyFilters,
  ContractFilters,
  QualificationFilters,
  RatingFilters,
  CompanyStats,
  ContractStats,
  QualificationStats,
  RatingStats,
  ExportOptions
} from '../types';

export class CompaniesService {
  private supabase;

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Company CRUD operations
  async getCompanies(orgId: string, filters?: CompanyFilters, page = 1, limit = 50) {
    let query = this.supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId);

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`);
    }
    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.industry?.length) {
      query = query.in('industry', filters.industry);
    }
    if (filters?.size?.length) {
      query = query.in('size', filters.size);
    }
    if (filters?.country?.length) {
      query = query.in('country', filters.country);
    }
    if (filters?.founded_year_min) {
      query = query.gte('founded_year', filters.founded_year_min);
    }
    if (filters?.founded_year_max) {
      query = query.lte('founded_year', filters.founded_year_max);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by name
    query = query.order('name', { ascending: true });

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async getCompany(id: string, orgId: string): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  }

  async createCompany(orgId: string, companyData: CreateCompanyForm): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .insert({
        ...companyData,
        organization_id: orgId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCompany(id: string, orgId: string, updates: UpdateCompanyForm): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCompany(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  // Company Contacts
  async getCompanyContacts(companyId: string, orgId: string): Promise<CompanyContact[]> {
    const { data, error } = await this.supabase
      .from('company_contacts')
      .select('*')
      .eq('company_id', companyId)
      .eq('organization_id', orgId)
      .order('is_primary', { ascending: false })
      .order('last_name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createContact(orgId: string, contactData: CreateContactForm): Promise<CompanyContact> {
    const { data, error } = await this.supabase
      .from('company_contacts')
      .insert({
        ...contactData,
        organization_id: orgId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateContact(id: string, orgId: string, updates: Partial<CreateContactForm>): Promise<CompanyContact> {
    const { data, error } = await this.supabase
      .from('company_contacts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteContact(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('company_contacts')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  // Company Contracts
  async getContracts(orgId: string, filters?: ContractFilters, page = 1, limit = 50) {
    let query = this.supabase
      .from('company_contracts')
      .select(`
        *,
        company:companies(id, name, industry)
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
      query = query.lte('end_date', thirtyDaysFromNow.toISOString());
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by end_date
    query = query.order('end_date', { ascending: true });

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async createContract(orgId: string, contractData: CreateContractForm): Promise<CompanyContract> {
    const { data, error } = await this.supabase
      .from('company_contracts')
      .insert({
        ...contractData,
        organization_id: orgId,
        status: 'draft',
        currency: contractData.currency || 'USD'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateContract(id: string, orgId: string, updates: Partial<CreateContractForm>): Promise<CompanyContract> {
    const { data, error } = await this.supabase
      .from('company_contracts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteContract(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('company_contracts')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  // Company Qualifications
  async getQualifications(orgId: string, filters?: QualificationFilters, page = 1, limit = 50) {
    let query = this.supabase
      .from('company_qualifications')
      .select(`
        *,
        company:companies(id, name, industry)
      `, { count: 'exact' })
      .eq('organization_id', orgId);

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,issuing_authority.ilike.%${filters.search}%`);
    }
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    if (filters?.type?.length) {
      query = query.in('type', filters.type);
    }
    if (filters?.verification_status?.length) {
      query = query.in('verification_status', filters.verification_status);
    }
    if (filters?.issuing_authority?.length) {
      query = query.in('issuing_authority', filters.issuing_authority);
    }
    if (filters?.expiring_soon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.lte('expiry_date', thirtyDaysFromNow.toISOString());
    }
    if (filters?.issue_date_from) {
      query = query.gte('issue_date', filters.issue_date_from);
    }
    if (filters?.issue_date_to) {
      query = query.lte('issue_date', filters.issue_date_to);
    }
    if (filters?.expiry_date_from) {
      query = query.gte('expiry_date', filters.expiry_date_from);
    }
    if (filters?.expiry_date_to) {
      query = query.lte('expiry_date', filters.expiry_date_to);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by expiry_date
    query = query.order('expiry_date', { ascending: true });

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async createQualification(orgId: string, qualificationData: CreateQualificationForm): Promise<CompanyQualification> {
    const { data, error } = await this.supabase
      .from('company_qualifications')
      .insert({
        ...qualificationData,
        organization_id: orgId,
        verification_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQualification(id: string, orgId: string, updates: Partial<CreateQualificationForm>): Promise<CompanyQualification> {
    const { data, error } = await this.supabase
      .from('company_qualifications')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQualification(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('company_qualifications')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  // Company Ratings
  async getRatings(orgId: string, filters?: RatingFilters, page = 1, limit = 50) {
    let query = this.supabase
      .from('company_ratings')
      .select(`
        *,
        company:companies(id, name, industry),
        rater:users(id, first_name, last_name)
      `, { count: 'exact' })
      .eq('organization_id', orgId);

    // Apply filters
    if (filters?.search) {
      query = query.or(`review.ilike.%${filters.search}%`);
    }
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters?.category?.length) {
      query = query.in('category', filters.category);
    }
    if (filters?.rating_min) {
      query = query.gte('rating', filters.rating_min);
    }
    if (filters?.rating_max) {
      query = query.lte('rating', filters.rating_max);
    }
    if (filters?.recommendation?.length) {
      query = query.in('recommendation', filters.recommendation);
    }
    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }
    if (filters?.created_from) {
      query = query.gte('created_at', filters.created_from);
    }
    if (filters?.created_to) {
      query = query.lte('created_at', filters.created_to);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by created_at
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async createRating(orgId: string, userId: string, ratingData: CreateRatingForm): Promise<CompanyRating> {
    const { data, error } = await this.supabase
      .from('company_ratings')
      .insert({
        ...ratingData,
        organization_id: orgId,
        rater_user_id: userId,
        is_public: ratingData.is_public ?? true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRating(id: string, orgId: string, updates: Partial<CreateRatingForm>): Promise<CompanyRating> {
    const { data, error } = await this.supabase
      .from('company_ratings')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRating(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('company_ratings')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  async importCompanies(orgId: string, records: Partial<Company>[]) {
    if (!records.length) {
      return { success: true, inserted: 0 };
    }

    const payload = records.map((record) => ({
      ...record,
      organization_id: orgId
    }));

    const { error, count } = await this.supabase
      .from('companies')
      .insert(payload, { count: 'exact' });

    if (error) {
      return {
        success: false,
        inserted: 0,
        errors: [error.message]
      } as const;
    }

    return {
      success: true,
      inserted: count ?? payload.length
    } as const;
  }

  // Statistics
  async getCompanyStats(orgId: string): Promise<CompanyStats> {
    const [
      { data: companies },
      { data: contracts },
      { data: qualifications },
      { data: ratings }
    ] = await Promise.all([
      this.supabase.from('companies').select('status').eq('organization_id', orgId),
      this.supabase.from('company_contracts').select('status, end_date').eq('organization_id', orgId),
      this.supabase.from('company_qualifications').select('verification_status, expiry_date').eq('organization_id', orgId),
      this.supabase.from('company_ratings').select('rating').eq('organization_id', orgId)
    ]);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return {
      totalCompanies: companies?.length || 0,
      activeCompanies: companies?.filter(c => c.status === 'active').length || 0,
      pendingCompanies: companies?.filter(c => c.status === 'pending').length || 0,
      blacklistedCompanies: companies?.filter(c => c.status === 'blacklisted').length || 0,
      totalContracts: contracts?.length || 0,
      activeContracts: contracts?.filter(c => c.status === 'active').length || 0,
      expiringContracts: contracts?.filter(c => {
        if (!c.end_date) return false;
        return new Date(c.end_date) <= thirtyDaysFromNow;
      }).length || 0,
      totalQualifications: qualifications?.length || 0,
      expiringQualifications: qualifications?.filter(q => {
        if (!q.expiry_date) return false;
        return new Date(q.expiry_date) <= thirtyDaysFromNow;
      }).length || 0,
      averageRating: ratings?.length ? 
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0,
      totalRatings: ratings?.length || 0
    };
  }

  // Export functionality
  async exportData(orgId: string, type: 'companies' | 'contracts' | 'qualifications' | 'ratings', options: ExportOptions) {
    let data: unknown[] = [];

    switch (type) {
      case 'companies':
        const companiesResult = await this.getCompanies(orgId, options.filters, 1, 10000);
        data = companiesResult.data;
        break;
      case 'contracts':
        const contractsResult = await this.getContracts(orgId, options.filters, 1, 10000);
        data = contractsResult.data;
        break;
      case 'qualifications':
        const qualificationsResult = await this.getQualifications(orgId, options.filters, 1, 10000);
        data = qualificationsResult.data;
        break;
      case 'ratings':
        const ratingsResult = await this.getRatings(orgId, options.filters, 1, 10000);
        data = ratingsResult.data;
        break;
    }

    // Filter fields if specified
    if (options.fields?.length) {
      data = data.map(item => {
        const filtered: unknown = {};
        options.fields!.forEach(field => {
          if (item[field] !== undefined) {
            filtered[field] = item[field];
          }
        });
        return filtered;
      });
    }

    return data;
  }

  // Utility methods
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDaysUntilExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
