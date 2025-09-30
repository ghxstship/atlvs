'use client';

import React from 'react';
import { Drawer, Button, Card, CardContent } from '@ghxstship/ui';

interface ViewInvoiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: unknown;
  isLoading?: boolean;
  onSubmit?: (data: unknown) => Promise<void>;
}

export default function ViewInvoiceDrawer({
  isOpen,
  onClose,
  invoice,
  isLoading = false,
  onSubmit
}: ViewInvoiceDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Invoice ViewInvoiceDrawer">
      <Card className="p-lg">
        <CardContent>
          <div className="text-center py-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-sm">ViewInvoiceDrawer Component</h3>
            <p className="text-gray-600">ViewInvoiceDrawer implementation - Enterprise Invoice Management</p>
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
