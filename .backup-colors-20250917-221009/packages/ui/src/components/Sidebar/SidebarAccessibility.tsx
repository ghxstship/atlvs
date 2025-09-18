'use client';

import React, { useEffect, useRef } from 'react';

// 2026 Sidebar Accessibility System
// WCAG 2.2 AA+ compliance with advanced keyboard navigation

interface AccessibilityProps {
  children: React.ReactNode;
  isCollapsed?: boolean;
  activeItemId?: string;
  onKeyboardNavigation?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onActivateItem?: (itemId: string) => void;
}

export const SidebarAccessibility: React.FC<AccessibilityProps> = ({
  children,
  isCollapsed = false,
  activeItemId,
  onKeyboardNavigation,
  onActivateItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const focusedItemRef = useRef<string | null>(null);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          onKeyboardNavigation?.('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          onKeyboardNavigation?.('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onKeyboardNavigation?.('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          onKeyboardNavigation?.('right');
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (activeItemId) {
            onActivateItem?.(activeItemId);
          }
          break;
        case 'Home':
          event.preventDefault();
          // Focus first item
          const firstItem = containerRef.current?.querySelector('[role="menuitem"]') as HTMLElement;
          firstItem?.focus();
          break;
        case 'End':
          event.preventDefault();
          // Focus last item
          const items = containerRef.current?.querySelectorAll('[role="menuitem"]');
          const lastItem = items?.[items.length - 1] as HTMLElement;
          lastItem?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeItemId, onKeyboardNavigation, onActivateItem]);

  // Screen reader announcements
  const announceChange = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // Announce state changes
  useEffect(() => {
    if (isCollapsed !== undefined) {
      announceChange(isCollapsed ? 'Sidebar collapsed' : 'Sidebar expanded');
    }
  }, [isCollapsed]);

  return (
    <div
      ref={containerRef}
      role="navigation"
      aria-label="Main navigation"
      className="focus-within:outline-none"
    >
      {children}
    </div>
  );
};

// Accessible navigation item wrapper
interface AccessibleNavItemProps {
  children: React.ReactNode;
  itemId: string;
  label: string;
  href?: string;
  hasChildren?: boolean;
  isExpanded?: boolean;
  isActive?: boolean;
  level?: number;
  onClick?: () => void;
}

export const AccessibleNavItem: React.FC<AccessibleNavItemProps> = ({
  children,
  itemId,
  label,
  href,
  hasChildren = false,
  isExpanded = false,
  isActive = false,
  level = 0,
  onClick,
}) => {
  const itemRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={itemRef}
      role="menuitem"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={level + 1}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
    >
      {children}
    </button>
  );
};

// Skip navigation link
export const SkipNavigation: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-md py-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
};

// Landmark regions
export const SidebarLandmarks: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <aside
      role="complementary"
      aria-label="Navigation sidebar"
      className="h-full"
    >
      {children}
    </aside>
  );
};

export default SidebarAccessibility;
