'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../Button';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { 
  Settings, 
  RotateCcw, 
  Download, 
  Filter,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { DataRecord, FieldConfig } from './types';

interface PivotTableProps {
  className?: string;
  defaultRowFields?: string[];
  defaultColumnFields?: string[];
  defaultValueFields?: string[];
  defaultAggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max';
  showGrandTotals?: boolean;
  showSubTotals?: boolean;
  allowDrillDown?: boolean;
}

interface PivotCell {
  value: any;
  aggregatedValue: number;
  count: number;
  records: DataRecord[];
  rowPath: string[];
  columnPath: string[];
}

interface PivotConfig {
  rowFields: string[];
  columnFields: string[];
  valueFields: string[];
  aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max';
  filters: Record<string, any>;
}

export function PivotTableView({
  className = '',
  defaultRowFields = [],
  defaultColumnFields = [],
  defaultValueFields = [],
  defaultAggregation = 'sum',
  showGrandTotals = true,
  showSubTotals = true,
  allowDrillDown = true
}: PivotTableProps) {
  const { state, config, actions } = useDataView();
  const [pivotConfig, setPivotConfig] = useState<PivotConfig>({
    rowFields: defaultRowFields,
    columnFields: defaultColumnFields,
    valueFields: defaultValueFields.length > 0 ? defaultValueFields : ['count'],
    aggregation: defaultAggregation,
    filters: {}
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

  // Get numeric fields for value aggregation
  const numericFields = useMemo(() => 
    state.fields.filter(field => 
      ['number', 'currency'].includes(field.type) || field.key === 'count'
    ),
    [state.fields]
  );

  // Get categorical fields for rows/columns
  const categoricalFields = useMemo(() => 
    state.fields.filter(field => 
      ['text', 'select', 'boolean', 'date'].includes(field.type)
    ),
    [state.fields]
  );

  // Build pivot data structure
  const pivotData = useMemo(() => {
    const data = config.data || [];
    const { rowFields, columnFields, valueFields, aggregation } = pivotConfig;

    // Create hierarchical structure
    const pivot: Record<string, Record<string, PivotCell>> = {};
    const rowHeaders: string[][] = [];
    const columnHeaders: string[][] = [];

    // Process each record
    data.forEach(record => {
      // Build row path
      const rowPath = rowFields.map(field => String(record[field] || ''));
      const rowKey = rowPath.join('|');

      // Build column path
      const columnPath = columnFields.map(field => String(record[field] || ''));
      const columnKey = columnPath.join('|');

      // Initialize pivot structure
      if (!pivot[rowKey]) {
        pivot[rowKey] = {};
        rowHeaders.push(rowPath);
      }

      if (!pivot[rowKey][columnKey]) {
        pivot[rowKey][columnKey] = {
          value: null,
          aggregatedValue: 0,
          count: 0,
          records: [],
          rowPath,
          columnPath
        };
        
        if (!columnHeaders.some(path => path.join('|') === columnKey)) {
          columnHeaders.push(columnPath);
        }
      }

      const cell = pivot[rowKey][columnKey];
      cell.records.push(record);
      cell.count++;

      // Calculate aggregated value
      if (valueFields.includes('count')) {
        cell.aggregatedValue = cell.count;
      } else {
        const values = valueFields.map(field => Number(record[field]) || 0);
        switch (aggregation) {
          case 'sum':
            cell.aggregatedValue = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'avg':
            cell.aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
            break;
          case 'min':
            cell.aggregatedValue = Math.min(...values);
            break;
          case 'max':
            cell.aggregatedValue = Math.max(...values);
            break;
          default:
            cell.aggregatedValue = cell.count;
        }
      }
    });

    return { pivot, rowHeaders, columnHeaders };
  }, [config.data, pivotConfig]);

  // Calculate totals
  const calculateTotals = useCallback((cells: PivotCell[]) => {
    if (cells.length === 0) return 0;
    
    switch (pivotConfig.aggregation) {
      case 'sum':
        return cells.reduce((sum, cell) => sum + cell.aggregatedValue, 0);
      case 'avg':
        return cells.reduce((sum, cell) => sum + cell.aggregatedValue, 0) / cells.length;
      case 'min':
        return Math.min(...cells.map(cell => cell.aggregatedValue));
      case 'max':
        return Math.max(...cells.map(cell => cell.aggregatedValue));
      case 'count':
        return cells.reduce((sum, cell) => sum + cell.count, 0);
      default:
        return cells.length;
    }
  }, [pivotConfig.aggregation]);

  // Format cell value
  const formatValue = useCallback((value: number, field?: FieldConfig) => {
    if (value === null || value === undefined) return '-';
    
    if (field?.type === 'currency') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value);
    }
    
    if (pivotConfig.aggregation === 'avg') {
      return value.toFixed(2);
    }
    
    return value.toLocaleString();
  }, [pivotConfig.aggregation]);

  // Toggle row expansion
  const toggleRowExpansion = useCallback((rowKey: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowKey)) {
        newSet.delete(rowKey);
      } else {
        newSet.add(rowKey);
      }
      return newSet;
    });
  }, []);

  // Handle drill down
  const handleDrillDown = useCallback((cell: PivotCell) => {
    if (!allowDrillDown) return;
    
    // Filter data to show only records in this cell
    actions.setSelectedRecords(cell.records.map(r => r.id));
    
    // Could also open a detailed view or apply filters
    console.log('Drill down into cell:', cell);
  }, [allowDrillDown, actions]);

  const containerClasses = `
    pivot-table-view bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Configuration Panel */}
      <div className="p-smmd border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-lg font-semibold">Pivot Table Configuration</h3>
          <div className="flex items-center gap-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPivotConfig({
                rowFields: [],
                columnFields: [],
                valueFields: ['count'],
                aggregation: 'sum',
                filters: {}
              })}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          {/* Row Fields */}
          <div>
            <label className="block text-sm font-medium mb-sm">Row Fields</label>
            <select
              value=""
              onChange={(e) => {
                const field = e.target.value;
                if (field && !pivotConfig.rowFields.includes(field)) {
                  setPivotConfig(prev => ({
                    ...prev,
                    rowFields: [...prev.rowFields, field]
                  }));
                }
              }}
              className="w-full px-sm py-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Add row field...</option>
              {categoricalFields.filter(field => 
                !pivotConfig.rowFields.includes(field.key)
              ).map(field => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
            <div className="mb-xs space-y-xs">
              {pivotConfig.rowFields.map(field => (
                <div key={field} className="flex items-center justify-between bg-background px-xs py-xs rounded">
                  <span className="text-sm">{state.fields.find(f => f.key === field)?.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPivotConfig(prev => ({
                      ...prev,
                      rowFields: prev.rowFields.filter(f => f !== field)
                    }))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Column Fields */}
          <div>
            <label className="block text-sm font-medium mb-sm">Column Fields</label>
            <select
              value=""
              onChange={(e) => {
                const field = e.target.value;
                if (field && !pivotConfig.columnFields.includes(field)) {
                  setPivotConfig(prev => ({
                    ...prev,
                    columnFields: [...prev.columnFields, field]
                  }));
                }
              }}
              className="w-full px-sm py-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Add column field...</option>
              {categoricalFields.filter(field => 
                !pivotConfig.columnFields.includes(field.key)
              ).map(field => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
            <div className="mb-xs space-y-xs">
              {pivotConfig.columnFields.map(field => (
                <div key={field} className="flex items-center justify-between bg-background px-xs py-xs rounded">
                  <span className="text-sm">{state.fields.find(f => f.key === field)?.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPivotConfig(prev => ({
                      ...prev,
                      columnFields: prev.columnFields.filter(f => f !== field)
                    }))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Value Fields */}
          <div>
            <label className="block text-sm font-medium mb-sm">Value Fields</label>
            <select
              value=""
              onChange={(e) => {
                const field = e.target.value;
                if (field && !pivotConfig.valueFields.includes(field)) {
                  setPivotConfig(prev => ({
                    ...prev,
                    valueFields: [...prev.valueFields, field]
                  }));
                }
              }}
              className="w-full px-sm py-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Add value field...</option>
              {numericFields.filter(field => 
                !pivotConfig.valueFields.includes(field.key)
              ).map(field => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
            <div className="mb-xs space-y-xs">
              {pivotConfig.valueFields.map(field => (
                <div key={field} className="flex items-center justify-between bg-background px-xs py-xs rounded">
                  <span className="text-sm">
                    {field === 'count' ? 'Count' : state.fields.find(f => f.key === field)?.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPivotConfig(prev => ({
                      ...prev,
                      valueFields: prev.valueFields.filter(f => f !== field)
                    }))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pivot Table */}
      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-muted z-10">
            <tr>
              {/* Row field headers */}
              {pivotConfig.rowFields.map((field, index) => (
                <th key={field} className="px-md py-xsxs text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                  {state.fields.find(f => f.key === field)?.label}
                </th>
              ))}
              
              {/* Column headers */}
              {pivotData.columnHeaders.map((columnPath, index) => (
                <th key={columnPath.join('|')} className="px-md py-xsxs text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border min-w-[100px]">
                  <div className="space-x-xs">
                    {columnPath.map((value, pathIndex) => (
                      <div key={pathIndex} className="text-xs">
                        {value || '(blank)'}
                      </div>
                    ))}
                  </div>
                </th>
              ))}
              
              {showGrandTotals && (
                <th className="px-md py-xsxs text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border bg-primary/10">
                  Total
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-background divide-y divide-border">
            {pivotData.rowHeaders.map((rowPath, rowIndex) => {
              const rowKey = rowPath.join('|');
              const rowCells = Object.entries(pivotData.pivot[rowKey] || {});
              const rowTotal = calculateTotals(rowCells.map(([_, cell]) => cell));
              
              return (
                <tr key={rowKey} className="hover:bg-muted/50">
                  {/* Row values */}
                  {rowPath.map((value, pathIndex) => (
                    <td key={pathIndex} className="px-md py-xsxs text-sm text-foreground border-r border-border">
                      <div className="flex items-center gap-sm">
                        {pathIndex === 0 && pivotConfig.rowFields.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(rowKey)}
                          >
                            {expandedRows.has(rowKey) ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        <span>{value || '(blank)'}</span>
                      </div>
                    </td>
                  ))}
                  
                  {/* Data cells */}
                  {pivotData.columnHeaders.map((columnPath) => {
                    const columnKey = columnPath.join('|');
                    const cell = pivotData.pivot[rowKey]?.[columnKey];
                    
                    return (
                      <td
                        key={columnKey}
                        className="px-md py-xsxs text-sm text-center cursor-pointer hover:bg-primary/10"
                        onClick={() => cell && handleDrillDown(cell)}
                      >
                        {cell ? (
                          <div>
                            <div className="font-medium">
                              {formatValue(cell.aggregatedValue)}
                            </div>
                            {cell.count > 1 && (
                              <div className="text-xs text-muted-foreground">
                                ({cell.count} records)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    );
                  })}
                  
                  {/* Row total */}
                  {showGrandTotals && (
                    <td className="px-md py-xsxs text-sm text-center font-semibold bg-primary/5 border-l border-border">
                      {formatValue(rowTotal)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          
          {/* Grand totals footer */}
          {showGrandTotals && (
            <tfoot className="bg-primary/10">
              <tr>
                <td colSpan={pivotConfig.rowFields.length} className="px-md py-xsxs text-sm font-semibold">
                  Grand Total
                </td>
                {pivotData.columnHeaders.map((columnPath) => {
                  const columnKey = columnPath.join('|');
                  const columnCells = Object.values(pivotData.pivot)
                    .map(row => row[columnKey])
                    .filter(Boolean);
                  const columnTotal = calculateTotals(columnCells);
                  
                  return (
                    <td key={columnKey} className="px-md py-xsxs text-sm text-center font-semibold">
                      {formatValue(columnTotal)}
                    </td>
                  );
                })}
                <td className="px-md py-xsxs text-sm text-center font-bold bg-primary/20">
                  {formatValue(calculateTotals(
                    Object.values(pivotData.pivot).flatMap(row => Object.values(row))
                  ))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Empty State */}
      {pivotData.rowHeaders.length === 0 && (
        <div className="text-center py-2xl text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-md opacity-50" />
          <h3 className="text-lg font-medium mb-sm">Configure Your Pivot Table</h3>
          <p className="text-sm">
            Add row fields, column fields, and value fields to create your pivot table analysis.
          </p>
        </div>
      )}
    </div>
  );
}
