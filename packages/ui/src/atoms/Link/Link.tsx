/**
 * Link Component — Styled Anchor Link
 * Modern link with variants
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import NextLink from 'next/link';
import type { LucideIcon } from 'lucide-react';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Link href */
  href: string;
  
  /** Link variant */
  variant?: 'default' | 'primary' | 'muted';
  
  /** Show underline */
  underline?: 'none' | 'hover' | 'always';
  
  /** External link */
  external?: boolean;
  
  /** Icon (left) */
  icon?: LucideIcon;
  
  /** Icon (right) */
  iconRight?: LucideIcon;
}

/**
 * Link Component
 * 
 * @example
 * ```tsx
 * <Link href="/about">About</Link>
 * <Link href="https://example.com" external>External</Link>
 * ```
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      variant = 'default',
      underline = 'hover',
      external = false,
      icon: Icon,
      iconRight: IconRight,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center gap-1
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      rounded-sm
    `;
    
    const variantClasses = {
      default: 'text-foreground hover:text-primary',
      primary: 'text-primary hover:opacity-80',
      muted: 'text-muted-foreground hover:text-foreground',
    };
    
    const underlineClasses = {
      none: 'no-underline',
      hover: 'no-underline hover:underline',
      always: 'underline',
    };
    
    const content = (
      <>
        {Icon && <Icon className="w-4 h-4" />}
        {children}
        {IconRight && <IconRight className="w-4 h-4" />}
      </>
    );
    
    const commonProps = {
      ref,
      className: `
        ${baseClasses}
        ${variantClasses[variant]}
        ${underlineClasses[underline]}
        ${className}
      `,
      ...props,
    };
    
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...commonProps}
        >
          {content}
        </a>
      );
    }
    
    return (
      <NextLink href={href} {...commonProps}>
        {content}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';
