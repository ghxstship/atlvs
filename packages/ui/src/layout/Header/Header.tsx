/**
 * Header Component — Modern SaaS App Header
 * Inspired by Supabase, Vercel, GitHub
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Search, Bell, Plus, Settings, Menu } from 'lucide-react';
import type { QuickAction, NotificationItem, UserProfile } from '../types';

export interface HeaderProps {
  /** Logo component */
  logo?: React.ReactNode;
  
  /** Search placeholder */
  searchPlaceholder?: string;
  
  /** Search callback */
  onSearch?: (query: string) => void;
  
  /** Quick actions */
  quickActions?: QuickAction[];
  
  /** Notifications */
  notifications?: NotificationItem[];
  
  /** Unread notification count */
  unreadCount?: number;
  
  /** User profile */
  user?: UserProfile;
  
  /** Show search */
  showSearch?: boolean;
  
  /** Show notifications */
  showNotifications?: boolean;
  
  /** Show user menu */
  showUserMenu?: boolean;
  
  /** Sidebar toggle callback */
  onToggleSidebar?: () => void;
  
  /** Additional header content */
  children?: React.ReactNode;
  
  /** Custom className */
  className?: string;
}

/**
 * Header Component
 * 
 * @example
 * ```tsx
 * <Header
 *   logo={<Logo />}
 *   user={currentUser}
 *   onSearch={handleSearch}
 *   notifications={notifications}
 * />
 * ```
 */
export function Header({
  logo,
  searchPlaceholder = 'Search...',
  onSearch,
  quickActions = [],
  notifications = [],
  unreadCount = 0,
  user,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  onToggleSidebar,
  children,
  className = '',
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showNotificationsPanel, setShowNotificationsPanel] = React.useState(false);
  const [showUserMenuPanel, setShowUserMenuPanel] = React.useState(false);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };
  
  return (
    <header
      className={`
        flex items-center justify-between
        h-16 px-4 
        border-b border-[var(--color-border)]
        bg-[var(--color-background)]
        sticky top-0 z-50
        ${className}
      `}
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Sidebar toggle (mobile) */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="
              lg:hidden
              p-2 rounded-md
              hover:bg-[var(--color-muted)]
              transition-colors
            "
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        {/* Logo */}
        {logo && (
          <div className="flex items-center">
            {logo}
          </div>
        )}
        
        {/* Search */}
        {showSearch && (
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md hidden md:block"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearchChange}
                className="
                  w-full h-9 pl-10 pr-4
                  rounded-md
                  border border-[var(--color-border)]
                  bg-[var(--color-background)]
                  text-sm
                  placeholder:text-[var(--color-foreground-muted)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                  transition-shadow
                "
              />
            </div>
          </form>
        )}
        
        {/* Custom content */}
        {children}
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Quick actions */}
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className="
              relative p-2 rounded-md
              hover:bg-[var(--color-muted)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
            aria-label={action.label}
            title={action.label}
          >
            <action.icon className="w-5 h-5" />
            {action.badge && (
              <span className="
                absolute -top-1 -right-1
                min-w-[18px] h-[18px] px-1
                rounded-full
                bg-[var(--color-error)]
                text-[var(--color-error-foreground)]
                text-xs font-medium
                flex items-center justify-center
              ">
                {action.badge}
              </span>
            )}
          </button>
        ))}
        
        {/* Notifications */}
        {showNotifications && (
          <div className="relative">
            <button
              onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
              className="
                relative p-2 rounded-md
                hover:bg-[var(--color-muted)]
                transition-colors
              "
              aria-label="Notifications"
              aria-expanded={showNotificationsPanel}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="
                  absolute top-1 right-1
                  w-2 h-2 rounded-full
                  bg-[var(--color-error)]
                " />
              )}
            </button>
            
            {/* Notifications panel (simplified - would use Popover component) */}
            {showNotificationsPanel && (
              <div className="
                absolute right-0 top-full mt-2
                w-80 max-h-96 overflow-auto
                rounded-lg border border-[var(--color-border)]
                bg-[var(--color-surface)]
                shadow-lg
              ">
                <div className="p-3 border-b border-[var(--color-border)]">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[var(--color-foreground-muted)]">
                    No notifications
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`
                          p-3 border-b border-[var(--color-border)] last:border-0
                          hover:bg-[var(--color-muted)]
                          cursor-pointer
                          ${!notification.read ? 'bg-[var(--color-info-background)]' : ''}
                        `}
                      >
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-sm text-[var(--color-foreground-secondary)] mt-1">
                          {notification.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* User menu */}
        {showUserMenu && user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenuPanel(!showUserMenuPanel)}
              className="
                flex items-center gap-2 p-2 rounded-md
                hover:bg-[var(--color-muted)]
                transition-colors
              "
              aria-label="User menu"
              aria-expanded={showUserMenuPanel}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div className="
                  w-7 h-7 rounded-full
                  bg-[var(--color-primary)]
                  text-[var(--color-primary-foreground)]
                  flex items-center justify-center
                  text-sm font-medium
                ">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            
            {/* User menu panel (simplified - would use Dropdown component) */}
            {showUserMenuPanel && (
              <div className="
                absolute right-0 top-full mt-2
                w-64
                rounded-lg border border-[var(--color-border)]
                bg-[var(--color-surface)]
                shadow-lg
              ">
                <div className="p-3 border-b border-[var(--color-border)]">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-[var(--color-foreground-secondary)]">
                    {user.email}
                  </div>
                </div>
                <div className="p-1">
                  <button className="
                    w-full px-3 py-2 text-left text-sm
                    rounded-md
                    hover:bg-[var(--color-muted)]
                    transition-colors
                  ">
                    Profile
                  </button>
                  <button className="
                    w-full px-3 py-2 text-left text-sm
                    rounded-md
                    hover:bg-[var(--color-muted)]
                    transition-colors
                  ">
                    Settings
                  </button>
                  <button className="
                    w-full px-3 py-2 text-left text-sm
                    rounded-md
                    hover:bg-[var(--color-muted)]
                    transition-colors
                    text-[var(--color-error)]
                  ">
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

Header.displayName = 'Header';
