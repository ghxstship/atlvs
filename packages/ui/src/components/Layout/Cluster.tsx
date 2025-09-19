import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const clusterVariants = cva('flex flex-row flex-wrap', {
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
      reverse: 'flex-wrap-reverse',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: {
    gap: 'sm',
    align: 'center',
    justify: 'start',
    wrap: true,
    fullWidth: false,
  },
});

export interface ClusterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof clusterVariants> {
  as?: React.ElementType;
  children?: React.ReactNode;
}

const Cluster = React.forwardRef<HTMLDivElement, ClusterProps>(
  ({ className, gap, align, justify, wrap, fullWidth, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(clusterVariants({ gap, align, justify, wrap, fullWidth }), className)}
        {...props}
      />
    );
  }
);

Cluster.displayName = 'Cluster';

export { Cluster, clusterVariants };
