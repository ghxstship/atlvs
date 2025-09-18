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
  Drawer,
  StateManagerProvider,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord
} from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

export default function FinanceClient({ orgId }: { orgId: string }) {
  const t = useTranslations('finance');
  const sb = createBrowserClient();
  const [loading, setLoading] = useState(false);
  const [financeData, setFinanceData] = useState<DataRecord[]>([]);

  useEffect(() => {
    loadFinanceData();
  }, [orgId]);

  async function loadFinanceData() {
    setLoading(true);
    try {
      // Load all finance-related data (budgets, expenses, invoices)
      const [budgetsData, expensesData, invoicesData] = await Promise.all([
        sb.from('budgets').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
        sb.from('expenses').select('*').eq('organization_id', orgId).order('date', { ascending: false }),
        sb.from('invoices').select('*').eq('organization_id', orgId).order('created_at', { ascending: false })
      ]);

      // Combine all data with type indicators
      const allData = [
        ...(budgetsData.data || []).map(item => ({ ...item, record_type: 'budget' })),
        ...(expensesData.data || []).map(item => ({ ...item, record_type: 'expense' })),
        ...(invoicesData.data || []).map(item => ({ ...item, record_type: 'invoice' }))
      ];

      setFinanceData(allData);
    } catch (error) {
      console.error('Error loading finance data:', error);
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
      key: 'amount',
      label: t('amount'),
      type: 'currency',
      required: true,
      sortable: true,
      filterable: true
    },
    {
      key: 'total_amount',
      label: t('totalAmount'),
      type: 'currency',
      sortable: true,
      filterable: true
    },
    {
      key: 'currency',
      label: t('currency'),
      type: 'select',
      options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' }
      ],
      defaultValue: 'USD',
      filterable: true
    },
    {
      key: 'status',
      label: t('status'),
      type: 'select',
      options: [
        { value: 'draft', label: t('statuses.draft') },
        { value: 'pending', label: t('statuses.pending') },
        { value: 'approved', label: t('statuses.approved') },
        { value: 'active', label: t('statuses.active') },
        { value: 'rejected', label: t('statuses.rejected') },
        { value: 'closed', label: t('statuses.closed') }
      ],
      filterable: true,
      sortable: true
    },
    {
      key: 'category',
      label: t('category'),
      type: 'select',
      options: [
        { value: 'equipment', label: t('categories.equipment') },
        { value: 'construction', label: t('categories.construction') },
        { value: 'catering', label: t('categories.catering') },
        { value: 'travel', label: t('categories.travel') },
        { value: 'other', label: t('categories.other') }
      ],
      filterable: true,
      sortable: true
    },
    {
      key: 'date',
      label: t('date'),
      type: 'date',
      sortable: true,
      filterable: true
    },
    {
      key: 'record_type',
      label: t('type'),
      type: 'select',
      options: [
        { value: 'budget', label: t('types.budget') },
        { value: 'expense', label: t('types.expense') },
        { value: 'invoice', label: t('types.invoice') }
      ],
      filterable: true,
      sortable: true
    }
  ];

  // ATLVS DataViews configuration
  const financeConfig: DataViewConfig = {
    id: 'finance-dataviews',
    name: t('title'),
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data: financeData,
    pagination: {
      page: 1,
      pageSize: 25,
      total: financeData.length
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
      loadFinanceData();
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
    ...financeConfig,
    data: financeData
  };

  return (
    <div className="h-full flex flex-col">
      <DataViewProvider config={configWithData}>
        <StateManagerProvider>
          <div className="flex-1 stack-lg">
            {/* View Switcher and Actions */}
            <div className="flex justify-between items-center">
              <ViewSwitcher />
              <DataActions />
            </div>

            {/* ATLVS DataViews */}
            <div className="flex-1 stack-lg">
              <DataGrid />
              <KanbanBoard 
                columns={[
                  { id: 'draft', title: t('statuses.draft') },
                  { id: 'pending', title: t('statuses.pending') },
                  { id: 'approved', title: t('statuses.approved') },
                  { id: 'active', title: t('statuses.active') }
                ]}
                statusField="status"
                titleField="name"
              />
              <CalendarView 
                startDateField="date"
                titleField="name"
              />
              <ListView titleField="name" />
            </div>

            {/* Universal Drawer for record details and editing */}
            <Drawer title="Details" 
              open={false}
              onClose={() => {}}
            >
              <div className="p-md">
                <p>Details will be shown here.</p>
              </div>
            </Drawer>
          </div>
        </StateManagerProvider>
      </DataViewProvider>
    </div>
  );
}
