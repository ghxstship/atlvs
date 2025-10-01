import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Divider - Visual Separator Primitive
 * Zero Tolerance: No hardcoded divider patterns
 * 
 * @example
 * // Before:
 * <hr className="border-t my-4" />
 * 
 * // After:
 * <Divider spacing="md" />
 */

const dividerVariants = cva('', {
  variants: {
    // Orientation
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full border-l',
    },

    // Spacing (margin)
    spacing: {
      none: '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },

    // Variant
    variant: {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },

    // Color
    color: {
      default: 'border-border',
      muted: 'border-muted',
      primary: 'border-primary',
    },

    // Thickness
    thickness: {
      thin: 'border-t',
      medium: 'border-t-2',
      thick: 'border-t-4',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    spacing: 'md',
    variant: 'solid',
    color: 'default',
    thickness: 'thin',
  },
  compoundVariants: [
    // Horizontal spacing (my-*)
    { orientation: 'horizontal', spacing: 'xs', class: 'my-xs' },
    { orientation: 'horizontal', spacing: 'sm', class: 'my-sm' },
    { orientation: 'horizontal', spacing: 'md', class: 'my-md' },
    { orientation: 'horizontal', spacing: 'lg', class: 'my-lg' },
    { orientation: 'horizontal', spacing: 'xl', class: 'my-xl' },
    
    // Vertical spacing (mx-*)
    { orientation: 'vertical', spacing: 'xs', class: 'mx-xs' },
    { orientation: 'vertical', spacing: 'sm', class: 'mx-sm' },
    { orientation: 'vertical', spacing: 'md', class: 'mx-md' },
    { orientation: 'vertical', spacing: 'lg', class: 'mx-lg' },
    { orientation: 'vertical', spacing: 'xl', class: 'mx-xl' },
  ],
})

export interface DividerProps
  extends React.HTMLAttributes<HTMLHRElement>,
    VariantProps<typeof dividerVariants> {
  as?: React.ElementType
  label?: string
}

/**
 * Divider Component
 * Visual separator for layouts
 */
export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      as,
      className,
      orientation,
      spacing,
      variant,
      color,
      thickness,
      label,
      ...props
    },
    ref
  ) => {
    const Component = as || (orientation === 'horizontal' ? 'hr' : 'div')

    if (label && orientation === 'horizontal') {
      return (
        <div
          className={cn(
            'flex items-center',
            spacing === 'xs' ? 'my-xs' : '',
            spacing === 'sm' ? 'my-sm' : '',
            spacing === 'md' ? 'my-md' : '',
            spacing === 'lg' ? 'my-lg' : '',
            spacing === 'xl' ? 'my-xl' : ''
          )}
        >
          <Component
            ref={ref}
            className={cn(
              dividerVariants({
                orientation,
                spacing: 'none',
                variant,
                color,
                thickness,
              }),
              'flex-1',
              className
            )}
            {...props}
          />
          {label && (
            <span className="px-sm text-sm text-muted-foreground">{label}</span>
          )}
          <Component
            className={cn(
              dividerVariants({
                orientation,
                spacing: 'none',
                variant,
                color,
                thickness,
              }),
              'flex-1',
              className
            )}
          />
        </div>
      )
    }

    return (
      <Component
        ref={ref}
        className={cn(
          dividerVariants({
            orientation,
            spacing,
            variant,
            color,
            thickness,
          }),
          className
        )}
        role="separator"
        {...props}
      />
    )
  }
)

Divider.displayName = 'Divider'

export default Divider
