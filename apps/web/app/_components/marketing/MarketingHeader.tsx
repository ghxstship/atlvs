'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@ghxstship/ui';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { anton } from '../lib/typography';
import { navigation, NavigationItem } from '../lib/navigation';
import { NavigationDropdown } from './navigation/NavigationDropdown';
import { MobileMenu } from './navigation/MobileMenu';

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced scroll detection with direction and momentum
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollThreshold = 10;
    
    // Determine scroll direction
    if (currentScrollY > lastScrollY) {
      setScrollDirection('down');
    } else {
      setScrollDirection('up');
    }
    
    // Update scrolled state with enhanced logic
    setIsScrolled(currentScrollY > scrollThreshold);
    setLastScrollY(currentScrollY);
    
    // Note: Auto-hide functionality removed to ensure sticky behavior works properly
  }, [lastScrollY, scrollDirection, isOpen]);

  // Debounced scroll handler for performance
  const debouncedHandleScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleScroll, 10);
  }, [handleScroll]);

  useEffect(() => {
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedHandleScroll]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDropdown && headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <header 
        ref={headerRef}
        className={cn(
          // Use fixed positioning to guarantee sticky behavior across all contexts
          'fixed top-0 left-0 right-0 z-[90]',
          // Base styling
          'w-full border-b transition-all duration-300 ease-out',
          // Solid surface treatment (no translucency)
          'bg-background border-border',
          // Scroll-based styling
          isScrolled && 'shadow-lg shadow-black/5 bg-background border-border',
          // Mobile menu open state
          isOpen && 'bg-background'
        )}
      >
        <div className="container mx-auto px-lg">
          <div className="flex h-component-md items-center justify-between">
            {/* Logo with enhanced hover effects */}
            <Link 
              href="/" 
              className="flex items-center gap-sm group transition-all duration-200 hover:scale-105"
              aria-label="GHXSTSHIP Home"
            >
              <div className="flex items-center">
                <span className={cn(
                  anton.className,
                  'text-heading-3 text-foreground transition-transform duration-200',
                  'group-hover:scale-105'
                )}>
                  GHXSTSHIP
                </span>
              </div>
            </Link>

            {/* Desktop Navigation with enhanced interactions */}
            <nav 
              className="hidden md:flex items-center cluster-lg"
              role="navigation"
              aria-label="Main navigation"
            >
              {navigation.map((item: NavigationItem) => (
                <div key={item.label} className="relative">
                  {item.children ? (
                    <NavigationDropdown
                      item={item}
                      activeDropdown={activeDropdown}
                      onDropdownChange={setActiveDropdown}
                    />
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "text-body-sm form-label transition-all duration-200 uppercase relative group",
                        "hover:color-accent hover:scale-105",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-sm px-xs py-xs",
                        anton.className,
                        pathname === item.href ? "color-accent" : "color-muted",
                        // Add underline animation
                        "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all after:duration-200",
                        "hover:after:w-full",
                        pathname === item.href && "after:w-full"
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Auth Buttons with enhanced styling */}
            <div className="hidden md:flex items-center gap-md">
              <Link href="/auth/signin">
                <Button 
                  size="sm" 
                  className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-accent/5"
                >
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button with enhanced animations */}
            <button
              className={cn(
                "md:hidden relative p-xs rounded-md transition-all duration-200",
                "hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/20",
                "active:scale-95"
              )}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-icon-md h-icon-md">
                <Menu 
                  className={cn(
                    "absolute inset-0 h-icon-md w-icon-md transition-all duration-300",
                    isOpen ? "opacity-0 rotate-180 scale-75" : "opacity-100 rotate-0 scale-100"
                  )} 
                />
                <X 
                  className={cn(
                    "absolute inset-0 h-icon-md w-icon-md transition-all duration-300",
                    isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-180 scale-75"
                  )} 
                />
              </div>
            </button>
          </div>

          {/* Mobile Navigation with slide animation */}
          <div 
            id="mobile-menu"
            className={cn(
              "md:hidden absolute top-full left-0 right-0 transition-all duration-300 ease-out",
              "bg-background/95 backdrop-blur-xl border-b border-border/50",
              "shadow-lg shadow-black/5",
              isOpen 
                ? "opacity-100 translate-y-0 pointer-events-auto" 
                : "opacity-0 -translate-y-2 pointer-events-none"
            )}
            aria-hidden={!isOpen}
          >
            <MobileMenu
              navigation={navigation}
              activeDropdown={activeDropdown}
              onDropdownChange={setActiveDropdown}
            />
          </div>
        </div>
      </header>
      {/* Spacer to offset fixed header height */}
      <div aria-hidden className="h-component-md" />
    </>
  );
}
