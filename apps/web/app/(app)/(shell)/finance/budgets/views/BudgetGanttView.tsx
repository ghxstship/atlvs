'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';

interface BudgetGanttViewProps {
  data: unknown[];
  isLoading?: boolean;
  onRecordClick?: (record: unknown) => void;
}

export default function BudgetGanttView({ data, isLoading, onRecordClick }: BudgetGanttViewProps) {
  if (isLoading) {
    return <Card className="p-lg"><div className="animate-pulse h-container-sm bg-gray-200 rounded"></div></Card>;
  }

  return (
    <Card className="p-lg">
      <div className="text-center py-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-sm">GanttView View</h3>
        <p className="text-gray-600">GanttView visualization for budgets - Coming Soon</p>
        <div className="mt-md text-sm text-gray-500">
          {data.length} budgets loaded
        </div>
      </div>
    </Card>
  );
}
