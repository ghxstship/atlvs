/**
 * Pagination Component — Page Navigation
 * Navigate through paginated content
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  
  /** Total pages */
  totalPages: number;
  
  /** Page change handler */
  onPageChange: (page: number) => void;
  
  /** Show first/last buttons */
  showFirstLast?: boolean;
  
  /** Number of page buttons to show */
  siblingCount?: number;
}

/**
 * Pagination Component
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={3}
 *   totalPages={10}
 *   onPageChange={setPage}
 * />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  siblingCount = 1,
}) => {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;
    
    if (!showLeftDots && showRightDots) {
      const leftRange = 3 + 2 * siblingCount;
      for (let i = 1; i <= leftRange; i++) {
        pages.push(i);
      }
      pages.push('dots');
      pages.push(totalPages);
    } else if (showLeftDots && !showRightDots) {
      pages.push(1);
      pages.push('dots');
      const rightRange = 3 + 2 * siblingCount;
      for (let i = totalPages - rightRange + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('dots');
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pages.push(i);
      }
      pages.push('dots');
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pages = generatePageNumbers();
  
  return (
    <div className="flex items-center gap-1">
      {/* First page */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="
            p-2 rounded
            border border-[var(--color-border)]
            hover:bg-[var(--color-muted)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      )}
      
      {/* Previous page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="
          p-2 rounded
          border border-[var(--color-border)]
          hover:bg-[var(--color-muted)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      {/* Page numbers */}
      {pages.map((page, index) => {
        if (page === 'dots') {
          return (
            <span
              key={`dots-${index}`}
              className="px-3 py-2 text-sm text-[var(--color-foreground-muted)]"
            >
              ...
            </span>
          );
        }
        
        const isActive = page === currentPage;
        
        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`
              px-3 py-2 rounded
              text-sm font-medium
              border border-[var(--color-border)]
              transition-colors
              ${isActive
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]'
                : 'hover:bg-[var(--color-muted)]'
              }
            `}
          >
            {page}
          </button>
        );
      })}
      
      {/* Next page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="
          p-2 rounded
          border border-[var(--color-border)]
          hover:bg-[var(--color-muted)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      
      {/* Last page */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="
            p-2 rounded
            border border-[var(--color-border)]
            hover:bg-[var(--color-muted)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

Pagination.displayName = 'Pagination';
