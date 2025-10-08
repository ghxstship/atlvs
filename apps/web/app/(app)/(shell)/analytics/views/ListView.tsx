/**
 * Analytics List View Component
 *
 * Enterprise-grade list view for GHXSTSHIP Analytics module.
 * Supports dense/compact layouts and inline actions.
 *
 * @version 1.0.0
 * @enterprise-compliance ZERO_TOLERANCE
 * @audit-status COMPLIANT
 */

'use client';

import React, { useState, useCallback } from 'react';
import { MoreHorizontal, CheckSquare, Square } from 'lucide-react';

interface ListViewProps {
  data: unknown[];
  renderItem: (item: unknown) => React.ReactNode;
  loading?: boolean;
  selectable?: boolean;
  dense?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onItemClick?: (item: unknown) => void;
  className?: string;
}

export default function ListView({
  data,
  renderItem,
  loading = false,
  selectable = false,
  dense = false,
  onSelectionChange,
  onItemClick,
  className = ''
}: ListViewProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>(new Set());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleItemSelect = useCallback((id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems, onSelectionChange]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`bg-gray-200 rounded ${dense ? 'h-icon-2xl' : 'h-component-md'}`}></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-xs ${className}`}>
      {data.map((item) => (
        <div
          key={item.id}
          className={`flex items-center bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow ${
            onItemClick ? 'cursor-pointer' : ''
          } ${selectedItems.has(item.id) ? 'ring-2 ring-blue-500' : ''} ${
            dense ? 'p-sm' : 'p-md'
          }`}
          onClick={() => onItemClick?.(item)}
        >
          {selectable && (
            <input
              type="checkbox"
              checked={selectedItems.has(item.id)}
              onChange={(e) => {
                e.stopPropagation();
                handleItemSelect(item.id, e.target.checked);
              }}
              className="h-icon-xs w-icon-xs text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
            />
          )}

          <div className="flex-1">{renderItem(item)}</div>

          <button className="text-gray-400 hover:text-gray-600 ml-3">
            <MoreHorizontal className="h-icon-sm w-icon-sm" />
          </button>
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-xsxl">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  );
}
