'use client';

import { useState } from 'react';
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
      <div>
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center justify-between w-full px-sm py-sm text-body form-label rounded-md transition-colors hover:bg-accent hover:color-accent-foreground uppercase",
            anton.className,
            pathname.startsWith(item.href) ? "bg-accent color-accent-foreground" : "color-foreground"
          )}
        >
          <span>{item.label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              activeDropdown === item.label ? "rotate-180" : ""
            )}
          />
        </button>
        {activeDropdown === item.label && (
          <div className="pl-md stack-xl">
            {item.children?.map((child) => (
              <a
                key={child.href}
                href={child.href}
                className={cn(
                  "block px-sm py-sm text-body-sm rounded-md transition-colors hover:bg-accent hover:color-accent-foreground",
                  pathname === child.href ? "bg-accent color-accent-foreground" : "color-muted"
                )}
              >
                {child.label}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="group relative"
      onMouseEnter={() => onDropdownChange(item.label)}
      onMouseLeave={() => onDropdownChange(null)}
    >
      <button
        className={cn(
          "flex items-center cluster-xs text-body-sm form-label transition-colors hover:color-primary uppercase",
          anton.className,
          pathname.startsWith(item.href) ? "color-primary" : "color-muted"
        )}
      >
        <span>{item.label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {/* Dropdown Menu */}
      <div
        className={cn(
          "absolute left-0 top-full mt-xs w-48 rounded-md border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-xs shadow-lg transition-all duration-200 z-[60]",
          activeDropdown === item.label
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 translate-y-1 invisible"
        )}
      >
        {item.children?.map((child) => (
          <a
            key={child.href}
            href={child.href}
            className={cn(
              "block px-sm py-sm text-body-sm rounded-sm transition-colors hover:bg-accent hover:color-accent-foreground",
              pathname === child.href ? "bg-accent color-accent-foreground" : "text-popover-foreground"
            )}
          >
            {child.label}
          </a>
        ))}
      </div>
    </div>
  );
}
