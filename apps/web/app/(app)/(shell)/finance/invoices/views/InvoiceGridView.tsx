'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';

interface InvoiceGridViewProps {
  data: unknown[];
  isLoading?: boolean;
  onRecordClick?: (record: unknown) => void;
}

export default function InvoiceGridView({ data, isLoading, onRecordClick }: InvoiceGridViewProps) {
  if (isLoading) {
    return <Card className="p-lg"><div className="animate-pulse h-container-sm bg-gray-200 rounded"></div></Card>;
  }

  return (
    <Card className="p-lg">
      <div className="text-center py-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-sm">GridView View</h3>
        <p className="text-gray-600">GridView visualization for invoices - Enterprise Implementation</p>
        <div className="mt-md text-sm text-gray-500">
          {data.length} invoices loaded
        </div>
      </div>
    </Card>
  );
}
