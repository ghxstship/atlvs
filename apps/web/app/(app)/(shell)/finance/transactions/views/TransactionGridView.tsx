'use client';

import React from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { ArrowUpDown, CreditCard, Calendar, Building } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface TransactionGridViewProps {
  data: DataRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: DataRecord) => void;
}

export default function TransactionGridView({ data, isLoading, onRecordClick }: TransactionGridViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-sm"></div>
            <div className="h-6 bg-gray-200 rounded mb-md"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {data.map((record) => (
        <Card
          key={record.id}
          className="p-lg hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onRecordClick?.(record)}
        >
          <div className="flex items-start justify-between mb-md">
            <div className="flex-1">
              <h3 className="font-semibold text-lg truncate">{record.description}</h3>
              <p className="text-sm text-gray-600 mt-xs">{record.type}</p>
            </div>
            <Badge variant={
              record.type === 'credit' ? 'success' : 'secondary'
            }>
              {record.type}
            </Badge>
          </div>

          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount</span>
              <span className={`font-semibold ${record.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {record.type === 'credit' ? '+' : '-'}${record.amount?.toLocaleString() || '0'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Date</span>
              <span className="text-sm">
                {record.transaction_date ? new Date(record.transaction_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {record.account_id && (
              <div className="flex items-center gap-xs">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Account: {record.account_id}</span>
              </div>
            )}

            {record.project_id && (
              <div className="flex items-center gap-xs">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Project: {record.project_id}</span>
              </div>
            )}
          </div>
        </Card>
      ))}

      {data.length === 0 && (
        <div className="col-span-full text-center py-xl">
          <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-md" />
          <h3 className="text-lg font-medium text-gray-900 mb-sm">No transactions</h3>
          <p className="text-gray-600">Get started by adding your first transaction.</p>
        </div>
      )}
    </div>
  );
}
