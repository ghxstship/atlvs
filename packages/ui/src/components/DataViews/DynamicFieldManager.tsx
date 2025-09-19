'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../atomic/Button';
import { Input } from '../atomic/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../Select';
import { Checkbox } from '../atomic/Checkbox';
import { Badge } from '../Badge';
import { 
  Plus, 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical,
  X,
  Save,
  RotateCcw,
  Database,
  AlertCircle
} from 'lucide-react';
import { FieldType } from './types';
import { 
  SchemaValidationFramework, 
  ColumnValidation,
  mapPostgreSQLTypeToUI,
  generateFieldConfigFromColumn 
} from './SchemaValidationFramework';

interface DynamicFieldManagerProps {
  tableName: string;
  supabase: any;
  fields: FieldConfig[];
  onFieldsChange: (fields: FieldConfig[]) => void;
  schemaInfo?: SchemaValidationFramework;
  className?: string;
}

interface FieldTemplate {
  id: string;
  name: string;
  fields: Partial<FieldConfig>[];
  category: string;
}

const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    id: 'basic_info',
    name: 'Basic Information',
    category: 'Common',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]}
    ]
  },
  {
    id: 'contact_info',
    name: 'Contact Information',
    category: 'Common',
    fields: [
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'phone' },
      { key: 'website', label: 'Website', type: 'url' }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Fields',
    category: 'Business',
    fields: [
      { key: 'amount', label: 'Amount', type: 'currency', required: true },
      { key: 'tax_rate', label: 'Tax Rate', type: 'number', min: 0, max: 100 },
      { key: 'due_date', label: 'Due Date', type: 'date' }
    ]
  }
];

export function DynamicFieldManager({
  tableName,
  supabase,
  fields,
  onFieldsChange,
  schemaInfo,
  className = ''
}: DynamicFieldManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [schemaFields, setSchemaFields] = useState<FieldConfig[]>([]);
  const [customFields, setCustomFields] = useState<FieldConfig[]>([]);
  const [fieldValidation, setFieldValidation] = useState<Record<string, string[]>>({});

  // Separate schema-based and custom fields
  useEffect(() => {
    if (!schemaInfo?.tables[tableName]) return;

    const tableSchema = schemaInfo.tables[tableName];
    const schemaFieldKeys = tableSchema.columns.map(col => col.name);
    
    const schemaBasedFields = fields.filter(field => schemaFieldKeys.includes(field.key));
    const customOnlyFields = fields.filter(field => !schemaFieldKeys.includes(field.key));
    
    setSchemaFields(schemaBasedFields);
    setCustomFields(customOnlyFields);
  }, [fields, schemaInfo, tableName]);

  // Validate field configuration against schema
  const validateFieldConfig = useCallback((field: FieldConfig): string[] => {
    const errors: string[] = [];
    
    if (!schemaInfo?.tables[tableName]) return errors;
    
    const schemaColumn = schemaInfo.tables[tableName].columns.find(col => col.name === field.key);
    
    if (schemaColumn) {
      // Validate type compatibility
      const expectedUIType = mapPostgreSQLTypeToUI(schemaColumn.data_type);
      if (field.type !== expectedUIType) {
        errors.push(`Type mismatch: expected ${expectedUIType}, got ${field.type}`);
      }
      
      // Validate required constraint
      if (!schemaColumn.is_nullable && !field.required) {
        errors.push('Field should be required (database constraint)');
      }
      
      // Validate length constraints
      if (schemaColumn.character_maximum_length && field.maxLength && field.maxLength > schemaColumn.character_maximum_length) {
        errors.push(`Max length exceeds database limit (${schemaColumn.character_maximum_length})`);
      }
    }
    
    return errors;
  }, [schemaInfo, tableName]);

  // Update field validation when fields change
  useEffect(() => {
    const validation: Record<string, string[]> = {};
    
    fields.forEach(field => {
      const errors = validateFieldConfig(field);
      if (errors.length > 0) {
        validation[field.key] = errors;
      }
    });
    
    setFieldValidation(validation);
  }, [fields, validateFieldConfig]);

  // Add new field
  const addField = useCallback((template?: Partial<FieldConfig>) => {
    const newField: FieldConfig = {
      key: template?.key || `custom_field_${Date.now()}`,
      label: template?.label || 'New Field',
      type: template?.type || 'text',
      visible: true,
      sortable: true,
      filterable: true,
      ...template
    };

    const updatedFields = [...fields, newField];
    onFieldsChange(updatedFields);
    setEditingField(newField);
  }, [fields, onFieldsChange]);

  // Update field
  const updateField = useCallback((fieldKey: string, updates: Partial<FieldConfig>) => {
    const updatedFields = fields.map(field =>
      field.key === fieldKey ? { ...field, ...updates } : field
    );
    onFieldsChange(updatedFields);
  }, [fields, onFieldsChange]);

  // Remove field
  const removeField = useCallback((fieldKey: string) => {
    const updatedFields = fields.filter(field => field.key !== fieldKey);
    onFieldsChange(updatedFields);
  }, [fields, onFieldsChange]);

  // Reorder fields
  const reorderFields = useCallback((fromIndex: number, toIndex: number) => {
    const updatedFields = [...fields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    onFieldsChange(updatedFields);
  }, [fields, onFieldsChange]);

  // Sync with database schema
  const syncWithSchema = useCallback(async () => {
    if (!schemaInfo?.tables[tableName]) return;

    const tableSchema = schemaInfo.tables[tableName];
    const schemaBasedFields = tableSchema.columns.map(generateFieldConfigFromColumn);
    
    // Merge with existing custom fields
    const existingCustomFields = fields.filter(field => 
      !tableSchema.columns.some(col => col.name === field.key)
    );
    
    const mergedFields = [...schemaBasedFields, ...existingCustomFields];
    onFieldsChange(mergedFields);
  }, [schemaInfo, tableName, fields, onFieldsChange]);

  // Handle drag and drop
  const handleDragStart = useCallback((fieldKey: string) => {
    setDraggedField(fieldKey);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetFieldKey: string) => {
    e.preventDefault();
    
    if (!draggedField || draggedField === targetFieldKey) return;
    
    const fromIndex = fields.findIndex(f => f.key === draggedField);
    const toIndex = fields.findIndex(f => f.key === targetFieldKey);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderFields(fromIndex, toIndex);
    }
    
    setDraggedField(null);
  }, [draggedField, fields, reorderFields]);

  // Render field editor
  const renderFieldEditor = useCallback((field: FieldConfig) => {
    const isSchemaField = schemaInfo?.tables[tableName]?.columns.some(col => col.name === field.key);
    const validation = fieldValidation[field.key] || [];

    return (
      <div className="gap-md p-md border border-border rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            {isSchemaField ? 'Schema Field' : 'Custom Field'}: {field.label}
          </h3>
          <div className="flex items-center gap-sm">
            {isSchemaField && <Database className="h-4 w-4 text-primary" />}
            {validation.length > 0 && <AlertCircle className="h-4 w-4 text-destructive" />}
          </div>
        </div>

        {validation.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-sm">
            <div className="text-sm text-destructive">
              <strong>Validation Issues:</strong>
              <ul className="list-disc list-inside mt-xs">
                {validation.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-md">
          <div>
            <label className="block text-sm font-medium mb-xs">Key</label>
            <Input
              value={field.key}
              onChange={(e: any) => updateField(field.key, { key: e.target.value })}
              disabled={isSchemaField}
              placeholder="field_key"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-xs">Label</label>
            <Input
              value={field.label}
              onChange={(e: any) => updateField(field.key, { label: e.target.value })}
              placeholder="Field Label"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-xs">Type</label>
            <Select
              value={field.type}
              onValueChange={(type: any) => updateField(field.key, { type: type as FieldType })}
              disabled={isSchemaField}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Field type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="multiselect">Multi-select</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="url">URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-xs">Width</label>
            <Input
              type="number"
              value={field.width || ''}
              onChange={(e: any) => updateField(field.key, { width: parseInt(e.target.value) || undefined })}
              placeholder="Auto"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-md">
          <label className="flex items-center gap-sm">
            <Checkbox
              checked={field.visible !== false}
              onChange={(e: any) => updateField(field.key, { visible: (e.target as HTMLInputElement).checked })}
            />
            <span className="text-sm">Visible</span>
          </label>

          <label className="flex items-center gap-sm">
            <Checkbox
              checked={field.required || false}
              onChange={(e: any) => updateField(field.key, { required: (e.target as HTMLInputElement).checked })}
              disabled={isSchemaField && schemaInfo?.tables[tableName]?.columns.find(col => col.name === field.key)?.is_nullable === false}
            />
            <span className="text-sm">Required</span>
          </label>

          <label className="flex items-center gap-sm">
            <Checkbox
              checked={field.sortable !== false}
              onChange={(e: any) => updateField(field.key, { sortable: (e.target as HTMLInputElement).checked })}
            />
            <span className="text-sm">Sortable</span>
          </label>

          <label className="flex items-center gap-sm">
            <Checkbox
              checked={field.filterable !== false}
              onChange={(e: any) => updateField(field.key, { filterable: (e.target as HTMLInputElement).checked })}
            />
            <span className="text-sm">Filterable</span>
          </label>

          <label className="flex items-center gap-sm">
            <Checkbox
              checked={field.readonly || false}
              onChange={(e: any) => updateField(field.key, { readonly: (e.target as HTMLInputElement).checked })}
            />
            <span className="text-sm">Read-only</span>
          </label>
        </div>

        {(field.type === 'select' || field.type === 'multiselect') && (
          <div>
            <label className="block text-sm font-medium mb-xs">Options</label>
            <div className="space-y-xs">
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex items-center gap-sm">
                  <Input
                    value={option.value}
                    onChange={(e: any) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[index] = { ...option, value: e.target.value };
                      updateField(field.key, { options: newOptions });
                    }}
                    placeholder="Value"
                    className="flex-1"
                  />
                  <Input
                    value={option.label}
                    onChange={(e: any) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[index] = { ...option, label: e.target.value };
                      updateField(field.key, { options: newOptions });
                    }}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Button
                    
                    variant="ghost"
                    onClick={() => {
                      const newOptions = (field.options || []).filter((_, i) => i !== index);
                      updateField(field.key, { options: newOptions });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                
                variant="ghost"
                onClick={() => {
                  const newOptions = [...(field.options || []), { value: '', label: '' }];
                  updateField(field.key, { options: newOptions });
                }}
              >
                <Plus className="h-3 w-3 mr-xs" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-sm">
          {!isSchemaField && (
            <Button
              
              variant="destructive"
              onClick={() => removeField(field.key)}
            >
              Remove Field
            </Button>
          )}
          <Button
            
            onClick={() => setEditingField(null)}
          >
            Done
          </Button>
        </div>
      </div>
    );
  }, [schemaInfo, tableName, fieldValidation, updateField, removeField]);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Settings className="h-4 w-4 mr-xs" />
        Manage Fields ({fields.length})
      </Button>
    );
  }

  return (
    <div className={`bg-background border border-border rounded-lg ${className}`}>
      <div className="p-md border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Field Manager</h2>
          <div className="flex items-center gap-sm">
            {schemaInfo?.tables[tableName] && (
              <Button  variant="ghost" onClick={syncWithSchema}>
                <Database className="h-4 w-4 mr-xs" />
                Sync Schema
              </Button>
            )}
            <Button  onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </div>

      <div className="p-md gap-lg">
        {/* Field Templates */}
        <div>
          <h3 className="text-sm font-medium mb-sm">Quick Add Templates</h3>
          <div className="flex flex-wrap gap-sm">
            {FIELD_TEMPLATES.map(template => (
              <Button
                key={template.id}
                
                variant="outline"
                onClick={() => {
                  template.fields.forEach(fieldTemplate => addField(fieldTemplate));
                }}
              >
                <Plus className="h-3 w-3 mr-xs" />
                {template.name}
              </Button>
            ))}
            <Button  variant="outline" onClick={() => addField()}>
              <Plus className="h-3 w-3 mr-xs" />
              Custom Field
            </Button>
          </div>
        </div>

        {/* Current Fields */}
        <div>
          <h3 className="text-sm font-medium mb-sm">Current Fields ({fields.length})</h3>
          <div className="space-y-xs">
            {fields.map((field, index) => {
              const isSchemaField = schemaInfo?.tables[tableName]?.columns.some(col => col.name === field.key);
              const hasValidationIssues = fieldValidation[field.key]?.length > 0;

              return (
                <div
                  key={field.key}
                  className={`flex items-center gap-sm p-sm border border-border rounded-md ${
                    editingField?.key === field.key ? 'ring-2 ring-primary' : ''
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(field.key)}
                  onDragOver={handleDragOver}
                  onDrop={(e: any) => handleDrop(e, field.key)}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  
                  <div className="flex-1 flex items-center gap-sm">
                    <span className="font-medium">{field.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {field.type}
                    </Badge>
                    {isSchemaField && (
                      <Badge variant="outline" className="text-xs">
                        <Database className="h-3 w-3 mr-xs" />
                        Schema
                      </Badge>
                    )}
                    {hasValidationIssues && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-xs" />
                        Issues
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-sm">
                    <Button
                      
                      variant="ghost"
                      onClick={() => updateField(field.key, { visible: !field.visible })}
                    >
                      {field.visible !== false ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                    
                    <Button
                      
                      variant="ghost"
                      onClick={() => setEditingField(editingField?.key === field.key ? null : field)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Field Editor */}
        {editingField && (
          <div>
            <h3 className="text-sm font-medium mb-sm">Edit Field</h3>
            {renderFieldEditor(editingField)}
          </div>
        )}
      </div>
    </div>
  );
}
