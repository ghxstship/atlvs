'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@ghxstship/ui/components/Button';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });
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
      <div className="container mx-auto px-md">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center cluster-sm">
            <div className="flex items-center">
              <span className="text-display color-primary">
                GHXSTSHIP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center cluster-xl">
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
                      "text-body-sm form-label transition-colors hover:color-primary uppercase",
                      anton.className,
                      pathname === item.href ? "color-primary" : "color-muted"
                    )}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center cluster">
            <Link href="/auth/signin">
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
