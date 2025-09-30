/**
 * GHXSTSHIP FormField Molecule
 * Composition: Label + Input/Textarea/Select + Error + Helper Text
 */

import React from 'react';
import { Input, type InputProps } from '../components/atomic/Input';
import { Textarea, type TextareaProps } from '../components/atomic/Textarea';
import { Label } from '../components/Label';
import { cn } from '../lib/utils';

export interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, description, error, required, className, children }, ref) => {
    const fieldId = React.useId();
    const descriptionId = description ? `${fieldId}-description` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={fieldId} className={error ? 'text-destructive' : ''}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}

        <div
          aria-describedby={cn(descriptionId, errorId)}
          aria-invalid={error ? 'true' : 'false'}
        >
          {children}
        </div>

        {description && !error && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// Convenience components for common field types
export interface InputFieldProps extends Omit<InputProps, 'label' | 'description' | 'error'> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, description, error, required, ...props }, ref) => {
    return (
      <FormField label={label} description={description} error={error} required={required}>
        <Input ref={ref} {...props} />
      </FormField>
    );
  }
);

InputField.displayName = 'InputField';

export interface TextareaFieldProps extends Omit<TextareaProps, 'label' | 'description' | 'error'> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, description, error, required, ...props }, ref) => {
    return (
      <FormField label={label} description={description} error={error} required={required}>
        <Textarea ref={ref} {...props} />
      </FormField>
    );
  }
);

TextareaField.displayName = 'TextareaField';
