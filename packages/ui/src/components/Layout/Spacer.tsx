import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const spacerVariants = cva('', {
  variants: {
    size: {
      xs: 'h-1 w-1',     // 4px
      sm: 'h-2 w-2',     // 8px
      md: 'h-4 w-4',     // 16px
      lg: 'h-6 w-6',     // 24px
      xl: 'h-8 w-8',     // 32px
      '2xl': 'h-12 w-12', // 48px
      '3xl': 'h-16 w-16', // 64px
      '4xl': 'h-24 w-24', // 96px
      '5xl': 'h-32 w-32', // 128px
    },
    axis: {
      horizontal: 'h-0',
      vertical: 'w-0',
      both: '',
    },
  },
  defaultVariants: {
    size: 'md',
    axis: 'vertical',
  },
});

export interface SpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacerVariants> {
  'aria-hidden'?: boolean;
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size, axis, 'aria-hidden': ariaHidden = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden={ariaHidden}
        className={cn(spacerVariants({ size, axis }), className)}
        {...props}
      />
    );
  }
);

Spacer.displayName = 'Spacer';

export { Spacer, spacerVariants };
