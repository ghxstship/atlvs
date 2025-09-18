import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils'

/**
 * Pixel-Perfect Normalized Badge Component
 * Uses only semantic design tokens for all styling
 */

const badgeVariants = cva(
  'inline-flex items-center font-weight-semibold transition-default focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground border border-input',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        info: 'border-transparent bg-info text-info-foreground',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        gradient: 'border-transparent bg-gradient-to-r from-primary to-accent text-white',
      },
      size: {
        xs: 'px-xs py-xs text-size-xs rounded-radius-sm gap-xs',
        sm: 'px-sm py-xs text-size-xs rounded-radius-md gap-xs',
        default: 'px-sm py-xs text-size-sm rounded-radius-md gap-xs',
        lg: 'px-md py-sm text-size-md rounded-radius-lg gap-sm',
        xl: 'px-lg py-md text-size-lg rounded-radius-xl gap-sm',
      },
      removable: {
        true: 'pr-xs',
      },
      dot: {
        true: 'pl-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean
  onRemove?: () => void
  dot?: boolean
  dotColor?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size,
    removable,
    onRemove,
    dot,
    dotColor = 'default',
    leftIcon,
    rightIcon,
    children,
    ...props 
  }, ref) => {
    const dotColors = {
      default: 'bg-foreground',
      success: 'bg-success',
      warning: 'bg-warning',
      destructive: 'bg-destructive',
      info: 'bg-info',
    }

    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, removable, dot, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'h-2 w-2 rounded-radius-full',
              dotColors[dotColor]
            )}
          />
        )}
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className="ml-xs inline-flex hover:opacity-70 transition-opacity-only"
            aria-label="Remove"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

// Badge Group Component
interface BadgeGroupProps {
  children: React.ReactNode
  className?: string
  gap?: 'xs' | 'sm' | 'md'
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  className,
  gap = 'sm',
}) => {
  const gapClasses = {
    xs: 'gap-xs',
    sm: 'gap-sm',
    md: 'gap-md',
  }

  return (
    <div className={cn('inline-flex flex-wrap items-center', gapClasses[gap], className)}>
      {children}
    </div>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning'
  label?: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
}) => {
  const statusConfig = {
    active: { variant: 'success' as const, dot: 'success' as const, label: 'Active' },
    inactive: { variant: 'secondary' as const, dot: 'default' as const, label: 'Inactive' },
    pending: { variant: 'warning' as const, dot: 'warning' as const, label: 'Pending' },
    success: { variant: 'success' as const, dot: 'success' as const, label: 'Success' },
    error: { variant: 'destructive' as const, dot: 'destructive' as const, label: 'Error' },
    warning: { variant: 'warning' as const, dot: 'warning' as const, label: 'Warning' },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      dot
      dotColor={config.dot}
      className={className}
    >
      {label || config.label}
    </Badge>
  )
}

export { Badge, badgeVariants }
