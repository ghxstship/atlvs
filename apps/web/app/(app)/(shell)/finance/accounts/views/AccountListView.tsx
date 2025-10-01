'use client';

import React from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { List, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface AccountListViewProps {
  data: DataRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: DataRecord) => void;
}

export default function AccountListView({ data, isLoading, onRecordClick }: AccountListViewProps) {
  if (isLoading) {
    return (
      <Card className="p-0">
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-icon-xs bg-gray-200 rounded w-container-xs mb-sm"></div>
                  <div className="h-3 bg-gray-200 rounded w-component-xl"></div>
                </div>
                <div className="flex items-center gap-md">
                  <div className="h-icon-md bg-gray-200 rounded w-component-md"></div>
                  <div className="h-icon-lg bg-gray-200 rounded w-component-lg"></div>
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
                  <h3 className="font-semibold text-lg truncate">{record.name}</h3>
                  <Badge variant={
                    record.type === 'checking' ? 'default' :
                    record.type === 'savings' ? 'success' :
                    record.type === 'credit' ? 'warning' : 'secondary'
                  }>
                    {record.type}
                  </Badge>
                  <Badge variant={record.status === 'active' ? 'success' : 'secondary'}>
                    {record.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-lg text-sm text-gray-600">
                  <span>{record.institution || 'No institution'}</span>
                  <span>•</span>
                  <div className="flex items-center gap-xs">
                    <CreditCard className="h-icon-xs w-icon-xs" />
                    {record.account_number ? `****${record.account_number.slice(-4)}` : 'No account number'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-md ml-md">
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    ${record.current_balance?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-500">{record.currency || 'USD'}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-xl">
            <CreditCard className="h-icon-2xl w-icon-2xl text-gray-400 mx-auto mb-md" />
            <h3 className="text-lg font-medium text-gray-900 mb-sm">No accounts</h3>
            <p className="text-gray-600">Get started by adding your first account.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
