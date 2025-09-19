import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const displayVariants = cva(
  'font-title uppercase tracking-wider font-black',
  {
    variants: {
      size: {
        sm: 'text-4xl leading-tight',  // 36px
        md: 'text-5xl leading-tight',  // 48px
        lg: 'text-6xl leading-tight',  // 60px
        xl: 'text-7xl leading-tight',  // 72px
        '2xl': 'text-8xl leading-tight', // 96px
        '3xl': 'text-9xl leading-tight', // 128px
      },
      color: {
        default: 'text-foreground',
        primary: 'text-primary',
        accent: 'text-accent',
        muted: 'text-muted-foreground',
        gradient: 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
        'gradient-success': 'bg-gradient-to-r from-success to-primary bg-clip-text text-transparent',
        'gradient-warning': 'bg-gradient-to-r from-warning to-primary bg-clip-text text-transparent',
      },
      responsive: {
        true: 'text-5xl md:text-6xl lg:text-7xl xl:text-8xl',
        false: '',
      },
    },
    defaultVariants: {
      size: 'lg',
      color: 'default',
      responsive: false,
    },
  }
);

export interface DisplayProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof displayVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
  children?: React.ReactNode;
}

const Display = React.forwardRef<HTMLHeadingElement, DisplayProps>(
  ({ className, size, color, responsive, as: Component = 'h1', ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(displayVariants({ size, color, responsive }), className)}
        {...props}
      />
    );
  }
);

Display.displayName = 'Display';

export { Display, displayVariants };
