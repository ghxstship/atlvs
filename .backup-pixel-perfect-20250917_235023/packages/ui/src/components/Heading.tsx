import React from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const headingVariants = cva('', {
  variants: {
    variant: {
      display: 'text-display',
      h1: 'text-h1',
      h2: 'text-h2',
      h3: 'text-h3',
    },
    color: {
      default: '',
      primary: 'text-primary',
      muted: 'text-muted-foreground',
      foreground: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'h2',
    color: 'default',
  },
});

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
  variant?: 'display' | 'h1' | 'h2' | 'h3';
  color?: 'default' | 'primary' | 'muted' | 'foreground';
  uppercase?: boolean;
  gradient?: boolean;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = 'h2', variant = 'h2', color = 'default', uppercase, gradient, className, children, ...props }, ref) => {
    const Component = as;
    
    const classes = twMerge(
      clsx(
        headingVariants({ variant, color }),
        uppercase && 'uppercase',
        gradient && 'bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent',
        className
      )
    );
    
    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';

// Convenience components for common use cases
export const DisplayHeading = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'variant'>>(
  (props, ref) => <Heading ref={ref} variant="display" as="h1" {...props} />
);
DisplayHeading.displayName = 'DisplayHeading';

export const H1 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'variant' | 'as'>>(
  (props, ref) => <Heading ref={ref} variant="h1" as="h1" {...props} />
);
H1.displayName = 'H1';

export const H2 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'variant' | 'as'>>(
  (props, ref) => <Heading ref={ref} variant="h2" as="h2" {...props} />
);
H2.displayName = 'H2';

export const H3 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'variant' | 'as'>>(
  (props, ref) => <Heading ref={ref} variant="h3" as="h3" {...props} />
);
H3.displayName = 'H3';

// Section header component for consistent section styling
export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, subtitle, badge, centered = false, className }, ref) => {
    return (
      <div 
        ref={ref} 
        className={twMerge(
          clsx(
            'mb-xl',
            centered && 'text-center',
            className
          )
        )}
      >
        {badge && <div className="mb-md">{badge}</div>}
        <Heading variant="h2" as="h2" className="mb-sm">
          {title}
        </Heading>
        {subtitle && (
          <p className={clsx(
            'text-body-lg text-muted-foreground',
            centered && 'max-w-3xl mx-auto'
          )}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = 'SectionHeader';
