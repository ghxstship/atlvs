'use client';

import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  DataViewProvider, 
  StateManagerProvider, 
  DataGrid, 
  KanbanBoard, 
  CalendarView, 
  ListView, 
  ViewSwitcher, 
  DataActions, 
  Drawer 
} from '@ghxstship/ui';
import type { 
  FieldConfig, 
  DataRecord, 
  DataViewConfig 
} from '@ghxstship/ui/components/DataViews/types';

export default function CompaniesClient({ orgId }: { orgId: string }) {
  const t = useTranslations('companies');
  const sb = createBrowserClient();

  // Field configuration for companies
  const fieldConfig: FieldConfig[] = [
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

  // Mock data loading function
  const loadCompaniesData = async (): Promise<DataRecord[]> => {
    // In a real implementation, this would fetch from Supabase
    return [
      {
        id: '1',
        name: 'Stellar Construction Co.',
        description: 'Leading construction company specializing in commercial buildings',
        industry: 'construction',
        website: 'https://stellarconstruction.com',
        email: 'contact@stellarconstruction.com',
        phone: '+1-555-0123',
        address: '123 Builder Street',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        name: 'TechFlow Solutions',
        description: 'Innovative technology solutions for modern businesses',
        industry: 'technology',
        website: 'https://techflow.com',
        email: 'hello@techflow.com',
        phone: '+1-555-0456',
        address: '456 Tech Avenue',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        status: 'active',
        created_at: '2024-01-10T09:15:00Z',
        updated_at: '2024-01-25T11:45:00Z'
      },
      {
        id: '3',
        name: 'Global Logistics Inc.',
        description: 'Worldwide shipping and logistics services',
        industry: 'logistics',
        website: 'https://globallogistics.com',
        email: 'info@globallogistics.com',
        phone: '+1-555-0789',
        address: '789 Cargo Way',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        status: 'pending',
        created_at: '2024-01-05T16:20:00Z',
        updated_at: '2024-01-15T13:10:00Z'
      }
    ];
  };

  // DataView configuration
  const dataViewConfig: DataViewConfig = {
    id: 'companies-view',
    name: 'Companies Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields: fieldConfig,
    data: [],
    onSearch: (query: string) => {
      console.log('Search companies:', query);
    },
    onFilter: (filters) => {
      console.log('Filter companies:', filters);
    },
    onSort: (sorts) => {
      console.log('Sort companies:', sorts);
    },
    onRefresh: () => {
      console.log('Refresh companies data');
      loadCompaniesData();
    },
    onExport: (data, format) => {
      console.log('Export companies:', format, data);
    },
    onImport: (data) => {
      console.log('Import companies:', data);
    }
  };

  return (
    <div className="h-full">
      <StateManagerProvider>
        <DataViewProvider config={dataViewConfig}>
          <div className="flex flex-col h-full space-y-4">
            {/* View Switcher and Actions */}
            <div className="flex items-center justify-between">
              <ViewSwitcher />
              <DataActions />
            </div>

            {/* Data Views */}
            <DataGrid />
            <KanbanBoard 
              columns={[
                { id: 'active', title: 'Active', color: '#10b981' },
                { id: 'inactive', title: 'Inactive', color: '#6b7280' },
                { id: 'pending', title: 'Pending', color: '#f59e0b' },
                { id: 'blacklisted', title: 'Blacklisted', color: '#ef4444' }
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
              <div className="p-6">
                <p className="text-muted-foreground">Company details will be displayed here.</p>
              </div>
            </Drawer>
          </div>
        </DataViewProvider>
      </StateManagerProvider>
    </div>
  );
}
