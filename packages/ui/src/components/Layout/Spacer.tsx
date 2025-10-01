import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const spacerVariants = cva('', {
  variants: {
    size: {
      xs: 'h-1 w-1',     // 4px
      sm: 'h-2 w-2',     // 8px
      md: 'h-icon-xs w-icon-xs',     // 16px
      lg: 'h-icon-md w-icon-md',     // 24px
      xl: 'h-icon-lg w-icon-lg',     // 32px
      '2xl': 'h-icon-2xl w-icon-2xl', // 48px
      '3xl': 'h-component-md w-component-md', // 64px
      '4xl': 'h-component-lg w-component-lg', // 96px
      '5xl': 'h-component-xl w-component-xl', // 128px
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
