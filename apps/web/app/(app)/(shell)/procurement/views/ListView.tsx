/**
 * Procurement List View Component
 * List view implementation for procurement entities
 */

'use client';

import React from 'react';
import { useATLVS } from '../../core/providers/ATLVSProvider';

interface ListViewProps {
  showHeaders?: boolean;
  sortable?: boolean;
}

export const ListView: React.FC<ListViewProps> = ({
  showHeaders = true,
  sortable = true
}) => {
  const { data, loading, config } = useATLVS();

  return (
    <div className="space-y-sm">
      {showHeaders && (
        <div className="flex font-medium text-sm border-b pb-sm">
          <div className="flex-1">Title</div>
          <div className="w-component-xl">Status</div>
          <div className="w-component-xl">Actions</div>
        </div>
      )}

      {data.map((item: unknown) => (
        <div key={item.id} className="flex items-center py-sm border-b border-border/50">
          <div className="flex-1">
            {item.title || item.name || item.po_number || `Item ${item.id}`}
          </div>
          <div className="w-component-xl">
            <span className="px-sm py-0.5 bg-muted rounded text-xs">
              {item.status || 'N/A'}
            </span>
          </div>
          <div className="w-component-xl flex gap-xs">
            <button
              onClick={() => config.actions?.view?.(item)}
              className="text-xs px-sm py-0.5 bg-primary/10 text-primary rounded hover:bg-primary/20"
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;
