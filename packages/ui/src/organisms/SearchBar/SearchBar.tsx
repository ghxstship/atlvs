/**
 * SearchBar Component — Advanced Search
 * Search with filters and suggestions
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
}

export interface SearchBarProps {
  /** Search query */
  value?: string;
  
  /** Search change handler */
  onChange?: (value: string) => void;
  
  /** Search submit handler */
  onSubmit?: (value: string) => void;
  
  /** Search results */
  results?: SearchResult[];
  
  /** Result click handler */
  onResultClick?: (result: SearchResult) => void;
  
  /** Placeholder */
  placeholder?: string;
  
  /** Show results dropdown */
  showResults?: boolean;
  
  /** Loading state */
  loading?: boolean;
}

/**
 * SearchBar Component
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChange,
  onSubmit,
  results = [],
  onResultClick,
  placeholder = 'Search...',
  showResults = true,
  loading = false,
}) => {
  const [internalValue, setInternalValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  
  const searchValue = value ?? internalValue;
  
  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(searchValue);
  };
  
  const handleClear = () => {
    handleChange('');
  };
  
  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const showDropdown = showResults && isFocused && searchValue && results.length > 0;
  
  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-foreground-muted)]" />
          
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="
              w-full pl-10 pr-10 py-2
              border border-[var(--color-border)]
              rounded-lg
              bg-[var(--color-background)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
              transition-all
            "
          />
          
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                p-1 rounded
                hover:bg-[var(--color-muted)]
                transition-colors
              "
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
      
      {showDropdown && (
        <div className="
          absolute top-full left-0 right-0 mt-2
          bg-[var(--color-surface)]
          border border-[var(--color-border)]
          rounded-lg shadow-lg
          max-h-96 overflow-auto
          z-50
        ">
          {loading ? (
            <div className="p-4 text-center text-[var(--color-foreground-secondary)]">
              Loading...
            </div>
          ) : (
            results.map((result) => (
              <button
                key={result.id}
                onClick={() => {
                  onResultClick?.(result);
                  setIsFocused(false);
                }}
                className="
                  w-full px-4 py-3 text-left
                  hover:bg-[var(--color-muted)]
                  transition-colors
                  border-b border-[var(--color-border)] last:border-0
                "
              >
                <div className="font-medium">{result.title}</div>
                {result.description && (
                  <div className="text-sm text-[var(--color-foreground-secondary)] mt-1">
                    {result.description}
                  </div>
                )}
                {result.category && (
                  <div className="text-xs text-[var(--color-foreground-muted)] mt-1">
                    {result.category}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

SearchBar.displayName = 'SearchBar';
