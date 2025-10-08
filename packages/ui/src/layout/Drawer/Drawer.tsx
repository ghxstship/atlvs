/**
 * Drawer Component — Sliding Panel with Tabs
 * For forms, details, activity, insights, etc.
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { DrawerSide, DrawerSize, DrawerTab } from '../types';

export interface DrawerProps {
  /** Is drawer open */
  open: boolean;
  
  /** Close callback */
  onClose: () => void;
  
  /** Drawer title */
  title?: string;
  
  /** Drawer side */
  side?: DrawerSide;
  
  /** Drawer size */
  size?: DrawerSize;
  
  /** Tabs */
  tabs?: DrawerTab[];
  
  /** Active tab ID */
  activeTab?: string;
  
  /** Tab change callback */
  onTabChange?: (tabId: string) => void;
  
  /** Show overlay */
  showOverlay?: boolean;
  
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  
  /** Close on escape */
  closeOnEscape?: boolean;
  
  /** Header actions */
  headerActions?: React.ReactNode;
  
  /** Footer content */
  footer?: React.ReactNode;
  
  /** Children (content) */
  children?: React.ReactNode;
  
  /** Custom className */
  className?: string;
}

/**
 * Drawer Component
 * 
 * @example
 * ```tsx
 * <Drawer
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Edit Project"
 *   tabs={[
 *     { id: 'details', label: 'Details', content: <ProjectForm /> },
 *     { id: 'activity', label: 'Activity', content: <ActivityLog /> },
 *   ]}
 * />
 * ```
 */
export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  size = 'md',
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  headerActions,
  footer,
  children,
  className = '',
}: DrawerProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState(tabs?.[0]?.id || '');
  
  const activeTab = controlledActiveTab || internalActiveTab;
  
  const handleTabChange = (tabId: string) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };
  
  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);
  
  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  
  if (!open) return null;
  
  const sizeClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[32rem]',
    xl: 'w-[48rem]',
    full: 'w-full',
  };
  
  const slideClasses = {
    left: {
      enter: '-translate-x-full',
      enterActive: 'translate-x-0',
      exit: '-translate-x-full',
    },
    right: {
      enter: 'translate-x-full',
      enterActive: 'translate-x-0',
      exit: 'translate-x-full',
    },
  };
  
  const currentTab = tabs?.find(tab => tab.id === activeTab);
  
  return (
    <div className="fixed inset-0 z-50 flex" style={{ pointerEvents: 'auto' }}>
      {/* Overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
      )}
      
      {/* Drawer */}
      <div
        className={`
          relative
          ${side === 'left' ? 'mr-auto' : 'ml-auto'}
          ${sizeClasses[size]}
          h-full
          bg-background
          border-${side === 'left' ? 'r' : 'l'} border-border
          shadow-2xl
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${slideClasses[side].enterActive}
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border">
          {/* Title bar */}
          <div className="flex items-center justify-between h-16 px-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="flex items-center gap-2">
              {headerActions}
              <button
                onClick={onClose}
                className="
                  p-2 rounded-md
                  hover:bg-muted
                  transition-colors
                "
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          {tabs && tabs.length > 0 && (
            <div className="flex border-t border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  disabled={tab.disabled}
                  className={`
                    flex items-center gap-2 px-4 py-3
                    text-sm font-medium
                    border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }
                    ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tabs && currentTab ? currentTab.content : children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-border p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

Drawer.displayName = 'Drawer';
