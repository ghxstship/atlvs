'use client';

import { useEffect, useState } from 'react';
import { 
  DataViewProvider, 
  DataGrid, 
  KanbanBoard, 
  CalendarView, 
  ListView,
  ViewSwitcher, 
  DataActions,
  UniversalDrawer,
  StateManagerProvider,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord
} from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

export default function PeopleClient({ orgId }: { orgId: string }) {
  const t = useTranslations('people');
  const sb = createBrowserClient();
  const [loading, setLoading] = useState(false);
  const [peopleData, setPeopleData] = useState<DataRecord[]>([]);

  useEffect(() => {
    loadPeopleData();
  }, [orgId]);

  async function loadPeopleData() {
    setLoading(true);
    try {
      const { data } = await sb
        .from('people')
        .select('*')
        .eq('organization_id', orgId)
        .order('last_name', { ascending: true });
      
      setPeopleData(data || []);
    } catch (error) {
      console.error('Error loading people data:', error);
    } finally {
      setLoading(false);
    }
  }

  // ATLVS DataViews field configuration
  const fields: FieldConfig[] = [
    {
      key: 'first_name',
      label: t('firstName'),
      type: 'text',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'last_name',
      label: t('lastName'),
      type: 'text',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      label: t('email'),
      type: 'email',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'phone',
      label: t('phone'),
      type: 'phone',
      sortable: true
    },
    {
      key: 'role',
      label: t('role'),
      type: 'text',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'department',
      label: t('department'),
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      key: 'location',
      label: t('location'),
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      key: 'start_date',
      label: t('startDate'),
      type: 'date',
      sortable: true
    },
    {
      key: 'skills',
      label: t('skills'),
      type: 'textarea',
      rows: 3
    },
    {
      key: 'bio',
      label: t('bio'),
      type: 'textarea',
      rows: 4
    },
    {
      key: 'status',
      label: t('status'),
      type: 'select',
      options: [
        { value: 'active', label: t('status.active') },
        { value: 'inactive', label: t('status.inactive') },
        { value: 'pending', label: t('status.pending') }
      ],
      filterable: true,
      sortable: true,
      defaultValue: 'active'
    }
  ];

  // ATLVS DataViews configuration
  const peopleConfig: DataViewConfig = {
    id: 'people-dataviews',
    name: t('title'),
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data: peopleData,
    pagination: {
      page: 1,
      pageSize: 25,
      total: peopleData.length
    },
    onSearch: (query: string) => {
      console.log('Search:', query);
      // Implement search logic
    },
    onFilter: (filters) => {
      console.log('Filter:', filters);
      // Implement filter logic
    },
    onSort: (sorts) => {
      console.log('Sort:', sorts);
      // Implement sort logic
    },
    onRefresh: () => {
      loadPeopleData();
    },
    onExport: (data, format) => {
      console.log('Export:', format, data);
      // Implement export logic
    },
    onImport: (data) => {
      console.log('Import:', data);
      // Implement import logic
    }
  };

  const configWithData = {
    ...peopleConfig,
    data: peopleData
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <DataViewProvider config={configWithData}>
        <StateManagerProvider>
          <div className="space-y-4">
            <ViewSwitcher />
            <DataActions />
            
            <DataGrid />
            
            <KanbanBoard 
              columns={[
                { id: 'active', title: t('status.active'), color: 'green' },
                { id: 'inactive', title: t('status.inactive'), color: 'gray' },
                { id: 'pending', title: t('status.pending'), color: 'yellow' }
              ]}
              statusField="status"
              titleField="first_name"
            />
            
            <CalendarView 
              startDateField="start_date"
              titleField="first_name"
            />
            
            <ListView 
              titleField="first_name"
            />
            
            <UniversalDrawer 
              open={false}
              onClose={() => {}}
              record={null}
              fields={fields}
              mode="view"
            />
          </div>
        </StateManagerProvider>
      </DataViewProvider>
    </div>
  );
}
