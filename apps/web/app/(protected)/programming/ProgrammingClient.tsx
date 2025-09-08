'use client';

import { useEffect, useState } from 'react';
import { 
  DataViewProvider, 
  StateManagerProvider, 
  DataGrid, 
  KanbanBoard, 
  CalendarView, 
  ListView, 
  ViewSwitcher, 
  DataActions, 
  UniversalDrawer,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord
} from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

export default function ProgrammingClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Define field configuration for programming data
  const fields: FieldConfig[] = [
    {
      key: 'name',
      label: t('name'),
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      key: 'description',
      label: t('description'),
      type: 'text',
      sortable: false,
      filterable: true
    },
    {
      key: 'type',
      label: t('type'),
      type: 'select',
      sortable: true,
      filterable: true,
      options: [
        { value: 'event', label: t('event') },
        { value: 'space', label: t('space') }
      ]
    },
    {
      key: 'event_date',
      label: t('eventDate'),
      type: 'date',
      sortable: true,
      filterable: true
    },
    {
      key: 'start_time',
      label: t('startTime'),
      type: 'text',
      sortable: true,
      filterable: false
    },
    {
      key: 'end_time',
      label: t('endTime'),
      type: 'text',
      sortable: true,
      filterable: false
    },
    {
      key: 'location',
      label: t('location'),
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      key: 'capacity',
      label: t('capacity'),
      type: 'number',
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: t('status'),
      type: 'select',
      sortable: true,
      filterable: true,
      options: [
        { value: 'draft', label: t('draft') },
        { value: 'published', label: t('published') },
        { value: 'cancelled', label: t('cancelled') }
      ]
    },
    {
      key: 'record_type',
      label: t('recordType'),
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      key: 'created_at',
      label: t('createdAt'),
      type: 'date',
      sortable: true,
      filterable: false
    }
  ];

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      // Load events
      const { data: eventsData, error: eventsError } = await sb
        .from('events')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      
      if (eventsError) throw eventsError;
      
      // Load spaces
      const { data: spacesData, error: spacesError } = await sb
        .from('spaces')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      
      if (spacesError) throw spacesError;
      
      // Combine data with record_type field
      const combinedData = [
        ...(eventsData || []).map(event => ({ ...event, record_type: 'event' })),
        ...(spacesData || []).map(space => ({ ...space, record_type: 'space' }))
      ];
      
      setData(combinedData);
    } catch (error) {
      console.error('Error loading programming data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configure DataView
  const config: DataViewConfig = {
    id: 'programming-data',
    name: t('programming'),
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data,
    
    // Callback functions (placeholder implementations)
    onSearch: (query: string) => {
      console.log('Search:', query);
    },
    onFilter: (filters: any[]) => {
      console.log('Filter:', filters);
    },
    onSort: (sorts: any[]) => {
      console.log('Sort:', sorts);
    },
    onRefresh: () => {
      loadData();
    },
    onExport: (data: any[], format: string) => {
      console.log('Export:', format, data);
    },
    onImport: (data: any[]) => {
      console.log('Import:', data);
    }
  };

  return (
    <div className="space-y-4">
      <DataViewProvider config={config}>
        <StateManagerProvider>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{t('programming')}</h1>
              <div className="flex items-center gap-2">
                <ViewSwitcher />
                <DataActions />
              </div>
            </div>

            {/* Data Views */}
            <DataGrid />
            
            <KanbanBoard 
              columns={[
                { id: 'draft', title: t('draft') },
                { id: 'published', title: t('published') },
                { id: 'cancelled', title: t('cancelled') }
              ]}
              statusField="status"
              titleField="name"
            />
            
            <CalendarView 
              startDateField="event_date"
              titleField="name"
            />
            
            <ListView titleField="name" />
            
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
