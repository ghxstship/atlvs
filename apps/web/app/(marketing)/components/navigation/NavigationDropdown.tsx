'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
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
            "flex items-center justify-between w-full px-3 py-2 text-base font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground uppercase",
            anton.className,
            pathname.startsWith(item.href) ? "bg-accent text-accent-foreground" : "text-foreground"
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
          <div className="pl-4 space-y-1">
            {item.children?.map((child) => (
              <a
                key={child.href}
                href={child.href}
                className={cn(
                  "block px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === child.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
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
          "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary uppercase",
          anton.className,
          pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
        )}
      >
        <span>{item.label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {/* Dropdown Menu */}
      <div
        className={cn(
          "absolute left-0 top-full mt-2 w-48 rounded-md border bg-background/95 backdrop-blur-sm p-1 shadow-lg transition-all duration-200 z-[60]",
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
              "block px-3 py-2 text-sm rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === child.href ? "bg-accent text-accent-foreground" : "text-popover-foreground"
            )}
          >
            {child.label}
          </a>
        ))}
      </div>
    </div>
  );
}
