/**
 * ListView Component — Simple List View
 * Clean list with grouping and virtualization support
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import type { ViewProps, DataRecord } from '../types';

export interface ListViewProps extends ViewProps {
  /** Title field key */
  titleField: string;
  
  /** Description field key */
  descriptionField?: string;
  
  /** Avatar field key */
  avatarField?: string;
  
  /** Meta fields to show */
  metaFields?: string[];
  
  /** List item renderer */
  itemRenderer?: (record: DataRecord) => React.ReactNode;
  
  /** Enable dividers */
  dividers?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * ListView Component
 */
export function ListView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  onRecordClick,
  onRecordSelect,
  onCreate,
  titleField,
  descriptionField,
  avatarField,
  metaFields = [],
  itemRenderer,
  dividers = true,
  className = '',
}: ListViewProps) {
  // Group data if groups are active
  const groupedData = React.useMemo(() => {
    if (state.groups.length === 0) {
      return [{ key: 'all', label: 'All Records', items: data }];
    }
    
    const grouped: Record<string, DataRecord[]> = {};
    const groupField = state.groups[0].field;
    
    data.forEach(record => {
      const groupValue = String(record[groupField] ?? 'Ungrouped');
      if (!grouped[groupValue]) {
        grouped[groupValue] = [];
      }
      grouped[groupValue].push(record);
    });
    
    return Object.entries(grouped).map(([key, items]) => ({
      key,
      label: key,
      items,
    }));
  }, [data, state.groups]);
  
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
    <div className={`flex flex-col h-full overflow-auto ${className}`}>
      {groupedData.map((group) => (
        <div key={group.key}>
          {/* Group header */}
          {state.groups.length > 0 && (
            <div className="
              sticky top-0 z-10
              px-4 py-2
              bg-[var(--color-muted)]
              border-b border-[var(--color-border)]
              font-medium text-sm
            ">
              {group.label} ({group.items.length})
            </div>
          )}
          
          {/* List items */}
          <div>
            {group.items.map((record, index) => (
              <div key={record.id}>
                {itemRenderer ? (
                  <div
                    onClick={() => onRecordClick?.(record)}
                    className="cursor-pointer"
                  >
                    {itemRenderer(record)}
                  </div>
                ) : (
                  <div
                    onClick={() => onRecordClick?.(record)}
                    className={`
                      flex items-center gap-3 px-4 py-3
                      hover:bg-[var(--color-muted)]
                      cursor-pointer
                      transition-colors
                      ${state.selectedIds.includes(record.id) ? 'bg-[var(--color-primary)]/10' : ''}
                    `}
                  >
                    {/* Checkbox */}
                    {onRecordSelect && (
                      <input
                        type="checkbox"
                        checked={state.selectedIds.includes(record.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newSelection = e.target.checked
                            ? [...state.selectedIds, record.id]
                            : state.selectedIds.filter(id => id !== record.id);
                          onRecordSelect(newSelection);
                        }}
                        className="rounded"
                      />
                    )}
                    
                    {/* Avatar */}
                    {avatarField && record[avatarField] && (
                      <img
                        src={record[avatarField]}
                        alt={record[titleField]}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {record[titleField]}
                      </div>
                      {descriptionField && record[descriptionField] && (
                        <div className="text-sm text-[var(--color-foreground-secondary)] truncate">
                          {record[descriptionField]}
                        </div>
                      )}
                      {metaFields.length > 0 && (
                        <div className="flex gap-3 mt-1">
                          {metaFields.map(fieldKey => {
                            const field = fields.find(f => f.key === fieldKey);
                            const value = record[fieldKey];
                            if (!value || !field) return null;
                            
                            return (
                              <div key={fieldKey} className="text-xs text-[var(--color-foreground-secondary)]">
                                {field.format ? field.format(value, record) : String(value)}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Chevron */}
                    <ChevronRight className="w-5 h-5 text-[var(--color-foreground-muted)] flex-shrink-0" />
                  </div>
                )}
                
                {/* Divider */}
                {dividers && index < group.items.length - 1 && (
                  <div className="border-b border-[var(--color-border)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

ListView.displayName = 'ListView';
