import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const iconVariants = cva('', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
    color: {
      default: '',
      foreground: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      destructive: 'text-destructive',
      info: 'text-info',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'default',
  },
});

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'foreground' | 'muted' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  title?: string;
  ariaHidden?: boolean;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = 'md', color = 'default', title, ariaHidden = !title, className, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={twMerge(clsx(iconVariants({ size, color }), className))}
        aria-hidden={ariaHidden}
        aria-label={title}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';

// Icon button wrapper for clickable icons
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'foreground' | 'muted' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  label: string; // Required for accessibility
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', color = 'default', label, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center rounded-md',
            'hover:bg-accent hover:text-accent-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'transition-colors duration-200',
            size === 'xs' && 'p-xs',
            size === 'sm' && 'p-xs.5',
            size === 'md' && 'p-sm',
            size === 'lg' && 'p-sm.5',
            size === 'xl' && 'p-sm',
            className
          )
        )}
        aria-label={label}
        {...props}
      >
        <Icon icon={icon} size={size} color={color} ariaHidden />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Status icon component for consistent status indicators
export interface StatusIconProps extends Omit<IconProps, 'icon' | 'color'> {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
}

import { CheckCircle, AlertCircle, XCircle, Info, Clock } from 'lucide-react';

const statusIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  info: Info,
  pending: Clock,
} as const;

const statusColors = {
  success: 'success',
  warning: 'warning',
  error: 'destructive',
  info: 'info',
  pending: 'muted',
} as const;

export const StatusIcon = React.forwardRef<SVGSVGElement, StatusIconProps>(
  ({ status, size = 'md', className, ...props }, ref) => {
    const IconComponent = statusIcons[status];
    const color = statusColors[status];
    
    return (
      <Icon
        ref={ref}
        icon={IconComponent}
        size={size}
        color={color}
        className={className}
        {...props}
      />
    );
  }
);

StatusIcon.displayName = 'StatusIcon';

// Icon with text component for consistent icon + label layouts
export interface IconWithTextProps {
  icon: LucideIcon;
  text: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'foreground' | 'muted' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  position?: 'left' | 'right';
  gap?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export const IconWithText = React.forwardRef<HTMLSpanElement, IconWithTextProps>(
  ({ icon, text, size = 'md', color = 'default', position = 'left', gap = 'normal', className }, ref) => {
    const gapClass = {
      tight: 'gap-xs',
      normal: 'gap-sm',
      loose: 'gap-sm',
    }[gap];
    
    return (
      <span 
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center',
            gapClass,
            className
          )
        )}
      >
        {position === 'left' && <Icon icon={icon} size={size} color={color} />}
        <span>{text}</span>
        {position === 'right' && <Icon icon={icon} size={size} color={color} />}
      </span>
    );
  }
);

IconWithText.displayName = 'IconWithText';
