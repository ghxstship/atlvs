'use client';

import React, { useState, useCallback } from 'react';
// Avoid importing Supabase types to keep UI package dependency-free
// type SupabaseClient = any;
import { Button } from '../Button';
import { Input } from '../Input';
import { Badge } from '../Badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Check,
  AlertTriangle,
  Database,
  Loader2,
  RefreshCw,
  Eye,
  Copy
} from 'lucide-react';
import { DataRecord, FieldConfig } from './types';
import { SchemaValidationFramework } from './SchemaValidationFramework';

interface CRUDOperationsFrameworkProps {
  supabase: any;
  tableName: string;
  schema?: SchemaValidationFramework;
  fields: FieldConfig[];
  data: DataRecord[];
  onDataChange?: (data: DataRecord[]) => void;
  onValidationError?: (errors: ValidationError[]) => void;
  permissions?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  className?: string;
}

interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'type' | 'constraint' | 'foreign_key' | 'unique';
  value?: any;
}

interface CRUDOperation {
  type: 'create' | 'update' | 'delete' | 'bulk_create' | 'bulk_update' | 'bulk_delete';
  record?: DataRecord;
  records?: DataRecord[];
  originalRecord?: DataRecord;
  validationErrors?: ValidationError[];
}

export function CRUDOperationsFramework({
  supabase,
  tableName,
  schema,
  fields,
  data,
  onDataChange,
  onValidationError,
  permissions = { create: true, read: true, update: true, delete: true },
  className = ''
}: CRUDOperationsFrameworkProps) {
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [creatingRecord, setCreatingRecord] = useState<boolean>(false);
  const [newRecord, setNewRecord] = useState<Partial<DataRecord>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [bulkOperation, setBulkOperation] = useState<string | null>(null);

  // Schema validation
  const validateRecord = useCallback((record: Partial<DataRecord>, isUpdate = false): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!schema) return errors;

    const tableSchema = schema.tables[tableName];
    if (!tableSchema) return errors;

    // Validate each field against schema
    for (const column of tableSchema.columns) {
      const columnName = column.name;
      const value = (record as any)[columnName];
      
      // Required field validation
      if (!isUpdate && !column.is_nullable && column.column_default === null && (value === undefined || value === null || value === '')) {
        errors.push({
          field: columnName,
          message: `${columnName} is required`,
          type: 'required',
          value
        });
      }

      // Type validation
      if (value !== undefined && value !== null) {
        const isValidType = validateFieldType(value, column.data_type);
        if (!isValidType) {
          errors.push({
            field: columnName,
            message: `${columnName} must be of type ${column.data_type}`,
            type: 'type',
            value
          });
        }
      }

      // Constraint validation
      if (column.constraints) {
        for (const constraint of column.constraints) {
          if (constraint.type === 'check' && value !== undefined) {
            // Basic constraint validation (can be extended)
            if (constraint.definition.includes('length') && typeof value === 'string') {
              const maxLength = extractMaxLength(constraint.definition);
              if (maxLength && value.length > maxLength) {
                errors.push({
                  field: columnName,
                  message: `${columnName} exceeds maximum length of ${maxLength}`,
                  type: 'constraint',
                  value
                });
              }
            }
          }
        }
      }
    }

    return errors;
  }, [schema, tableName]);

  // Type validation helper
  const validateFieldType = (value: any, type: string): boolean => {
    switch (type) {
      case 'uuid':
        return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      case 'integer':
      case 'bigint':
        return Number.isInteger(Number(value));
      case 'numeric':
      case 'decimal':
      case 'real':
      case 'double precision':
        return !isNaN(Number(value));
      case 'boolean':
        return typeof value === 'boolean';
      case 'timestamp':
      case 'timestamptz':
      case 'date':
        return !isNaN(Date.parse(value));
      case 'json':
      case 'jsonb':
        try {
          JSON.parse(typeof value === 'string' ? value : JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      case 'text':
      case 'varchar':
      case 'character varying':
        return typeof value === 'string';
      default:
        return true; // Allow unknown types
    }
  };

  // Extract max length from constraint definition
  const extractMaxLength = (definition: string): number | null => {
    const match = definition.match(/length\([^)]*\)\s*<=?\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Create record
  const handleCreate = useCallback(async (recordData: Partial<DataRecord>) => {
    if (!permissions.create) {
      throw new Error('Create permission denied');
    }

    setIsLoading(true);
    
    try {
      // Validate record
      const errors = validateRecord(recordData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        onValidationError?.(errors);
        return;
      }

      // Direct Supabase operation
      const { data: insertedData, error } = await supabase
        .from(tableName)
        .insert(recordData)
        .select()
        .single();

      if (error) throw error;

      const updatedData = [...data, insertedData];
      onDataChange?.(updatedData);

      setCreatingRecord(false);
      setNewRecord({});
      setValidationErrors([]);

    } catch (error) {
      console.error('Create operation failed:', error);
      setValidationErrors([{
        field: 'general',
        message: error instanceof Error ? error.message : 'Create operation failed',
        type: 'constraint'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [permissions.create, validateRecord, onValidationError, supabase, tableName, data, onDataChange]);

  // Update record
  const handleUpdate = useCallback(async (id: string, updates: Partial<DataRecord>) => {
    if (!permissions.update) {
      throw new Error('Update permission denied');
    }

    setIsLoading(true);

    try {
      // Validate updates
      const errors = validateRecord(updates, true);
      if (errors.length > 0) {
        setValidationErrors(errors);
        onValidationError?.(errors);
        return;
      }

      // Direct Supabase operation
      const { data: updatedData, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const newData = data.map(record => 
        record.id === id ? updatedData : record
      );
      onDataChange?.(newData);

      setEditingRecord(null);
      setValidationErrors([]);

    } catch (error) {
      console.error('Update operation failed:', error);
      setValidationErrors([{
        field: 'general',
        message: error instanceof Error ? error.message : 'Update operation failed',
        type: 'constraint'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [permissions.update, validateRecord, onValidationError, supabase, tableName, data, onDataChange]);

  // Delete record
  const handleDelete = useCallback(async (id: string) => {
    if (!permissions.delete) {
      throw new Error('Delete permission denied');
    }

    setIsLoading(true);

    try {
      // Direct Supabase operation
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedData = data.filter(record => record.id !== id);
      onDataChange?.(updatedData);

      setValidationErrors([]);

    } catch (error) {
      console.error('Delete operation failed:', error);
      setValidationErrors([{
        field: 'general',
        message: error instanceof Error ? error.message : 'Delete operation failed',
        type: 'constraint'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [permissions.delete, supabase, tableName, data, onDataChange]);

  // Bulk operations
  const handleBulkDelete = useCallback(async () => {
    if (!permissions.delete || selectedRecords.size === 0) return;

    setIsLoading(true);
    setBulkOperation('delete');

    try {
      const idsToDelete = Array.from(selectedRecords);
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;

      const updatedData = data.filter(record => !selectedRecords.has(record.id));
      onDataChange?.(updatedData);
      setSelectedRecords(new Set());

    } catch (error) {
      console.error('Bulk delete failed:', error);
      setValidationErrors([{
        field: 'general',
        message: error instanceof Error ? error.message : 'Bulk delete failed',
        type: 'constraint'
      }]);
    } finally {
      setIsLoading(false);
      setBulkOperation(null);
    }
  }, [permissions.delete, selectedRecords, supabase, tableName, data, onDataChange]);

  // Duplicate record
  const handleDuplicate = useCallback(async (record: DataRecord) => {
    if (!permissions.create) return;

    const duplicateData: any = { ...record };
    delete duplicateData.id;
    delete duplicateData.created_at;
    delete duplicateData.updated_at;
    
    // Add "Copy" prefix to name/title fields
    if (duplicateData.name) {
      duplicateData.name = `Copy of ${duplicateData.name}`;
    } else if (duplicateData.title) {
      duplicateData.title = `Copy of ${duplicateData.title}`;
    }

    await handleCreate(duplicateData);
  }, [permissions.create, handleCreate]);

  // Render field input
  const renderFieldInput = (field: FieldConfig, value: any, onChange: (value: any) => void) => {
    const error = validationErrors.find(e => e.field === field.key);
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.label}
            className={error ? 'border-destructive' : ''}
            required={field.required}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.label}
            className={error ? 'border-destructive' : ''}
            required={field.required}
          />
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-border"
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-destructive' : ''}
            required={field.required}
          />
        );
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.label}
            className={error ? 'border-destructive' : ''}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Transaction Manager disabled in UI package to avoid ref complexity */}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              Validation Errors
            </span>
          </div>
          <ul className="text-sm text-destructive/80 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>
                <strong>{error.field}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {permissions.create && (
            <Button
              onClick={() => setCreatingRecord(true)}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Record
            </Button>
          )}
          
          {selectedRecords.size > 0 && permissions.delete && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isLoading}
            >
              {bulkOperation === 'delete' ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete Selected ({selectedRecords.size})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {data.length} records
          </Badge>
          
          {selectedRecords.size > 0 && (
            <Badge variant="outline">
              {selectedRecords.size} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Create Form */}
      {creatingRecord && (
        <div className="bg-muted border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Create New Record</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {fields.filter(f => !f.readonly).map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                {renderFieldInput(field, newRecord[field.key], (value) => 
                  setNewRecord(prev => ({ ...prev, [field.key]: value }))
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setCreatingRecord(false);
                setNewRecord({});
                setValidationErrors([]);
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={() => handleCreate(newRecord)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Create
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRecords.size === data.length && data.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRecords(new Set(data.map(r => r.id)));
                      } else {
                        setSelectedRecords(new Set());
                      }
                    }}
                    className="rounded border-border"
                  />
                </th>
                {fields.map(field => (
                  <th key={field.key} className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    {field.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {data.map(record => (
                <tr key={record.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(record.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedRecords);
                        if (e.target.checked) {
                          newSelected.add(record.id);
                        } else {
                          newSelected.delete(record.id);
                        }
                        setSelectedRecords(newSelected);
                      }}
                      className="rounded border-border"
                    />
                  </td>
                  {fields.map(field => (
                    <td key={field.key} className="px-4 py-3 text-sm text-foreground">
                      {editingRecord?.id === record.id ? (
                        renderFieldInput(field, editingRecord[field.key], (value) =>
                          setEditingRecord(prev => prev ? { ...prev, [field.key]: value } : null)
                        )
                      ) : (
                        <span>{String(record[field.key] || '')}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingRecord?.id === record.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingRecord(null);
                              setValidationErrors([]);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(record.id, editingRecord)}
                            disabled={isLoading}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {permissions.read && (
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {permissions.update && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingRecord(record)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {permissions.create && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicate(record)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                          {permissions.delete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(record.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No records found</p>
          {permissions.create && (
            <Button
              className="mt-2"
              onClick={() => setCreatingRecord(true)}
            >
              Create First Record
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
