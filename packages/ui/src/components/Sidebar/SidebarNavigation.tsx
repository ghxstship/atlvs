'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Pin, 
  Star,
  Menu,
  X,
  Home,
  Users,
  Briefcase,
  Code,
  Layers,
  ShoppingCart,
  Building,
  DollarSign,
  BarChart3,
  BookOpen,
  Settings,
  User
} from 'lucide-react';

// 2026 Sidebar Navigation System
// Advanced expand/collapse, responsive design, micro-animations

// =============================================================================
// NAVIGATION DATA STRUCTURE
// =============================================================================

interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  href?: string;
  badge?: string | number;
  children?: NavigationItem[];
  isPinned?: boolean;
  isFrequent?: boolean;
  lastAccessed?: Date;
}

const defaultNavigationData: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    isFrequent: true,
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Briefcase,
    badge: 12,
    children: [
      { id: 'projects-overview', label: 'Overview', icon: Layers, href: '/projects' },
      { id: 'projects-active', label: 'Active Projects', icon: Briefcase, href: '/projects/active', badge: 8 },
      { id: 'projects-templates', label: 'Templates', icon: BookOpen, href: '/projects/templates' },
      { id: 'projects-archive', label: 'Archive', icon: Layers, href: '/projects/archive' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    icon: Users,
    children: [
      { id: 'people-crew', label: 'Crew', icon: Users, href: '/people/crew' },
      { id: 'people-contacts', label: 'Contacts', icon: Users, href: '/people/contacts' },
      { id: 'people-roles', label: 'Roles', icon: Users, href: '/people/roles' },
    ],
  },
  {
    id: 'programming',
    label: 'Programming',
    icon: Code,
    children: [
      { id: 'programming-schedule', label: 'Schedule', icon: Code, href: '/programming/schedule' },
      { id: 'programming-content', label: 'Content', icon: Code, href: '/programming/content' },
    ],
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: Layers,
    href: '/pipeline',
    isPinned: true,
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: ShoppingCart,
    href: '/procurement',
  },
  {
    id: 'companies',
    label: 'Companies',
    icon: Building,
    href: '/companies',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    children: [
      { id: 'finance-overview', label: 'Overview', icon: DollarSign, href: '/finance' },
      { id: 'finance-invoices', label: 'Invoices', icon: DollarSign, href: '/finance/invoices' },
      { id: 'finance-expenses', label: 'Expenses', icon: DollarSign, href: '/finance/expenses' },
      { id: 'finance-reports', label: 'Reports', icon: BarChart3, href: '/finance/reports' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: BookOpen,
    href: '/resources',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

// =============================================================================
// SIDEBAR VARIANTS
// =============================================================================

const sidebarVariants = cva(
  [
    'flex flex-col bg-background border-r border-border',
    'transition-all duration-300 ease-in-out',
    'relative z-40',
  ],
  {
    variants: {
      state: {
        expanded: 'w-64',
        collapsed: 'w-16',
        hidden: 'w-0 border-r-0',
      },
      variant: {
        default: '',
        floating: 'mx-2 my-2 rounded-lg border border-border shadow-sm bg-background/95 backdrop-blur',
        overlay: 'fixed inset-y-0 left-0 z-50 shadow-xl',
      },
    },
    defaultVariants: {
      state: 'expanded',
      variant: 'default',
    },
  }
);

const navItemVariants = cva(
  [
    'flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-sm font-medium',
    'motion-safe:transition-all motion-safe:duration-200',
    'hover:bg-muted',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'group relative',
  ],
  {
    variants: {
      active: {
        true: 'bg-primary/10 text-primary',
        false: 'text-muted-foreground',
      },
      level: {
        0: 'ml-0',
        1: 'ml-4',
        2: 'ml-8',
      },
      collapsed: {
        true: 'justify-center px-2',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
      level: 0,
      collapsed: false,
    },
  }
);

// =============================================================================
// SIDEBAR NAVIGATION COMPONENT
// =============================================================================

interface SidebarNavigationProps {
  className?: string;
  defaultCollapsed?: boolean;
  variant?: 'default' | 'floating' | 'overlay';
  onNavigate?: (href: string) => void;
  // When provided, replaces the default navigation structure
  items?: NavigationItem[];
  // Telemetry hooks
  onSearchChange?: (query: string, resultsCount: number) => void;
  onToggleExpand?: (itemId: string, expanded: boolean) => void;
  onTogglePin?: (itemId: string, pinned: boolean) => void;
  initialPinnedIds?: string[];
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  className,
  defaultCollapsed = false,
  variant = 'default',
  onNavigate,
  items,
  onSearchChange,
  onToggleExpand,
  onTogglePin,
  initialPinnedIds,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState('dashboard');
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set((initialPinnedIds && initialPinnedIds.length > 0) ? initialPinnedIds : ['pipeline']));
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  // Data source (props override default)
  const sourceNavigation: NavigationItem[] = items ?? defaultNavigationData;

  // Search functionality
  const filteredNavigation = React.useMemo(() => {
    if (!searchQuery) return sourceNavigation;
    
    const filterItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.reduce((acc, item) => {
        const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredChildren = item.children ? filterItems(item.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren.length > 0 ? filteredChildren : item.children,
          });
        }
        
        return acc;
      }, [] as NavigationItem[]);
    };
    
    return filterItems(sourceNavigation);
  }, [searchQuery, sourceNavigation]);

  // Notify search telemetry on changes
  useEffect(() => {
    if (!onSearchChange) return;
    // Count visible nodes
    const countNodes = (items: NavigationItem[]): number =>
      items.reduce((sum, it) => sum + 1 + (it.children ? countNodes(it.children) : 0), 0);
    const resultsCount = countNodes(filteredNavigation);
    onSearchChange(searchQuery, resultsCount);
  }, [searchQuery, filteredNavigation, onSearchChange]);

  // Derive active item from current URL and auto-expand parents
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;

    const findMatch = (items: NavigationItem[], parents: string[] = []): { id?: string; parents: string[] } => {
      for (const it of items) {
        if (it.href && it.href === path) return { id: it.id, parents };
        if (it.children) {
          const res = findMatch(it.children, [...parents, it.id]);
          if (res.id) return res;
        }
      }
      return { parents };
    };

    const match = findMatch(sourceNavigation);
    if (match.id) {
      setActiveItem(match.id);
      setExpandedItems(new Set(match.parents));
    }
  }, [sourceNavigation]);

  // Toggle expand/collapse
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        onToggleExpand?.(itemId, false);
      } else {
        newSet.add(itemId);
        onToggleExpand?.(itemId, true);
      }
      return newSet;
    });
  };

  // Toggle pin
  const togglePin = (itemId: string) => {
    setPinnedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        onTogglePin?.(itemId, false);
      } else {
        newSet.add(itemId);
        onTogglePin?.(itemId, true);
      }
      return newSet;
    });
  };

  // Handle navigation
  const handleNavigate = (href: string, itemId: string) => {
    setActiveItem(itemId);
    if (isMobile) {
      setIsMobileOpen(false);
    }
    onNavigate?.(href);
  };

  // Render navigation item
  const renderNavItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeItem === item.id;
    const isPinned = pinnedItems.has(item.id);
    const Icon = item.icon;

    const childContainerId = `children-${item.id}`;
    return (
      <div key={item.id} className="relative">
        <button
          className={navItemVariants({
            active: isActive,
            level: level as 0 | 1 | 2,
            collapsed: isCollapsed && level === 0,
          })}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.href) {
              handleNavigate(item.href, item.id);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (hasChildren) {
                toggleExpanded(item.id);
              } else if (item.href) {
                handleNavigate(item.href, item.id);
              }
            } else if (hasChildren && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
              // ArrowRight expands, ArrowLeft collapses
              e.preventDefault();
              const wantExpand = e.key === 'ArrowRight';
              const currentlyExpanded = expandedItems.has(item.id);
              if (wantExpand && !currentlyExpanded) toggleExpanded(item.id);
              if (!wantExpand && currentlyExpanded) toggleExpanded(item.id);
            }
          }}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-controls={hasChildren ? childContainerId : undefined}
          aria-current={isActive ? 'page' : undefined}
        >
          {/* Icons only for top-level items and when provided */}
          {level === 0 && Icon ? (
            <Icon className="h-5 w-5 flex-shrink-0" />
          ) : (
            level === 0 && <span className="h-5 w-5" aria-hidden="true" />
          )}
          
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full">
                  {item.badge}
                </span>
              )}
              
              {isPinned && (
                <Pin className="h-3 w-3 text-primary" />
              )}
              
              {hasChildren && (
                <div className="motion-safe:transition-transform motion-safe:duration-200">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.label}
              {item.badge && ` (${item.badge})`}
            </div>
          )}
        </button>

        {/* Pin toggle button */}
        {!isCollapsed && level === 0 && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              togglePin(item.id);
            }}
            aria-label={isPinned ? 'Unpin item' : 'Pin item'}
          >
            <Pin className={`h-3 w-3 ${isPinned ? 'text-primary' : 'text-muted-foreground'}`} />
          </button>
        )}

        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div id={childContainerId} className="ml-2 border-l border-border animate-in slide-in-from-top-2 motion-safe:duration-200">
            {item.children!.map((child: NavigationItem) => (
              <div
                key={child.id}
                role="link"
                tabIndex={0}
                aria-label={child.label}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer motion-safe:transition-colors motion-safe:duration-200"
                onClick={() => onNavigate?.(child.href || '#')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate?.(child.href || '#');
                  }
                }}
              >
                <span className="truncate">{child.label}</span>
                {child.badge && (
                  <span className="ml-auto text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                    {child.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Mobile overlay
  if (isMobile && variant === 'overlay') {
    return (
      <>
        {/* Mobile toggle button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border border-border rounded-lg shadow-sm"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile overlay */}
        {isMobileOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 flex"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchMove={(e) => {
              if (touchStartX.current == null) return;
              const dx = e.touches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 50) {
                setIsMobileOpen(false);
                touchStartX.current = null;
              }
            }}
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            
            {/* Sidebar */}
            <div className={sidebarVariants({ state: 'expanded', variant: 'overlay' })}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">ATLVS</h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded hover:bg-muted"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search */}
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search navigation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-2 pb-4">
                {filteredNavigation.map((item: NavigationItem) => renderNavItem(item))}
              </nav>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <div aria-label="Sidebar Navigation" className={twMerge(sidebarVariants({ 
      state: isCollapsed ? 'collapsed' : 'expanded',
      variant 
    }), className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-anton), ANTON, sans-serif' }}>
            ATLVS
          </h2>
        )}
        
        <button
          className="p-1.5 rounded-lg hover:bg-muted motion-safe:transition-colors motion-safe:duration-200"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary motion-safe:transition-all motion-safe:duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery('');
                  searchInputRef.current?.blur();
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {/* Pinned items first */}
        {!isCollapsed && pinnedItems.size > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Pinned
            </div>
            {filteredNavigation
              .filter(item => pinnedItems.has(item.id))
              .map(item => renderNavItem(item))}
          </div>
        )}
        
        {/* All items */}
        <div className="space-y-1">
          {filteredNavigation.map(item => renderNavItem(item))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <button
          className={navItemVariants({
            active: activeItem === 'profile',
            collapsed: isCollapsed,
          })}
          onClick={() => handleNavigate('/profile', 'profile')}
        >
          <User className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="flex-1 text-left">Profile</span>}
          
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Profile
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default SidebarNavigation;
