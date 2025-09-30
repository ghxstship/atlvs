'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';

interface BudgetTimelineViewProps {
  data: unknown[];
  isLoading?: boolean;
  onRecordClick?: (record: unknown) => void;
}

export default function BudgetTimelineView({ data, isLoading, onRecordClick }: BudgetTimelineViewProps) {
  if (isLoading) {
    return <Card className="p-lg"><div className="animate-pulse h-64 bg-gray-200 rounded"></div></Card>;
  }

  return (
    <Card className="p-lg">
      <div className="text-center py-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-sm">TimelineView View</h3>
        <p className="text-gray-600">TimelineView visualization for budgets - Coming Soon</p>
        <div className="mt-md text-sm text-gray-500">
          {data.length} budgets loaded
        </div>
      </div>
    </Card>
  );
}
