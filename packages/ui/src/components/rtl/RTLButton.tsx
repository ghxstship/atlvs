'use client';

import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { isRTLLocale } from '../../utils/rtl-utils';

const rtlButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-icon-xl px-md py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-icon-xl w-icon-xl',
      },
      rtl: {
        true: 'flex-row-reverse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rtl: false,
    },
  }
);

export interface RTLButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rtlButtonVariants> {
  asChild?: boolean;
  locale?: string;
}

const RTLButton = forwardRef<HTMLButtonElement, RTLButtonProps>(
  ({ className, variant, size, asChild = false, locale, ...props }, ref) => {
    const isRTL = locale ? isRTLLocale(locale as any) : false;
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(rtlButtonVariants({ variant, size, rtl: isRTL, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
RTLButton.displayName = 'RTLButton';

export { RTLButton, rtlButtonVariants };
