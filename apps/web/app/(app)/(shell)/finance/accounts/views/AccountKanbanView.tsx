'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';

interface AccountKanbanViewProps {
  data: unknown[];
  isLoading?: boolean;
  onRecordClick?: (record: unknown) => void;
}

export default function AccountKanbanView({ data, isLoading, onRecordClick }: AccountKanbanViewProps) {
  if (isLoading) {
    return <Card className="p-lg"><div className="animate-pulse h-container-sm bg-gray-200 rounded"></div></Card>;
  }

  return (
    <Card className="p-lg">
      <div className="text-center py-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-sm">KanbanView View</h3>
        <p className="text-gray-600">KanbanView visualization for accounts - Coming Soon</p>
        <div className="mt-md text-sm text-gray-500">
          {data.length} accounts loaded
        </div>
      </div>
    </Card>
  );
}
