/**
 * GridView Component — Spreadsheet-Style Data Grid
 * Modern data grid with inline editing, sorting, filtering
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Filter, Plus } from 'lucide-react';
import type { ViewProps, FieldConfig, DataRecord } from '../types';

export interface GridViewProps extends ViewProps {
  /** Enable inline editing */
  editable?: boolean;
  
  /** Row height */
  rowHeight?: 'compact' | 'normal' | 'comfortable';
  
  /** Enable row hover */
  hoverHighlight?: boolean;
  
  /** Enable zebra striping */
  striped?: boolean;
  
  /** Sticky header */
  stickyHeader?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * GridView Component
 * 
 * @example
 * ```tsx
 * <GridView
 *   data={records}
 *   fields={fieldConfig}
 *   state={viewState}
 *   onRecordClick={handleClick}
 *   editable
 * />
 * ```
 */
export function GridView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  onRecordClick,
  onRecordSelect,
  onSort,
  onCreate,
  onEdit,
  onDelete,
  editable = false,
  rowHeight = 'normal',
  hoverHighlight = true,
  striped = false,
  stickyHeader = true,
  className = '',
}: GridViewProps) {
  const [editingCell, setEditingCell] = useState<{ recordId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  
  // Visible fields
  const visibleFields = useMemo(
    () => fields.filter(f => f.visible !== false),
    [fields]
  );
  
  // Row height classes
  const rowHeightClasses = {
    compact: 'h-8',
    normal: 'h-12',
    comfortable: 'h-16',
  };
  
  // Handle sort
  const handleSort = (field: string) => {
    if (!onSort) return;
    
    const currentSort = state.sorts.find(s => s.field === field);
    const newSorts = currentSort
      ? currentSort.direction === 'asc'
        ? [{ field, direction: 'desc' as const }]
        : []
      : [{ field, direction: 'asc' as const }];
    
    onSort(newSorts);
  };
  
  // Handle cell edit
  const handleCellDoubleClick = (record: DataRecord, field: FieldConfig) => {
    if (!editable || field.readonly) return;
    
    setEditingCell({ recordId: record.id, field: field.key });
    setEditValue(record[field.key]);
  };
  
  const handleCellEditSave = () => {
    if (!editingCell) return;
    
    // Would trigger update via onEdit
    // onEdit?.({ ...record, [editingCell.field]: editValue });
    
    setEditingCell(null);
    setEditValue(null);
  };
  
  const handleCellEditCancel = () => {
    setEditingCell(null);
    setEditValue(null);
  };
  
  // Get sort direction for field
  const getSortDirection = (field: string) => {
    const sort = state.sorts.find(s => s.field === field);
    return sort?.direction;
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading data</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground font-medium">No records found</p>
        {onCreate && (
          <button
            onClick={onCreate}
            className="
              mt-4 flex items-center gap-2 px-4 py-2
              rounded-md
              bg-primary
              text-primary-foreground
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
    <div className={`flex flex-col h-full ${className}`}>
      {/* Grid container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          {/* Header */}
          <thead
            className={`
              bg-muted
              border-b border-border
              ${stickyHeader ? 'sticky top-0 z-10' : ''}
            `}
          >
            <tr>
              {/* Checkbox column */}
              {onRecordSelect && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={state.selectedIds.length === data.length}
                    onChange={(e) => {
                      onRecordSelect(e.target.checked ? data.map(r => r.id) : []);
                    }}
                    className="rounded"
                  />
                </th>
              )}
              
              {/* Field columns */}
              {visibleFields.map((field) => {
                const sortDir = getSortDirection(field.key);
                
                return (
                  <th
                    key={field.key}
                    className="px-4 py-3 text-left"
                    style={{
                      width: field.width,
                      minWidth: field.minWidth,
                      maxWidth: field.maxWidth,
                    }}
                  >
                    <button
                      onClick={() => field.sortable && handleSort(field.key)}
                      className={`
                        flex items-center gap-2
                        font-medium text-sm
                        ${field.sortable ? 'hover:text-foreground cursor-pointer' : ''}
                      `}
                      disabled={!field.sortable}
                    >
                      {field.icon && <field.icon className="w-4 h-4" />}
                      <span>{field.label}</span>
                      {field.sortable && (
                        <span className="flex flex-col">
                          <ChevronUp
                            className={`w-3 h-3 -mb-1 ${sortDir === 'asc' ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${sortDir === 'desc' ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                        </span>
                      )}
                    </button>
                  </th>
                );
              })}
              
              {/* Actions column */}
              {(onEdit || onDelete) && (
                <th className="w-12 px-4 py-3" />
              )}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody>
            {data.map((record, rowIndex) => (
              <tr
                key={record.id}
                className={`
                  border-b border-border last:border-0
                  ${hoverHighlight ? 'hover:bg-muted' : ''}
                  ${striped && rowIndex % 2 === 1 ? 'bg-muted/50' : ''}
                  ${state.selectedIds.includes(record.id) ? 'bg-primary/10' : ''}
                  transition-colors
                  cursor-pointer
                `}
                onClick={() => onRecordClick?.(record)}
              >
                {/* Checkbox column */}
                {onRecordSelect && (
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
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
                    />
                  </td>
                )}
                
                {/* Field columns */}
                {visibleFields.map((field) => {
                  const isEditing =
                    editingCell?.recordId === record.id &&
                    editingCell?.field === field.key;
                  const value = record[field.key];
                  
                  return (
                    <td
                      key={field.key}
                      className={`px-4 ${rowHeightClasses[rowHeight]}`}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleCellDoubleClick(record, field);
                      }}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellEditSave}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellEditSave();
                            if (e.key === 'Escape') handleCellEditCancel();
                          }}
                          autoFocus
                          className="
                            w-full px-2 py-1
                            border border-primary
                            rounded
                            bg-background
                            focus:outline-none focus:ring-2 focus:ring-primary
                          "
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="truncate">
                          {field.format ? field.format(value, record) : String(value ?? '')}
                        </div>
                      )}
                    </td>
                  );
                })}
                
                {/* Actions column */}
                {(onEdit || onDelete) && (
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="
                        p-1 rounded
                        hover:bg-muted
                        transition-colors
                      "
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer with pagination */}
      {state.pagination && (
        <div className="
          flex items-center justify-between
          px-4 py-3
          border-t border-border
        ">
          <div className="text-sm text-muted-foreground">
            Showing {((state.pagination.page - 1) * state.pagination.pageSize) + 1} to{' '}
            {Math.min(state.pagination.page * state.pagination.pageSize, state.pagination.total)} of{' '}
            {state.pagination.total} records
          </div>
          <div className="flex gap-2">
            <button
              disabled={state.pagination.page === 1}
              className="
                px-3 py-1 rounded
                border border-border
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-muted
                transition-colors
              "
            >
              Previous
            </button>
            <button
              disabled={state.pagination.page * state.pagination.pageSize >= state.pagination.total}
              className="
                px-3 py-1 rounded
                border border-border
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-muted
                transition-colors
              "
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

GridView.displayName = 'GridView';
