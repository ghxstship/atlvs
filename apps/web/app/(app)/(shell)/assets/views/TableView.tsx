'use client';

/**
 * Assets Table View
 *
 * Enterprise-grade table view component for asset management.
 * Features advanced grid functionality, frozen columns, cell editing,
 * conditional formatting, and responsive design.
 *
 * @module assets/views/TableView
 */

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Asset, AssetFilters, AssetSort, AssetViewState } from '../types';
import { apiClient } from '../lib/api';
import { realtimeService } from '../lib/realtime';
import {
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@ghxstship/ui";
import { Button ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { Input ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { Badge ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { Checkbox ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  Dropdown,
  
  DropdownItem,
  
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Copy,
  Download,
  Filter,
  Search,
  Settings
} from 'lucide-react';

interface TableViewProps {
  viewState: AssetViewState;
  onViewStateChange: (newState: Partial<AssetViewState>) => void;
  onAssetSelect?: (asset: Asset, selected: boolean) => void;
  onAssetAction?: (action: string, asset: Asset) => void;
  className?: string;
}

// Column configuration
interface ColumnConfig {
  key: keyof Asset | string;
  label: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  frozen?: boolean;
  render?: (value: unknown, asset: Asset) => React.ReactNode;
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'select',
    label: '',
    width: 48,
    frozen: true,
    render: (value, asset) => (
      <Checkbox
        checked={asset.id ? true : false}
        onChange={() => {}}
      />
    )
  },
  {
    key: 'name',
    label: 'Asset Name',
    width: 200,
    sortable: true,
    filterable: true,
    editable: true,
    frozen: true,
    render: (value) => (
      <div className="font-medium truncate">{value}</div>
    )
  },
  {
    key: 'asset_tag',
    label: 'Asset Tag',
    width: 120,
    sortable: true,
    filterable: true,
    editable: true,
    render: (value) => (
      <Badge variant="outline" className="font-mono text-xs">
        {value}
      </Badge>
    )
  },
  {
    key: 'category',
    label: 'Category',
    width: 120,
    sortable: true,
    filterable: true,
    editable: true,
    render: (value) => (
      <Badge variant="secondary" className="text-xs capitalize">
        {value?.replace('_', ' ')}
      </Badge>
    )
  },
  {
    key: 'status',
    label: 'Status',
    width: 100,
    sortable: true,
    filterable: true,
    editable: true,
    render: (value) => {
      const statusColors = {
        available: 'bg-green-100 text-green-800',
        in_use: 'bg-blue-100 text-blue-800',
        maintenance: 'bg-yellow-100 text-yellow-800',
        retired: 'bg-gray-100 text-gray-800',
        lost: 'bg-red-100 text-red-800',
        damaged: 'bg-orange-100 text-orange-800'
      };
      return (
        <Badge className={`text-xs capitalize ${statusColors[e.target.value as keyof typeof statusColors] || 'bg-gray-100'}`}>
          {value?.replace('_', ' ')}
        </Badge>
      );
    }
  },
  {
    key: 'condition',
    label: 'Condition',
    width: 100,
    sortable: true,
    filterable: true,
    editable: true,
    render: (value) => {
      const conditionColors = {
        excellent: 'bg-emerald-100 text-emerald-800',
        good: 'bg-green-100 text-green-800',
        fair: 'bg-yellow-100 text-yellow-800',
        poor: 'bg-orange-100 text-orange-800',
        needs_repair: 'bg-red-100 text-red-800'
      };
      return (
        <Badge className={`text-xs capitalize ${conditionColors[e.target.value as keyof typeof conditionColors] || 'bg-gray-100'}`}>
          {value?.replace('_', ' ')}
        </Badge>
      );
    }
  },
  {
    key: 'location',
    label: 'Location',
    width: 150,
    sortable: true,
    filterable: true,
    render: (value) => (
      <div className="truncate text-sm">{value?.name || 'Unassigned'}</div>
    )
  },
  {
    key: 'assigned_to',
    label: 'Assigned To',
    width: 150,
    sortable: true,
    filterable: true,
    render: (value) => (
      <div className="flex items-center gap-xs">
        {value?.avatar && (
          <Image
            src={value.avatar}
            alt={value.name}
            width={32}
            height={32}
            className="w-icon-md h-icon-md rounded-full"
          />
        )}
        <span className="truncate text-sm">{value?.name || 'Unassigned'}</span>
      </div>
    )
  },
  {
    key: 'purchase_price',
    label: 'Purchase Price',
    width: 120,
    sortable: true,
    editable: true,
    render: (value) => value ? `$${value.toLocaleString()}` : '-'
  },
  {
    key: 'current_value',
    label: 'Current Value',
    width: 120,
    sortable: true,
    render: (value) => value ? `$${value.toLocaleString()}` : '-'
  },
  {
    key: 'brand',
    label: 'Brand',
    width: 100,
    sortable: true,
    filterable: true,
    editable: true
  },
  {
    key: 'model',
    label: 'Model',
    width: 100,
    sortable: true,
    filterable: true,
    editable: true
  },
  {
    key: 'actions',
    label: '',
    width: 48,
    frozen: true,
    render: (value, asset) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-icon-lg w-icon-lg p-0">
            <MoreHorizontal className="h-icon-xs w-icon-xs" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {}}>
            <Eye className="mr-2 h-icon-xs w-icon-xs" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>
            <Edit className="mr-2 h-icon-xs w-icon-xs" />
            Edit Asset
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {}}>
            <Copy className="mr-2 h-icon-xs w-icon-xs" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>
            <Download className="mr-2 h-icon-xs w-icon-xs" />
            Export
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {}} className="text-red-600">
            <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];

export default function TableView({
  viewState,
  onViewStateChange,
  onAssetSelect,
  onAssetAction,
  className = ''
}: TableViewProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>(new Set());

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAssets(
        viewState.filters,
        viewState.sort,
        viewState.pagination
      );
      setAssets(response.data);
      onViewStateChange({
        pagination: {
          ...viewState.pagination,
          total: response.pagination.total
        }
      });
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  }, [viewState.filters, viewState.sort, viewState.pagination, onViewStateChange]);

  // Set up realtime subscription
  React.useEffect(() => {
    const unsubscribe = realtimeService.subscribeToAssets(
      'org-id', // Would come from context
      (event, record, oldRecord) => {
        if (event === 'INSERT') {
          setAssets(prev => [record, ...prev]);
        } else if (event === 'UPDATE') {
          setAssets(prev =>
            prev.map(asset =>
              asset.id === record.id ? { ...asset, ...record } : asset
            )
          );
        } else if (event === 'DELETE') {
          setAssets(prev => prev.filter(asset => asset.id !== record.id));
        }
      }
    );

    return unsubscribe;
  }, []);

  // Load data on mount and when filters/sort change
  React.useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Handle column sorting
  const handleSort = useCallback((columnKey: string) => {
    const newSort: AssetSort = {
      field: columnKey as keyof Asset,
      direction: viewState.sort.field === columnKey && viewState.sort.direction === 'asc'
        ? 'desc'
        : 'asc'
    };
    onViewStateChange({ sort: newSort });
  }, [viewState.sort, onViewStateChange]);

  // Handle row selection
  const handleRowSelect = useCallback((assetId: string, selected: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(assetId);
      } else {
        newSet.delete(assetId);
      }
      return newSet;
    });
    onAssetSelect?.(assets.find(a => a.id === assetId)!, selected);
  }, [assets, onAssetSelect, setSelectedRows]);

  // Handle bulk selection
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const allIds = new Set(assets.map(a => a.id));
      setSelectedRows(allIds);
      assets.forEach(asset => onAssetSelect?.(asset, true));
    } else {
      setSelectedRows(new Set());
      assets.forEach(asset => onAssetSelect?.(asset, false));
    }
  }, [assets, onAssetSelect, setSelectedRows]);

  // Get visible columns
  const visibleColumns = useMemo(() =>
    COLUMNS.filter(col => viewState.visibleFields.includes(col.key as keyof Asset)),
    [viewState.visibleFields]
  );

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (viewState.sort.field !== columnKey) {
      return <ArrowUpDown className="ml-2 h-icon-xs w-icon-xs" />;
    }
    return viewState.sort.direction === 'asc'
      ? <ArrowUp className="ml-2 h-icon-xs w-icon-xs" />
      : <ArrowDown className="ml-2 h-icon-xs w-icon-xs" />;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Table Controls */}
      <div className="flex items-center justify-between p-md border-b">
        <div className="flex items-center gap-xs">
          <div className="relative">
            <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-gray-400" />
            <Input
              placeholder="Search assets..."
              className="pl-9 w-container-sm"
              value={viewState.filters.search || ''}
              onChange={(e) => onViewStateChange({
                filters: { ...viewState.filters, search: e.target.value }
              })}
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-icon-xs w-icon-xs" />
            Filters
          </Button>
        </div>
        <div className="flex items-center gap-xs">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-icon-xs w-icon-xs" />
            Columns
          </Button>
          {selectedRows.size > 0 && (
            <div className="flex items-center gap-xs">
              <span className="text-sm text-gray-600">
                {selectedRows.size} selected
              </span>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`${
                    column.frozen ? 'sticky left-0 bg-white z-20' : ''
                  } ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  style={{ width: column.width, minWidth: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.key === 'select' ? (
                      <Checkbox
                        checked={selectedRows.size === assets.length && assets.length > 0}
                        indeterminate={selectedRows.size > 0 && selectedRows.size < assets.length}
                        onChange={(checked) => handleSelectAll(checked)}
                      />
                    ) : (
                      <>
                        {column.label}
                        {column.sortable && renderSortIcon(column.key)}
                      </>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-xl">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-icon-md w-icon-md border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading assets...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-xl">
                  <div className="text-gray-500">No assets found</div>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className={`hover:bg-gray-50 ${
                    selectedRows.has(asset.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {visibleColumns.map((column) => {
                    const value = column.key.includes('.')
                      ? column.key.split('.').reduce((obj, key) => obj?.[key], asset)
                      : asset[column.key as keyof Asset];

                    return (
                      <TableCell
                        key={column.key}
                        className={column.frozen ? 'sticky left-0 bg-white' : ''}
                        style={{ width: column.width, minWidth: column.width }}
                      >
                        {column.render
                          ? column.render(value, asset)
                          : <span className="truncate">{value || '-'}</span>
                        }
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-md border-t">
        <div className="text-sm text-gray-600">
          Showing {((viewState.pagination.page - 1) * viewState.pagination.pageSize) + 1} to{' '}
          {Math.min(viewState.pagination.page * viewState.pagination.pageSize, viewState.pagination.total || 0)} of{' '}
          {viewState.pagination.total || 0} assets
        </div>
        <div className="flex items-center gap-xs">
          <Button
            variant="outline"
            size="sm"
            disabled={viewState.pagination.page === 1}
            onClick={() => onViewStateChange({
              pagination: { ...viewState.pagination, page: viewState.pagination.page - 1 }
            })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!viewState.pagination.total ||
              viewState.pagination.page * viewState.pagination.pageSize >= viewState.pagination.total}
            onClick={() => onViewStateChange({
              pagination: { ...viewState.pagination, page: viewState.pagination.page + 1 }
            })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
