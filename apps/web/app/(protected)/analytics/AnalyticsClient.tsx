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
  Drawer,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord
} from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

export default function AnalyticsClient({ orgId }: { orgId: string }) {
  const t = useTranslations('analytics');
  const sb = createBrowserClient();
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<DataRecord[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [orgId]);

  async function loadAnalyticsData() {
    setLoading(true);
    try {
      // Load all analytics-related data (reports, dashboards, exports)
      const [reportsData, dashboardsData] = await Promise.all([
        sb.from('reports').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
        sb.from('dashboards').select('*').eq('organization_id', orgId).order('created_at', { ascending: false })
      ]);

      // Combine all data with type indicators
      const allData = [
        ...(reportsData.data || []).map(item => ({ ...item, record_type: 'report' })),
        ...(dashboardsData.data || []).map(item => ({ ...item, record_type: 'dashboard' }))
      ];

      setAnalyticsData(allData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  }

  // ATLVS DataViews field configuration
  const fields: FieldConfig[] = [
    {
      key: 'name',
      label: t('name'),
      type: 'text',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'description',
      label: t('description'),
      type: 'textarea',
      rows: 3,
      sortable: true,
      filterable: true
    },
    {
      key: 'type',
      label: t('type'),
      type: 'select',
      options: [
        { value: 'financial', label: t('types.financial') },
        { value: 'operational', label: t('types.operational') },
        { value: 'project', label: t('types.project') },
        { value: 'custom', label: t('types.custom') }
      ],
      filterable: true,
      sortable: true
    },
    {
      key: 'frequency',
      label: t('frequency'),
      type: 'select',
      options: [
        { value: 'daily', label: t('frequencies.daily') },
        { value: 'weekly', label: t('frequencies.weekly') },
        { value: 'monthly', label: t('frequencies.monthly') },
        { value: 'quarterly', label: t('frequencies.quarterly') },
        { value: 'annual', label: t('frequencies.annual') },
        { value: 'on_demand', label: t('frequencies.onDemand') }
      ],
      filterable: true,
      sortable: true
    },
    {
      key: 'format',
      label: t('format'),
      type: 'select',
      options: [
        { value: 'pdf', label: 'PDF' },
        { value: 'excel', label: 'Excel' },
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' }
      ],
      defaultValue: 'pdf',
      filterable: true,
      sortable: true
    },
    {
      key: 'recipients',
      label: t('recipients'),
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: t('status'),
      type: 'select',
      options: [
        { value: 'active', label: t('statuses.active') },
        { value: 'inactive', label: t('statuses.inactive') },
        { value: 'draft', label: t('statuses.draft') }
      ],
      defaultValue: 'draft',
      filterable: true,
      sortable: true
    },
    {
      key: 'record_type',
      label: t('recordType'),
      type: 'select',
      options: [
        { value: 'report', label: t('recordTypes.report') },
        { value: 'dashboard', label: t('recordTypes.dashboard') }
      ],
      filterable: true,
      sortable: true
    },
    {
      key: 'created_at',
      label: t('createdAt'),
      type: 'date',
      sortable: true,
      filterable: true
    }
  ];

  // ATLVS DataViews configuration
  const analyticsConfig: DataViewConfig = {
    id: 'analytics-dataviews',
    name: t('title'),
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data: analyticsData,
    pagination: {
      page: 1,
      pageSize: 25,
      total: analyticsData.length
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
      loadAnalyticsData();
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
    ...analyticsConfig,
    data: analyticsData
  };

  return (
    <div className="h-full flex flex-col">
      <DataViewProvider config={configWithData}>
        <StateManagerProvider>
          <div className="flex-1 space-y-6">
            {/* View Switcher and Actions */}
            <div className="flex justify-between items-center">
              <ViewSwitcher />
              <DataActions />
            </div>

            {/* ATLVS DataViews */}
            <div className="flex-1 space-y-6">
              <DataGrid />
              <KanbanBoard 
                columns={[
                  { id: 'draft', title: t('statuses.draft') },
                  { id: 'active', title: t('statuses.active') },
                  { id: 'inactive', title: t('statuses.inactive') }
                ]}
                statusField="status"
                titleField="name"
              />
              <CalendarView 
                startDateField="created_at"
                titleField="name"
              />
              <ListView titleField="name" />
            </div>

            {/* Drawer for record details and editing */}
            <Drawer 
              open={false}
              onClose={() => {}}
              title="Analytics Details"
              width="md"
            >
              <div className="p-6">
                <p className="color-muted">Analytics details will be displayed here.</p>
              </div>
            </Drawer>
          </div>
        </StateManagerProvider>
      </DataViewProvider>
    </div>
  );
}
