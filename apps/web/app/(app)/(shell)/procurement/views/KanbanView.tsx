/**
 * Procurement Kanban View Component
 * Kanban board view for procurement entities
 */

'use client';

import React from 'react';
import { useATLVS } from '../../core/providers/ATLVSProvider';

export const KanbanView: React.FC = () => {
  const { data, config } = useATLVS();

  // Group by status
  const grouped = data.reduce((acc: unknown, item: unknown) => {
    const status = item.status || 'unknown';
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {});

  return (
    <div className="flex gap-md p-md overflow-x-auto">
      {Object.entries(grouped).map(([status, items]: [string, any[]]) => (
        <div key={status} className="flex-shrink-0 w-container-md">
          <div className="bg-muted p-sm rounded-t-lg font-medium text-sm">
            {status} ({items.length})
          </div>
          <div className="bg-muted/50 min-h-container-lg p-sm rounded-b-lg space-y-sm">
            {items.map((item: unknown) => (
              <div
                key={item.id}
                className="bg-background p-sm rounded shadow-sm cursor-pointer hover:shadow-md"
                onClick={() => config.actions?.view?.(item)}
              >
                <div className="font-medium text-sm">
                  {item.title || item.name || `Item ${item.id}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanView;
