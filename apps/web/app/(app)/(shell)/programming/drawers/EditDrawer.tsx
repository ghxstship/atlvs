'use client';

import { AppDrawer, Button } from '@ghxstship/ui';

export function EditDrawer({ isOpen, onClose, onSuccess, recordId }: any) {
  return (
    <AppDrawer isOpen={isOpen} onClose={onClose} title="Edit">
      <div className="p-md">
        <p>Edit form for {recordId}</p>
        <div className="flex gap-xs mt-4">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={onSuccess}>Save</Button>
        </div>
      </div>
    </AppDrawer>
  );
}
