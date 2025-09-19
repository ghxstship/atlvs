import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const dividerVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
    variant: {
      solid: 'bg-border',
      dashed: 'border-border border-dashed',
      dotted: 'border-border border-dotted',
      gradient: 'bg-gradient-to-r from-transparent via-border to-transparent',
    },
    spacing: {
      none: '',
      xs: 'my-1',
      sm: 'my-2',
      md: 'my-4',
      lg: 'my-6',
      xl: 'my-8',
      '2xl': 'my-12',
      '3xl': 'my-16',
    },
    thickness: {
      hairline: '',
      thin: '',
      medium: '',
      thick: '',
      heavy: '',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
    spacing: 'md',
    thickness: 'thin',
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      thickness: 'hairline',
      className: 'h-[0.5px]',
    },
    {
      orientation: 'horizontal',
      thickness: 'thin',
      className: 'h-px',
    },
    {
      orientation: 'horizontal',
      thickness: 'medium',
      className: 'h-[1.5px]',
    },
    {
      orientation: 'horizontal',
      thickness: 'thick',
      className: 'h-0.5',
    },
    {
      orientation: 'horizontal',
      thickness: 'heavy',
      className: 'h-[3px]',
    },
    {
      orientation: 'vertical',
      thickness: 'hairline',
      className: 'w-[0.5px]',
    },
    {
      orientation: 'vertical',
      thickness: 'thin',
      className: 'w-px',
    },
    {
      orientation: 'vertical',
      thickness: 'medium',
      className: 'w-[1.5px]',
    },
    {
      orientation: 'vertical',
      thickness: 'thick',
      className: 'w-0.5',
    },
    {
      orientation: 'vertical',
      thickness: 'heavy',
      className: 'w-[3px]',
    },
    {
      orientation: 'vertical',
      spacing: 'xs',
      className: 'mx-1 my-0',
    },
    {
      orientation: 'vertical',
      spacing: 'sm',
      className: 'mx-2 my-0',
    },
    {
      orientation: 'vertical',
      spacing: 'md',
      className: 'mx-4 my-0',
    },
    {
      orientation: 'vertical',
      spacing: 'lg',
      className: 'mx-6 my-0',
    },
    {
      orientation: 'vertical',
      spacing: 'xl',
      className: 'mx-8 my-0',
    },
    {
      variant: 'dashed',
      orientation: 'horizontal',
      className: 'border-t',
    },
    {
      variant: 'dashed',
      orientation: 'vertical',
      className: 'border-l',
    },
    {
      variant: 'dotted',
      orientation: 'horizontal',
      className: 'border-t',
    },
    {
      variant: 'dotted',
      orientation: 'vertical',
      className: 'border-l',
    },
  ],
});

export interface DividerProps
  extends React.HTMLAttributes<HTMLHRElement>,
    VariantProps<typeof dividerVariants> {
  decorative?: boolean;
}

const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation, variant, spacing, thickness, decorative = true, ...props }, ref) => {
    const Component = orientation === 'vertical' ? 'div' : 'hr';
    
    return (
      <Component
        ref={ref as any}
        role={decorative ? 'presentation' : 'separator'}
        aria-orientation={orientation}
        className={cn(dividerVariants({ orientation, variant, spacing, thickness }), className)}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider, dividerVariants };
