import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { tokens } from '../../tokens';

const textVariants = cva('', {
  variants: {
    variant: {
      body: 'font-body text-base leading-normal',
      'body-lg': 'font-body text-lg leading-relaxed',
      'body-sm': 'font-body text-sm leading-normal',
      'body-xs': 'font-body text-xs leading-normal',
      caption: 'font-body text-xs leading-tight',
      label: 'font-body text-sm font-medium',
      helper: 'font-body text-xs text-muted-foreground',
      error: 'font-body text-xs text-destructive',
      code: 'font-mono text-sm bg-muted px-1 py-0.5 rounded',
    },
    color: {
      default: 'text-foreground',
      primary: 'text-accent',
      secondary: 'text-secondary-foreground',
      muted: 'text-muted-foreground',
      success: 'text-success',
      warning: 'text-warning',
      destructive: 'text-destructive',
      info: 'text-info',
    },
    weight: {
      thin: 'font-thin',
      extralight: 'font-extralight',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
    wrap: {
      normal: 'whitespace-normal',
      nowrap: 'whitespace-nowrap',
      pre: 'whitespace-pre',
      'pre-wrap': 'whitespace-pre-wrap',
      'pre-line': 'whitespace-pre-line',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
    weight: 'normal',
    align: 'left',
    truncate: false,
    wrap: 'normal',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'label' | 'small' | 'strong' | 'em' | 'mark' | 'del' | 'ins' | 'sub' | 'sup';
  children?: React.ReactNode;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, color, weight, align, truncate, wrap, as: Component = 'p', ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(textVariants({ variant, color, weight, align, truncate, wrap }), className)}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

export { Text, textVariants };
