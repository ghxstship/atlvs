/**
 * Breadcrumb Component — Navigation Breadcrumbs
 * Shows current location in app hierarchy
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '../types';

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  
  /** Show home icon */
  showHome?: boolean;
  
  /** Home href */
  homeHref?: string;
  
  /** Separator */
  separator?: React.ReactNode;
  
  /** Max items to show (rest will be collapsed) */
  maxItems?: number;
  
  /** Custom className */
  className?: string;
}

/**
 * Breadcrumb Component
 * 
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Projects', href: '/projects' },
 *     { label: 'Website Redesign', href: '/projects/123' },
 *     { label: 'Tasks' }
 *   ]}
 *   showHome
 * />
 * ```
 */
export function Breadcrumb({
  items,
  showHome = true,
  homeHref = '/',
  separator,
  maxItems,
  className = '',
}: BreadcrumbProps) {
  const defaultSeparator = <ChevronRight className="w-4 h-4 text-muted-foreground" />;
  const sep = separator || defaultSeparator;
  
  // Handle collapsed items
  let displayItems = items;
  
  if (maxItems && items.length > maxItems) {
    displayItems = [
      ...items.slice(0, 1),
      { label: '...', href: undefined },
      ...items.slice(-(maxItems - 2)),
    ];
  }
  
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <ol className="flex items-center gap-2">
        {/* Home */}
        {showHome && (
          <li className="flex items-center gap-2">
            <Link
              href={homeHref}
              className="
                flex items-center gap-1
                text-muted-foreground
                hover:text-foreground
                transition-colors
              "
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </Link>
            {(items.length > 0 || displayItems.length > 0) && (
              <span aria-hidden="true">{sep}</span>
            )}
          </li>
        )}
        
        {/* Breadcrumb items */}
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="
                    flex items-center gap-1
                    text-muted-foreground
                    hover:text-foreground
                    transition-colors
                  "
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={`
                    flex items-center gap-1
                    ${isLast
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                    }
                  `}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              )}
              
              {!isLast && (
                <span aria-hidden="true">{sep}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Breadcrumb.displayName = 'Breadcrumb';
