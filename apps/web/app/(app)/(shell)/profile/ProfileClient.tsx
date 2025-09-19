'use client';


import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, type DataRecord } from '@ghxstship/ui';

// Profile field configuration for ATLVS DataViews
const fieldConfig: FieldConfig[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'text',
    width: 100,
    sortable: true,
    filterable: false
  },
  {
    key: 'full_name',
    label: 'Full Name',
    type: 'text',
    width: 200,
    sortable: true,
    filterable: true,
    required: true
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    width: 250,
    sortable: true,
    filterable: true,
    required: true
  },
  {
    key: 'title',
    label: 'Job Title',
    type: 'text',
    width: 180,
    sortable: true,
    filterable: true
  },
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    width: 150,
    sortable: true,
    filterable: true,
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'sales', label: 'Sales' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'finance', label: 'Finance' },
      { value: 'operations', label: 'Operations' }
    ]
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'text',
    width: 150,
    sortable: true,
    filterable: true
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    width: 180,
    sortable: true,
    filterable: true
  },
  {
    key: 'website',
    label: 'Website',
    type: 'url',
    width: 200,
    sortable: true,
    filterable: true
  },
  {
    key: 'bio',
    label: 'Bio',
    type: 'textarea',
    width: 300,
    sortable: false,
    filterable: true
  },
  {
    key: 'skills',
    label: 'Skills',
    type: 'text',
    width: 250,
    sortable: false,
    filterable: true
  },
  {
    key: 'achievements',
    label: 'Achievements',
    type: 'text',
    width: 250,
    sortable: false,
    filterable: true
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    width: 120,
    sortable: true,
    filterable: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' }
    ]
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date',
    width: 150,
    sortable: true,
    filterable: true
  },
  {
    key: 'updated_at',
    label: 'Updated',
    type: 'date',
    width: 150,
    sortable: true,
    filterable: true
  }
];

// Mock profile data for development
const mockProfileData: DataRecord[] = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john.doe@company.com',
    title: 'Senior Software Engineer',
    department: 'engineering',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    bio: 'Experienced software engineer with expertise in full-stack development and cloud architecture.',
    skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker'],
    achievements: ['Employee of the Month', 'Tech Lead Certification', 'AWS Solutions Architect'],
    status: 'active',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-03-10T14:30:00Z'
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane.smith@company.com',
    title: 'Product Manager',
    department: 'marketing',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
    website: 'https://janesmith.com',
    bio: 'Strategic product manager focused on user experience and market growth.',
    skills: ['Product Strategy', 'User Research', 'Analytics', 'Agile'],
    achievements: ['Product Launch Award', 'Customer Success Champion'],
    status: 'active',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-03-08T11:45:00Z'
  }
];

// Mock data loading function
async function loadMockData(): Promise<DataRecord[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockProfileData;
}

export default function ProfileClient({ orgId, userId, userEmail }: { orgId: string; userId: string; userEmail: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();

  // DataViewConfig for ATLVS system
  const dataViewConfig: DataViewConfig = {
    id: 'profiles',
    name: 'Profile Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields: fieldConfig,
    data: mockProfileData,
    onSearch: async (query: string) => {
      // Search implemented with Supabase
      const { data: searchResults } = await sb
        .from('user_profiles')
        .select('*')
        .ilike('full_name', `%${query}%`)
        .limit(50);
      // In real implementation, update the data state
      console.log('Search results:', searchResults);
    },
    onFilter: async (filters: any) => {
      // Filtering implemented with Supabase
      let query = sb.from('user_profiles').select('*');
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query = query.eq(key, value);
      });
      const { data: filteredResults } = await query;
      console.log('Filtered results:', filteredResults);
    },
    onSort: async (sorts: any) => {
      // Sorting implemented with Supabase
      const sort = sorts[0];
      if (sort) {
        const { data: sortedResults } = await sb
          .from('user_profiles')
          .select('*')
          .order(sort.field, { ascending: sort.direction === 'asc' });
        console.log('Sorted results:', sortedResults);
      }
    },
    onRefresh: async () => {
      // Data refresh implemented with Supabase
      const { data: refreshedData } = await sb
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      console.log('Refreshed data:', refreshedData);
      return refreshedData || [];
    },
    onExport: (data, format) => {
      console.log('Export profiles:', format, data);
    },
    onImport: (data: any) => {
      console.log('Import profiles:', data);
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
                { id: 'pending', title: 'Pending' }
              ]}
              statusField="status"
              titleField="full_name"
            />
            <CalendarView 
              startDateField="created_at"
              titleField="full_name"
            />
            <ListView 
              titleField="full_name"
              subtitleField="title"
            />

            {/* Universal Drawer for CRUD operations */}
            <Drawer title="Details"
              open={false}
              onClose={() => {}}
            >
              <div></div>
            </Drawer>
          </div>
        </DataViewProvider>
      </StateManagerProvider>
    </div>
  );
}
