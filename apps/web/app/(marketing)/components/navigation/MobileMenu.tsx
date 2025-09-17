'use client';

import Link from 'next/link';
import { Button } from '@ghxstship/ui/components/Button';
import { NavigationDropdown } from './NavigationDropdown';
import { anton } from '../../lib/typography';
import { cn } from '../../../lib/utils';

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
  return (
    <div className="md:hidden border-t bg-popover">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {navigation.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <NavigationDropdown
                item={item}
                activeDropdown={activeDropdown}
                onDropdownChange={onDropdownChange}
                isMobile
              />
            ) : (
              <a
                href={item.href}
                className={cn(
                  "block px-3 py-2 text-body form-label rounded-md transition-colors hover:bg-accent hover:color-accent-foreground color-foreground uppercase",
                  anton.className
                )}
              >
                {item.label}
              </a>
            )}
          </div>
        ))}
        
        {/* Mobile Auth Buttons */}
        <div className="pt-4 space-y-2">
          <Link href="/auth/signin" className="block">
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
  );
}
