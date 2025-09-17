'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// 2026 Sidebar Breadcrumbs Component
// Context-aware navigation with smooth animations

interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
}

interface SidebarBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (href: string) => void;
}

export const SidebarBreadcrumbs: React.FC<SidebarBreadcrumbsProps> = ({
  items,
  className,
  onNavigate,
}) => {
  if (items.length === 0) return null;

  return (
    <nav 
      className={twMerge(
        'flex items-center space-x-1 px-4 py-2 text-sm text-muted-foreground border-b border-border bg-muted',
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={item.id} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground mx-1 flex-shrink-0" />
              )}
              
              {item.href && !isLast ? (
                <button
                  onClick={() => onNavigate?.(item.href!)}
                  className="flex items-center gap-1 hover:text-primary transition-colors duration-200 rounded px-1 py-0.5 hover:bg-muted"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && React.createElement(Icon, { className: "h-3 w-3" })}
                  <span className="truncate max-w-32">{item.label}</span>
                </button>
              ) : (
                <span 
                  className={twMerge(
                    'flex items-center gap-1 px-1 py-0.5',
                    isLast && 'text-foreground font-medium'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && React.createElement(Icon, { className: "h-3 w-3" })}
                  <span className="truncate max-w-32">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default SidebarBreadcrumbs;
