'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@ghxstship/ui/components/Button';
import { Menu, X } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';
import { anton } from '../lib/typography';
import { navigation } from '../lib/navigation';
import { NavigationDropdown } from './navigation/NavigationDropdown';
import { MobileMenu } from './navigation/MobileMenu';

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className={`text-2xl font-bold tracking-tight text-foreground ${anton.className}`}>
                GHXSTSHIP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <NavigationDropdown
                    item={item}
                    activeDropdown={activeDropdown}
                    onDropdownChange={setActiveDropdown}
                  />
                ) : (
                  <a
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary uppercase",
                      anton.className,
                      pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button>
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button>
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <MobileMenu
            navigation={navigation}
            activeDropdown={activeDropdown}
            onDropdownChange={setActiveDropdown}
          />
        )}
      </div>
    </header>
  );
}
