/**
 * Procurement Table View Component
 * Data table implementation for procurement entities
 */

'use client';
import { DataGrid } from '@ghxstship/ui';

import React from 'react';
import { DataGrid } from '@ghxstship/ui/components/DataViews/DataGrid';
import { useATLVS } from '../../core/providers/ATLVSProvider';
import type { FieldConfig } from '../../unified/drawers/UnifiedDrawer';

interface TableViewProps {
  entity?: string;
  fields?: FieldConfig[];
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  compact?: boolean;
}

export const TableView: React.FC<TableViewProps> = ({
  entity,
  fields,
  selectable = true,
  sortable = true,
  filterable = true,
  paginated = true,
  compact = false
}) => {
  const {
    data,
    loading,
    error,
    selectedIds,
    setSelectedIds,
    handleEdit,
    handleView,
    handleDelete,
    config
  } = useATLVS();

  const handleItemAction = (action: string, item: unknown) => {
    switch (action) {
      case 'view':
        handleView(item);
        break;
      case 'edit':
        handleEdit(item);
        break;
      case 'delete':
        handleDelete(item.id);
        break;
      default:
    }
  };

  return (
    <DataGrid
      data={data}
      fields={fields || config.fields || []}
      loading={loading}
      error={error}
      selectable={selectable}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      sortable={sortable}
      filterable={filterable}
      paginated={paginated}
      compact={compact}
      onItemAction={handleItemAction}
      emptyState={config.emptyState}
    />
  );
};

export default TableView;
