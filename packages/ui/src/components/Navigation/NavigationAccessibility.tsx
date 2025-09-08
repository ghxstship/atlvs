'use client';

import React, { useEffect, useState } from 'react';

interface NavigationAnnouncerProps {
  pathname?: string;
}

export const NavigationAnnouncer: React.FC<NavigationAnnouncerProps> = ({ pathname }) => {
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Announce page changes for screen readers
    const segments = currentPath.split('/').filter(Boolean);
    const pageName = segments
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '))
      .join(' - ');
    
    setAnnouncement(`Navigated to ${pageName || 'Home'}`);
    
    // Clear announcement after delay to allow re-announcement
    const timer = setTimeout(() => setAnnouncement(''), 100);
    return () => clearTimeout(timer);
  }, [currentPath]);

  return (
    <>
      {/* Live region for navigation announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* Skip navigation links */}
      <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-50">
        <a
          href="#main-content"
          className="inline-block px-4 py-2 m-2 bg-brand-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="inline-block px-4 py-2 m-2 bg-brand-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Skip to navigation
        </a>
      </div>
    </>
  );
};

interface NavigationLandmarkProps {
  children: React.ReactNode;
  label?: string;
}

export const NavigationLandmark: React.FC<NavigationLandmarkProps> = ({ 
  children, 
  label = 'Main navigation' 
}) => {
  return (
    <nav
      id="navigation"
      role="navigation"
      aria-label={label}
    >
      {children}
    </nav>
  );
};

interface NavigationItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  level?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}

export const AccessibleNavigationItem: React.FC<NavigationItemProps> = ({
  href,
  label,
  isActive = false,
  level = 0,
  hasChildren = false,
  isExpanded = false,
  onToggle,
  children
}) => {
  const ariaLevel = level + 1;
  
  return (
    <li role="none">
      <div className="flex items-center">
        {hasChildren && (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={`nav-group-${label.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={onToggle}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label} menu`}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
        
        <a
          href={href}
          aria-current={isActive ? 'page' : undefined}
          aria-level={ariaLevel}
          className={`
            flex-1 px-3 py-2 rounded-md text-sm font-medium
            ${isActive 
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' 
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
          `}
        >
          {label}
        </a>
      </div>
      
      {hasChildren && isExpanded && (
        <ul
          id={`nav-group-${label.toLowerCase().replace(/\s+/g, '-')}`}
          role="group"
          className="ml-4 mt-1"
        >
          {children}
        </ul>
      )}
    </li>
  );
};

// Keyboard navigation hook
export const useKeyboardNavigation = (items: any[], isOpen: boolean) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
          
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
          
        case 'End':
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
          
        case 'Escape':
          e.preventDefault();
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items.length, isOpen]);

  return { focusedIndex, setFocusedIndex };
};

// Focus trap for modals and overlays
export const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
};

// High contrast mode detection
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    setIsHighContrast(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};
