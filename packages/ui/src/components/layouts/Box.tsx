import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Box - Universal Layout Primitive
 * Zero Tolerance: No hardcoded dimensions
 * 
 * Replace all hardcoded <div> patterns with semantic Box component
 * 
 * @example
 * // Before:
 * <div className="w-container-sm h-container-xs p-md bg-card rounded-lg">
 * 
 * // After:
 * <Box width="container-sm" height="container-xs" padding="md" bg="card" rounded="lg">
 */

const boxVariants = cva('', {
  variants: {
    // Display
    display: {
      block: 'block',
      inline: 'inline',
      inlineBlock: 'inline-block',
      flex: 'flex',
      inlineFlex: 'inline-flex',
      grid: 'grid',
      inlineGrid: 'inline-grid',
      hidden: 'hidden',
    },

    // Position
    position: {
      static: 'static',
      relative: 'relative',
      absolute: 'absolute',
      fixed: 'fixed',
      sticky: 'sticky',
    },

    // Width (semantic tokens)
    width: {
      auto: 'w-auto',
      full: 'w-full',
      screen: 'w-screen',
      half: 'w-1/2',
      third: 'w-1/3',
      twoThirds: 'w-2/3',
      quarter: 'w-1/4',
      threeQuarters: 'w-3/4',
      'icon-xs': 'w-icon-xs',
      'icon-sm': 'w-icon-sm',
      'icon-md': 'w-icon-md',
      'icon-lg': 'w-icon-lg',
      'icon-xl': 'w-icon-xl',
      'icon-2xl': 'w-icon-2xl',
      'component-xs': 'w-icon-lg',
      'component-sm': 'w-icon-2xl',
      'component-md': 'w-component-md',
      'component-lg': 'w-component-lg',
      'component-xl': 'w-component-xl',
      'container-xs': 'w-container-xs',
      'container-sm': 'w-container-sm',
      'container-md': 'w-container-md',
      'container-lg': 'w-container-lg',
    },

    // Height (semantic tokens)
    height: {
      auto: 'h-auto',
      full: 'h-full',
      screen: 'h-screen',
      half: 'h-1/2',
      third: 'h-1/3',
      quarter: 'h-1/4',
      'icon-xs': 'h-icon-xs',
      'icon-sm': 'h-icon-sm',
      'icon-md': 'h-icon-md',
      'icon-lg': 'h-icon-lg',
      'icon-xl': 'h-icon-xl',
      'icon-2xl': 'h-icon-2xl',
      'component-xs': 'h-icon-lg',
      'component-sm': 'h-icon-2xl',
      'component-md': 'h-component-md',
      'component-lg': 'h-component-lg',
      'component-xl': 'h-component-xl',
      'container-xs': 'h-container-xs',
      'container-sm': 'h-container-sm',
      'container-md': 'h-container-md',
      'container-lg': 'h-container-lg',
    },

    // Min Width
    minWidth: {
      none: 'min-w-0',
      full: 'min-w-full',
      xs: 'min-w-container-xs',
      sm: 'min-w-64',
      md: 'min-w-80',
      lg: 'min-w-96',
    },

    // Max Width
    maxWidth: {
      none: 'max-w-none',
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
      prose: 'max-w-prose',
      screen: 'max-w-screen-2xl',
    },

    // Padding (semantic spacing)
    padding: {
      none: 'p-0',
      xs: 'p-xs',
      sm: 'p-sm',
      md: 'p-md',
      lg: 'p-lg',
      xl: 'p-xl',
      '2xl': 'p-2xl',
    },

    // Padding X
    paddingX: {
      none: 'px-0',
      xs: 'px-xs',
      sm: 'px-sm',
      md: 'px-md',
      lg: 'px-lg',
      xl: 'px-xl',
      '2xl': 'px-2xl',
    },

    // Padding Y
    paddingY: {
      none: 'py-0',
      xs: 'py-xs',
      sm: 'py-sm',
      md: 'py-md',
      lg: 'py-lg',
      xl: 'py-xl',
      '2xl': 'py-2xl',
    },

    // Margin
    margin: {
      none: 'm-0',
      auto: 'm-auto',
      xs: 'm-xs',
      sm: 'm-sm',
      md: 'm-md',
      lg: 'm-lg',
      xl: 'm-xl',
    },

    // Margin X
    marginX: {
      none: 'mx-0',
      auto: 'mx-auto',
      xs: 'mx-xs',
      sm: 'mx-sm',
      md: 'mx-md',
      lg: 'mx-lg',
      xl: 'mx-xl',
    },

    // Margin Y
    marginY: {
      none: 'my-0',
      auto: 'my-auto',
      xs: 'my-xs',
      sm: 'my-sm',
      md: 'my-md',
      lg: 'my-lg',
      xl: 'my-xl',
    },

    // Background
    bg: {
      transparent: 'bg-transparent',
      background: 'bg-background',
      foreground: 'bg-foreground',
      card: 'bg-card',
      muted: 'bg-muted',
      accent: 'bg-accent',
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      destructive: 'bg-destructive',
    },

    // Border
    border: {
      none: 'border-0',
      default: 'border',
      thick: 'border-2',
    },

    // Border Radius (semantic)
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    },

    // Shadow
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
    },

    // Overflow
    overflow: {
      auto: 'overflow-auto',
      hidden: 'overflow-hidden',
      visible: 'overflow-visible',
      scroll: 'overflow-scroll',
    },

    // Z-Index
    zIndex: {
      auto: 'z-auto',
      0: 'z-0',
      10: 'z-10',
      20: 'z-20',
      30: 'z-30',
      40: 'z-40',
      50: 'z-50',
    },
  },
  defaultVariants: {
    display: 'block',
    position: 'relative',
  },
})

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  as?: React.ElementType
  children?: React.ReactNode
  // Responsive variants
  responsive?: {
    sm?: Partial<VariantProps<typeof boxVariants>>
    md?: Partial<VariantProps<typeof boxVariants>>
    lg?: Partial<VariantProps<typeof boxVariants>>
    xl?: Partial<VariantProps<typeof boxVariants>>
  }
}

/**
 * Box Component
 * Universal layout primitive with semantic props
 */
export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      as: Component = 'div',
      className,
      display,
      position,
      width,
      height,
      minWidth,
      maxWidth,
      padding,
      paddingX,
      paddingY,
      margin,
      marginX,
      marginY,
      bg,
      border,
      rounded,
      shadow,
      overflow,
      zIndex,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          boxVariants({
            display,
            position,
            width,
            height,
            minWidth,
            maxWidth,
            padding,
            paddingX,
            paddingY,
            margin,
            marginX,
            marginY,
            bg,
            border,
            rounded,
            shadow,
            overflow,
            zIndex,
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

Box.displayName = 'Box'

export default Box
