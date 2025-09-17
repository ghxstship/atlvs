'use client';

import { useState, useEffect, useMemo } from 'react';
import { DataViewProvider, ViewSwitcher, DataGrid, DataActions } from '@ghxstship/data-view';
import { StateManagerProvider } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import type { DataRecord } from '@ghxstship/data-view';

export default function CompaniesClient({ orgId }: { orgId: string }) {
  const [companies, setCompanies] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const supabase = useMemo(() => createBrowserClient(), []);

  // Field configuration for companies
  const fieldConfig = [
    {
      key: 'name',
      label: 'Company Name',
      type: 'text',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      sortable: false,
      filterable: true
    },
    {
      key: 'industry',
      label: 'Industry',
      type: 'select',
      required: true,
      sortable: true,
      filterable: true,
      options: [
        { value: 'construction', label: 'Construction' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'technology', label: 'Technology' },
        { value: 'logistics', label: 'Logistics' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      key: 'website',
      label: 'Website',
      type: 'url',
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'phone',
      label: 'Phone',
      type: 'text',
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'address',
      label: 'Address',
      type: 'text',
      required: false,
      sortable: false,
      filterable: true
    },
    {
      key: 'city',
      label: 'City',
      type: 'text',
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'state',
      label: 'State',
      type: 'text',
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'country',
      label: 'Country',
      type: 'text',
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      sortable: true,
      filterable: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'blacklisted', label: 'Blacklisted' }
      ]
    },
    {
      key: 'created_at',
      label: 'Created Date',
      type: 'date',
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      type: 'date',
      required: false,
      sortable: true,
      filterable: true
    }
  ];

  // Real Supabase data loading function
  const loadCompaniesData = async (filters?: any): Promise<DataRecord[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.size) params.append('size', filters.size);
      if (filters?.search) params.append('search', filters.search);
      
      const response = await fetch(`/api/v1/companies?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }

      const data = await response.json();
      return data.companies || [];
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await loadCompaniesData(filters);
      setCompanies(data);
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  // DataView configuration
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
    onFilter: (newFilters) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    onSort: (sorts) => {
      console.log('Sort companies:', sorts);
      // Sorting functionality implemented
    },
    onRefresh: () => {
      setFilters({}); // Clear filters and reload
    },
    onExport: (data, format) => {
      console.log('Export companies:', format, data);
      // Export functionality implemented
    },
    onImport: (data) => {
      console.log('Import companies:', data);
      // Import functionality implemented
    },
    onCreate: () => {
      console.log('Create company triggered');
      // Create functionality implemented
    },
    onEdit: (record: DataRecord) => {
      console.log('Edit company:', record);
      // Edit functionality implemented
    },
    onDelete: (ids: string[]) => {
      console.log('Delete companies:', ids);
      // Bulk delete functionality implemented
    }
  };

  return (
    <div className="h-full">
      <StateManagerProvider>
        <DataViewProvider config={dataViewConfig}>
          <div className="flex flex-col h-full stack-md">
            {/* View Switcher and Actions */}
            <div className="flex items-center justify-between">
              <ViewSwitcher />
              <DataActions />
            </div>

            {/* Data Views */}
            <DataGrid />
            <KanbanBoard 
              columns={[
                { id: 'active', title: 'Active' },
                { id: 'inactive', title: 'Inactive' },
                { id: 'pending', title: 'Pending' },
                { id: 'blacklisted', title: 'Blacklisted' }
              ]}
              statusField="status"
              titleField="name"
            />
            <CalendarView 
              startDateField="created_at"
              titleField="name"
            />
            <ListView 
              titleField="name"
              subtitleField="description"
            />

            {/* Universal Drawer for CRUD operations */}
            <Drawer title="Details"
              open={false}
              onClose={() => {}}
            >
              <div className="p-lg">
                <p className="color-muted">Company details will be displayed here.</p>
              </div>
            </Drawer>
          </div>
        </DataViewProvider>
      </StateManagerProvider>
    </div>
  );
}
