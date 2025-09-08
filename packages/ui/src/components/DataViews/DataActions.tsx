'use client';

import React, { useState, useCallback } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';
import { Modal } from '../Modal';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Download, 
  Upload, 
  Settings,
  X,
  Plus,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';
import { FilterConfig, SortConfig, ActionConfig } from './types';

interface DataActionsProps {
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  showBulkActions?: boolean;
  showFieldToggle?: boolean;
}

export function DataActions({
  className = '',
  showSearch = true,
  showFilters = true,
  showSort = true,
  showExport = true,
  showImport = true,
  showBulkActions = true,
  showFieldToggle = true
}: DataActionsProps) {
  const { state, config, actions } = useDataView();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Filter Management
  const addFilter = useCallback((filter: Omit<FilterConfig, 'label'>) => {
    const field = state.fields.find(f => f.key === filter.field);
    const newFilter: FilterConfig = {
      ...filter,
      label: `${field?.label || filter.field} ${filter.operator} ${filter.value}`
    };
    actions.setFilters([...state.filters, newFilter]);
  }, [state.fields, state.filters, actions]);

  const removeFilter = useCallback((index: number) => {
    const newFilters = state.filters.filter((_, i) => i !== index);
    actions.setFilters(newFilters);
  }, [state.filters, actions]);

  const clearFilters = useCallback(() => {
    actions.setFilters([]);
  }, [actions]);

  // Sort Management
  const addSort = useCallback((sort: SortConfig) => {
    const existingIndex = state.sorts.findIndex(s => s.field === sort.field);
    let newSorts = [...state.sorts];
    
    if (existingIndex >= 0) {
      newSorts[existingIndex] = sort;
    } else {
      newSorts.push(sort);
    }
    
    actions.setSorts(newSorts);
  }, [state.sorts, actions]);

  const removeSort = useCallback((field: string) => {
    const newSorts = state.sorts.filter(s => s.field !== field);
    actions.setSorts(newSorts);
  }, [state.sorts, actions]);

  const clearSorts = useCallback(() => {
    actions.setSorts([]);
  }, [actions]);

  // Field Visibility Management
  const toggleFieldVisibility = useCallback((fieldKey: string) => {
    const newFields = state.fields.map(field => 
      field.key === fieldKey 
        ? { ...field, visible: field.visible !== false ? false : true }
        : field
    );
    // This would need to be handled by the parent component
    // as field configuration is typically managed at a higher level
  }, [state.fields]);

  // Bulk Actions
  const handleBulkAction = useCallback((action: ActionConfig) => {
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
    if (config.exportConfig) {
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

  const handleImport = useCallback((files: FileList | null) => {
    if (files && files.length > 0 && config.importConfig) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let data;
          if (file.name.endsWith('.json')) {
            data = JSON.parse(e.target?.result as string);
          } else if (file.name.endsWith('.csv')) {
            // Simple CSV parsing - in production, use a proper CSV parser
            const lines = (e.target?.result as string).split('\n');
            const headers = lines[0].split(',');
            data = lines.slice(1).map(line => {
              const values = line.split(',');
              return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index]?.trim();
                return obj;
              }, {} as any);
            });
          }
          
          if (data) {
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

  const actionsClasses = `
    flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700
    ${className}
  `.trim();

  return (
    <>
      <div className={actionsClasses}>
        {/* Left Side - Search and Filters */}
        <div className="flex items-center gap-2 flex-1">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={state.search}
                onChange={(e) => actions.setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilterModal(true)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {state.filters.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {state.filters.length}
                  </span>
                )}
              </Button>
              
              {state.filters.map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                >
                  <span>{filter.label}</span>
                  <button
                    onClick={() => removeFilter(index)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {state.filters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
          )}

          {showSort && state.sorts.length > 0 && (
            <div className="flex items-center gap-1">
              {state.sorts.map((sort) => {
                const field = state.fields.find(f => f.key === sort.field);
                return (
                  <div
                    key={sort.field}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-xs"
                  >
                    {sort.direction === 'asc' ? (
                      <SortAsc className="h-3 w-3" />
                    ) : (
                      <SortDesc className="h-3 w-3" />
                    )}
                    <span>{field?.label || sort.field}</span>
                    <button
                      onClick={() => removeSort(sort.field)}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSorts}
                className="text-xs"
              >
                Clear Sorts
              </Button>
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {showBulkActions && state.selection.length > 0 && config.bulkActions && (
            <div className="flex items-center gap-1 mr-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {state.selection.length} selected:
              </span>
              {config.bulkActions.map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant || 'ghost'}
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

          {/* View Options */}
          {showSort && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSortModal(true)}
            >
              <SortAsc className="h-4 w-4" />
              Sort
            </Button>
          )}

          {showFieldToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFieldModal(true)}
            >
              <Settings className="h-4 w-4" />
              Fields
            </Button>
          )}

          {/* Import/Export */}
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

          {/* Create Action */}
          {config.onCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={config.onCreate}
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Add Filter"
        size="md"
      >
        <FilterForm
          fields={state.fields}
          onAddFilter={addFilter}
          onClose={() => setShowFilterModal(false)}
        />
      </Modal>

      {/* Sort Modal */}
      <Modal
        open={showSortModal}
        onClose={() => setShowSortModal(false)}
        title="Sort Options"
        size="md"
      >
        <SortForm
          fields={state.fields}
          currentSorts={state.sorts}
          onAddSort={addSort}
          onRemoveSort={removeSort}
          onClose={() => setShowSortModal(false)}
        />
      </Modal>

      {/* Field Toggle Modal */}
      <Modal
        open={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        title="Manage Fields"
        size="md"
      >
        <FieldToggleForm
          fields={state.fields}
          onToggleField={toggleFieldVisibility}
          onClose={() => setShowFieldModal(false)}
        />
      </Modal>

      {/* Export Modal */}
      <Modal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Data"
        size="md"
      >
        <ExportForm
          config={config.exportConfig}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Data"
        size="md"
      >
        <ImportForm
          config={config.importConfig}
          onImport={handleImport}
          onClose={() => setShowImportModal(false)}
        />
      </Modal>
    </>
  );
}

// Sub-components for modals
function FilterForm({ fields, onAddFilter, onClose }: any) {
  const [selectedField, setSelectedField] = useState('');
  const [operator, setOperator] = useState('equals');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedField && value) {
      onAddFilter({ field: selectedField, operator, value });
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Field"
        value={selectedField}
        onChange={(e) => setSelectedField(e.target.value)}
        required
      >
        <option value="">Select field...</option>
        {fields.filter((f: any) => f.filterable !== false).map((field: any) => (
          <option key={field.key} value={field.key}>
            {field.label}
          </option>
        ))}
      </Select>

      <Select
        label="Operator"
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
      >
        <option value="equals">Equals</option>
        <option value="contains">Contains</option>
        <option value="startsWith">Starts with</option>
        <option value="endsWith">Ends with</option>
        <option value="gt">Greater than</option>
        <option value="lt">Less than</option>
      </Select>

      <Input
        label="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Add Filter
        </Button>
      </div>
    </form>
  );
}

function SortForm({ fields, currentSorts, onAddSort, onRemoveSort, onClose }: any) {
  const [selectedField, setSelectedField] = useState('');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedField) {
      onAddSort({ field: selectedField, direction });
      setSelectedField('');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="flex-1"
          >
            <option value="">Select field...</option>
            {fields.filter((f: any) => f.sortable !== false).map((field: any) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </Select>

          <Select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>

          <Button type="submit" disabled={!selectedField}>
            Add
          </Button>
        </div>
      </form>

      {currentSorts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Current Sorts:</h4>
          {currentSorts.map((sort: any) => {
            const field = fields.find((f: any) => f.key === sort.field);
            return (
              <div key={sort.field} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span>
                  {field?.label || sort.field} ({sort.direction})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveSort(sort.field)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

function FieldToggleForm({ fields, onToggleField, onClose }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {fields.map((field: any) => (
          <label key={field.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.visible !== false}
              onChange={() => onToggleField(field.key)}
              className="rounded"
            />
            <span>{field.label}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

function ExportForm({ config, onExport, onClose }: any) {
  const [selectedFormat, setSelectedFormat] = useState(config?.formats[0] || 'csv');

  return (
    <div className="space-y-4">
      <Select
        label="Format"
        value={selectedFormat}
        onChange={(e) => setSelectedFormat(e.target.value)}
      >
        {config?.formats.map((format: string) => (
          <option key={format} value={format}>
            {format.toUpperCase()}
          </option>
        ))}
      </Select>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onExport(selectedFormat)}>
          Export
        </Button>
      </div>
    </div>
  );
}

function ImportForm({ config, onImport, onClose }: any) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImport(e.target.files);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Select file to import
        </label>
        <input
          type="file"
          onChange={handleFileSelect}
          accept={config?.formats.map((f: string) => `.${f}`).join(',')}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
