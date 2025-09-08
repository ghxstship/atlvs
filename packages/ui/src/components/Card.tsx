import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', size = 'md', interactive = false, loading = false, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-4 rounded-lg',
      md: 'p-6 rounded-lg',
      lg: 'p-8 rounded-xl'
    };

    const variantClasses = {
      default: 'card',
      outline: 'card border-2 border-border/50',
      elevated: 'card surface-elevated',
      glass: 'glass border border-white/20',
      gradient: 'bg-gradient-to-br from-background to-muted/50 border border-border/50'
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'relative overflow-hidden transition-all duration-200',
            sizeClasses[size],
            variantClasses[variant],
            interactive && 'interactive cursor-pointer hover:shadow-lg',
            loading && 'animate-pulse pointer-events-none',
            className
          )
        )}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'flex items-start justify-between space-y-1.5 pb-4 border-b border-border/50',
            className
          )
        )}
        {...props}
      >
        <div className="space-y-1 flex-1">
          {title && (
            <h3 className="font-display text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground font-body">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="flex items-center space-x-2 ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

// Card Content
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(clsx('pt-4 font-body', className))}
        {...props}
      />
    );
  }
);
CardContent.displayName = 'CardContent';

// Card Footer
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'flex items-center justify-between pt-4 mt-4 border-t border-border/50 font-body',
            className
          )
        )}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';

// Specialized Card Variants
export const StatsCard = React.forwardRef<HTMLDivElement, CardProps & {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}>(
  ({ title, value, change, changeType = 'neutral', icon, className, ...props }, ref) => {
    const changeColors = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-muted-foreground'
    };

    return (
      <Card ref={ref} className={clsx('relative overflow-hidden', className)} {...props}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground font-body">{title}</p>
            <p className="text-2xl font-bold font-display">{value}</p>
            {change && (
              <p className={clsx('text-xs font-body', changeColors[changeType])}>
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground/50">
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
);
StatsCard.displayName = 'StatsCard';

export const FeatureCard = React.forwardRef<HTMLDivElement, CardProps & {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
}>(
  ({ title, description, icon, badge, className, ...props }, ref) => {
    return (
      <Card 
        ref={ref} 
        interactive 
        className={clsx('group relative', className)} 
        {...props}
      >
        {badge && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {badge}
            </span>
          </div>
        )}
        <div className="space-y-4">
          {icon && (
            <div className="text-primary group-hover:scale-110 transition-transform duration-200">
              {icon}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </Card>
    );
  }
);
FeatureCard.displayName = 'FeatureCard';
