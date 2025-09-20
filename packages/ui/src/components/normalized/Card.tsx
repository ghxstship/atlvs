import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils'

/**
 * Pixel-Perfect Normalized Card Component
 * Uses only semantic design tokens for all styling
 */

const cardVariants = cva(
  'bg-card text-card-foreground transition-default',
  {
    variants: {
      variant: {
        default: 'border border-border shadow-elevation-sm',
        elevated: 'shadow-elevation-md hover:shadow-elevation-lg',
        outline: 'border-2 border-border',
        ghost: 'border border-transparent hover:border-border',
        gradient: 'bg-gradient-to-br from-primary/10 to-accent/10 border border-border',
      },
      padding: {
        none: '',
        xs: 'p-xs',
        sm: 'p-sm',
        md: 'p-md',
        lg: 'p-lg',
        xl: 'p-xl',
        '2xl': 'p-2xl',
      },
      rounded: {
        none: 'rounded-radius-none',
        sm: 'rounded-radius-sm',
        md: 'rounded-radius-md',
        lg: 'rounded-radius-lg',
        xl: 'rounded-radius-xl',
        '2xl': 'rounded-radius-2xl',
        full: 'rounded-radius-full',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-elevation-lg active:shadow-elevation-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'lg',
      rounded: 'lg',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, rounded, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, rounded, interactive, className }))}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-sm', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-size-2xl font-weight-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-size-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-lg', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Specialized Card Components

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon?: React.ReactNode
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-xs">
            <p className="text-size-sm text-muted-foreground font-weight-medium">
              {title}
            </p>
            <p className="text-size-3xl font-weight-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-xs">
                <span
                  className={cn(
                    'text-size-sm font-weight-medium',
                    change.type === 'increase' ? 'text-success' : 'text-destructive'
                  )}
                >
                  {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-radius-lg bg-accent/10 text-accent">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        {icon && (
          <div className="mb-sm flex h-10 w-10 items-center justify-center rounded-radius-md bg-accent/10 text-accent">
            {icon}
          </div>
        )}
        <CardTitle className="text-size-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}
