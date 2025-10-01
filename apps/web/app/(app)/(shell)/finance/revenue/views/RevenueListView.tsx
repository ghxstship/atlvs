'use client';

import React from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { DollarSign, Calendar, User, Building, MoreVertical, Edit, Eye, Trash2 } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface RevenueListViewProps {
  data: DataRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: DataRecord) => void;
  onEdit?: (record: DataRecord) => void;
  onDelete?: (record: DataRecord) => void;
}

export default function RevenueListView({
  data,
  isLoading,
  onRecordClick,
  onEdit,
  onDelete
}: RevenueListViewProps) {
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
                  <h3 className="font-semibold text-lg truncate">{record.source}</h3>
                  <Badge variant={
                    record.status === 'received' ? 'success' :
                    record.status === 'invoiced' ? 'warning' : 'secondary'
                  }>
                    {record.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-lg text-sm text-gray-600">
                  <span>{record.category}</span>
                  <span>•</span>
                  <div className="flex items-center gap-xs">
                    <Calendar className="h-icon-xs w-icon-xs" />
                    {record.recognition_date ? new Date(record.recognition_date).toLocaleDateString() : 'N/A'}
                  </div>
                  {record.client_id && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-xs">
                        <User className="h-icon-xs w-icon-xs" />
                        Client: {record.client_id}
                      </div>
                    </>
                  )}
                  {record.project_id && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-xs">
                        <Building className="h-icon-xs w-icon-xs" />
                        Project: {record.project_id}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-md ml-md">
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    ${record.amount?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-500">USD</div>
                </div>

                <div className="flex items-center gap-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(record);
                    }}
                  >
                    <Edit className="h-icon-xs w-icon-xs" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecordClick?.(record);
                    }}
                  >
                    <Eye className="h-icon-xs w-icon-xs" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(record);
                    }}
                  >
                    <Trash2 className="h-icon-xs w-icon-xs" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-xl">
            <DollarSign className="h-icon-2xl w-icon-2xl text-gray-400 mx-auto mb-md" />
            <h3 className="text-lg font-medium text-gray-900 mb-sm">No revenue records</h3>
            <p className="text-gray-600">Get started by adding your first revenue entry.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
