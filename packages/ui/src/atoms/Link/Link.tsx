'use client';

import React from 'react';
import NextLink from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

const linkVariants = cva(
  'inline-flex items-center gap-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-primary hover:text-primary/80',
        secondary: 'text-secondary hover:text-secondary/80',
        muted: 'text-muted-foreground hover:text-foreground',
        destructive: 'text-destructive hover:text-destructive/80',
        success: 'text-success hover:text-success/80',
        warning: 'text-warning hover:text-warning/80',
        info: 'text-info hover:text-info/80',
      },
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
      },
      underline: {
        none: '',
        hover: 'hover:underline',
        always: 'underline',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      underline: 'hover',
    },
  }
);

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    VariantProps<typeof linkVariants> {
  href: string;
  external?: boolean;
  showExternalIcon?: boolean;
  children: React.ReactNode;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({
    href,
    external = false,
    showExternalIcon = true,
    variant,
    size,
    underline,
    className,
    children,
    ...props
  }, ref) => {
    const isExternal = external || href.startsWith('http') || href.startsWith('//');

    const linkContent = (
      <>
        {children}
        {isExternal && showExternalIcon && (
          <ArrowUpRight className="h-3 w-3" />
        )}
      </>
    );

    const linkClassName = cn(linkVariants({ variant, size, underline }), className);

    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          {...props}
        >
          {linkContent}
        </a>
      );
    }

    return (
      <NextLink
        ref={ref}
        href={href}
        className={linkClassName}
        {...props}
      >
        {linkContent}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';

export type { LinkProps };

// Additional semantic link variants for specific use cases
export const NavLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link ref={ref} variant="muted" {...props} />
);
NavLink.displayName = 'NavLink';

export const FooterLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link ref={ref} variant="muted" size="sm" {...props} />
);
FooterLink.displayName = 'FooterLink';

export const ButtonLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link ref={ref} underline="none" {...props} />
);
ButtonLink.displayName = 'ButtonLink';
