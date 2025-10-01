'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card } from '../Card';
import { Button } from '../atomic/Button';
import { Input } from '../atomic/Input';
import { Textarea } from '../atomic/Textarea';
import { Select } from '../Select';
import { Checkbox } from '../atomic/Checkbox';
import { FieldConfig, FormSection, ViewProps } from '../../types/data-views';
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
import { FormValidation } from './types';
import { useDataView } from './DataViewProvider';

interface FormViewProps extends ViewProps {
  fields: FieldConfig[];
  sections?: FormSection[];
  validation?: FormValidation;
  mode?: 'create' | 'edit' | 'view';
  error?: string | null;
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
        initialData[field.key] = (record as any)[field.key] || getDefaultValue(field);
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

  const validateField = useCallback((field: any, value: any): string[] => {
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
          />
        );
      
      case 'select':
        return (
          <Select
            key={field.key}
            {...commonProps}
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'boolean':
        return (
          <div key={field.key} className="space-y-xs">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={Boolean(formData[field.key])}
                disabled={isReadonly}
                onCheckedChange={(checked: any) => handleFieldChange(field.key, checked)}
              />
              <label className="text-sm font-medium">{field.label}</label>
            </div>
            {field.helpText && (
              <div className="text-xs text-muted-foreground/70 dark:text-muted-foreground/50">
                {field.helpText}
              </div>
            )}
            {hasError && (
              <div className="text-xs text-destructive dark:text-destructive">
                {fieldErrors[0]}
              </div>
            )}
          </div>
        );
      
      case 'toggle':
        return (
          <div key={field.key} className="space-y-xs">
            <Toggle
              checked={Boolean(formData[field.key])}
              disabled={isReadonly}
              onChange={(checked: any) => handleFieldChange(field.key, checked)}
              label={field.label}
            />
            {field.helpText && (
              <div className="text-xs text-muted-foreground/70 dark:text-muted-foreground/50">
                {field.helpText}
              </div>
            )}
            {hasError && (
              <div className="text-xs text-destructive dark:text-destructive">
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
            onChange={(e: any) => handleFieldChange(field.key, e.target.value)}
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
            onChange={(e: any) => handleFieldChange(field.key, Number(e.target.value))}
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
            onChange={(e: any) => handleFieldChange(field.key, Number(e.target.value))}
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
      <div className="flex items-center justify-center py-2xl">
        <Loader text="Loading form..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-md">
        <AlertCircle className="h-icon-xs w-icon-xs" />
        <div>
          <div className="font-medium">Error loading form</div>
          <div className="text-sm mt-xs">{error}</div>
        </div>
      </Alert>
    );
  }

  const fieldsToRender = sections.length > 0 
    ? fields.filter(f => !sections.some(s => s.fields.some(sf => sf.key === f.key)))
    : fields;

  return (
    <div className="max-w-4xl mx-auto space-y-lg">
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create New Record' :
             mode === 'edit' ? 'Edit Record' :
             'View Record'}
          </h2>
          {showProgress && (
            <div className="flex items-center gap-sm mt-sm">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-sm">
          {autoSaving && (
            <div className="flex items-center gap-sm text-sm text-muted-foreground">
              <Loader  />
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
      <div className="space-y-lg">
        {/* Sections */}
        {sections.map((section, index) => {
          const sectionId = section.id || `section-${index}`;
          const isCollapsed = collapsedSections.has(sectionId);
          const sectionFields = fields.filter(f => section.fields.some(sf => sf.key === f.key));
          
          return (
            <Card key={sectionId} variant="outline">
              <div
                className="flex items-center justify-between p-md cursor-pointer"
                onClick={() => toggleSection(sectionId)}
              >
                <div className="flex items-center gap-sm">
                  {isCollapsed ? (
                    <ChevronRight className="h-icon-xs w-icon-xs" />
                  ) : (
                    <ChevronDown className="h-icon-xs w-icon-xs" />
                  )}
                  <h3 className="font-medium">{section.title}</h3>
                  {section.description && (
                    <span className="text-sm text-muted-foreground">
                      {section.description}
                    </span>
                  )}
                </div>
                
                <Badge variant="secondary">
                  {sectionFields.length} field{sectionFields.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {!isCollapsed && (
                <Card variant="outline" className="p-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-md">
                    {sectionFields.map(renderField)}
                  </div>
                </Card>
              )}
            </Card>
          );
        })}

        {/* Ungrouped Fields */}
        {fieldsToRender.length > 0 && (
          <Card variant="outline">
            <div className="p-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {fieldsToRender.map(renderField)}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-lg border-t border-border">
        <div className="flex items-center gap-sm">
          {allowReset && (
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw className="h-icon-xs w-icon-xs mr-sm" />
              Reset
            </Button>
          )}
          
          {allowDuplicate && mode !== 'create' && (
            <Button
              variant="ghost"
              onClick={() => onDuplicate?.(formData)}
              disabled={saving}
            >
              <Copy className="h-icon-xs w-icon-xs mr-sm" />
              Duplicate
            </Button>
          )}
          
          {customActions.map(action => (
            <Button
              key={action.key}
              variant={saving ? 'ghost' : 'outline'}
              onClick={() => action.onClick(formData)}
              disabled={saving}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-sm">
          {mode !== 'view' && (
            <Button
              variant="default"
              onClick={handleSave}
              disabled={saving || (showValidation && totalErrors > 0)}
            >
              {saving ? <Loader  /> : <Save className="h-icon-xs w-icon-xs" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
