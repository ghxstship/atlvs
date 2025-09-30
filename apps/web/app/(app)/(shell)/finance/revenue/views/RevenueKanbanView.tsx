'use client';

import React from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { DollarSign, Calendar, User, Building, Plus } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface RevenueKanbanViewProps {
  data: DataRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: DataRecord) => void;
  onAddToColumn?: (status: string) => void;
}

export default function RevenueKanbanView({
  data,
  isLoading,
  onRecordClick,
  onAddToColumn
}: RevenueKanbanViewProps) {
  const columns = [
    { id: 'projected', title: 'Projected', color: 'bg-blue-50 border-blue-200' },
    { id: 'invoiced', title: 'Invoiced', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'received', title: 'Received', color: 'bg-green-50 border-green-200' }
  ];

  const getRecordsByStatus = (status: string) => {
    return data.filter(record => record.status === status);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {columns.map((column) => (
          <div key={column.id} className={`rounded-lg border-2 p-lg min-h-96 ${column.color}`}>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-md"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-md rounded mb-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-sm"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
      {columns.map((column) => {
        const columnRecords = getRecordsByStatus(column.id);

        return (
          <div key={column.id} className={`rounded-lg border-2 p-lg min-h-96 ${column.color}`}>
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <div className="flex items-center gap-xs">
                <Badge variant="secondary">{columnRecords.length}</Badge>
                <button
                  onClick={() => onAddToColumn?.(column.id)}
                  className="p-xs hover:bg-white/50 rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-sm">
              {columnRecords.map((record) => (
                <Card
                  key={record.id}
                  className="p-md hover:shadow-md transition-shadow cursor-pointer bg-white"
                  onClick={() => onRecordClick?.(record)}
                >
                  <h4 className="font-medium truncate mb-sm">{record.source}</h4>
                  <p className="text-sm text-gray-600 mb-sm">{record.category}</p>

                  <div className="flex items-center justify-between mb-sm">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="font-semibold text-green-600">
                      ${record.amount?.toLocaleString() || '0'}
                    </span>
                  </div>

                  <div className="flex items-center gap-xs text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {record.recognition_date ? new Date(record.recognition_date).toLocaleDateString() : 'N/A'}
                  </div>

                  {record.client_id && (
                    <div className="flex items-center gap-xs mt-xs">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">Client: {record.client_id}</span>
                    </div>
                  )}

                  {record.project_id && (
                    <div className="flex items-center gap-xs mt-xs">
                      <Building className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">Project: {record.project_id}</span>
                    </div>
                  )}
                </Card>
              ))}

              {columnRecords.length === 0 && (
                <div className="text-center py-lg text-gray-500">
                  <DollarSign className="h-8 w-8 mx-auto mb-sm opacity-50" />
                  <p className="text-sm">No {column.title.toLowerCase()} revenue</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
