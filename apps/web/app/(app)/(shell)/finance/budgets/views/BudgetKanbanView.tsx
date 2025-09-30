'use client';

import React from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { Kanban, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface BudgetKanbanViewProps {
  data: DataRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: DataRecord) => void;
  onAddToColumn?: (status: string) => void;
}

export default function BudgetKanbanView({
  data,
  isLoading,
  onRecordClick,
  onAddToColumn
}: BudgetKanbanViewProps) {
  const columns = [
    { id: 'active', title: 'Active', color: 'bg-green-50 border-green-200' },
    { id: 'inactive', title: 'Inactive', color: 'bg-gray-50 border-gray-200' },
    { id: 'exceeded', title: 'Exceeded', color: 'bg-red-50 border-red-200' }
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
                  <Kanban className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-sm">
              {columnRecords.map((record) => {
                const utilization = record.amount > 0 ? ((record.spent || 0) / record.amount) * 100 : 0;

                return (
                  <Card
                    key={record.id}
                    className="p-md hover:shadow-md transition-shadow cursor-pointer bg-white"
                    onClick={() => onRecordClick?.(record)}
                  >
                    <h4 className="font-medium truncate mb-sm">{record.name}</h4>
                    <p className="text-sm text-gray-600 mb-sm">{record.category}</p>

                    <div className="space-y-xs">
                      <div className="flex justify-between text-sm">
                        <span>Spent: ${record.spent?.toLocaleString() || '0'}</span>
                        <span>Budget: ${record.amount?.toLocaleString() || '0'}</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            utilization > 100 ? 'bg-red-500' :
                            utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>

                      <div className="text-xs text-gray-500 text-center">
                        {utilization.toFixed(1)}% utilized
                      </div>
                    </div>
                  </Card>
                );
              })}

              {columnRecords.length === 0 && (
                <div className="text-center py-lg text-gray-500">
                  <DollarSign className="h-8 w-8 mx-auto mb-sm opacity-50" />
                  <p className="text-sm">No {column.title.toLowerCase()} budgets</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
