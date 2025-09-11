'use client';

import { Button } from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/system';
import { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';

interface StandardButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'xl' | 'icon-sm' | 'icon-lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
}

export const StandardButton = forwardRef<HTMLButtonElement, StandardButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    icon: Icon, 
    iconPosition = 'right',
    loading = false,
    loadingText,
    disabled,
    className,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    const buttonText = loading && loadingText ? loadingText : children;

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        loading={loading}
        disabled={isDisabled}
        className={cn(
          'group transition-all duration-200 hover:scale-105 active:scale-95',
          'shadow-lg hover:shadow-xl',
          loading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {!loading && iconPosition === 'left' && Icon && (
          <Icon className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
        )}
        {buttonText}
        {!loading && iconPosition === 'right' && Icon && (
          <Icon className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        )}
      </Button>
    );
  }
);

StandardButton.displayName = 'StandardButton';

export default StandardButton;
