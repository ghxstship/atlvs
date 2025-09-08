'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
// import { useOrganization } from '@/hooks/useOrganization';
// import { createClient } from '@/lib/supabase/client';
// Mock implementations for now
const useOrganization = () => ({ organization: { id: 'mock-org-id' } });
const createClient = () => ({
  from: (table: string) => ({
    select: (fields: string) => ({
      eq: (field: string, value: any) => ({
        order: (field: string, options: any) => ({
          then: () => Promise.resolve({ data: [] })
        })
      })
    })
  })
});
import {
  DataViewProvider,
  StateManagerProvider,
  DataGrid,
  KanbanBoard,
  CalendarView,
  ListView,
  ViewSwitcher,
  DataActions,
  UniversalDrawer
} from '@ghxstship/ui/components/DataViews';
import type {
  FieldConfig,
  DataViewConfig,
  DataRecord,
  FilterConfig,
  SortConfig
} from '@ghxstship/ui/components/DataViews/types';

interface PipelineClientProps {
  className?: string;
}

export default function PipelineClient({ className }: PipelineClientProps) {
  const t = useTranslations();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataRecord[]>([]);
  const orgId = organization?.id;
  const sb = createClient();

  // Define field configuration for pipeline data
  const fieldConfig: FieldConfig[] = [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea'
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'safety', label: 'Safety' },
        { value: 'technical', label: 'Technical' },
        { value: 'compliance', label: 'Compliance' },
        { value: 'orientation', label: 'Orientation' },
        { value: 'manning', label: 'Manning' },
        { value: 'onboarding', label: 'Onboarding' },
        { value: 'contracting', label: 'Contracting' }
      ],
      filterable: true,
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'archived', label: 'Archived' }
      ],
      filterable: true,
      sortable: true
    },
    {
      key: 'duration',
      label: 'Duration (hours)',
      type: 'number',
      sortable: true
    },
    {
      key: 'instructor',
      label: 'Instructor',
      type: 'text'
    },
    {
      key: 'required_for',
      label: 'Required For',
      type: 'text'
    },
    {
      key: 'record_type',
      label: 'Category',
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
  }, [orgId]);

  async function loadData() {
    if (!orgId) return;
    
    setLoading(true);
    try {
      // Mock data for now - replace with actual Supabase call when imports are fixed
      const mockData: DataRecord[] = [
        {
          id: '1',
          title: 'Safety Training',
          description: 'Basic safety protocols for production crew',
          type: 'safety',
          status: 'active',
          duration: 2,
          instructor: 'John Smith',
          required_for: 'All crew members',
          record_type: 'training',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Technical Skills Workshop',
          description: 'Advanced technical training for equipment operation',
          type: 'technical',
          status: 'draft',
          duration: 4,
          instructor: 'Jane Doe',
          required_for: 'Technical staff',
          record_type: 'training',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setData(mockData);
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    }
    setLoading(false);
  }

  // Define DataView configuration
  const dataViewConfig: DataViewConfig = {
    id: 'pipeline-data',
    name: 'Pipeline Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields: fieldConfig,
    data: data,
    onSearch: (query: string) => {
      // Implement search functionality
      console.log('Search:', query);
    },
    onFilter: (filters: FilterConfig[]) => {
      // Implement filter functionality
      console.log('Filter:', filters);
    },
    onSort: (sorts: SortConfig[]) => {
      // Implement sort functionality
      console.log('Sort:', sorts);
    },
    onRefresh: async () => {
      await loadData();
    },
    onExport: (data: DataRecord[], format: string) => {
      // Implement export functionality
      console.log('Export:', data, format);
    },
    onImport: (data: any[]) => {
      // Implement import functionality
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
                { id: 'draft', title: 'Draft' },
                { id: 'active', title: 'Active' },
                { id: 'completed', title: 'Completed' },
                { id: 'archived', title: 'Archived' }
              ]}
              statusField="status"
              titleField="title"
            />
            <CalendarView 
              startDateField="created_at"
              titleField="title"
            />
            <ListView 
              titleField="title"
            />
            
            {/* Universal Drawer */}
            <UniversalDrawer
              open={false}
              onClose={() => {}}
              record={null}
              fields={fieldConfig}
              mode="view"
            />
          </div>
        </DataViewProvider>
      </StateManagerProvider>
    </div>
  );
}
