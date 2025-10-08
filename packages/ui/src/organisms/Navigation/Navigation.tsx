/**
 * Navigation Component — Main Navigation
 * Primary site navigation with nested items
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string;
  children?: NavItem[];
  active?: boolean;
}

export interface NavigationProps {
  /** Navigation items */
  items: NavItem[];
  
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Item click handler */
  onItemClick?: (item: NavItem) => void;
}

/**
 * Navigation Component
 */
export const Navigation: React.FC<NavigationProps> = ({
  items,
  orientation = 'horizontal',
  onItemClick,
}) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const renderItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            }
            onItemClick?.(item);
          }}
          className={`
            w-full flex items-center gap-2 px-3 py-2
            rounded-md
            text-sm font-medium
            transition-colors
            ${item.active
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }
          `}
          style={{ paddingLeft: `${level * 1 + 0.75}rem` }}
        >
          {item.icon && <item.icon className="w-4 h-4" />}
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <nav className={orientation === 'vertical' ? 'space-y-1' : 'flex gap-1'}>
      {items.map(item => renderItem(item))}
    </nav>
  );
};

Navigation.displayName = 'Navigation';
