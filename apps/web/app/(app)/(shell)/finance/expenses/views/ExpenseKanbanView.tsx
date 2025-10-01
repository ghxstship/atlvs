'use client';

import React from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { Kanban, Receipt, Calendar, DollarSign } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface ExpenseKanbanViewProps {
  data: DataRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: DataRecord) => void;
  onAddToColumn?: (status: string) => void;
}

export default function ExpenseKanbanView({
  data,
  isLoading,
  onRecordClick,
  onAddToColumn
}: ExpenseKanbanViewProps) {
  const columns = [
    { id: 'draft', title: 'Draft', color: 'bg-gray-50 border-gray-200' },
    { id: 'submitted', title: 'Submitted', color: 'bg-blue-50 border-blue-200' },
    { id: 'approved', title: 'Approved', color: 'bg-green-50 border-green-200' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-50 border-red-200' },
    { id: 'paid', title: 'Paid', color: 'bg-purple-50 border-purple-200' }
  ];

  const getRecordsByStatus = (status: string) => {
    return data.filter(record => record.status === status);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-lg">
        {columns.map((column) => (
          <div key={column.id} className={`rounded-lg border-2 p-lg min-h-container-lg ${column.color}`}>
            <div className="animate-pulse">
              <div className="h-icon-md bg-gray-200 rounded mb-md"></div>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white p-md rounded mb-sm animate-pulse">
                  <div className="h-icon-xs bg-gray-200 rounded mb-sm"></div>
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
    <div className="grid grid-cols-1 md:grid-cols-5 gap-lg">
      {columns.map((column) => {
        const columnRecords = getRecordsByStatus(column.id);

        return (
          <div key={column.id} className={`rounded-lg border-2 p-lg min-h-container-lg ${column.color}`}>
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <div className="flex items-center gap-xs">
                <Badge variant="secondary">{columnRecords.length}</Badge>
                <button
                  onClick={() => onAddToColumn?.(column.id)}
                  className="p-xs hover:bg-white/50 rounded transition-colors"
                >
                  <Kanban className="h-icon-xs w-icon-xs" />
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
                  <h4 className="font-medium truncate mb-sm">{record.description}</h4>
                  <p className="text-sm text-gray-600 mb-sm">{record.category}</p>

                  <div className="flex items-center justify-between mb-sm">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="font-semibold text-red-600">
                      ${record.amount?.toLocaleString() || '0'}
                    </span>
                  </div>

                  <div className="flex items-center gap-xs text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {record.expense_date ? new Date(record.expense_date).toLocaleDateString() : 'N/A'}
                  </div>

                  {record.vendor && (
                    <div className="flex items-center gap-xs mt-xs">
                      <Receipt className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{record.vendor}</span>
                    </div>
                  )}
                </Card>
              ))}

              {columnRecords.length === 0 && (
                <div className="text-center py-lg text-gray-500">
                  <DollarSign className="h-icon-lg w-icon-lg mx-auto mb-sm opacity-50" />
                  <p className="text-sm">No {column.title.toLowerCase()} expenses</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
