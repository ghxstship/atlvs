'use client';

import React, { useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Download, 
  Upload, 
  MoreHorizontal,
  X,
  Plus
} from 'lucide-react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Select } from '../Select';
import { useDataView } from './DataViewProvider';

export interface DataActionsProps {
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  showBulkActions?: boolean;
  showViewOptions?: boolean;
  className?: string;
}

export function DataActions({
  showSearch = true,
  showFilters = true,
  showSort = true,
  showExport = true,
  showImport = true,
  showBulkActions = true,
  showViewOptions = true,
  className = ''
}: DataActionsProps) {
  const { state, config, actions } = useDataView();
  
  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Form states
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState('visible');

  // Bulk action handler
  const handleBulkAction = useCallback((action: any) => {
    if (action.confirmMessage) {
      if (window.confirm(action.confirmMessage)) {
        action.onClick(state.selection);
      }
    } else {
      action.onClick(state.selection);
    }
  }, [state.selection]);

  // Export/Import
  const handleExport = useCallback((format: string) => {
    if (config.exportConfig && config.data) {
      const exportData = config.data.filter(record => 
        state.selection.length === 0 || state.selection.includes(record.id)
      );
      config.exportConfig.onExport(format, exportData, {
        filters: state.filters,
        sorts: state.sorts,
        fields: state.fields.filter(f => f.visible !== false)
      });
    }
    setShowExportModal(false);
  }, [config, state]);

  const handleImport = useCallback((file: File) => {
    if (config.importConfig) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let data;
          
          if (file.name.endsWith('.json')) {
            data = JSON.parse(content);
          } else if (file.name.endsWith('.csv')) {
            // Simple CSV parsing - in production, use a proper CSV parser
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            data = lines.slice(1).map(line => {
              const values = line.split(',');
              return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index]?.trim();
                return obj;
              }, {} as any);
            });
          }
          
          if (data && config.importConfig) {
            config.importConfig.onImport(data);
          }
        } catch (error) {
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
    setShowImportModal(false);
  }, [config]);

  // Build CSS classes
  const actionsClasses = `
    flex items-center justify-between gap-md p-md bg-background border-b border-border
    ${className}
  `.trim();

  return (
    <>
      <div className={actionsClasses}>
        {/* Left Side - Search and Filters */}
        <div className="flex items-center gap-sm flex-1">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={state.search}
                onChange={(e) => actions.setSearch(e.target.value)}
                className="pl-2xl pr-md py-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex items-center gap-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilterModal(true)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {state.filters.length > 0 && (
                  <span className="ml-xs px-xs.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                    {state.filters.length}
                  </span>
                )}
              </Button>
            </div>
          )}

          {showSort && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSortModal(true)}
            >
              <SortAsc className="h-4 w-4" />
              Sort
              {state.sorts.length > 0 && (
                <span className="ml-xs px-xs.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {state.sorts.length}
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-sm">
          {/* Bulk Actions */}
          {showBulkActions && state.selection.length > 0 && config.bulkActions && (
            <div className="flex items-center gap-xs mr-sm">
              <span className="text-sm text-muted-foreground">
                {state.selection.length} selected:
              </span>
              {config.bulkActions.map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant === 'secondary' ? 'outline' : (action.variant || 'ghost')}
                  size="sm"
                  onClick={() => handleBulkAction(action)}
                  disabled={action.disabled}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Export */}
          {showExport && config.exportConfig && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExportModal(true)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}

          {/* Import */}
          {showImport && config.importConfig && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
          )}

          {/* View Options */}
          {showViewOptions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Toggle view options */}}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <Modal
          open={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          title="Manage Filters"
        >
          <FilterForm
            fields={state.fields}
            currentFilters={state.filters}
            onAddFilter={(filter: any) => actions.setFilters([...state.filters, filter])}
            onRemoveFilter={(index: number) => actions.setFilters(state.filters.filter((_, i) => i !== index))}
            onClose={() => setShowFilterModal(false)}
          />
        </Modal>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <Modal
          open={showSortModal}
          onClose={() => setShowSortModal(false)}
          title="Manage Sorting"
        >
          <SortForm
            fields={state.fields}
            currentSorts={state.sorts}
            onAddSort={(sort: any) => actions.setSorts([...state.sorts, sort])}
            onRemoveSort={(index: number) => actions.setSorts(state.sorts.filter((_, i) => i !== index))}
            onClose={() => setShowSortModal(false)}
          />
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Modal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Data"
        >
          <div className="space-y-md">
            <div>
              <label className="block text-sm font-medium mb-xs">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full p-sm border border-border rounded-md bg-background text-foreground"
              >
                {config.exportConfig?.formats?.map(format => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                )) || [
                  <option key="csv" value="csv">CSV</option>,
                  <option key="json" value="json">JSON</option>
                ]}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-xs">Include Fields</label>
              <select
                value={exportFields}
                onChange={(e) => setExportFields(e.target.value)}
                className="w-full p-sm border border-border rounded-md bg-background text-foreground"
              >
                <option value="visible">Visible Fields Only</option>
                <option value="all">All Fields</option>
              </select>
            </div>
            <div className="flex justify-end gap-sm">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => handleExport(exportFormat)}>
                Export
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <Modal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Data"
        >
          <div className="space-y-md">
            <div>
              <label className="block text-sm font-medium mb-xs">Select File</label>
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImport(file);
                  }
                }}
                className="w-full p-sm border border-border rounded-md bg-background text-foreground"
              />
            </div>
            <div className="flex justify-end gap-sm">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// Filter Form Component
function FilterForm({ fields, currentFilters, onAddFilter, onRemoveFilter, onClose }: any) {
  const [newFilter, setNewFilter] = useState({ field: '', operator: 'equals', value: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFilter.field && newFilter.value) {
      onAddFilter(newFilter);
      setNewFilter({ field: '', operator: 'equals', value: '' });
    }
  };

  return (
    <div className="space-y-md">
      <form onSubmit={handleSubmit} className="space-y-md">
        <div>
          <label className="block text-sm font-medium mb-xs">Field</label>
          <select
            value={newFilter.field}
            onChange={(e) => setNewFilter({...newFilter, field: e.target.value})}
            className="w-full p-sm border border-border rounded-md bg-background text-foreground"
          >
            <option value="">Select field...</option>
            {fields.filter((f: any) => f.filterable !== false).map((field: any) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-xs">Operator</label>
          <select
            value={newFilter.operator}
            onChange={(e) => setNewFilter({...newFilter, operator: e.target.value})}
            className="w-full p-sm border border-border rounded-md bg-background text-foreground"
          >
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="gt">Greater Than</option>
            <option value="lt">Less Than</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-xs">Value</label>
          <input
            type="text"
            value={newFilter.value}
            onChange={(e) => setNewFilter({...newFilter, value: e.target.value})}
            className="w-full p-sm border border-border rounded-md bg-background text-foreground"
            placeholder="Enter filter value..."
          />
        </div>

        <div className="flex justify-end gap-sm">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!newFilter.field || !newFilter.value}>
            Add Filter
          </Button>
        </div>
      </form>

      {currentFilters.length > 0 && (
        <div className="space-y-xs">
          <h4 className="font-medium">Current Filters:</h4>
          {currentFilters.map((filter: any, index: number) => {
            const field = fields.find((f: any) => f.key === filter.field);
            return (
              <div key={index} className="flex items-center justify-between p-sm bg-muted/10 rounded">
                <span className="text-sm">
                  {field?.label || filter.field} {filter.operator} "{filter.value}"
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFilter(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Sort Form Component
function SortForm({ fields, currentSorts, onAddSort, onRemoveSort, onClose }: any) {
  const [newSort, setNewSort] = useState({ field: '', direction: 'asc' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSort.field) {
      onAddSort(newSort);
      setNewSort({ field: '', direction: 'asc' });
    }
  };

  return (
    <div className="space-y-md">
      <form onSubmit={handleSubmit} className="space-y-md">
        <div className="flex gap-sm">
          <div className="flex-1">
            <select
              value={newSort.field}
              onChange={(e) => setNewSort({...newSort, field: e.target.value})}
              className="w-full p-sm border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Select field...</option>
              {fields.filter((f: any) => f.sortable !== false).map((field: any) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={newSort.direction}
            onChange={(e) => setNewSort({...newSort, direction: e.target.value as 'asc' | 'desc'})}
            className="w-24 p-sm border border-border rounded-md bg-background text-foreground"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <Button type="submit" disabled={!newSort.field}>
            Add
          </Button>
        </div>
      </form>

      {currentSorts.length > 0 && (
        <div className="space-y-xs">
          <h4 className="font-medium">Current Sorts:</h4>
          {currentSorts.map((sort: any, index: number) => {
            const field = fields.find((f: any) => f.key === sort.field);
            return (
              <div key={index} className="flex items-center justify-between p-sm bg-muted/10 rounded">
                <span className="text-sm">
                  {field?.label || sort.field} ({sort.direction === 'asc' ? 'Ascending' : 'Descending'})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveSort(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
