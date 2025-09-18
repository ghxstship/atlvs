'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, Check, Type } from 'lucide-react';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-sm py-sm text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none',
  {
    variants: {
      variant: {
        default: 'border-border hover:border-border/80',
        success: 'border-success focus-visible:ring-success',
        error: 'border-destructive focus-visible:ring-destructive',
      },
      size: {
        default: 'min-h-[80px] px-sm py-sm',
        sm: 'min-h-[60px] px-sm py-xs text-sm',
        lg: 'min-h-[120px] px-md py-sm',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      resize: 'vertical',
    },
  }
);

export interface TextareaProps 
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  label?: string;
  description?: string;
  success?: boolean;
  loading?: boolean;
  autoResize?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  leftIcon?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant, 
    size, 
    resize,
    error, 
    success, 
    loading, 
    label, 
    description, 
    id, 
    autoResize = false,
    maxLength,
    showCharCount = false,
    leftIcon,
    value,
    onChange,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    const currentVariant = error ? 'error' : success ? 'success' : variant;
    
    const textareaRef = useCallback((node: HTMLTextAreaElement | null) => {
      if (autoResize && node) {
        node.style.height = 'auto';
        node.style.height = `${node.scrollHeight}px`;
      }
      if (typeof ref === 'function') {
        ref(node);
      }
    }, [autoResize, ref]);

    // Character count tracking
    useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const isNearLimit = maxLength && charCount > maxLength * 0.8;
    const isOverLimit = maxLength && charCount > maxLength;
    
    return (
      <div className="space-y-xs">
        {label && (
          <label 
            htmlFor={textareaId}
            className={clsx(
              'text-sm font-medium leading-none transition-colors duration-200',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              isFocused && 'text-primary',
              error && 'text-destructive',
              success && 'text-success'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-sm top-sm text-muted-foreground pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          <textarea
            id={textareaId}
            ref={textareaRef}
            className={twMerge(
              textareaVariants({ variant: currentVariant, size, resize }),
              leftIcon && 'pl-2xl',
              'group-hover:shadow-surface',
              isFocused && 'shadow-elevated',
              isOverLimit && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={maxLength}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${textareaId}-error` : description ? `${textareaId}-description` : undefined
            }
            {...props}
          />
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute right-sm top-sm pointer-events-none">
              <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
            </div>
          )}
          
          {/* Success indicator */}
          {success && !loading && (
            <div className="absolute right-sm top-sm pointer-events-none">
              <Check className="h-4 w-4 text-success" />
            </div>
          )}
          
          {/* Error indicator */}
          {error && !loading && (
            <div className="absolute right-sm top-sm pointer-events-none">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          )}
        </div>
        
        {/* Character count */}
        {(showCharCount || maxLength) && (
          <div className="flex justify-between items-center text-xs">
            <div />
            <div className={clsx(
              'transition-colors duration-200',
              isOverLimit ? 'text-destructive' : 
              isNearLimit ? 'text-warning' : 
              'text-muted-foreground'
            )}>
              {charCount}{maxLength && `/${maxLength}`}
            </div>
          </div>
        )}
        
        {description && !error && (
          <p id={`${textareaId}-description`} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-destructive flex items-center gap-x-xs" role="alert">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {success && !error && (
          <p className="text-sm text-success flex items-center gap-x-xs">
            <Check className="h-3 w-3" />
            Input validated
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
