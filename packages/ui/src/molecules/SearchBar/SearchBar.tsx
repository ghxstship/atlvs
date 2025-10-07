'use client';

import { Search, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Input } from '../../components/atomic/Input';
import { Button } from '../../components/atomic/Button';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
  debounceMs = 300,
  showClearButton = true,
  autoFocus = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);

    // Debounce search
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (onSearch) {
      const timeout = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
      setDebounceTimeout(timeout);
    }
  }, [controlledValue, onChange, onSearch, debounceMs, debounceTimeout]);

  const handleClear = useCallback(() => {
    const newValue = '';
    
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onSearch?.(newValue);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  }, [controlledValue, onChange, onSearch, debounceTimeout]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      onSearch?.(value);
    } else if (e.key === 'Escape') {
      handleClear();
    }
  }, [value, onSearch, debounceTimeout, handleClear]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="pl-10 pr-10"
      />
      {showClearButton && value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
