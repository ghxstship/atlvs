/**
 * DataActions — ATLVS Data Action Toolbar
 * Provides common data manipulation actions (search, filter, export, etc.)
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import { Filter, Upload, RefreshCw, Trash2, Archive, Send } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Dropdown } from '../../molecules/Dropdown/Dropdown';

export interface DataActionsProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onExport?: (format: 'csv' | 'json' | 'xlsx') => void;
  onRefresh?: () => void;
  onBulkAction?: (action: string) => void;
  selectedCount?: number;
  showSearch?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  showBulkActions?: boolean;
  bulkActions?: Array<{ label: string; value: string; icon?: React.ComponentType<{ className?: string }> }>;
  className?: string;
}

export function DataActions({
  onSearch,
  onFilter,
  onExport,
  onRefresh,
  onBulkAction,
  selectedCount = 0,
  showSearch = true,
  showFilter = true,
  showExport = true,
  showRefresh = true,
  showBulkActions = true,
  bulkActions = [
    { label: 'Delete', value: 'delete', icon: Trash2 },
    { label: 'Archive', value: 'archive', icon: Archive },
    { label: 'Export', value: 'export', icon: Send },
  ],
  className = '',
}: DataActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const exportFormats = [
    { id: 'csv', label: 'Export as CSV', onClick: () => onExport?.('csv') },
    { id: 'json', label: 'Export as JSON', onClick: () => onExport?.('json') },
    { id: 'xlsx', label: 'Export as Excel', onClick: () => onExport?.('xlsx') },
  ];

  return (
    <div className={`flex items-center gap-sm flex-wrap ${className}`}>
      {/* Search */}
      {showSearch && onSearch && (
        <div className="flex-1 min-w-[200px]">
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
      )}

      {/* Filter */}
      {showFilter && onFilter && (
        <Button variant="outline" size="sm" onClick={onFilter}>
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      )}

      {/* Export */}
      {showExport && onExport && (
        <Dropdown
          items={exportFormats}
          trigger={
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Export
            </Button>
          }
        />
      )}

      {/* Refresh */}
      {showRefresh && onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      )}

      {/* Bulk Actions */}
      {showBulkActions && selectedCount > 0 && onBulkAction && (
        <div className="flex items-center gap-sm ml-auto">
          <span className="text-sm text-muted-foreground">
            {selectedCount} selected
          </span>
          <Dropdown
            items={bulkActions.map(action => ({
              id: action.value,
              label: action.label,
              onClick: () => onBulkAction(action.value),
            }))}
            trigger={
              <Button variant="outline" size="sm">
                Actions
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
