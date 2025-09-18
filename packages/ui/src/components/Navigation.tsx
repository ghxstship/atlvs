import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Command,
  Zap,
  Globe,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { SearchInput } from './Input';
import { Button, IconButton } from './Button';
import { Badge } from './Badge';

// Global Search Component
export interface GlobalSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  shortcuts?: Array<{
    key: string;
    label: string;
    action: () => void;
  }>;
  recentSearches?: string[];
  suggestions?: Array<{
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action: () => void;
  }>;
}

export const GlobalSearch = React.forwardRef<HTMLDivElement, GlobalSearchProps>(
  ({ placeholder = "Search everything...", onSearch, shortcuts, recentSearches, suggestions }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const searchRef = React.useRef<HTMLInputElement>(null);

    // Global keyboard shortcut (Cmd+K / Ctrl+K)
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setIsOpen(true);
          setTimeout(() => searchRef.current?.focus(), 100);
        }
        if (e.key === 'Escape') {
          setIsOpen(false);
          setQuery('');
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearch = (value: string) => {
      setQuery(value);
      onSearch?.(value);
    };

    return (
      <>
        {/* Search Trigger */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 w-full max-w-md px-3 py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted transition-colors rounded-lg border border-border/50 hover:border-border"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">{placeholder}</span>
            <div className="flex items-center gap-1 text-xs">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">
                <Command className="h-3 w-3 inline mr-1" />K
              </kbd>
            </div>
          </button>
        </div>

        {/* Search Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl">
              <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-border">
                  <Search className="h-5 w-5 text-muted-foreground mr-3" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-sm font-body"
                    autoComplete="off"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-muted rounded-sm transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                  {query ? (
                    <div className="p-md">
                      <p className="text-sm text-muted-foreground mb-4">
                        Searching for "{query}"...
                      </p>
                      {suggestions?.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            suggestion.action();
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-3 w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                        >
                          {suggestion.icon && (
                            <div className="text-muted-foreground">
                              {suggestion.icon}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{suggestion.title}</p>
                            {suggestion.subtitle && (
                              <p className="text-sm text-muted-foreground">
                                {suggestion.subtitle}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {/* Shortcuts */}
                      {shortcuts && shortcuts.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Quick Actions
                          </h3>
                          <div className="space-y-xs">
                            {shortcuts.map((shortcut, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  shortcut.action();
                                  setIsOpen(false);
                                }}
                                className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg transition-colors text-left"
                              >
                                <span className="text-sm">{shortcut.label}</span>
                                <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">
                                  {shortcut.key}
                                </kbd>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Searches */}
                      {recentSearches && recentSearches.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Recent Searches
                          </h3>
                          <div className="space-y-xs">
                            {recentSearches.map((search, index) => (
                              <button
                                key={index}
                                onClick={() => handleSearch(search)}
                                className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-lg transition-colors text-left text-sm"
                              >
                                <Search className="h-3 w-3 text-muted-foreground" />
                                {search}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);
GlobalSearch.displayName = 'GlobalSearch';

// Theme Switcher
export interface ThemeSwitcherProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const ThemeSwitcher = React.forwardRef<HTMLDivElement, ThemeSwitcherProps>(
  ({ theme, onThemeChange }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const themes = [
      { value: 'light', label: 'Light', icon: Sun },
      { value: 'dark', label: 'Dark', icon: Moon },
      { value: 'system', label: 'System', icon: Monitor },
    ] as const;

    const currentTheme = themes.find(t => t.value === theme);

    return (
      <div ref={ref} className="relative">
        <IconButton
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          {currentTheme && <currentTheme.icon className="h-4 w-4" />}
        </IconButton>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    onThemeChange(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted transition-colors',
                    theme === themeOption.value && 'bg-muted text-primary'
                  )}
                >
                  <themeOption.icon className="h-4 w-4" />
                  {themeOption.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
);
ThemeSwitcher.displayName = 'ThemeSwitcher';

// Notification Bell
export interface NotificationBellProps {
  count?: number;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type?: 'info' | 'success' | 'warning' | 'error';
  }>;
  onNotificationClick?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export const NotificationBell = React.forwardRef<HTMLDivElement, NotificationBellProps>(
  ({ count = 0, notifications = [], onNotificationClick, onMarkAllRead }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const typeColors = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-amber-600',
      error: 'text-red-600',
    };

    return (
      <div ref={ref} className="relative">
        <IconButton
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </IconButton>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-display text-sm font-semibold">Notifications</h3>
                {count > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={onMarkAllRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        onNotificationClick?.(notification.id);
                        setIsOpen(false);
                      }}
                      className={clsx(
                        'flex items-start gap-3 w-full p-4 hover:bg-muted transition-colors text-left border-b border-border/50 last:border-b-0',
                        !notification.read && 'bg-muted/50'
                      )}
                    >
                      <div className={clsx(
                        'w-2 h-2 rounded-full mt-2 shrink-0',
                        notification.read ? 'bg-muted-foreground/30' : 'bg-primary'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
NotificationBell.displayName = 'NotificationBell';

// User Menu
export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  menuItems?: Array<{
    label: string;
    icon?: React.ReactNode;
    action: () => void;
    separator?: boolean;
  }>;
}

export const UserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(
  ({ user, menuItems = [] }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 hover:bg-muted rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              {/* User Info */}
              <div className="p-4 border-b border-border">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.role && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {user.role}
                  </Badge>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item, index) => (
                  <React.Fragment key={index}>
                    {item.separator && <div className="h-px bg-border my-2" />}
                    <button
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      {item.icon && (
                        <span className="text-muted-foreground">
                          {item.icon}
                        </span>
                      )}
                      {item.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
UserMenu.displayName = 'UserMenu';

// Top Navigation Bar
export interface TopNavProps {
  title?: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  showSearch?: boolean;
  searchProps?: Partial<GlobalSearchProps>;
  user?: UserMenuProps['user'];
  userMenuItems?: UserMenuProps['menuItems'];
  notifications?: NotificationBellProps['notifications'];
  notificationCount?: number;
  theme?: ThemeSwitcherProps['theme'];
  onThemeChange?: ThemeSwitcherProps['onThemeChange'];
  onNotificationClick?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export const TopNav = React.forwardRef<HTMLElement, TopNavProps>(
  ({ 
    title,
    subtitle,
    leftContent,
    rightContent,
    showSearch = true,
    searchProps,
    user,
    userMenuItems,
    notifications,
    notificationCount,
    theme = 'system',
    onThemeChange,
    onNotificationClick,
    onMarkAllRead,
  }, ref) => {
    return (
      <nav 
        ref={ref}
        className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {leftContent}
            {(title || subtitle) && (
              <div>
                {title && (
                  <h1 className="font-display text-lg font-semibold">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground font-body">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Center Section - Search */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-8">
              <GlobalSearch {...searchProps} />
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {rightContent}
            
            {/* Theme Switcher */}
            {onThemeChange && (
              <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
            )}
            
            {/* Notifications */}
            <NotificationBell
              count={notificationCount}
              notifications={notifications}
              onNotificationClick={onNotificationClick}
              onMarkAllRead={onMarkAllRead}
            />
            
            {/* User Menu */}
            {user && (
              <UserMenu user={user} menuItems={userMenuItems} />
            )}
          </div>
        </div>
      </nav>
    );
  }
);
TopNav.displayName = 'TopNav';
