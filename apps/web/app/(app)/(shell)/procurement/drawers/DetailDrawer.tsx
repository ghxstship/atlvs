/**
 * Procurement Detail Drawer Component
 * Record detail drawer for procurement entities
 */

'use client';

import React from 'react';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  data?: unknown;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  open,
  onClose,
  data
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="bg-background w-container-lg h-full shadow-lg">
        <div className="p-md border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Details</h2>
            <button onClick={onClose} className="text-muted-foreground">✕</button>
          </div>
        </div>
        <div className="p-md">
          {data ? (
            <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
          ) : (
            <p className="text-muted-foreground">No data selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailDrawer;
