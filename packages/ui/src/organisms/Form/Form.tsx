/**
 * Form Component — Advanced Form Builder
 * Dynamic form with validation and field management
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Input } from '../../atoms/Input/Input';
import { Textarea } from '../../atoms/Textarea/Textarea';
import { Select } from '../../atoms/Select/Select';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { Radio } from '../../atoms/Radio/Radio';
import { Switch } from '../../atoms/Switch/Switch';
import { Button } from '../../atoms/Button/Button';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null;
}

export interface FormProps {
  /** Form fields */
  fields: FormField[];
  
  /** Initial values */
  initialValues?: Record<string, any>;
  
  /** Submit handler */
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  
  /** Cancel handler */
  onCancel?: () => void;
  
  /** Submit button text */
  submitText?: string;
  
  /** Cancel button text */
  cancelText?: string;
  
  /** Loading state */
  loading?: boolean;
}

/**
 * Form Component
 */
export const Form: React.FC<FormProps> = ({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
}) => {
  const [values, setValues] = React.useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  
  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };
  
  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };
  
  const validateField = (name: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;
    
    const value = values[name];
    
    if (field.required && !value) {
      setErrors(prev => ({ ...prev, [name]: 'This field is required' }));
      return false;
    }
    
    if (field.validation) {
      const error = field.validation(value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    // Validate all
    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field.name)) {
        isValid = false;
      }
    });
    
    if (isValid) {
      await onSubmit(values);
    }
  };
  
  const renderField = (field: FormField) => {
    const value = values[field.name] ?? '';
    const error = touched[field.name] ? errors[field.name] : undefined;
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            label={field.label}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            error={error}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <Select
            label={field.label}
            options={field.options || []}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            selectSize="md"
            disabled={field.disabled || loading}
            error={error}
          />
        );
      
      case 'checkbox':
        return (
          <Checkbox
            label={field.label}
            checked={!!value}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            disabled={field.disabled || loading}
            error={error}
          />
        );
      
      case 'switch':
        return (
          <Switch
            label={field.label}
            checked={!!value}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            disabled={field.disabled || loading}
          />
        );
      
      default:
        return (
          <Input
            type={field.type}
            label={field.label}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            error={error}
            showRequired={field.required}
          />
        );
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          {renderField(field)}
        </div>
      ))}
      
      <div className="flex items-center justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
};

Form.displayName = 'Form';
