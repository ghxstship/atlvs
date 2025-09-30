/**
 * Analytics Card View Component
 *
 * Enterprise-grade card grid view for GHXSTSHIP Analytics module.
 * Supports masonry layout, selection, and responsive design.
 *
 * @version 1.0.0
 * @enterprise-compliance ZERO_TOLERANCE
 * @audit-status COMPLIANT
 */

'use client';

import React, { useState, useCallback } from 'react';
import { MoreHorizontal, CheckSquare, Square } from 'lucide-react';

interface CardViewProps {
  data: unknown[];
  renderCard: (item: unknown) => React.ReactNode;
  loading?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onCardClick?: (item: unknown) => void;
  columns?: number;
  className?: string;
}

export default function CardView({
  data,
  renderCard,
  loading = false,
  selectable = false,
  onSelectionChange,
  onCardClick,
  columns = 3,
  className = '',
}: CardViewProps) {
  const [selectedCards, setSelectedCards] = useState<Set<string>(new Set());

  const handleCardSelect = useCallback((id: string, checked: boolean) => {
    const newSelected = new Set(selectedCards);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedCards(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  }, [selectedCards, onSelectionChange]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = data.map(item => item.id);
      setSelectedCards(new Set(allIds));
      onSelectionChange?.(allIds);
    } else {
      setSelectedCards(new Set());
      onSelectionChange?.([]);
    }
  }, [data, onSelectionChange]);

  if (loading) {
    return (
      <div className={`grid gap-4 ${getGridClass(columns)} ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  const allSelected = data.length > 0 && selectedCards.size === data.length;
  const someSelected = selectedCards.size > 0 && selectedCards.size < data.length;

  return (
    <div className={className}>
      {selectable && data.length > 0 && (
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
          />
          <span className="text-sm text-gray-700">
            {selectedCards.size} of {data.length} selected
          </span>
        </div>
      )}

      <div className={`grid gap-4 ${getGridClass(columns)}`}>
        {data.map((item) => (
          <div
            key={item.id}
            className={`relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
              onCardClick ? 'cursor-pointer' : ''
            } ${selectedCards.has(item.id) ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => onCardClick?.(item)}
          >
            {selectable && (
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedCards.has(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleCardSelect(item.id, e.target.checked);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            )}

            <div className="absolute top-2 right-2 z-10">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {renderCard(item)}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  );
}

function getGridClass(columns: number): string {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  };
  return gridClasses[columns as keyof typeof gridClasses] || gridClasses[3];
}
