import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils'

/**
 * Pixel-Perfect Normalized Button Component
 * Uses only semantic design tokens for all styling
 */

const buttonVariants = cva(
  // Base styles using semantic tokens
  'inline-flex items-center justify-center font-weight-medium transition-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevation-sm',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-elevation-sm',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-elevation-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-success text-success-foreground hover:bg-success/90 shadow-elevation-sm',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 shadow-elevation-sm',
        info: 'bg-info text-info-foreground hover:bg-info/90 shadow-elevation-sm',
      },
      size: {
        xs: 'h-7 px-xs py-xs text-size-xs rounded-radius-sm',
        sm: 'h-8 px-sm py-xs text-size-sm rounded-radius-md',
        default: 'h-10 px-md py-sm text-size-md rounded-radius-md',
        lg: 'h-12 px-lg py-md text-size-lg rounded-radius-lg',
        xl: 'h-14 px-xl py-lg text-size-xl rounded-radius-lg',
        icon: 'h-10 w-10 rounded-radius-md',
        'icon-sm': 'h-8 w-8 rounded-radius-sm',
        'icon-lg': 'h-12 w-12 rounded-radius-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'relative cursor-wait',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        <span className={cn(
          'inline-flex items-center gap-xs',
          loading && 'opacity-0'
        )}>
          {leftIcon && <span className="inline-flex">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  size = 'md',
}) => {
  const spacing = {
    sm: 'gap-xs',
    md: 'gap-sm',
    lg: 'gap-md',
  }

  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        spacing[size],
        className
      )}
    >
      {children}
    </div>
  )
}

export { Button, buttonVariants }
