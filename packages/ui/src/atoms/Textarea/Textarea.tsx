/**
 * Textarea Component — Multi-line Text Input
 * Modern textarea with auto-resize option
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label */
  label?: string;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Show character count */
  showCount?: boolean;
  
  /** Auto-resize */
  autoResize?: boolean;
}

/**
 * Textarea Component
 * 
 * @example
 * ```tsx
 * <Textarea label="Description" rows={4} />
 * <Textarea maxLength={500} showCount />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCount = false,
      autoResize = false,
      maxLength,
      className = '',
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [charCount, setCharCount] = React.useState(0);
    
    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value, autoResize]);
    
    // Track character count
    React.useEffect(() => {
      if (showCount && value) {
        setCharCount(String(value).length);
      }
    }, [value, showCount]);
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCount) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };
    
    const baseClasses = `
      w-full
      rounded-md
      border
      bg-[var(--color-background)]
      px-4 py-2
      text-sm
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      placeholder:text-[var(--color-foreground-muted)]
      resize-y
    `;
    
    const variantClasses = error
      ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]'
      : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]';
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5">
            {label}
          </label>
        )}
        
        <textarea
          ref={(node) => {
            textareaRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={`
            ${baseClasses}
            ${variantClasses}
            ${autoResize ? 'resize-none overflow-hidden' : ''}
            ${className}
          `}
          {...props}
        />
        
        <div className="flex items-center justify-between mt-1.5">
          {(error || helperText) && (
            <p className={`text-sm ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-foreground-secondary)]'}`}>
              {error || helperText}
            </p>
          )}
          {showCount && maxLength && (
            <p className={`text-sm ml-auto ${charCount > maxLength ? 'text-[var(--color-error)]' : 'text-[var(--color-foreground-secondary)]'}`}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
