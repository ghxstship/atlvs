/**
 * Footer/StatusBar Component — App Footer with Status Info
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Wifi, WifiOff, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface FooterProps {
  /** Show sync status */
  showSyncStatus?: boolean;
  
  /** Sync status */
  syncStatus?: 'synced' | 'syncing' | 'error' | 'offline';
  
  /** Last sync time */
  lastSyncTime?: Date;
  
  /** Version info */
  version?: string;
  
  /** Custom status message */
  statusMessage?: string;
  
  /** Additional footer content */
  children?: React.ReactNode;
  
  /** Custom className */
  className?: string;
}

/**
 * Footer Component
 * 
 * @example
 * ```tsx
 * <Footer
 *   syncStatus="synced"
 *   version="v2.0.0"
 *   showSyncStatus
 * />
 * ```
 */
export function Footer({
  showSyncStatus = true,
  syncStatus = 'synced',
  lastSyncTime,
  version,
  statusMessage,
  children,
  className = '',
}: FooterProps) {
  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />;
      case 'syncing':
        return <Clock className="w-4 h-4 text-[var(--color-info)] animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[var(--color-error)]" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-[var(--color-foreground-muted)]" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };
  
  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return lastSyncTime
          ? `Synced ${formatRelativeTime(lastSyncTime)}`
          : 'All changes saved';
      case 'syncing':
        return 'Saving changes...';
      case 'error':
        return 'Sync error';
      case 'offline':
        return 'Offline';
      default:
        return '';
    }
  };
  
  return (
    <footer
      className={`
        flex items-center justify-between
        h-8 px-4
        border-t border-[var(--color-border)]
        bg-[var(--color-background)]
        text-xs text-[var(--color-foreground-secondary)]
        ${className}
      `}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {showSyncStatus && (
          <div className="flex items-center gap-2">
            {getSyncStatusIcon()}
            <span>{getSyncStatusText()}</span>
          </div>
        )}
        
        {statusMessage && (
          <div className="flex items-center gap-2">
            <span>{statusMessage}</span>
          </div>
        )}
        
        {children}
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-4">
        {version && (
          <span className="text-[var(--color-foreground-muted)]">
            {version}
          </span>
        )}
      </div>
    </footer>
  );
}

/**
 * Format relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

Footer.displayName = 'Footer';
