'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@ghxstship/ui';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'ATLVS', href: '/products/atlvs' },
      { label: 'OPENDECK', href: '/products/opendeck' },
      { label: 'Compare Products', href: '/products/compare' },
    ],
  },
  {
    label: 'Solutions',
    href: '/solutions',
    children: [
      { label: 'Brand Activations', href: '/solutions/brand-activations' },
      { label: 'Community & Cultural Events', href: '/solutions/community-cultural-events' },
      { label: 'Concerts, Festivals & Tours', href: '/solutions/concerts-festivals-tours' },
      { label: 'Corporate & Private Events', href: '/solutions/corporate-community-events' },
      { label: 'Film & TV', href: '/solutions/film-tv' },
      { label: 'Health & Wellness Events', href: '/solutions/health-wellness-events' },
      { label: 'Hospitality & Travel', href: '/solutions/hospitality-travel' },
      { label: 'Immersive Experiences', href: '/solutions/immersive-experiences' },
      { label: 'Sporting Events & Tournaments', href: '/solutions/sporting-events-tournaments' },
      { label: 'Themed & Theatrical Entertainment', href: '/solutions/themed-theatrical-entertainment' },
      { label: 'Trade Shows & Conferences', href: '/solutions/trade-shows-conferences' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'Resources',
    href: '/resources',
    children: [
      { label: 'Blog', href: '/resources/blog' },
      { label: 'Case Studies', href: '/resources/case-studies' },
      { label: 'Documentation', href: '/resources/docs' },
      { label: 'Guides', href: '/resources/guides' },
      { label: 'Whitepapers', href: '/resources/whitepapers' },
    ],
  },
  { label: 'Community', href: '/community' },
  {
    label: 'Company',
    href: '/company',
    children: [
      { label: 'About', href: '/company/about' },
      { label: 'Team', href: '/company/team' },
      { label: 'Press', href: '/company/press' },
      { label: 'Careers', href: '/company/careers' },
    ],
  },
];

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

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

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
                  <div
                    className="group"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={cn(
                        "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary",
                        pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div
                      className={cn(
                        "absolute left-0 top-full mt-2 w-48 rounded-md border bg-white/100 backdrop-blur-sm p-1 shadow-lg transition-all duration-200 z-[60]",
                        activeDropdown === item.label
                          ? "opacity-100 translate-y-0 visible"
                          : "opacity-0 translate-y-1 invisible"
                      )}
                    >
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href as any as any}
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
                ) : (
                  <a
                    href={item.href as any as any}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
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
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => handleDropdownToggle(item.label)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-base font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
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
                          {item.children.map((child) => (
                            <a
                              key={child.href}
                              href={child.href as any as any}
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
                  ) : (
                    <a
                      href={item.href as any as any}
                      className={cn(
                        "block px-3 py-2 text-base font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block">
                  <Button className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full justify-center">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
