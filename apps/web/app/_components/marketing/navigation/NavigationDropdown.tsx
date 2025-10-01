'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { anton } from '../../lib/typography';

interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

interface NavigationDropdownProps {
  item: NavigationItem;
  activeDropdown: string | null;
  onDropdownChange: (label: string | null) => void;
  isMobile?: boolean;
}

export function NavigationDropdown({ 
  item, 
  activeDropdown, 
  onDropdownChange,
  isMobile = false 
}: NavigationDropdownProps) {
  const pathname = usePathname();

  const handleToggle = () => {
    onDropdownChange(activeDropdown === item.label ? null : item.label);
  };

  if (isMobile) {
    return (
      <div className="border-b border-border/20 last:border-b-0">
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center justify-between w-full px-sm py-sm text-body form-label rounded-md transition-all duration-200 uppercase",
            "hover:bg-accent/10 hover:color-accent hover:scale-[1.02]",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            anton.className,
            pathname.startsWith(item.href) ? "bg-accent/10 color-accent" : "color-foreground"
          )}
          aria-expanded={activeDropdown === item.label}
        >
          <span>{item.label}</span>
          <ChevronDown
            className={cn(
              "h-icon-xs w-icon-xs transition-all duration-300",
              activeDropdown === item.label ? "rotate-180 color-accent" : "rotate-0"
            )}
          />
        </button>
        
        {/* Mobile submenu with slide animation */}
        <div 
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            activeDropdown === item.label 
              ? "max-h-container-lg opacity-100" 
              : "max-h-0 opacity-0"
          )}
        >
          <div className="pl-md pt-xs stack-xs">
            {item.children?.map((child: any, index: number) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block px-sm py-sm text-body-sm rounded-md transition-all duration-200",
                  "hover:bg-accent/10 hover:color-accent hover:translate-x-1",
                  "focus:outline-none focus:bg-accent/10 focus:color-accent",
                  pathname === child.href ? "bg-accent/10 color-accent" : "color-muted"
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('left');

  // Adjust dropdown position based on viewport
  useEffect(() => {
    if (activeDropdown === item.label && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      if (rect.right > viewportWidth - 20) {
        setDropdownPosition('right');
      } else {
        setDropdownPosition('left');
      }
    }
  }, [activeDropdown, item.label]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDropdownChange(activeDropdown === item.label ? null : item.label);
    } else if (e.key === 'Escape') {
      onDropdownChange(null);
    }
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => onDropdownChange(item.label)}
      onMouseLeave={() => onDropdownChange(null)}
    >
      <button
        className={cn(
          "flex items-center cluster-xs text-body-sm form-label transition-all duration-200 uppercase relative group",
          "hover:color-accent hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-sm px-xs py-xs",
          anton.className,
          pathname.startsWith(item.href) ? "color-accent" : "color-muted",
          // Add underline animation
          "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all after:duration-200",
          "hover:after:w-full",
          pathname.startsWith(item.href) && "after:w-full"
        )}
        onKeyDown={handleKeyDown}
        aria-expanded={activeDropdown === item.label}
        aria-haspopup="true"
      >
        <span>{item.label}</span>
        <ChevronDown 
          className={cn(
            "h-icon-xs w-icon-xs transition-all duration-200",
            activeDropdown === item.label ? "rotate-180" : "rotate-0"
          )} 
        />
      </button>
      
      {/* Dropdown Menu with enhanced positioning and animations */}
      <div
        ref={dropdownRef}
        className={cn(
          // Positioning only — background is applied to inner container to avoid overrides
          "absolute top-full w-container-sm z-[var(--z-dropdown)]",
          // Position based on viewport
          dropdownPosition === 'right' ? 'right-0' : 'left-0',
          // Animation states
          activeDropdown === item.label
            ? "opacity-100 translate-y-0 scale-100 visible pointer-events-auto"
            : "opacity-0 -translate-y-1 scale-95 invisible pointer-events-none"
        )}
        role="menu"
        aria-label={`${item.label} menu`}
      >
        {/* Inner container ensures solid theme-aware surface */}
        <div
          className={cn(
            "relative rounded-xl border border-border bg-popover text-popover-foreground",
            // Elevation and stacking context
            "p-xs shadow-xl z-[calc(var(--z-dropdown)+1)]"
          )}
        >
          {item.children?.map((child: any, index: number) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "flex items-center px-sm py-sm text-body-sm rounded-md transition-all duration-200",
                "hover:bg-accent/10 hover:color-accent hover:translate-x-1",
                "focus:outline-none focus:bg-accent/10 focus:color-accent",
                "group relative overflow-hidden",
                pathname === child.href ? "bg-accent/10 color-accent" : "text-popover-foreground"
              )}
              role="menuitem"
              tabIndex={activeDropdown === item.label ? 0 : -1}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="relative z-10">{child.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
