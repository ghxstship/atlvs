'use client';

import React from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { ArrowUpDown, CreditCard, Calendar, Building, MoreVertical, Edit, Eye, Trash2 } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface TransactionListViewProps {
  data: DataRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: DataRecord) => void;
  onEdit?: (record: DataRecord) => void;
  onDelete?: (record: DataRecord) => void;
}

export default function TransactionListView({
  data,
  isLoading,
  onRecordClick,
  onEdit,
  onDelete
}: TransactionListViewProps) {
  if (isLoading) {
    return (
      <Card className="p-0">
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-sm"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex items-center gap-md">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="divide-y">
        {data.map((record) => (
          <div
            key={record.id}
            className="p-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onRecordClick?.(record)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-md mb-sm">
                  <h3 className="font-semibold text-lg truncate">{record.description}</h3>
                  <Badge variant={
                    record.type === 'credit' ? 'success' : 'secondary'
                  }>
                    {record.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-lg text-sm text-gray-600">
                  <span>{record.category || 'General'}</span>
                  <span>•</span>
                  <div className="flex items-center gap-xs">
                    <Calendar className="h-4 w-4" />
                    {record.transaction_date ? new Date(record.transaction_date).toLocaleDateString() : 'N/A'}
                  </div>
                  {record.account_id && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-xs">
                        <CreditCard className="h-4 w-4" />
                        Account: {record.account_id}
                      </div>
                    </>
                  )}
                  {record.project_id && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-xs">
                        <Building className="h-4 w-4" />
                        Project: {record.project_id}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-md ml-md">
                <div className="text-right">
                  <div className={`font-semibold ${record.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {record.type === 'credit' ? '+' : '-'}${record.amount?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-500">USD</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-xl">
            <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-md" />
            <h3 className="text-lg font-medium text-gray-900 mb-sm">No transactions</h3>
            <p className="text-gray-600">Get started by adding your first transaction.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
