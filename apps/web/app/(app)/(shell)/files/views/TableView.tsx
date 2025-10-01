"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2,
  Share,
  Filter,
  Search,
  ArrowUpDown,
  Pin,
  PinOff,
} from 'lucide-react';
import { Button, Checkbox, Input, DropdownMenu, Badge } from '@ghxstship/ui';
import type { DigitalAsset } from '../types';

interface TableViewProps {
  files: DigitalAsset[];
  selectedFiles: Set<string>;
  onSelectFile: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (file: DigitalAsset) => void;
  onEdit: (file: DigitalAsset) => void;
  onDownload: (file: DigitalAsset) => void;
  onDelete: (file: DigitalAsset) => void;
  onShare: (file: DigitalAsset) => void;
  onBulkAction: (action: string, files: DigitalAsset[]) => void;
  formatFileSize: (bytes: number) => string;
  getCategoryIcon: (category: string) => React.ComponentType<any>;
  getAccessIcon: (level: string) => React.ComponentType<any>;
}

interface Column {
  key: keyof DigitalAsset | string;
  label: string;
  sortable: boolean;
  filterable: boolean;
  width?: number;
  frozen?: boolean;
  render?: (file: DigitalAsset) => React.ReactNode;
}

export default function TableView({
  files,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onShare,
  onBulkAction,
  formatFileSize,
  getCategoryIcon,
  getAccessIcon,
}: TableViewProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>({});
  const [frozenColumns, setFrozenColumns] = useState<Set<string>(new Set(['title']));
  const [columnWidths, setColumnWidths] = useState<Record<string, number>({});

  // Define table columns
  const columns: Column[] = [
    {
      key: 'select',
      label: '',
      sortable: false,
      filterable: false,
      width: 40,
      frozen: true,
      render: (file) => (
        <Checkbox
          checked={selectedFiles.has(file.id)}
          onCheckedChange={() => onSelectFile(file.id)}
        />
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      filterable: true,
      width: 250,
      frozen: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      width: 120,
      render: (file) => {
        const Icon = getCategoryIcon(file.category);
        return (
          <div className="flex items-center gap-xs">
            <Icon className="w-icon-xs h-icon-xs" />
            <span className="capitalize">{file.category}</span>
          </div>
        );
      },
    },
    {
      key: 'file_size',
      label: 'Size',
      sortable: true,
      filterable: false,
      width: 100,
      render: (file) => formatFileSize(file.file_size || 0),
    },
    {
      key: 'access_level',
      label: 'Access',
      sortable: true,
      filterable: true,
      width: 100,
      render: (file) => {
        const Icon = getAccessIcon(file.access_level);
        return (
          <div className="flex items-center gap-xs">
            <Icon className="w-icon-xs h-icon-xs" />
            <span className="capitalize">{file.access_level}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      width: 100,
      render: (file) => (
        <Badge
          variant={file.status === 'active' ? 'default' : 'secondary'}
        >
          {file.status}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      filterable: false,
      width: 150,
      render: (file) => new Date(file.created_at).toLocaleDateString(),
    },
    {
      key: 'updated_at',
      label: 'Modified',
      sortable: true,
      filterable: false,
      width: 150,
      render: (file) => new Date(file.updated_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      width: 120,
      render: (file) => (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-icon-xs h-icon-xs" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onClick={() => onView(file)}>
              <Eye className="w-icon-xs h-icon-xs mr-2" />
              View
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => onEdit(file)}>
              <Edit className="w-icon-xs h-icon-xs mr-2" />
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => onDownload(file)}>
              <Download className="w-icon-xs h-icon-xs mr-2" />
              Download
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => onShare(file)}>
              <Share className="w-icon-xs h-icon-xs mr-2" />
              Share
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onClick={() => onDelete(file)}
              className="text-red-600"
            >
              <Trash2 className="w-icon-xs h-icon-xs mr-2" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      ),
    },
  ];

  // Filter and sort files
  const processedFiles = useMemo(() => {
    let result = [...files];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        result = result.filter(file => {
          const fieldValue = file[key as keyof DigitalAsset];
          return String(fieldValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = a[sortColumn as keyof DigitalAsset];
        const bValue = b[sortColumn as keyof DigitalAsset];

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [files, filters, sortColumn, sortDirection]);

  // Handle column sorting
  const handleSort = useCallback((columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  // Handle filter changes
  const handleFilterChange = useCallback((columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value,
    }));
  }, []);

  // Toggle column freezing
  const toggleColumnFreeze = useCallback((columnKey: string) => {
    setFrozenColumns(prev => {
      const newFrozen = new Set(prev);
      if (newFrozen.has(columnKey)) {
        newFrozen.delete(columnKey);
      } else {
        newFrozen.add(columnKey);
      }
      return newFrozen;
    });
  }, []);

  // Handle column resize
  const handleColumnResize = useCallback((columnKey: string, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: width,
    }));
  }, []);

  // Bulk actions
  const selectedFileObjects = files.filter(file => selectedFiles.has(file.id));

  return (
    <div className="w-full">
      {/* Bulk Actions Bar */}
      {selectedFiles.size > 0 && (
        <div className="mb-4 p-md bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedFiles.size} file(s) selected
            </span>
            <div className="flex gap-xs">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction('download', selectedFileObjects)}
              >
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction('share', selectedFileObjects)}
              >
                Share
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onBulkAction('delete', selectedFileObjects)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => {
                  const isFrozen = frozenColumns.has(column.key);
                  const width = columnWidths[column.key] || column.width || 150;

                  return (
                    <th
                      key={column.key}
                      className={`relative p-sm text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        isFrozen ? 'sticky left-0 bg-gray-50 z-10 border-r-2 border-gray-300' : ''
                      }`}
                      style={{ width }}
                    >
                      <div className="flex items-center gap-xs">
                        {/* Column Header */}
                        <div className="flex items-center gap-xs flex-1">
                          {column.label}
                          {column.sortable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-icon-xs w-icon-xs p-0"
                              onClick={() => handleSort(column.key)}
                            >
                              {sortColumn === column.key ? (
                                sortDirection === 'asc' ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Column Actions */}
                        <div className="flex items-center gap-xs opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-icon-xs w-icon-xs p-0"
                            onClick={() => toggleColumnFreeze(column.key)}
                          >
                            {isFrozen ? (
                              <PinOff className="w-3 h-3" />
                            ) : (
                              <Pin className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Filter Input */}
                      {column.filterable && (
                        <div className="mt-1">
                          <Input
                            placeholder={`Filter ${column.label.toLowerCase()}`}
                            value={filters[column.key] || ''}
                            onChange={(e) => handleFilterChange(column.key, e.target.value)}
                            className="h-icon-md text-xs"
                          />
                        </div>
                      )}

                      {/* Resize Handle */}
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400"
                        onMouseDown={(e) => {
                          // Column resize logic would go here
                          e.preventDefault();
                        }}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {processedFiles.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-lg py-xsxl text-center text-gray-500"
                  >
                    No files found
                  </td>
                </tr>
              ) : (
                processedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 group">
                    {columns.map((column) => {
                      const isFrozen = frozenColumns.has(column.key);
                      const width = columnWidths[column.key] || column.width || 150;

                      return (
                        <td
                          key={column.key}
                          className={`px-sm py-md text-sm text-gray-900 ${
                            isFrozen ? 'sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r-2 border-gray-200' : ''
                          }`}
                          style={{ width }}
                        >
                          {column.render
                            ? column.render(file)
                            : (file[column.key as keyof DigitalAsset] as React.ReactNode)
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {processedFiles.length} of {files.length} files
        </div>
        <div className="flex items-center gap-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(processedFiles.every(file => selectedFiles.has(file.id)))}
          >
            {processedFiles.every(file => selectedFiles.has(file.id))
              ? 'Deselect All'
              : 'Select All'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
