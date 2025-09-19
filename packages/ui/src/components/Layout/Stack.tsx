import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { tokens } from '../../tokens';

const stackVariants = cva('flex flex-col', {
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-1',     // 4px
      sm: 'gap-2',     // 8px
      md: 'gap-4',     // 16px
      lg: 'gap-6',     // 24px
      xl: 'gap-8',     // 32px
      '2xl': 'gap-12', // 48px
      '3xl': 'gap-16', // 64px
      '4xl': 'gap-24', // 96px
      '5xl': 'gap-32', // 128px
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
    fullHeight: {
      true: 'h-full',
      false: '',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    wrap: false,
    fullWidth: false,
    fullHeight: false,
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  as?: React.ElementType;
  children?: React.ReactNode;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap, align, justify, wrap, fullWidth, fullHeight, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(stackVariants({ gap, align, justify, wrap, fullWidth, fullHeight }), className)}
        {...props}
      />
    );
  }
);

Stack.displayName = 'Stack';

export { Stack, stackVariants };
