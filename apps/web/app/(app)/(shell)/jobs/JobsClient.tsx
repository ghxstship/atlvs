'use client';


import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Drawer,
  type DataRecord,
  StateManagerProvider,
  DataViewProvider,
  ViewSwitcher,
  DataActions,
  DataGrid,
  KanbanBoard,
  CalendarView,
  ListView
} from '@ghxstship/ui';

// Mock Supabase client for now
const sb = {
  from: () => ({
    select: () => ({ eq: () => ({ order: () => ({ data: [], error: null }) }) })
  })
};

// Mock organization hook
const useOrganization = () => ({ organization: { id: 'mock-org' } });

export default function JobsClient({ orgId }: { orgId: string }) {
  const t = useTranslations('jobs');
  const [data, setData] = useState<DataRecord[]>([]);

  // Field configuration for jobs/opportunities data
  const fieldConfig: FieldConfig[] = [
    {
      key: 'title',
      label: 'Job Title',
      type: 'text',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      sortable: false,
      filterable: true
    },
    {
      key: 'type',
      label: 'Job Type',
      type: 'select',
      required: true,
      sortable: true,
      filterable: true,
      options: [
        { value: 'construction', label: 'Construction' },
        { value: 'technical', label: 'Technical' },
        { value: 'creative', label: 'Creative' },
        { value: 'logistics', label: 'Logistics' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      key: 'budget',
      label: 'Budget',
      type: 'number',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'select',
      required: true,
      sortable: true,
      filterable: true,
      options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' },
        { value: 'CAD', label: 'CAD' }
      ]
    },
    {
      key: 'deadline',
      label: 'Deadline',
      type: 'date',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      required: false,
      sortable: true,
      filterable: true
    },
    {
      key: 'requirements',
      label: 'Requirements',
      type: 'textarea',
      required: false,
      sortable: false,
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
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'closed', label: 'Closed' },
        { value: 'cancelled', label: 'Cancelled' }
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
  const loadJobsData = async (): Promise<DataRecord[]> => {
    // In a real implementation, this would fetch from Supabase
    return [
      {
        id: '1',
        title: 'Senior Construction Manager',
        description: 'Lead construction team for major infrastructure project',
        type: 'construction',
        budget: 85000,
        currency: 'USD',
        deadline: '2024-03-15',
        location: 'Los Angeles, CA',
        requirements: 'Minimum 5 years experience, PMP certification preferred',
        status: 'open',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        title: 'Video Production Specialist',
        description: 'Create high-quality video content for marketing campaigns',
        type: 'creative',
        budget: 65000,
        currency: 'USD',
        deadline: '2024-02-28',
        location: 'Remote',
        requirements: 'Adobe Creative Suite expertise, portfolio required',
        status: 'in_progress',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-18T16:45:00Z'
      },
      {
        id: '3',
        title: 'Logistics Coordinator',
        description: 'Manage supply chain and transportation logistics',
        type: 'logistics',
        budget: 55000,
        currency: 'USD',
        deadline: '2024-04-01',
        location: 'Chicago, IL',
        requirements: 'Experience with logistics software, strong organizational skills',
        status: 'open',
        created_at: '2024-01-12T11:30:00Z',
        updated_at: '2024-01-19T13:15:00Z'
      }
    ];
  };

  // Data view configuration
  const dataViewConfig: DataViewConfig = {
    id: 'jobs-opportunities',
    name: 'Job Opportunities',
    viewType: 'grid',
    defaultView: 'grid',
    fields: fieldConfig,
    data: data,
    onSearch: (query: string) => {
      console.log('Search:', query);
      // Implement search logic
    },
    onFilter: (filters: any) => {
      console.log('Filter:', filters);
      // Implement filter logic
    },
    onSort: (sorts: any) => {
      console.log('Sort:', sorts);
      // Implement sort logic
    },
    onRefresh: () => {
      console.log('Refresh data');
      loadData();
    },
    onExport: (data, format) => {
      console.log('Export:', format, data);
      // Implement export logic
    },
    onImport: (importData: any) => {
      console.log('Import:', importData);
      // Implement import logic
    }
  };

  const loadData = async () => {
    try {
      const jobsData = await loadJobsData();
      setData(jobsData);
    } catch (error) {
      console.error('Error loading jobs data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  return (
    <div className="h-full w-full">
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
                { id: 'open', title: 'Open' },
                { id: 'in_progress', title: 'In Progress' },
                { id: 'closed', title: 'Closed' },
                { id: 'cancelled', title: 'Cancelled' }
              ]}
              statusField="status"
              titleField="title"
            />
            <CalendarView 
              startDateField="deadline"
              titleField="title"
            />
            <ListView 
              titleField="title"
              subtitleField="description"
            />

            {/* Universal Drawer for CRUD operations */}
            <Drawer title="Details"
              open={false}
              onClose={() => {}}
            >
              <div className="p-md">
                <p>Job details will be implemented here.</p>
              </div>
            </Drawer>
          </div>
        </DataViewProvider>
      </StateManagerProvider>
    </div>
  );
}
