'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../atomic/Button';
import { Input } from '../atomic/Input';
import { Checkbox } from '../atomic/Checkbox';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Filter, 
  Search,
  Settings,
  Download,
  Upload,
  Database,
  AlertTriangle
} from 'lucide-react';
import { SortConfig } from './types';
import { 
  SchemaIntrospector, 
  SchemaValidationFramework, 
  mapPostgreSQLTypeToUI,
  generateFieldConfigFromColumn 
} from './SchemaValidationFramework';

interface SchemaIntegratedDataGridProps {
  tableName: string;
  supabase: any;
  className?: string;
  height?: string | number;
  stickyHeader?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  virtualized?: boolean;
  enableSchemaValidation?: boolean;
  enableRealTimeSync?: boolean;
}

export function SchemaIntegratedDataGrid({
  tableName,
  supabase,
  className = '',
  height = 'auto',
  stickyHeader = true,
  resizable = true,
  reorderable = true,
  virtualized = false,
  enableSchemaValidation = true,
  enableRealTimeSync = true
}: SchemaIntegratedDataGridProps) {
  const { state, config, actions } = useDataView();
  const actionsAny = actions as any;
  const [schemaInfo, setSchemaInfo] = useState<SchemaValidationFramework | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [realTimeChannel, setRealTimeChannel] = useState<any>(null);

  // Initialize schema introspection
  useEffect(() => {
    const introspector = new SchemaIntrospector(supabase);
    
    const loadSchema = async () => {
      try {
        setSchemaLoading(true);
        const schema = await introspector.introspectSchema();
        setSchemaInfo(schema);
        
        // Generate field configs from schema
        if (schema.tables[tableName]) {
          const generatedFields = schema.tables[tableName].columns.map(generateFieldConfigFromColumn);
          actionsAny?.setFields?.(generatedFields);
        }
      } catch (error) {
        console.error('Schema introspection failed:', error);
        setSchemaError(error instanceof Error ? error.message : 'Schema introspection failed');
      } finally {
        setSchemaLoading(false);
      }
    };

    loadSchema();
  }, [tableName, supabase, actions]);

  // Set up real-time synchronization
  useEffect(() => {
    if (!enableRealTimeSync || !supabase) return;

    const channel = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName 
        }, 
        (payload: any) => {
          console.log('Real-time change detected:', payload);
          // Handle real-time updates
          handleRealTimeChange(payload);
        }
      )
      .subscribe();

    setRealTimeChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, supabase, enableRealTimeSync]);

  const handleRealTimeChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        actionsAny?.addRecord?.(newRecord);
        break;
      case 'UPDATE':
        actionsAny?.updateRecord?.(newRecord.id, newRecord);
        break;
      case 'DELETE':
        actionsAny?.removeRecord?.(oldRecord.id);
        break;
    }
  }, [actionsAny]);

  // Schema-aware data validation
  const validateRecord = useCallback(async (record: DataRecord) => {
    if (!enableSchemaValidation || !schemaInfo?.tables[tableName]) {
      return { isValid: true, errors: {} };
    }

    try {
      const { data: validationResults } = await supabase.rpc('validate_data_against_schema', {
        table_name: tableName,
        data_json: record
      });

      const errors: Record<string, string[]> = {};
      let isValid = true;

      validationResults?.forEach((result: any) => {
        if (!result.is_valid) {
          if (!errors[result.field]) {
            errors[result.field] = [];
          }
          errors[result.field].push(result.error_message);
          isValid = false;
        }
      });

      return { isValid, errors };
    } catch (error) {
      console.error('Validation failed:', error);
      return { isValid: false, errors: { _general: ['Validation failed'] } };
    }
  }, [enableSchemaValidation, schemaInfo, tableName, supabase]);

  // Enhanced CRUD operations with schema validation
  const handleCreate = useCallback(async (record: DataRecord) => {
    const validation = await validateRecord(record);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      
      actionsAny?.addRecord?.(data);
      setValidationErrors({});
    } catch (error) {
      console.error('Create failed:', error);
      setValidationErrors({ _general: [error instanceof Error ? error.message : 'Create failed'] });
    }
  }, [tableName, supabase, validateRecord, actions]);

  const handleUpdate = useCallback(async (id: string, updates: Partial<DataRecord>) => {
    const existingRecord = config.data?.find(r => r.id === id);
    if (!existingRecord) return;

    const updatedRecord = { ...existingRecord, ...updates };
    const validation = await validateRecord(updatedRecord);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      actionsAny?.updateRecord?.(id, data);
      setValidationErrors({});
    } catch (error) {
      console.error('Update failed:', error);
      setValidationErrors({ _general: [error instanceof Error ? error.message : 'Update failed'] });
    }
  }, [tableName, supabase, config.data, validateRecord, actions]);

  const handleDelete = useCallback(async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', ids);

      if (error) throw error;
      
      ids.forEach(id => actionsAny?.removeRecord?.(id));
    } catch (error) {
      console.error('Delete failed:', error);
      setValidationErrors({ _general: [error instanceof Error ? error.message : 'Delete failed'] });
    }
  }, [tableName, supabase, actions]);

  // Schema-optimized search with PostgreSQL full-text search
  const handleSchemaOptimizedSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      actions.setSearch('');
      return;
    }

    try {
      // Use PostgreSQL full-text search if available
      const searchColumns = state.fields
        .filter(field => field.type === 'text' && field.key !== 'id')
        .map(field => field.key);

      if (searchColumns.length === 0) {
        actions.setSearch(query);
        return;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .textSearch('search_vector', query, { type: 'websearch' });

      if (error) {
        // Fallback to regular search
        actions.setSearch(query);
        return;
      }

      // Update data with search results
      actionsAny?.setData?.(data || []);
    } catch (error) {
      console.error('Schema-optimized search failed:', error);
      actions.setSearch(query);
    }
  }, [tableName, supabase, state.fields, actions, actionsAny]);

  if (schemaLoading) {
    return (
      <div className="flex items-center justify-center p-xl">
        <Database className="h-icon-md w-icon-md animate-spin mr-sm" />
        <span>Loading schema information...</span>
      </div>
    );
  }

  if (schemaError) {
    return (
      <div className="flex items-center justify-center p-xl text-destructive">
        <AlertTriangle className="h-icon-md w-icon-md mr-sm" />
        <span>Schema Error: {schemaError}</span>
      </div>
    );
  }

  return (
    <div className={`bg-background border border-border rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {/* Enhanced Toolbar with Schema Info */}
      <div className="flex items-center justify-between p-md border-b border-border">
        <div className="flex items-center gap-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
            <Input
              placeholder="Search with full-text search..."
              value={state.search}
              onChange={(e: any) => handleSchemaOptimizedSearch(e.target.value)}
              className="pl-2xl w-container-sm"
            />
          </div>
          <Button variant="ghost" >
            <Filter className="h-icon-xs w-icon-xs" />
            Filters ({state.filters.length})
          </Button>
          {schemaInfo?.tables[tableName] && (
            <div className="text-xs text-muted-foreground bg-muted px-sm py-xs rounded">
              Schema: {schemaInfo.tables[tableName].columns.length} columns
            </div>
          )}
        </div>

        <div className="flex items-center gap-sm">
          <Button variant="ghost" >
            <Settings className="h-icon-xs w-icon-xs" />
            Columns
          </Button>
          <Button variant="ghost" >
            <Database className="h-icon-xs w-icon-xs" />
            Schema
          </Button>
          {config.exportConfig && (
            <Button variant="ghost" >
              <Download className="h-icon-xs w-icon-xs" />
              Export
            </Button>
          )}
          {config.importConfig && (
            <Button variant="ghost" >
              <Upload className="h-icon-xs w-icon-xs" />
              Import
            </Button>
          )}
        </div>
      </div>

      {/* Validation Errors Display */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-destructive/10 border-b border-destructive/20 p-sm">
          <div className="flex items-center text-destructive">
            <AlertTriangle className="h-icon-xs w-icon-xs mr-sm" />
            <span className="font-medium">Validation Errors:</span>
          </div>
          {Object.entries(validationErrors).map(([field, errors]) => (
            <div key={field} className="mt-xs text-sm text-destructive/80">
              <strong>{field}:</strong> {errors.join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Table with Schema Integration */}
      <div className="overflow-auto" style={{ maxHeight: typeof height === 'number' ? height - 120 : 'calc(100% - 120px)' }}>
        {/* Table implementation would continue here with schema-aware rendering */}
        <div className="p-md text-center text-muted-foreground">
          Schema-integrated table rendering in progress...
          <br />
          Table: {tableName}
          <br />
          Columns: {schemaInfo?.tables[tableName]?.columns.length || 0}
          <br />
          Real-time: {enableRealTimeSync ? 'Enabled' : 'Disabled'}
        </div>
      </div>
    </div>
  );
}
