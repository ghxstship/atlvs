'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';

interface ForecastKanbanViewProps {
  data: unknown[];
  isLoading?: boolean;
  onRecordClick?: (record: unknown) => void;
}

export default function ForecastKanbanView({ data, isLoading, onRecordClick }: ForecastKanbanViewProps) {
  if (isLoading) {
    return <Card className="p-lg"><div className="animate-pulse h-container-sm bg-gray-200 rounded"></div></Card>;
  }

  return (
    <Card className="p-lg">
      <div className="text-center py-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-sm">KanbanView View</h3>
        <p className="text-gray-600">KanbanView visualization for forecasts - Enterprise Analytics</p>
        <div className="mt-md text-sm text-gray-500">
          {data.length} forecasts loaded
        </div>
      </div>
    </Card>
  );
}
