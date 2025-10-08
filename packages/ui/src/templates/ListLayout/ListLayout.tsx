/**
 * ListLayout Template
 * Layout template for list/table pages
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../../atoms/Input/Input';
import { Button } from '../../atoms/Button/Button';

export interface ListLayoutProps {
  /** Page title */
  title: string;
  
  /** Page subtitle */
  subtitle?: string;
  
  /** Action buttons */
  actions?: React.ReactNode;
  
  /** Search configuration */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  
  /** Filter configuration */
  filters?: {
    activeCount: number;
    onClear: () => void;
  };
  
  /** Sidebar content */
  sidebar?: React.ReactNode;
  
  /** Main content */
  children: React.ReactNode;
}

/**
 * ListLayout Component
 */
export const ListLayout: React.FC<ListLayoutProps> = ({
  title,
  subtitle,
  actions,
  search,
  filters,
  sidebar,
  children,
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
          
          {/* Search & Filters */}
          {(search || filters) && (
            <div className="flex items-center gap-4">
              {search && (
                <div className="flex-1 max-w-md">
                  <Input
                    type="search"
                    placeholder={search.placeholder || 'Search...'}
                    value={search.value}
                    onChange={(e) => search.onChange(e.target.value)}
                    icon={Search}
                  />
                </div>
              )}
              
              {filters && filters.activeCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={filters.onClear}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear {filters.activeCount} filter{filters.activeCount !== 1 ? 's' : ''}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          {sidebar && (
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-6">
                {sidebar}
              </div>
            </aside>
          )}
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

ListLayout.displayName = 'ListLayout';
