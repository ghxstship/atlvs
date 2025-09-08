'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { Select } from '../Select';
import { Checkbox } from '../Checkbox';
import { Toggle } from '../Toggle';
import { Badge } from '../Badge';
import { Alert } from '../Alert';
import { Loader } from '../Loader';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Copy,
  RotateCcw
} from 'lucide-react';
import { DataRecord, ViewProps, FieldConfig, FormSection, FormValidation } from './types';
import { useDataView } from './DataViewProvider';

interface FormViewProps extends ViewProps {
  fields: FieldConfig[];
  sections?: FormSection[];
  validation?: FormValidation;
  mode?: 'create' | 'edit' | 'view';
  autoSave?: boolean;
  autoSaveDelay?: number;
  showProgress?: boolean;
  allowReset?: boolean;
  allowDuplicate?: boolean;
  customActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
    onClick: (formData: Record<string, any>) => void;
  }>;
  onSave?: (data: Record<string, any>) => Promise<void> | void;
  onReset?: () => void;
  onDuplicate?: (data: Record<string, any>) => void;
  onFieldChange?: (field: string, value: any, formData: Record<string, any>) => void;
  onValidation?: (errors: Record<string, string[]>) => void;
}

export function FormView({
  data = [],
  loading = false,
  error,
  fields,
  sections = [],
  validation,
  mode = 'create',
  autoSave = false,
  autoSaveDelay = 2000,
  showProgress = true,
  allowReset = true,
  allowDuplicate = false,
  customActions = [],
  onSave,
  onReset,
  onDuplicate,
  onFieldChange,
  onValidation
}: FormViewProps) {
  const { selectedRecords } = useDataView();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [showValidation, setShowValidation] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && selectedRecords.length > 0) {
      const record = selectedRecords[0];
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.key] = record[field.key] || getDefaultValue(field);
      });
      setFormData(initialData);
    } else {
      // Initialize with default values for create mode
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.key] = getDefaultValue(field);
      });
      setFormData(initialData);
    }
  }, [fields, mode, selectedRecords]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave || Object.keys(touched).length === 0) return;

    const timeoutId = setTimeout(async () => {
      if (Object.keys(errors).length === 0) {
        setAutoSaving(true);
        try {
          await onSave(formData);
        } catch (error) {
          console.error('Auto-save error:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [formData, touched, errors, autoSave, autoSaveDelay, onSave]);

  function getDefaultValue(field: FieldConfig): any {
    if (field.defaultValue !== undefined) return field.defaultValue;
    
    switch (field.type) {
      case 'boolean':
        return false;
      case 'number':
      case 'currency':
        return 0;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return '';
    }
  }

  const validateField = useCallback((field: FieldConfig, value: any): string[] => {
    const fieldErrors: string[] = [];
    
    // Required validation
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      fieldErrors.push(`${field.label} is required`);
    }
    
    // Type-specific validation
    if (value) {
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            fieldErrors.push('Please enter a valid email address');
          }
          break;
        
        case 'url':
          try {
            new URL(value);
          } catch {
            fieldErrors.push('Please enter a valid URL');
          }
          break;
        
        case 'number':
        case 'currency':
          if (isNaN(Number(value))) {
            fieldErrors.push('Please enter a valid number');
          }
          if (field.min !== undefined && Number(value) < field.min) {
            fieldErrors.push(`Value must be at least ${field.min}`);
          }
          if (field.max !== undefined && Number(value) > field.max) {
            fieldErrors.push(`Value must be no more than ${field.max}`);
          }
          break;
        
        case 'text':
        case 'textarea':
          if (field.minLength && value.length < field.minLength) {
            fieldErrors.push(`Must be at least ${field.minLength} characters`);
          }
          if (field.maxLength && value.length > field.maxLength) {
            fieldErrors.push(`Must be no more than ${field.maxLength} characters`);
          }
          break;
      }
    }
    
    // Custom validation
    if (field.validation) {
      const customErrors = field.validation(value, formData);
      if (customErrors) {
        fieldErrors.push(...(Array.isArray(customErrors) ? customErrors : [customErrors]));
      }
    }
    
    return fieldErrors;
  }, [formData]);

  const handleFieldChange = useCallback((fieldKey: string, value: any) => {
    const field = fields.find(f => f.key === fieldKey);
    if (!field) return;

    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    setTouched(prev => ({ ...prev, [fieldKey]: true }));
    
    // Validate field
    const fieldErrors = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [fieldKey]: fieldErrors
    }));
    
    // Call external change handler
    onFieldChange?.(fieldKey, value, { ...formData, [fieldKey]: value });
  }, [fields, formData, validateField, onFieldChange]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string[]> = {};
    
    fields.forEach(field => {
      const fieldErrors = validateField(field, formData[field.key]);
      if (fieldErrors.length > 0) {
        newErrors[field.key] = fieldErrors;
      }
    });
    
    setErrors(newErrors);
    onValidation?.(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [fields, formData, validateField, onValidation]);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    
    setShowValidation(true);
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, onSave, validateForm]);

  const handleReset = useCallback(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.key] = getDefaultValue(field);
    });
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setShowValidation(false);
    onReset?.();
  }, [fields, onReset]);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const renderField = useCallback((field: FieldConfig) => {
    const value = formData[field.key] || '';
    const fieldErrors = errors[field.key] || [];
    const hasError = showValidation && fieldErrors.length > 0;
    const isReadonly = mode === 'view' || field.readonly;
    
    const commonProps = {
      label: field.label,
      value,
      disabled: isReadonly,
      required: field.required,
      error: hasError ? fieldErrors[0] : undefined,
      helpText: field.helpText,
      onChange: (e: any) => handleFieldChange(field.key, e.target.value)
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            key={field.key}
            {...commonProps}
            rows={field.rows || 3}
            maxLength={field.maxLength}
            showCount={Boolean(field.maxLength)}
          />
        );
      
      case 'select':
        return (
          <Select
            key={field.key}
            {...commonProps}
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'boolean':
        return (
          <div key={field.key} className="space-y-2">
            <Checkbox
              checked={Boolean(value)}
              disabled={isReadonly}
              onChange={(checked) => handleFieldChange(field.key, checked)}
              label={field.label}
              error={hasError}
            />
            {field.helpText && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {field.helpText}
              </div>
            )}
            {hasError && (
              <div className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors[0]}
              </div>
            )}
          </div>
        );
      
      case 'toggle':
        return (
          <div key={field.key} className="space-y-2">
            <Toggle
              checked={Boolean(value)}
              disabled={isReadonly}
              onChange={(checked) => handleFieldChange(field.key, checked)}
              label={field.label}
            />
            {field.helpText && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {field.helpText}
              </div>
            )}
            {hasError && (
              <div className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors[0]}
              </div>
            )}
          </div>
        );
      
      case 'date':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
          />
        );
      
      case 'number':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
          />
        );
      
      case 'currency':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="number"
            step="0.01"
            prefix="$"
            onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
          />
        );
      
      case 'email':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="email"
          />
        );
      
      case 'url':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="url"
          />
        );
      
      case 'password':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="password"
          />
        );
      
      default:
        return (
          <Input
            key={field.key}
            {...commonProps}
            maxLength={field.maxLength}
          />
        );
    }
  }, [formData, errors, showValidation, mode, handleFieldChange]);

  const completionPercentage = useMemo(() => {
    const requiredFields = fields.filter(f => f.required);
    const completedFields = requiredFields.filter(f => {
      const value = formData[f.key];
      return value !== undefined && value !== '' && value !== null;
    });
    return requiredFields.length > 0 ? (completedFields.length / requiredFields.length) * 100 : 100;
  }, [fields, formData]);

  const totalErrors = useMemo(() => {
    return Object.values(errors).reduce((sum, fieldErrors) => sum + fieldErrors.length, 0);
  }, [errors]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader text="Loading form..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <div>
          <div className="font-medium">Error loading form</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      </Alert>
    );
  }

  const fieldsToRender = sections.length > 0 
    ? fields.filter(f => !sections.some(s => s.fields.includes(f.key)))
    : fields;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create New Record' :
             mode === 'edit' ? 'Edit Record' :
             'View Record'}
          </h2>
          {showProgress && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(completionPercentage)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {autoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader size="xs" />
              Auto-saving...
            </div>
          )}
          
          {totalErrors > 0 && showValidation && (
            <Badge variant="destructive">
              {totalErrors} error{totalErrors !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Sections */}
        {sections.map(section => {
          const isCollapsed = collapsedSections.has(section.id);
          const sectionFields = fields.filter(f => section.fields.includes(f.key));
          
          return (
            <Card key={section.id} variant="outlined">
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <h3 className="font-medium">{section.title}</h3>
                  {section.description && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {section.description}
                    </span>
                  )}
                </div>
                
                <Badge variant="secondary">
                  {sectionFields.length} field{sectionFields.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {!isCollapsed && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {sectionFields.map(renderField)}
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {/* Ungrouped Fields */}
        {fieldsToRender.length > 0 && (
          <Card variant="outlined">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldsToRender.map(renderField)}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {allowReset && (
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          
          {allowDuplicate && mode !== 'create' && (
            <Button
              variant="ghost"
              onClick={() => onDuplicate?.(formData)}
              disabled={saving}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
          )}
          
          {customActions.map(action => (
            <Button
              key={action.key}
              variant={action.variant || 'ghost'}
              onClick={() => action.onClick(formData)}
              disabled={saving}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {mode !== 'view' && (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || (showValidation && totalErrors > 0)}
            >
              {saving ? <Loader size="xs" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
