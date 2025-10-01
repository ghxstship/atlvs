import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Container - Content Container Primitive
 * Zero Tolerance: No hardcoded container patterns
 * 
 * Replace all content container patterns with Container component
 * 
 * @example
 * // Before:
 * <div className="max-w-7xl mx-auto px-md">
 * 
 * // After:
 * <Container size="7xl" centered paddingX="md">
 */

const containerVariants = cva('', {
  variants: {
    // Container Size (max-width)
    size: {
      xs: 'max-w-xs',      // 320px
      sm: 'max-w-sm',      // 384px
      md: 'max-w-md',      // 448px
      lg: 'max-w-lg',      // 512px
      xl: 'max-w-xl',      // 576px
      '2xl': 'max-w-2xl',  // 672px
      '3xl': 'max-w-3xl',  // 768px
      '4xl': 'max-w-4xl',  // 896px
      '5xl': 'max-w-5xl',  // 1024px
      '6xl': 'max-w-6xl',  // 1152px
      '7xl': 'max-w-7xl',  // 1280px
      full: 'max-w-full',
      prose: 'max-w-prose', // 65ch
      screen: 'max-w-screen-2xl',
    },

    // Centered
    centered: {
      true: 'mx-auto',
      false: '',
    },

    // Padding X
    paddingX: {
      none: 'px-0',
      xs: 'px-xs',
      sm: 'px-sm',
      md: 'px-md',
      lg: 'px-lg',
      xl: 'px-xl',
    },

    // Padding Y
    paddingY: {
      none: 'py-0',
      xs: 'py-xs',
      sm: 'py-sm',
      md: 'py-md',
      lg: 'py-lg',
      xl: 'py-xl',
    },

    // Padding (all sides)
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
    size: '7xl',
    centered: true,
    paddingX: 'md',
  },
})

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType
  children?: React.ReactNode
}

/**
 * Container Component
 * Content container with max-width and centering
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      as: Component = 'div',
      className,
      size,
      centered,
      paddingX,
      paddingY,
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
          containerVariants({
            size,
            centered,
            paddingX,
            paddingY,
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

Container.displayName = 'Container'

export default Container
