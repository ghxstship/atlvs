'use client';

import { AppDrawer, Button } from '@ghxstship/ui';

export function ViewDrawer({ isOpen, onClose, recordId }: any) {
  return (
    <AppDrawer isOpen={isOpen} onClose={onClose} title="Details">
      <div className="p-md">
        <p>Details for {recordId}</p>
        <div className="flex gap-xs mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </AppDrawer>
  );
}
