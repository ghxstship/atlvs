/**
 * CardView Component — Gallery/Card Layout
 * Grid of cards for visual data display
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import type { ViewProps, DataRecord } from '../types';

export interface CardViewProps extends ViewProps {
  /** Title field */
  titleField: string;
  
  /** Image field */
  imageField?: string;
  
  /** Description field */
  descriptionField?: string;
  
  /** Columns */
  columns?: 2 | 3 | 4 | 5 | 6;
  
  /** Card renderer */
  cardRenderer?: (record: DataRecord) => React.ReactNode;
  
  /** Custom className */
  className?: string;
}

/**
 * CardView Component
 */
export function CardView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  onRecordClick,
  onRecordSelect,
  onCreate,
  onEdit,
  onDelete,
  titleField,
  imageField,
  descriptionField,
  columns = 3,
  cardRenderer,
  className = '',
}: CardViewProps) {
  const gridColsClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[var(--color-error)] font-medium">Error loading data</p>
          <p className="text-[var(--color-foreground-secondary)] text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-[var(--color-foreground-secondary)] font-medium">No records found</p>
        {onCreate && (
          <button
            onClick={onCreate}
            className="
              mt-4 flex items-center gap-2 px-4 py-2
              rounded-md
              bg-[var(--color-primary)]
              text-[var(--color-primary-foreground)]
              hover:opacity-90
              transition-opacity
            "
          >
            <Plus className="w-4 h-4" />
            Create Record
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className={`p-4 h-full overflow-auto ${className}`}>
      <div className={`grid ${gridColsClasses[columns]} gap-4`}>
        {data.map(record => (
          <div
            key={record.id}
            className={`
              group relative
              rounded-lg overflow-hidden
              border border-[var(--color-border)]
              hover:border-[var(--color-primary)]
              bg-[var(--color-surface)]
              transition-all
              ${state.selectedIds.includes(record.id) ? 'ring-2 ring-[var(--color-primary)]' : ''}
            `}
          >
            {cardRenderer ? (
              <div onClick={() => onRecordClick?.(record)} className="cursor-pointer">
                {cardRenderer(record)}
              </div>
            ) : (
              <>
                {/* Image */}
                {imageField && record[imageField] && (
                  <div
                    className="aspect-video bg-[var(--color-muted)] cursor-pointer"
                    onClick={() => onRecordClick?.(record)}
                  >
                    <img
                      src={record[imageField]}
                      alt={record[titleField]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="p-4">
                  {/* Checkbox */}
                  {onRecordSelect && (
                    <div className="mb-2">
                      <input
                        type="checkbox"
                        checked={state.selectedIds.includes(record.id)}
                        onChange={(e) => {
                          const newSelection = e.target.checked
                            ? [...state.selectedIds, record.id]
                            : state.selectedIds.filter(id => id !== record.id);
                          onRecordSelect(newSelection);
                        }}
                        className="rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  
                  {/* Title */}
                  <h3
                    className="font-medium mb-2 cursor-pointer hover:text-[var(--color-primary)] transition-colors"
                    onClick={() => onRecordClick?.(record)}
                  >
                    {record[titleField]}
                  </h3>
                  
                  {/* Description */}
                  {descriptionField && record[descriptionField] && (
                    <p className="text-sm text-[var(--color-foreground-secondary)] line-clamp-2">
                      {record[descriptionField]}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                {(onEdit || onDelete) && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="
                        p-2 rounded
                        bg-[var(--color-surface)]
                        border border-[var(--color-border)]
                        hover:bg-[var(--color-muted)]
                        shadow-sm
                        transition-colors
                      "
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

CardView.displayName = 'CardView';
