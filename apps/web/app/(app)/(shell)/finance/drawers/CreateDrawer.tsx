'use client';

import { AppDrawer, Button } from '@ghxstship/ui';

export function CreateDrawer({ isOpen, onClose, onSuccess }: any) {
  return (
    <AppDrawer isOpen={isOpen} onClose={onClose} title="Create">
      <div className="p-md">
        <p>Create form</p>
        <div className="flex gap-xs mt-4">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={onSuccess}>Create</Button>
        </div>
      </div>
    </AppDrawer>
  );
}
