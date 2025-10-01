'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';

interface InvoiceCalendarViewProps {
  data: unknown[];
  isLoading?: boolean;
  onRecordClick?: (record: unknown) => void;
}

export default function InvoiceCalendarView({ data, isLoading, onRecordClick }: InvoiceCalendarViewProps) {
  if (isLoading) {
    return <Card className="p-lg"><div className="animate-pulse h-container-sm bg-gray-200 rounded"></div></Card>;
  }

  return (
    <Card className="p-lg">
      <div className="text-center py-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-sm">CalendarView View</h3>
        <p className="text-gray-600">CalendarView visualization for invoices - Enterprise Implementation</p>
        <div className="mt-md text-sm text-gray-500">
          {data.length} invoices loaded
        </div>
      </div>
    </Card>
  );
}
