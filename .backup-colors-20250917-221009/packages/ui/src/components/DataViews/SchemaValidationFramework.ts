// Schema Validation Framework
// Comprehensive system for validating and integrating Supabase database schema with UI components

// PostgreSQL type mapping to TypeScript/UI types
export const POSTGRES_TYPE_MAPPING = {
  // Text types
  'text': 'text',
  'varchar': 'text', 
  'char': 'text',
  'character': 'text',
  'character varying': 'text',
  
  // Numeric types
  'integer': 'number',
  'int': 'number',
  'int4': 'number',
  'bigint': 'number',
  'int8': 'number',
  'smallint': 'number',
  'int2': 'number',
  'decimal': 'number',
  'numeric': 'number',
  'real': 'number',
  'float4': 'number',
  'double precision': 'number',
  'float8': 'number',
  'money': 'currency',
  
  // Boolean
  'boolean': 'boolean',
  'bool': 'boolean',
  
  // Date/Time
  'date': 'date',
  'time': 'text',
  'timestamp': 'date',
  'timestamptz': 'date',
  'timestamp with time zone': 'date',
  'timestamp without time zone': 'date',
  'interval': 'text',
  
  // JSON
  'json': 'object',
  'jsonb': 'object',
  
  // Arrays
  '_text': 'array',
  '_varchar': 'array',
  '_integer': 'array',
  '_numeric': 'array',
  
  // UUID
  'uuid': 'text',
  
  // Network
  'inet': 'text',
  'cidr': 'text',
  'macaddr': 'text',
  
  // Other
  'bytea': 'text',
  'point': 'text',
  'line': 'text',
  'lseg': 'text',
  'box': 'text',
  'path': 'text',
  'polygon': 'text',
  'circle': 'text'
} as const;

export type PostgreSQLType = keyof typeof POSTGRES_TYPE_MAPPING;
export type UIFieldType = typeof POSTGRES_TYPE_MAPPING[PostgreSQLType];

// Database constraint types
export interface DatabaseConstraint {
  type: 'not_null' | 'unique' | 'primary_key' | 'foreign_key' | 'check' | 'default';
  definition: string;
  referenced_table?: string;
  referenced_column?: string;
}

// Column validation structure
export interface ColumnValidation {
  name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
  constraints: DatabaseConstraint[];
  enum_values?: string[];
  comment?: string;
}

// Relationship validation
export interface RelationshipValidation {
  constraint_name: string;
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  on_delete: string;
  on_update: string;
}

// RLS Policy validation
export interface RLSPolicyValidation {
  policy_name: string;
  command: string;
  roles: string[];
  using_expression: string;
  with_check_expression?: string;
}

// Trigger validation
export interface TriggerValidation {
  trigger_name: string;
  event_manipulation: string;
  action_timing: string;
  action_statement: string;
}

// Index validation
export interface IndexValidation {
  index_name: string;
  index_type: string;
  columns: string[];
  is_unique: boolean;
  is_partial: boolean;
  definition: string;
}

// Permission validation
export interface PermissionValidation {
  grantee: string;
  privilege_type: string;
  is_grantable: boolean;
}

// Main schema validation framework interface
export interface SchemaValidationFramework {
  tables: {
    [tableName: string]: {
      exists: boolean;
      columns: ColumnValidation[];
      relationships: RelationshipValidation[];
      policies: RLSPolicyValidation[];
      triggers: TriggerValidation[];
      indexes: IndexValidation[];
      permissions: PermissionValidation[];
    }
  };
  views: {
    [viewName: string]: {
      exists: boolean;
      definition: string;
      columns: ColumnValidation[];
      dependencies: string[];
    }
  };
  functions: {
    [functionName: string]: {
      exists: boolean;
      parameters: ParameterValidation[];
      returnType: string;
      security: 'DEFINER' | 'INVOKER';
    }
  };
  customTypes: {
    [typeName: string]: {
      exists: boolean;
      definition: string;
      usage: string[];
    }
  };
}

export interface ParameterValidation {
  name: string;
  data_type: string;
  default_value?: string;
}

// Data flow validation results
export interface ValidationResult {
  field: string;
  expected_type: string;
  actual_type: string;
  success: boolean;
  message: string;
}

export interface ConstraintViolation {
  constraint: string;
  field: string;
  value: any;
  message: string;
}

export interface PermissionResult {
  operation: string;
  allowed: boolean;
  reason?: string;
}

export interface TransformationError {
  field: string;
  input_value: any;
  expected_output: any;
  actual_output: any;
  error: string;
}

// Data flow validation interface
export interface DataFlowValidation {
  inboundValidation: {
    schemaCompliance: boolean;
    typeCoercion: ValidationResult[];
    constraintViolations: ConstraintViolation[];
    permissionCheck: PermissionResult;
    transformationErrors: TransformationError[];
  };
  outboundValidation: {
    fieldValidation: FieldValidationResult[];
    businessRuleCompliance: BusinessRuleResult[];
    dataIntegrity: IntegrityCheckResult[];
    securityValidation: SecurityValidationResult[];
  };
  syncValidation: {
    conflictDetection: ConflictDetectionResult[];
    mergeStrategy: MergeStrategyResult;
    rollbackCapability: RollbackValidation;
  };
}

export interface FieldValidationResult {
  field: string;
  valid: boolean;
  errors: string[];
}

export interface BusinessRuleResult {
  rule: string;
  passed: boolean;
  message?: string;
}

export interface IntegrityCheckResult {
  check: string;
  passed: boolean;
  details?: string;
}

export interface SecurityValidationResult {
  check: string;
  passed: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConflictDetectionResult {
  field: string;
  local_value: any;
  remote_value: any;
  conflict_type: 'update' | 'delete' | 'concurrent_modification';
}

export interface MergeStrategyResult {
  strategy: 'local_wins' | 'remote_wins' | 'merge' | 'manual_resolution';
  resolved_value: any;
}

export interface RollbackValidation {
  can_rollback: boolean;
  rollback_point?: string;
  affected_records: string[];
}

// Schema introspection class
export class SchemaIntrospector {
  constructor(private supabase: any) {}

  async introspectSchema(): Promise<SchemaValidationFramework> {
    const [tables, views, functions, customTypes] = await Promise.all([
      this.introspectTables(),
      this.introspectViews(),
      this.introspectFunctions(),
      this.introspectCustomTypes()
    ]);

    return {
      tables,
      views,
      functions,
      customTypes
    };
  }

  private async introspectTables(): Promise<SchemaValidationFramework['tables']> {
    const { data: tables, error } = await this.supabase.rpc('get_table_info');
    
    if (error) {
      console.error('Error introspecting tables:', error);
      return {};
    }

    const result: SchemaValidationFramework['tables'] = {};

    for (const table of tables || []) {
      const [columns, relationships, policies, triggers, indexes, permissions] = await Promise.all([
        this.getTableColumns(table.table_name),
        this.getTableRelationships(table.table_name),
        this.getTablePolicies(table.table_name),
        this.getTableTriggers(table.table_name),
        this.getTableIndexes(table.table_name),
        this.getTablePermissions(table.table_name)
      ]);

      result[table.table_name] = {
        exists: true,
        columns,
        relationships,
        policies,
        triggers,
        indexes,
        permissions
      };
    }

    return result;
  }

  private async getTableColumns(tableName: string): Promise<ColumnValidation[]> {
    const { data, error } = await this.supabase.rpc('get_table_columns', { 
      table_name: tableName 
    });

    if (error) {
      console.error(`Error getting columns for ${tableName}:`, error);
      return [];
    }

    return data?.map((col: any) => ({
      name: col.column_name,
      data_type: col.data_type,
      is_nullable: col.is_nullable === 'YES',
      column_default: col.column_default,
      character_maximum_length: col.character_maximum_length,
      numeric_precision: col.numeric_precision,
      numeric_scale: col.numeric_scale,
      constraints: [], // Will be populated by separate constraint query
      enum_values: col.enum_values,
      comment: col.column_comment
    })) || [];
  }

  private async getTableRelationships(tableName: string): Promise<RelationshipValidation[]> {
    const { data, error } = await this.supabase.rpc('get_table_relationships', {
      table_name: tableName
    });

    if (error) {
      console.error(`Error getting relationships for ${tableName}:`, error);
      return [];
    }

    return data || [];
  }

  private async getTablePolicies(tableName: string): Promise<RLSPolicyValidation[]> {
    const { data, error } = await this.supabase.rpc('get_table_policies', {
      table_name: tableName
    });

    if (error) {
      console.error(`Error getting policies for ${tableName}:`, error);
      return [];
    }

    return data || [];
  }

  private async getTableTriggers(tableName: string): Promise<TriggerValidation[]> {
    const { data, error } = await this.supabase.rpc('get_table_triggers', {
      table_name: tableName
    });

    if (error) {
      console.error(`Error getting triggers for ${tableName}:`, error);
      return [];
    }

    return data || [];
  }

  private async getTableIndexes(tableName: string): Promise<IndexValidation[]> {
    const { data, error } = await this.supabase.rpc('get_table_indexes', {
      table_name: tableName
    });

    if (error) {
      console.error(`Error getting indexes for ${tableName}:`, error);
      return [];
    }

    return data || [];
  }

  private async getTablePermissions(tableName: string): Promise<PermissionValidation[]> {
    const { data, error } = await this.supabase.rpc('get_table_permissions', {
      table_name: tableName
    });

    if (error) {
      console.error(`Error getting permissions for ${tableName}:`, error);
      return [];
    }

    return data || [];
  }

  private async introspectViews(): Promise<SchemaValidationFramework['views']> {
    const { data, error } = await this.supabase.rpc('get_views_info');
    
    if (error) {
      console.error('Error introspecting views:', error);
      return {};
    }

    const result: SchemaValidationFramework['views'] = {};

    for (const view of data || []) {
      result[view.view_name] = {
        exists: true,
        definition: view.view_definition,
        columns: await this.getViewColumns(view.view_name),
        dependencies: view.dependencies || []
      };
    }

    return result;
  }

  private async getViewColumns(viewName: string): Promise<ColumnValidation[]> {
    const { data, error } = await this.supabase.rpc('get_view_columns', {
      view_name: viewName
    });

    if (error) {
      console.error(`Error getting columns for view ${viewName}:`, error);
      return [];
    }

    return data?.map((col: any) => ({
      name: col.column_name,
      data_type: col.data_type,
      is_nullable: col.is_nullable === 'YES',
      column_default: null,
      character_maximum_length: col.character_maximum_length,
      numeric_precision: col.numeric_precision,
      numeric_scale: col.numeric_scale,
      constraints: [],
      comment: col.column_comment
    })) || [];
  }

  private async introspectFunctions(): Promise<SchemaValidationFramework['functions']> {
    const { data, error } = await this.supabase.rpc('get_functions_info');
    
    if (error) {
      console.error('Error introspecting functions:', error);
      return {};
    }

    const result: SchemaValidationFramework['functions'] = {};

    for (const func of data || []) {
      result[func.function_name] = {
        exists: true,
        parameters: func.parameters || [],
        returnType: func.return_type,
        security: func.security_type
      };
    }

    return result;
  }

  private async introspectCustomTypes(): Promise<SchemaValidationFramework['customTypes']> {
    const { data, error } = await this.supabase.rpc('get_custom_types_info');
    
    if (error) {
      console.error('Error introspecting custom types:', error);
      return {};
    }

    const result: SchemaValidationFramework['customTypes'] = {};

    for (const type of data || []) {
      result[type.type_name] = {
        exists: true,
        definition: type.type_definition,
        usage: type.usage_locations || []
      };
    }

    return result;
  }
}

// Schema change detection
export class SchemaChangeDetector {
  private lastSchema: SchemaValidationFramework | null = null;

  constructor(private introspector: SchemaIntrospector) {}

  async detectChanges(): Promise<SchemaChange[]> {
    const currentSchema = await this.introspector.introspectSchema();
    
    if (!this.lastSchema) {
      this.lastSchema = currentSchema;
      return [];
    }

    const changes = this.compareSchemas(this.lastSchema, currentSchema);
    this.lastSchema = currentSchema;
    
    return changes;
  }

  private compareSchemas(oldSchema: SchemaValidationFramework, newSchema: SchemaValidationFramework): SchemaChange[] {
    const changes: SchemaChange[] = [];

    // Compare tables
    for (const [tableName, newTable] of Object.entries(newSchema.tables)) {
      const oldTable = oldSchema.tables[tableName];
      
      if (!oldTable) {
        changes.push({
          type: 'table_added',
          object: tableName,
          details: { table: newTable }
        });
        continue;
      }

      // Compare columns
      const columnChanges = this.compareColumns(oldTable.columns, newTable.columns, tableName);
      changes.push(...columnChanges);

      // Compare relationships
      const relationshipChanges = this.compareRelationships(oldTable.relationships, newTable.relationships, tableName);
      changes.push(...relationshipChanges);
    }

    // Check for removed tables
    for (const tableName of Object.keys(oldSchema.tables)) {
      if (!newSchema.tables[tableName]) {
        changes.push({
          type: 'table_removed',
          object: tableName,
          details: { table: oldSchema.tables[tableName] }
        });
      }
    }

    return changes;
  }

  private compareColumns(oldColumns: ColumnValidation[], newColumns: ColumnValidation[], tableName: string): SchemaChange[] {
    const changes: SchemaChange[] = [];
    const oldColumnMap = new Map(oldColumns.map(col => [col.name, col]));
    const newColumnMap = new Map(newColumns.map(col => [col.name, col]));

    // Check for added/modified columns
    for (const [columnName, newColumn] of newColumnMap) {
      const oldColumn = oldColumnMap.get(columnName);
      
      if (!oldColumn) {
        changes.push({
          type: 'column_added',
          object: `${tableName}.${columnName}`,
          details: { column: newColumn }
        });
      } else if (JSON.stringify(oldColumn) !== JSON.stringify(newColumn)) {
        changes.push({
          type: 'column_modified',
          object: `${tableName}.${columnName}`,
          details: { oldColumn, newColumn }
        });
      }
    }

    // Check for removed columns
    for (const columnName of oldColumnMap.keys()) {
      if (!newColumnMap.has(columnName)) {
        changes.push({
          type: 'column_removed',
          object: `${tableName}.${columnName}`,
          details: { column: oldColumnMap.get(columnName) }
        });
      }
    }

    return changes;
  }

  private compareRelationships(oldRels: RelationshipValidation[], newRels: RelationshipValidation[], tableName: string): SchemaChange[] {
    const changes: SchemaChange[] = [];
    // Implementation for relationship comparison
    // Similar pattern to column comparison
    return changes;
  }
}

export interface SchemaChange {
  type: 'table_added' | 'table_removed' | 'table_modified' | 
        'column_added' | 'column_removed' | 'column_modified' |
        'relationship_added' | 'relationship_removed' | 'relationship_modified' |
        'policy_added' | 'policy_removed' | 'policy_modified';
  object: string;
  details: any;
  timestamp?: Date;
}

// Type mapping utilities
export function mapPostgreSQLTypeToUI(pgType: string): UIFieldType {
  const normalizedType = pgType.toLowerCase().replace(/\(\d+\)/g, ''); // Remove length specifiers
  return POSTGRES_TYPE_MAPPING[normalizedType as PostgreSQLType] || 'text';
}

export function generateFieldConfigFromColumn(column: ColumnValidation): any {
  const fieldType = mapPostgreSQLTypeToUI(column.data_type);
  
  return {
    key: column.name,
    label: column.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type: fieldType,
    required: !column.is_nullable,
    readonly: column.name === 'id' || column.name.endsWith('_at'),
    defaultValue: column.column_default,
    maxLength: column.character_maximum_length,
    min: fieldType === 'number' ? undefined : undefined,
    max: fieldType === 'number' ? undefined : undefined,
    helpText: column.comment,
    options: column.enum_values?.map(value => ({ value, label: value })),
    validate: (value: any) => {
      // Generate validation based on constraints
      if (!column.is_nullable && (value === null || value === undefined || value === '')) {
        return `${column.name} is required`;
      }
      return true;
    }
  };
}
