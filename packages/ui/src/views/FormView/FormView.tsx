/**
 * FormView Component — Dynamic Form Builder
 * Build and render forms dynamically from field config
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import type { FieldConfig, DataRecord } from '../types';

export interface FormViewProps {
  /** Field configuration */
  fields: FieldConfig[];
  
  /** Initial data (for editing) */
  initialData?: DataRecord;
  
  /** Submit handler */
  onSubmit: (data: DataRecord) => void | Promise<void>;
  
  /** Cancel handler */
  onCancel?: () => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * FormView Component
 */
export function FormView({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  className = '',
}: FormViewProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Handle field change
  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear error when user edits
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };
  
  // Handle field blur
  const handleBlur = (key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    validateField(key);
  };
  
  // Validate single field
  const validateField = (key: string) => {
    const field = fields.find(f => f.key === key);
    if (!field) return;
    
    const value = formData[key];
    
    // Required validation
    if (field.required && !value) {
      setErrors(prev => ({ ...prev, [key]: 'This field is required' }));
      return false;
    }
    
    // Custom validation
    if (field.validation?.custom) {
      const error = field.validation.custom(value, formData);
      if (error) {
        setErrors(prev => ({ ...prev, [key]: error }));
        return false;
      }
    }
    
    // Type-specific validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, [key]: 'Invalid email address' }));
        return false;
      }
    }
    
    if (field.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        setErrors(prev => ({ ...prev, [key]: 'Invalid URL' }));
        return false;
      }
    }
    
    if (field.type === 'number' && value != null) {
      if (field.validation?.min != null && value < field.validation.min) {
        setErrors(prev => ({ ...prev, [key]: `Minimum value is ${field.validation!.min}` }));
        return false;
      }
      if (field.validation?.max != null && value > field.validation.max) {
        setErrors(prev => ({ ...prev, [key]: `Maximum value is ${field.validation!.max}` }));
        return false;
      }
    }
    
    if (field.type === 'text' || field.type === 'textarea') {
      if (field.validation?.minLength != null && String(value || '').length < field.validation.minLength) {
        setErrors(prev => ({ ...prev, [key]: `Minimum length is ${field.validation!.minLength}` }));
        return false;
      }
      if (field.validation?.maxLength != null && String(value || '').length > field.validation.maxLength) {
        setErrors(prev => ({ ...prev, [key]: `Maximum length is ${field.validation!.maxLength}` }));
        return false;
      }
    }
    
    return true;
  };
  
  // Validate all fields
  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field.key)) {
        isValid = false;
      }
    });
    
    return isValid;
  };
  
  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field.key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    // Validate
    if (!validateAll()) return;
    
    // Submit
    await onSubmit(formData);
  };
  
  const visibleFields = fields.filter(f => f.visible !== false);
  
  return (
    <form onSubmit={handleSubmit} className={`flex flex-col h-full ${className}`}>
      {/* Form content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {visibleFields.map(field => {
            const value = formData[field.key] ?? field.defaultValue ?? '';
            const error = touched[field.key] ? errors[field.key] : undefined;
            const disabled = field.readonly || loading;
            
            return (
              <div key={field.key} className="space-y-2">
                <label
                  htmlFor={field.key}
                  className="block text-sm font-medium"
                >
                  {field.icon && <field.icon className="inline w-4 h-4 mr-1" />}
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                
                {/* Input based on type */}
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onBlur={() => handleBlur(field.key)}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    rows={field.validation?.minLength ? Math.ceil(field.validation.minLength / 50) : 4}
                    className={`
                      w-full px-3 py-2 rounded-md
                      border ${error ? 'border-destructive' : 'border-border'}
                      bg-background
                      focus:outline-none focus:ring-2 focus:ring-primary
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-shadow
                    `}
                  />
                ) : field.type === 'boolean' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => handleChange(field.key, e.target.checked)}
                      disabled={disabled}
                      className="rounded"
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.placeholder || 'Enable'}
                    </span>
                  </label>
                ) : field.type === 'select' ? (
                  <select
                    id={field.key}
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onBlur={() => handleBlur(field.key)}
                    disabled={disabled}
                    className={`
                      w-full px-3 py-2 rounded-md
                      border ${error ? 'border-destructive' : 'border-border'}
                      bg-background
                      focus:outline-none focus:ring-2 focus:ring-primary
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-shadow
                    `}
                  >
                    <option value="">Select...</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'number' ? (
                  <input
                    id={field.key}
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.valueAsNumber || '')}
                    onBlur={() => handleBlur(field.key)}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    min={field.validation?.min}
                    max={field.validation?.max}
                    step={field.validation?.min != null ? 1 : 'any'}
                    className={`
                      w-full px-3 py-2 rounded-md
                      border ${error ? 'border-destructive' : 'border-border'}
                      bg-background
                      focus:outline-none focus:ring-2 focus:ring-primary
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-shadow
                    `}
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'date' ? 'date' : 'text'}
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onBlur={() => handleBlur(field.key)}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    className={`
                      w-full px-3 py-2 rounded-md
                      border ${error ? 'border-destructive' : 'border-border'}
                      bg-background
                      focus:outline-none focus:ring-2 focus:ring-primary
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-shadow
                    `}
                  />
                )}
                
                {/* Help text or error */}
                {error ? (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                ) : field.helpText ? (
                  <p className="text-sm text-muted-foreground">
                    {field.helpText}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="
        flex items-center justify-end gap-2
        px-6 py-4
        border-t border-border
      ">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex items-center gap-2 px-4 py-2
              rounded-md
              border border-border
              hover:bg-muted
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="
            flex items-center gap-2 px-4 py-2
            rounded-md
            bg-primary
            text-primary-foreground
            hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-opacity
          "
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

FormView.displayName = 'FormView';
