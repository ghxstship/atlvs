'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@ghxstship/ui';
import { NavigationDropdown } from './NavigationDropdown';
import { anton } from '../../lib/typography';
import { cn } from '../../lib/utils';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

interface MobileMenuProps {
  navigation: NavigationItem[];
  activeDropdown: string | null;
  onDropdownChange: (label: string | null) => void;
}

export function MobileMenu({ navigation, activeDropdown, onDropdownChange }: MobileMenuProps) {
  const pathname = usePathname();
  const [animatedItems, setAnimatedItems] = useState<boolean[]>([]);

  // Stagger animation for menu items
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedItems(navigation.map((_, index) => index < navigation.length));
    }, 50);
    
    return () => clearTimeout(timer);
  }, [navigation.length]);

  return (
    <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-xl">
      <div className="px-md py-lg max-h-[70vh] overflow-y-auto">
        {/* Navigation Items with staggered animation */}
        <div className="space-y-xs">
          {navigation.map((item: NavigationItem, index: number) => (
            <div 
              key={item.label}
              className={cn(
                "transition-all duration-300 ease-out",
                animatedItems[index] 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 translate-x-4"
              )}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              {item.children ? (
                <NavigationDropdown
                  item={item}
                  activeDropdown={activeDropdown}
                  onDropdownChange={onDropdownChange}
                  isMobile
                />
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "block px-sm py-sm text-body form-label rounded-md transition-all duration-200 uppercase relative group",
                    "hover:bg-accent/10 hover:color-accent hover:translate-x-1",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "border border-transparent hover:border-primary/20",
                    anton.className,
                    pathname === item.href 
                      ? "bg-accent/10 color-accent border-primary/20" 
                      : "color-foreground"
                  )}
                >
                  <span className="relative z-10">{item.label}</span>
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md" />
                </Link>
              )}
            </div>
          ))}
        </div>
        
        {/* Divider */}
        <div className="my-lg border-t border-border/20" />
        
        {/* Mobile Auth Buttons with enhanced styling */}
        <div 
          className={cn(
            "space-y-sm transition-all duration-500 ease-out",
            animatedItems.length > 0 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          )}
          style={{
            transitionDelay: `${navigation.length * 100 + 200}ms`
          }}
        >
          <Link href="/auth/signin" className="block">
            <Button 
              className="w-full justify-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              size="lg"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup" className="block">
            <Button 
              variant="outline" 
              className="w-full justify-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:bg-accent/5"
              size="lg"
            >
              Sign Up
            </Button>
          </Link>
        </div>
        
        {/* Additional spacing for scroll */}
        <div className="h-lg" />
      </div>
    </div>
  );
}
