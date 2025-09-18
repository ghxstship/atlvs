import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated' | 'floating' | 'glass' | 'glass-intense' | 'gradient' | 'subway-accent' | 'surface';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
  depth?: 'surface' | 'elevated' | 'floating';
  glow?: 'primary' | 'success' | 'warning' | 'error' | 'none';
  subwayLine?: 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'yellow' | 'grey';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', size = 'md', interactive = false, loading = false, depth, glow = 'none', subwayLine, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-4 rounded-lg',
      md: 'p-6 rounded-lg',
      lg: 'p-8 rounded-xl'
    };

    const variantClasses = {
      default: 'bg-card text-card-foreground border-thin border-default shadow-surface',
      surface: 'depth-surface bg-card text-card-foreground',
      outline: 'bg-card text-card-foreground border-medium border-accent shadow-surface',
      elevated: 'depth-elevated bg-card text-card-foreground',
      floating: 'depth-floating bg-card text-card-foreground',
      glass: 'glass-medium text-foreground',
      'glass-intense': 'glass-intense text-foreground',
      gradient: 'bg-gradient-to-br from-background to-muted/50 border-thin border-subtle shadow-elevated',
      'subway-accent': 'bg-card text-card-foreground border-l-heavy shadow-surface'
    };

    const depthClasses = depth ? {
      surface: 'depth-surface',
      elevated: 'depth-elevated', 
      floating: 'depth-floating'
    }[depth] : '';

    const glowClasses = glow !== 'none' ? {
      primary: 'glow-primary',
      success: 'glow-success',
      warning: 'glow-warning',
      error: 'glow-error'
    }[glow] : '';

    const subwayAccentClasses = subwayLine ? {
      red: 'border-l-subway-red',
      blue: 'border-l-subway-blue', 
      green: 'border-l-subway-green',
      orange: 'border-l-subway-orange',
      purple: 'border-l-subway-purple',
      yellow: 'border-l-subway-yellow',
      grey: 'border-l-subway-grey'
    }[subwayLine] : '';

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'relative overflow-hidden transition-all duration-200',
            sizeClasses[size],
            variantClasses[variant],
            depthClasses,
            glowClasses,
            variant === 'subway-accent' && subwayAccentClasses,
            interactive && 'interactive-depth cursor-pointer',
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
            'flex items-start justify-between space-y-1.5 pb-4 border-b border-thin border-subtle',
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
            'flex items-center justify-between pt-4 mt-4 border-t border-thin border-subtle font-body',
            className
          )
        )}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';

// Card Title
export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={twMerge(
          clsx('font-display text-lg font-semibold leading-none tracking-tight', className)
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

// Card Description
export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={twMerge(
          clsx('text-sm text-muted-foreground font-body', className)
        )}
        {...props}
      />
    );
  }
);
CardDescription.displayName = 'CardDescription';

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
      positive: 'text-success',
      negative: 'text-destructive',
      neutral: 'text-muted-foreground'
    };

    return (
      <Card ref={ref} className={clsx('relative overflow-hidden', className)} {...props}>
        <div className="flex items-center justify-between">
          <div className="space-y-xs">
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
        <div className="space-y-md">
          {icon && (
            <div className="text-primary group-hover:scale-110 transition-transform duration-200">
              {icon}
            </div>
          )}
          <div className="space-y-xs">
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
