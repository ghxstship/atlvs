import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Stack - Flex Layout Primitive
 * Zero Tolerance: No hardcoded flex patterns
 * 
 * Replace all flex layout patterns with Stack component
 * 
 * @example
 * // Before:
 * <div className="flex flex-col gap-md items-center justify-between p-md">
 * 
 * // After:
 * <Stack direction="vertical" spacing="md" align="center" justify="between" padding="md">
 */

const stackVariants = cva('flex', {
  variants: {
    // Direction
    direction: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
      horizontalReverse: 'flex-row-reverse',
      verticalReverse: 'flex-col-reverse',
    },

    // Spacing (gap)
    spacing: {
      none: 'gap-0',
      xs: 'gap-xs',
      sm: 'gap-sm',
      md: 'gap-md',
      lg: 'gap-lg',
      xl: 'gap-xl',
      '2xl': 'gap-2xl',
    },

    // Align Items
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },

    // Justify Content
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },

    // Wrap
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      wrapReverse: 'flex-wrap-reverse',
    },

    // Full Width
    fullWidth: {
      true: 'w-full',
      false: '',
    },

    // Full Height
    fullHeight: {
      true: 'h-full',
      false: '',
    },

    // Padding
    padding: {
      none: 'p-0',
      xs: 'p-xs',
      sm: 'p-sm',
      md: 'p-md',
      lg: 'p-lg',
      xl: 'p-xl',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    spacing: 'md',
    align: 'stretch',
    justify: 'start',
    wrap: 'nowrap',
  },
})

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  as?: React.ElementType
  children?: React.ReactNode
}

/**
 * Stack Component
 * Flex layout primitive for vertical/horizontal stacking
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      as: Component = 'div',
      className,
      direction,
      spacing,
      align,
      justify,
      wrap,
      fullWidth,
      fullHeight,
      padding,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          stackVariants({
            direction,
            spacing,
            align,
            justify,
            wrap,
            fullWidth,
            fullHeight,
            padding,
          }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Stack.displayName = 'Stack'

/**
 * Convenience components for common patterns
 */

// Horizontal Stack (Row)
export const HStack = React.forwardRef<
  HTMLDivElement,
  Omit<StackProps, 'direction'>
>((props, ref) => <Stack ref={ref} direction="horizontal" {...props} />)

HStack.displayName = 'HStack'

// Vertical Stack (Column)
export const VStack = React.forwardRef<
  HTMLDivElement,
  Omit<StackProps, 'direction'>
>((props, ref) => <Stack ref={ref} direction="vertical" {...props} />)

VStack.displayName = 'VStack'

export default Stack
