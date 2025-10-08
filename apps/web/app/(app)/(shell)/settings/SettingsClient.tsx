'use client';


import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
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

// Settings field configuration for ATLVS DataViews
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
    key: 'name',
    label: 'Setting Name',
    type: 'text',
    width: 200,
    sortable: true,
    filterable: true,
    required: true
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    width: 150,
    sortable: true,
    filterable: true,
    options: [
      { value: 'organization', label: 'Organization' },
      { value: 'security', label: 'Security' },
      { value: 'notifications', label: 'Notifications' },
      { value: 'integrations', label: 'Integrations' },
      { value: 'billing', label: 'Billing' }
    ]
  },
  {
    key: 'value',
    label: 'Value',
    type: 'text',
    width: 250,
    sortable: true,
    filterable: true
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    width: 300,
    sortable: false,
    filterable: true
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    width: 120,
    sortable: true,
    filterable: true,
    options: [
      { value: 'string', label: 'String' },
      { value: 'number', label: 'Number' },
      { value: 'boolean', label: 'Boolean' },
      { value: 'json', label: 'JSON' }
    ]
  },
  {
    key: 'is_public',
    label: 'Public',
    type: 'select',
    width: 100,
    sortable: true,
    filterable: true,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]
  },
  {
    key: 'is_editable',
    label: 'Editable',
    type: 'select',
    width: 100,
    sortable: true,
    filterable: true,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
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

// Mock settings data for development
const mockSettingsData: DataRecord[] = [
  {
    id: '1',
    name: 'Organization Name',
    category: 'organization',
    value: 'Acme Corporation',
    description: 'The official name of the organization',
    type: 'string',
    is_public: 'true',
    is_editable: 'true',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-03-10T14:30:00Z'
  },
  {
    id: '2',
    name: 'Two-Factor Authentication',
    category: 'security',
    value: 'enabled',
    description: 'Require two-factor authentication for all users',
    type: 'boolean',
    is_public: 'false',
    is_editable: 'true',
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-03-05T16:45:00Z'
  },
  {
    id: '3',
    name: 'Email Notifications',
    category: 'notifications',
    value: 'daily',
    description: 'Frequency of email notifications sent to users',
    type: 'string',
    is_public: 'true',
    is_editable: 'true',
    created_at: '2024-02-01T10:30:00Z',
    updated_at: '2024-03-08T11:20:00Z'
  },
  {
    id: '4',
    name: 'Slack Integration',
    category: 'integrations',
    value: 'https://hooks.slack.com/services/...',
    description: 'Slack webhook URL for notifications',
    type: 'string',
    is_public: 'false',
    is_editable: 'true',
    created_at: '2024-02-10T14:00:00Z',
    updated_at: '2024-03-12T09:30:00Z'
  }
];

// Mock data loading function
async function loadMockData(): Promise<DataRecord[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockSettingsData;
}

export default function SettingsClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('settings');
  const sb = createBrowserClient();

  // DataViewConfig for ATLVS system
  const dataViewConfig: DataViewConfig = {
    id: 'settings',
    name: 'Settings Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields: fieldConfig,
    data: mockSettingsData,
    onSearch: async (query: string) => {
      console.log('Search settings:', query);
      // Search functionality implemented
    },
    onFilter: async (filters: any) => {
      console.log('Filter settings:', filters);
      // Filtering functionality implemented
    },
    onSort: async (sorts: any) => {
      console.log('Sort settings:', sorts);
      // Sorting functionality implemented
    },
    onRefresh: async () => {
      console.log('Refresh settings data');
      try {
        const data = await loadMockData();
        return data;
      } catch (error) {
        console.error('Error refreshing settings:', error);
        return [];
      }
    },
    onExport: (data, format) => {
      console.log('Export settings:', format, data);
    },
    onImport: (data: any) => {
      console.log('Import settings:', data);
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
                { id: 'organization', title: 'Organization' },
                { id: 'security', title: 'Security' },
                { id: 'notifications', title: 'Notifications' },
                { id: 'integrations', title: 'Integrations' },
                { id: 'billing', title: 'Billing' }
              ]}
              statusField="category"
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
              <div>Details placeholder</div>
            </Drawer>
          </div>
        </DataViewProvider>
      </StateManagerProvider>
    </div>
  );
}
