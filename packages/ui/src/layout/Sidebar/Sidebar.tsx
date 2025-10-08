/**
 * Sidebar Component — Modern Collapsible Navigation
 * Inspired by Supabase, Vercel, GitHub
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import type { NavigationSection, NavigationItem, SidebarState } from '../types';

export interface SidebarProps {
  /** Navigation sections */
  sections: NavigationSection[];
  
  /** Initial sidebar state */
  initialState?: SidebarState;
  
  /** Header content (logo, workspace selector, etc.) */
  header?: React.ReactNode;
  
  /** Footer content (user profile, settings, etc.) */
  footer?: React.ReactNode;
  
  /** Allow collapse */
  collapsible?: boolean;
  
  /** Callback when state changes */
  onStateChange?: (state: SidebarState) => void;
  
  /** Custom className */
  className?: string;
}

/**
 * Sidebar Component
 * 
 * @example
 * ```tsx
 * <Sidebar
 *   sections={navigationSections}
 *   header={<WorkspaceSelector />}
 *   footer={<UserProfile />}
 *   collapsible
 * />
 * ```
 */
export function Sidebar({
  sections,
  initialState = 'expanded',
  header,
  footer,
  collapsible = true,
  onStateChange,
  className = '',
}: SidebarProps) {
  const [state, setState] = React.useState<SidebarState>(initialState);
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const pathname = usePathname();
  
  const isCollapsed = state === 'collapsed';
  const isHidden = state === 'hidden';
  
  const handleToggleCollapse = () => {
    const newState = isCollapsed ? 'expanded' : 'collapsed';
    setState(newState);
    onStateChange?.(newState);
  };
  
  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };
  
  const isItemActive = (item: NavigationItem): boolean => {
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.href === pathname);
    }
    return false;
  };
  
  if (isHidden) return null;
  
  return (
    <aside
      className={`
        flex flex-col
        h-screen
        border-r border-[var(--color-border)]
        bg-[var(--color-background)]
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
    >
      {/* Header */}
      {header && (
        <div className={`
          flex items-center
          h-16 px-4
          border-b border-[var(--color-border)]
          ${isCollapsed ? 'justify-center' : 'justify-between'}
        `}>
          {!isCollapsed && header}
          {isCollapsed && collapsible && (
            <button
              onClick={handleToggleCollapse}
              className="p-2 rounded-md hover:bg-[var(--color-muted)] transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {sections.map((section) => (
          <div key={section.id} className="mb-6 last:mb-0">
            {/* Section label */}
            {!isCollapsed && section.label && (
              <div className="px-3 py-2 text-xs font-semibold text-[var(--color-foreground-muted)] uppercase tracking-wider">
                {section.label}
              </div>
            )}
            
            {/* Section items */}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavigationItemComponent
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                  isExpanded={expandedItems.has(item.id)}
                  isActive={isItemActive(item)}
                  onToggleExpand={() => handleToggleExpand(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Footer */}
      {footer && (
        <div className={`
          border-t border-[var(--color-border)]
          p-2
          ${isCollapsed ? 'flex justify-center' : ''}
        `}>
          {footer}
        </div>
      )}
      
      {/* Collapse toggle */}
      {!isCollapsed && collapsible && (
        <div className="border-t border-[var(--color-border)] p-2">
          <button
            onClick={handleToggleCollapse}
            className="
              w-full flex items-center gap-2 px-3 py-2
              rounded-md
              hover:bg-[var(--color-muted)]
              text-sm text-[var(--color-foreground-secondary)]
              transition-colors
            "
          >
            <PanelLeftClose className="w-4 h-4" />
            <span>Collapse sidebar</span>
          </button>
        </div>
      )}
    </aside>
  );
}

/**
 * Navigation Item Component
 * Recursive component for nested navigation
 */
interface NavigationItemComponentProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  isActive: boolean;
  onToggleExpand: () => void;
  level?: number;
}

function NavigationItemComponent({
  item,
  isCollapsed,
  isExpanded,
  isActive,
  onToggleExpand,
  level = 0,
}: NavigationItemComponentProps) {
  const hasChildren = item.children && item.children.length > 0;
  const pathname = usePathname();
  
  const isChildActive = hasChildren && item.children!.some(child => child.href === pathname);
  
  const itemContent = (
    <>
      {/* Icon */}
      {item.icon && (
        <item.icon className="w-5 h-5 flex-shrink-0" />
      )}
      
      {/* Label */}
      {!isCollapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}
      
      {/* Badge */}
      {!isCollapsed && item.badge && (
        <span className="
          px-2 py-0.5 rounded-full
          bg-[var(--color-primary)]
          text-[var(--color-primary-foreground)]
          text-xs font-medium
        ">
          {item.badge}
        </span>
      )}
      
      {/* Expand icon */}
      {!isCollapsed && hasChildren && (
        <span className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
      )}
    </>
  );
  
  const itemClasses = `
    flex items-center gap-3 px-3 py-2
    rounded-md
    text-sm font-medium
    transition-colors
    ${isCollapsed ? 'justify-center' : ''}
    ${isActive || isChildActive
      ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
      : 'text-[var(--color-foreground-secondary)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]'
    }
    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${level > 0 && !isCollapsed ? `ml-${level * 4}` : ''}
  `;
  
  const handleClick = (e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    
    if (hasChildren) {
      e.preventDefault();
      onToggleExpand();
    }
    
    item.onClick?.();
  };
  
  return (
    <div>
      {/* Main item */}
      {item.href && !hasChildren ? (
        <Link
          href={item.href}
          className={itemClasses}
          onClick={handleClick}
          aria-current={isActive ? 'page' : undefined}
          title={isCollapsed ? item.label : undefined}
        >
          {itemContent}
        </Link>
      ) : (
        <button
          className={`w-full ${itemClasses}`}
          onClick={handleClick}
          disabled={item.disabled}
          aria-expanded={hasChildren ? isExpanded : undefined}
          title={isCollapsed ? item.label : undefined}
        >
          {itemContent}
        </button>
      )}
      
      {/* Children */}
      {!isCollapsed && hasChildren && isExpanded && (
        <div className="ml-2 mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavigationItemComponent
              key={child.id}
              item={child}
              isCollapsed={isCollapsed}
              isExpanded={false}
              isActive={child.href === pathname}
              onToggleExpand={() => {}}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

Sidebar.displayName = 'Sidebar';
