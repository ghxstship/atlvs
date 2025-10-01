'use client';

import React, { useState } from 'react';
import { Input } from '../../components/atomic/Input';
import { Button } from '../../atoms/Button';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showIcon?: boolean;
  showClear?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export const SearchBox = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  showIcon = true,
  showClear = true,
  disabled = false,
  size = 'default',
}: SearchBoxProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className={cn('relative', className)}>
      {showIcon && (
        <div className="absolute left-sm top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-icon-xs w-icon-xs" />
        </div>
      )}
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          showIcon && 'pl-9',
          showClear && value && 'pr-9',
          isFocused && 'ring-2 ring-ring ring-offset-2'
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        size={size}
      />
      {showClear && value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
          onClick={handleClear}
          disabled={disabled}
          type="button"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
};

export type { SearchBoxProps };

// Backward compatibility alias
export const SearchFilter = SearchBox;
