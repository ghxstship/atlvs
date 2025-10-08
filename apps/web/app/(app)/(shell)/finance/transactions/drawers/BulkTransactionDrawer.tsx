'use client';

import React from 'react';
import { Button, Card, CardBody, CardContent, Drawer } from '@ghxstship/ui';

interface BulkTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: unknown;
  isLoading?: boolean;
  onSubmit?: (data: unknown) => Promise<void>;
}

export default function BulkTransactionDrawer({
  isOpen,
  onClose,
  transaction,
  isLoading = false,
  onSubmit
}: BulkTransactionDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Transaction BulkTransactionDrawer">
      <Card className="p-lg">
        <CardContent>
          <div className="text-center py-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-sm">BulkTransactionDrawer Component</h3>
            <p className="text-gray-600">BulkTransactionDrawer implementation - Coming Soon</p>
            {transaction && (
              <div className="mt-md text-sm text-gray-500">
                Transaction: {transaction.description || 'N/A'}
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
