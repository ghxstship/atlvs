/**
 * Procurement Edit Drawer Component
 * Inline edit drawer for procurement entities
 */

'use client';

import React from 'react';

interface EditDrawerProps {
  open: boolean;
  onClose: () => void;
  data?: unknown;
  onSave?: (data: unknown) => void;
}

export const EditDrawer: React.FC<EditDrawerProps> = ({
  open,
  onClose,
  data,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="bg-background w-container-lg h-full shadow-lg">
        <div className="p-md border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Edit Item</h2>
            <button onClick={onClose} className="text-muted-foreground">✕</button>
          </div>
        </div>
        <div className="p-md">
          <p className="text-muted-foreground mb-md">Edit drawer implementation</p>
          {data && (
            <button
              onClick={() => onSave?.(data)}
              className="px-sm py-0.5 bg-primary text-primary-foreground rounded"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditDrawer;
