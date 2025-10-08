'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer } from '@ghxstship/ui';

// Type definitions
type DataRecord = Record<string, unknown>;

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date';
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  options?: Array<{ value: string; label: string }>;
}

// DataViewConfig interface for future ATLVS integration
interface _DataViewConfig {
  id: string;
  name: string;
  viewType: string;
  defaultView: string;
  fields: FieldConfig[];
  data: DataRecord[];
  loading?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: unknown) => void;
  onSort?: (sorts: unknown) => void;
  onRefresh?: () => Promise<void>;
  onExport?: (data: DataRecord[], format: string) => void;
  onImport?: (data: unknown) => void;
}

interface PipelineClientProps {
  className?: string;
  orgId: string;
}

export default function PipelineClient({ className, orgId }: PipelineClientProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataRecord[]>([]);
  const supabase = createBrowserClient();

  // Field configuration for future ATLVS integration
  const _fieldConfig: FieldConfig[] = [
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
      filterable: true,
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
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

  // Load pipeline data from Supabase
  const loadData = useCallback(async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      const { data: pipelineData, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(pipelineData || []);
    } catch (error) {
      console.error('Error loading pipeline data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, supabase]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData]);

  return (
    <div className={className}>
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pipeline Management</h1>
          <button
            onClick={() => loadData()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>

        {/* Data Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading pipeline data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No pipeline stages found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => {
              const itemId = typeof item.id === 'string' ? item.id : String(item.id);
              const title = typeof item.title === 'string' ? item.title : typeof item.name === 'string' ? item.name : 'Untitled';
              const description = typeof item.description === 'string' ? item.description : '';
              const status = typeof item.status === 'string' ? item.status : 'unknown';
              
              return (
                <div key={itemId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">{title}</h3>
                  {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  )}
                  <div className="mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      status === 'active' ? 'bg-green-100 text-green-800' :
                      status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Universal Drawer */}
        <Drawer title="Details" open={false} onClose={() => {}}>
          <div className="p-4">
            <p className="text-gray-600">Pipeline details will be displayed here.</p>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
