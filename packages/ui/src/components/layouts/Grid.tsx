import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Grid - Grid Layout Primitive
 * Zero Tolerance: No hardcoded grid patterns
 * 
 * Replace all grid layout patterns with Grid component
 * 
 * @example
 * // Before:
 * <div className="grid grid-cols-4 gap-md p-md">
 * 
 * // After:
 * <Grid cols={4} spacing="md" padding="md">
 */

const gridVariants = cva('grid', {
  variants: {
    // Grid Columns (responsive)
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
      auto: 'grid-cols-auto',
    },

    // Grid Rows
    rows: {
      1: 'grid-rows-1',
      2: 'grid-rows-2',
      3: 'grid-rows-3',
      4: 'grid-rows-4',
      5: 'grid-rows-5',
      6: 'grid-rows-6',
      auto: 'grid-rows-auto',
    },

    // Gap (spacing)
    spacing: {
      none: 'gap-0',
      xs: 'gap-xs',
      sm: 'gap-sm',
      md: 'gap-md',
      lg: 'gap-lg',
      xl: 'gap-xl',
      '2xl': 'gap-2xl',
    },

    // Column Gap
    spacingX: {
      none: 'gap-x-0',
      xs: 'gap-x-xs',
      sm: 'gap-x-sm',
      md: 'gap-x-md',
      lg: 'gap-x-lg',
      xl: 'gap-x-xl',
    },

    // Row Gap
    spacingY: {
      none: 'gap-y-0',
      xs: 'gap-y-xs',
      sm: 'gap-y-sm',
      md: 'gap-y-md',
      lg: 'gap-y-lg',
      xl: 'gap-y-xl',
    },

    // Align Items
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },

    // Justify Items
    justify: {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      stretch: 'justify-items-stretch',
    },

    // Full Width
    fullWidth: {
      true: 'w-full',
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

    // Auto Fit (responsive columns)
    autoFit: {
      true: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
      false: '',
    },

    // Auto Fill (responsive columns)
    autoFill: {
      true: 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]',
      false: '',
    },
  },
  defaultVariants: {
    cols: 1,
    spacing: 'md',
    align: 'stretch',
    justify: 'start',
  },
})

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  as?: React.ElementType
  children?: React.ReactNode
  // Responsive columns (breakpoint-based)
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  }
}

/**
 * Grid Component
 * CSS Grid layout primitive
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      as: Component = 'div',
      className,
      cols,
      rows,
      spacing,
      spacingX,
      spacingY,
      align,
      justify,
      fullWidth,
      padding,
      autoFit,
      autoFill,
      responsive,
      children,
      ...props
    },
    ref
  ) => {
    // Build responsive classes
    const responsiveClasses = responsive
      ? [
          responsive.sm && `sm:grid-cols-${responsive.sm}`,
          responsive.md && `md:grid-cols-${responsive.md}`,
          responsive.lg && `lg:grid-cols-${responsive.lg}`,
          responsive.xl && `xl:grid-cols-${responsive.xl}`,
        ]
          .filter(Boolean)
          .join(' ')
      : ''

    return (
      <Component
        ref={ref}
        className={cn(
          gridVariants({
            cols,
            rows,
            spacing,
            spacingX,
            spacingY,
            align,
            justify,
            fullWidth,
            padding,
            autoFit,
            autoFill,
          }),
          responsiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Grid.displayName = 'Grid'

/**
 * GridItem - For controlling individual grid items
 */
const gridItemVariants = cva('', {
  variants: {
    colSpan: {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      12: 'col-span-12',
      full: 'col-span-full',
    },
    rowSpan: {
      1: 'row-span-1',
      2: 'row-span-2',
      3: 'row-span-3',
      4: 'row-span-4',
      5: 'row-span-5',
      6: 'row-span-6',
      full: 'row-span-full',
    },
  },
})

export interface GridItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {
  as?: React.ElementType
  children?: React.ReactNode
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      as: Component = 'div',
      className,
      colSpan,
      rowSpan,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(gridItemVariants({ colSpan, rowSpan }), className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

GridItem.displayName = 'GridItem'

export default Grid
