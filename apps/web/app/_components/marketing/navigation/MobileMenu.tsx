'use client';


import Link from 'next/link';
import { Button  } from '@ghxstship/ui';
import { NavigationDropdown } from './NavigationDropdown';
import { anton } from '../../lib/typography';
import { cn } from '../../lib/utils';

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
      <div className=" px-md pt-sm pb-sm stack-xl">
        {navigation.map((item: any) => (
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
                  "block px-sm py-sm text-body form-label rounded-md transition-colors hover:bg-accent hover:color-accent-foreground color-foreground uppercase",
                  anton.className
                )}
              >
                {item.label}
              </a>
            )}
          </div>
        ))}
        
        {/* Mobile Auth Buttons */}
        <div className="pt-md stack-xl">
          <Link href="/auth/signin" className="block">
            <Button className="w-full justify-center">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup" className="block">
            <Button variant="outline" className="w-full justify-center">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
