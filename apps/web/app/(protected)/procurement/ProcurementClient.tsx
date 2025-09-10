'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  DataViewConfig,
  DataRecord,
  FilterConfig,
  SortConfig
} from '@ghxstship/ui/components/DataViews/types';

interface ProcurementClientProps {
  className?: string;
  orgId?: string;
}

export default function ProcurementClient({ className }: ProcurementClientProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataRecord[]>([]);

  // Define field configuration for procurement data
  const fieldConfig: FieldConfig[] = [
    {
      key: 'orderNumber',
      label: 'Order Number',
      type: 'text',
      required: true,
      sortable: true
    },
    {
      key: 'vendorName',
      label: 'Vendor Name',
      type: 'text',
      required: true,
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: true
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      type: 'currency',
      required: true,
      sortable: true
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'select',
      options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' }
      ],
      defaultValue: 'USD'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'ordered', label: 'Ordered' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      filterable: true,
      sortable: true,
      defaultValue: 'pending'
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      type: 'date',
      required: true,
      sortable: true
    },
    {
      key: 'expectedDelivery',
      label: 'Expected Delivery',
      type: 'date',
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'equipment', label: 'Equipment' },
        { value: 'supplies', label: 'Supplies' },
        { value: 'services', label: 'Services' },
        { value: 'materials', label: 'Materials' }
      ],
      filterable: true,
      sortable: true
    },
    {
      key: 'record_type',
      label: 'Type',
      type: 'text',
      filterable: true,
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Created',
      type: 'date',
      sortable: true
    },
    {
      key: 'updated_at',
      label: 'Updated',
      type: 'date',
      sortable: true
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Mock data for procurement - replace with actual API calls
      const mockData: DataRecord[] = [
        {
          id: '1',
          orderNumber: 'PO-2024-001',
          vendorName: 'Tech Equipment Co.',
          description: 'Professional camera equipment for production',
          totalAmount: 15000,
          currency: 'USD',
          status: 'approved',
          orderDate: '2024-01-15',
          expectedDelivery: '2024-01-25',
          category: 'equipment',
          record_type: 'order',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          orderNumber: 'PO-2024-002',
          vendorName: 'Audio Solutions Ltd.',
          description: 'Sound equipment and microphones',
          totalAmount: 8500,
          currency: 'USD',
          status: 'pending',
          orderDate: '2024-01-20',
          expectedDelivery: '2024-02-01',
          category: 'equipment',
          record_type: 'order',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          orderNumber: 'PO-2024-003',
          vendorName: 'Catering Services Inc.',
          description: 'Craft services for 3-day shoot',
          totalAmount: 2500,
          currency: 'USD',
          status: 'delivered',
          orderDate: '2024-01-10',
          expectedDelivery: '2024-01-12',
          category: 'services',
          record_type: 'service',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setData(mockData);
    } catch (error) {
      console.error('Error loading procurement data:', error);
    }
    setLoading(false);
  }

  // Define DataView configuration
  const dataViewConfig: DataViewConfig = {
    id: 'procurement-data',
    name: 'Procurement Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields: fieldConfig,
    data: data,
    onSearch: (query: string) => {
      console.log('Search:', query);
    },
    onFilter: (filters: FilterConfig[]) => {
      console.log('Filter:', filters);
    },
    onSort: (sorts: SortConfig[]) => {
      console.log('Sort:', sorts);
    },
    onRefresh: async () => {
      await loadData();
    },
    onExport: (data: DataRecord[], format: string) => {
      console.log('Export:', data, format);
    },
    onImport: (data: any[]) => {
      console.log('Import:', data);
    }
  };

  return (
    <div className={className}>
      <StateManagerProvider>
        <DataViewProvider config={dataViewConfig}>
          <div className="space-y-6">
            {/* Data Actions */}
            <DataActions />
            
            {/* View Switcher */}
            <ViewSwitcher />
            
            {/* Data Views */}
            <DataGrid />
            <KanbanBoard 
              columns={[
                { id: 'pending', title: 'Pending' },
                { id: 'approved', title: 'Approved' },
                { id: 'ordered', title: 'Ordered' },
                { id: 'delivered', title: 'Delivered' },
                { id: 'cancelled', title: 'Cancelled' }
              ]}
              statusField="status"
              titleField="orderNumber"
            />
            <CalendarView 
              startDateField="orderDate"
              titleField="orderNumber"
            />
            <ListView 
              titleField="orderNumber"
            />
            
            {/* Universal Drawer */}
            <Drawer title="Details"
              open={false}
              onClose={() => {}}
            >
              <div className="p-4">
                <p>Procurement details will be implemented here.</p>
              </div>
            </Drawer>
          </div>
        </DataViewProvider>
      </StateManagerProvider>
    </div>
  );
}
