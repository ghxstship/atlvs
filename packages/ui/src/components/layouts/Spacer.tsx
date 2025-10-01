import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Spacer - Flexible Space Primitive
 * Zero Tolerance: No hardcoded spacing divs
 * 
 * @example
 * // Before:
 * <div className="h-icon-xs" />
 * 
 * // After:
 * <Spacer size="md" />
 */

const spacerVariants = cva('', {
  variants: {
    // Size (height for horizontal, width for vertical)
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
      '2xl': '',
    },

    // Direction
    direction: {
      horizontal: 'w-full',
      vertical: 'h-full',
    },

    // Flex grow (fill available space)
    grow: {
      true: 'flex-grow',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    direction: 'horizontal',
    grow: false,
  },
  compoundVariants: [
    // Horizontal spacing (height)
    { direction: 'horizontal', size: 'xs', class: 'h-xs' },
    { direction: 'horizontal', size: 'sm', class: 'h-sm' },
    { direction: 'horizontal', size: 'md', class: 'h-md' },
    { direction: 'horizontal', size: 'lg', class: 'h-lg' },
    { direction: 'horizontal', size: 'xl', class: 'h-xl' },
    { direction: 'horizontal', size: '2xl', class: 'h-2xl' },
    
    // Vertical spacing (width)
    { direction: 'vertical', size: 'xs', class: 'w-xs' },
    { direction: 'vertical', size: 'sm', class: 'w-sm' },
    { direction: 'vertical', size: 'md', class: 'w-md' },
    { direction: 'vertical', size: 'lg', class: 'w-lg' },
    { direction: 'vertical', size: 'xl', class: 'w-xl' },
    { direction: 'vertical', size: '2xl', class: 'w-2xl' },
  ],
})

export interface SpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacerVariants> {
  as?: React.ElementType
}

/**
 * Spacer Component
 * Flexible space for layouts
 */
export const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  (
    {
      as: Component = 'div',
      className,
      size,
      direction,
      grow,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          spacerVariants({
            size,
            direction,
            grow,
          }),
          className
        )}
        aria-hidden="true"
        {...props}
      />
    )
  }
)

Spacer.displayName = 'Spacer'

export default Spacer
