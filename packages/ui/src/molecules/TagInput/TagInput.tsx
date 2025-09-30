'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const tagInputVariants = cva(
  'flex flex-wrap gap-xs p-sm border border-border rounded-md bg-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-border',
        error: 'border-destructive focus-within:ring-destructive',
        success: 'border-success focus-within:ring-success',
      },
      size: {
        sm: 'text-sm min-h-[32px]',
        default: 'text-sm min-h-[40px]',
        lg: 'text-base min-h-[48px]',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed bg-muted',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      disabled: false,
    },
  }
);

const tagVariants = cva(
  'inline-flex items-center gap-xs px-sm py-xs rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary hover:bg-primary/20',
        secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/20',
        destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
        outline: 'border border-border hover:bg-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TagInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof tagInputVariants> {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  tagVariant?: VariantProps<typeof tagVariants>['variant'];
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  suggestions?: string[];
  disabled?: boolean;
}

export const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(
  (
    {
      className,
      value = [],
      onChange,
      placeholder = 'Add a tag...',
      maxTags,
      allowDuplicates = false,
      variant,
      size,
      tagVariant = 'default',
      onTagAdd,
      onTagRemove,
      suggestions = [],
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setShowSuggestions(e.target.value.length > 0 && suggestions.length > 0);
    };

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim();
      if (!trimmedTag) return;

      if (!allowDuplicates && value.includes(trimmedTag)) {
        return;
      }

      if (maxTags && value.length >= maxTags) {
        return;
      }

      const newTags = [...value, trimmedTag];
      onChange?.(newTags);
      onTagAdd?.(trimmedTag);
      setInputValue('');
      setShowSuggestions(false);
    };

    const removeTag = (tagToRemove: string) => {
      if (disabled) return;
      
      const newTags = value.filter(tag => tag !== tagToRemove);
      onChange?.(newTags);
      onTagRemove?.(tagToRemove);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
        removeTag(value[value.length - 1]);
      }
    };

    const handleSuggestionClick = (suggestion: string) => {
      addTag(suggestion);
      inputRef.current?.focus();
    };

    const filteredSuggestions = suggestions.filter(
      s => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
    );

    return (
      <div className="relative">
        <div
          ref={ref}
          className={twMerge(
            tagInputVariants({ variant, size, disabled }),
            className
          )}
          onClick={() => inputRef.current?.focus()}
          {...props}
        >
          {value.map((tag) => (
            <span
              key={tag}
              className={tagVariants({ variant: tagVariant })}
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="ml-xs hover:text-destructive transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {(!maxTags || value.length < maxTags) && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : ''}
              disabled={disabled}
              className={clsx(
                'flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground',
                disabled && 'cursor-not-allowed'
              )}
            />
          )}
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 top-full mt-xs w-full max-h-[200px] overflow-auto rounded-md border bg-popover p-xs shadow-elevated">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-sm py-xs rounded hover:bg-muted transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TagInput.displayName = 'TagInput';

export default TagInput;
