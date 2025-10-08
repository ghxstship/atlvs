'use client';

import { useState, useEffect, useCallback } from 'react';
import { Drawer } from '@ghxstship/ui';
import { CompaniesService } from './lib/companies-service';
import type { Company } from './types';

// Type definitions for ATLVS DataViews
type DataRecord = Record<string, unknown>;

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'url' | 'email' | 'date' | 'number' | 'currency';
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataViewConfig {
  id: string;
  name: string;
  viewType: string;
  defaultView: string;
  fields: FieldConfig[];
  data: DataRecord[];
  loading?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, unknown>) => void;
  onSort?: (sorts: unknown[]) => void;
  onRefresh?: () => void;
  onExport?: (data: DataRecord[], format: string) => void;
  onImport?: (data: unknown[]) => void;
  onCreate?: () => void;
  onEdit?: (record: DataRecord) => void;
  onDelete?: (ids: string[]) => void;
}

interface CompaniesClientProps {
  orgId: string;
  userId: string;
  userEmail: string;
}

const companiesService = new CompaniesService();

export default function CompaniesClient({ orgId, userId: _userId, userEmail: _userEmail }: CompaniesClientProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  // Field configuration for companies
  const fieldConfig: FieldConfig[] = [
    {
      key: 'name',
      label: 'Company Name',
      type: 'text' as const,
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea' as const,
      required: false,
      sortable: false,
      filterable: true
    },
    {
      key: 'industry',
      label: 'Industry',
      type: 'select' as const,
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'website',
      label: 'Website',
      type: 'url' as const,
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email' as const,
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'phone',
      label: 'Phone',
      type: 'text' as const,
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'address',
      label: 'Address',
      type: 'text' as const,
      required: false,
      sortable: false,
      filterable: true
    },
    {
      key: 'city',
      label: 'City',
      type: 'text' as const,
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'state',
      label: 'State',
      type: 'text' as const,
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'country',
      label: 'Country',
      type: 'text' as const,
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'created_at',
      label: 'Created Date',
      type: 'date' as const,
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      type: 'date' as const,
      required: false,
      sortable: true,
      filterable: true
    }
  ];

  // Real Supabase data loading function
  const loadCompaniesData = useCallback(async (currentFilters?: Record<string, unknown>): Promise<Company[]> => {
    try {
      setError(null);
      const result = await companiesService.getCompanies(orgId, {
        search: currentFilters?.search as string,
        status: currentFilters?.status ? [currentFilters.status as string] : undefined,
        industry: currentFilters?.industry ? [currentFilters.industry as string] : undefined,
        size: currentFilters?.size ? [currentFilters.size as string] : undefined
      });
      return result.data || [];
    } catch (err) {
      console.error('Error loading companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load companies');
      return [];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // Load data on mount and when filters change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await loadCompaniesData(filters);
      setCompanies(data);
      setLoading(false);
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, loadCompaniesData]);

  // DataView configuration (for future ATLVS integration)
  const dataViewConfig: DataViewConfig = {
    id: 'companies-view',
    name: 'Companies Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields: fieldConfig,
    data: companies,
    loading,
    onSearch: (query: string) => {
      setFilters(prev => ({ ...prev, search: query }));
    },
    onFilter: (newFilters: Record<string, unknown>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    onSort: (_sorts: unknown[]) => {
      // TODO: Implement sort logic
    },
    onRefresh: () => {
      setFilters({}); // Clear filters and reload
    },
    onExport: (_data: DataRecord[], _format: string) => {
      // TODO: Implement export logic
    },
    onImport: (_data: unknown[]) => {
      // TODO: Implement import logic
    },
    onCreate: () => {
      // TODO: Implement create logic
    },
    onEdit: (_record: DataRecord) => {
      // TODO: Implement edit logic
    },
    onDelete: (_ids: string[]) => {
      // TODO: Implement delete logic
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Companies</h1>
          <div className="flex gap-2">
            {/* TODO: Add view switcher and action buttons */}
          </div>
        </div>

        {/* Data Display - Using available components */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading companies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => {
              const companyId = typeof company.id === 'string' ? company.id : String(company.id);
              const companyName = typeof company.name === 'string' ? company.name : 'Untitled';
              const companyDesc = typeof company.description === 'string' ? company.description : '';
              const companyIndustry = typeof company.industry === 'string' ? company.industry : 'N/A';
              const companyStatus = typeof company.status === 'string' ? company.status : 'unknown';
              
              return (
                <div key={companyId} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{companyName}</h3>
                  <p className="text-sm text-gray-600">{companyDesc}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {companyIndustry}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 rounded">
                      {companyStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Universal Drawer for CRUD operations */}
        <Drawer title="Details" open={false} onClose={() => {}}>
          <div className="p-4">
            <p className="text-gray-600">Company details will be displayed here.</p>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
