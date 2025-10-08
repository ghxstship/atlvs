'use client';

import React from 'react';
import { Button, Card, CardBody, CardContent, Drawer } from '@ghxstship/ui';

interface BulkInvoiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: unknown;
  isLoading?: boolean;
  onSubmit?: (data: unknown) => Promise<void>;
}

export default function BulkInvoiceDrawer({
  isOpen,
  onClose,
  invoice,
  isLoading = false,
  onSubmit
}: BulkInvoiceDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Invoice BulkInvoiceDrawer">
      <Card className="p-lg">
        <CardContent>
          <div className="text-center py-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-sm">BulkInvoiceDrawer Component</h3>
            <p className="text-gray-600">BulkInvoiceDrawer implementation - Enterprise Invoice Management</p>
            {invoice && (
              <div className="mt-md text-sm text-gray-500">
                Invoice: {invoice.invoice_number || 'N/A'}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-md mt-lg">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onSubmit && (
              <Button onClick={() => onSubmit?.({})} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Submit'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Drawer>
  );
}
