'use client';

import React from 'react';
import { Drawer, Button, Card, CardContent } from '@ghxstship/ui';

interface ViewTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: unknown;
  isLoading?: boolean;
  onSubmit?: (data: unknown) => Promise<void>;
}

export default function ViewTransactionDrawer({
  isOpen,
  onClose,
  transaction,
  isLoading = false,
  onSubmit
}: ViewTransactionDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Transaction ViewTransactionDrawer">
      <Card className="p-lg">
        <CardContent>
          <div className="text-center py-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-sm">ViewTransactionDrawer Component</h3>
            <p className="text-gray-600">ViewTransactionDrawer implementation - Coming Soon</p>
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
