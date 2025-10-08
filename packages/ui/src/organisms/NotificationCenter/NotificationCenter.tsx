/**
 * NotificationCenter Component — Notification Panel
 * Display and manage notifications
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Bell, X, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationCenterProps {
  /** Notifications */
  notifications: Notification[];
  
  /** Mark as read handler */
  onMarkAsRead?: (id: string) => void;
  
  /** Mark all as read handler */
  onMarkAllAsRead?: () => void;
  
  /** Dismiss handler */
  onDismiss?: (id: string) => void;
  
  /** Clear all handler */
  onClearAll?: () => void;
}

/**
 * NotificationCenter Component
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="w-96 max-h-[600px] flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onMarkAllAsRead && unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              Mark all as read
            </button>
          )}
          {onClearAll && notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm text-[var(--color-foreground-secondary)] hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
      
      {/* Notifications */}
      <div className="flex-1 overflow-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-foreground-secondary)]">
            <Bell className="w-12 h-12 mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 ${!notification.read ? 'bg-[var(--color-primary)]/5' : ''} hover:bg-[var(--color-muted)] transition-colors`}
              >
                <div className="flex gap-3">
                  {notification.icon && (
                    <notification.icon className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{notification.title}</div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && onMarkAsRead && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="p-1 rounded hover:bg-[var(--color-muted)] transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {onDismiss && (
                          <button
                            onClick={() => onDismiss(notification.id)}
                            className="p-1 rounded hover:bg-[var(--color-muted)] transition-colors"
                            title="Dismiss"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-[var(--color-foreground-secondary)] mt-1">
                      {notification.message}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-[var(--color-foreground-muted)]">
                        {notification.timestamp.toLocaleString()}
                      </div>
                      {notification.action && (
                        <button
                          onClick={notification.action.onClick}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          {notification.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

NotificationCenter.displayName = 'NotificationCenter';
