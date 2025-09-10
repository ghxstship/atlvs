import { Button } from '@ghxstship/ui/components/Button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  icon?: 'arrow' | 'external' | 'none';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function CTAButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon = 'arrow',
  className,
  disabled,
  loading
}: CTAButtonProps) {
  const IconComponent = icon === 'arrow' ? ArrowRight : icon === 'external' ? ExternalLink : null;

  const buttonContent = (
    <>
      {children}
      {IconComponent && (
        <IconComponent className={cn(
          'transition-transform',
          size === 'sm' || size === 'xs' ? 'h-3 w-3 ml-1' : 'h-4 w-4 ml-2',
          icon === 'arrow' && 'group-hover:translate-x-1'
        )} />
      )}
    </>
  );

  if (href) {
    return (
      <Button
        asChild
        variant={variant}
        size={size}
        className={cn('group', className)}
        disabled={disabled}
      >
        <a href={href} target={icon === 'external' ? '_blank' : undefined} rel={icon === 'external' ? 'noopener noreferrer' : undefined}>
          {buttonContent}
        </a>
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={cn('group', className)}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : buttonContent}
    </Button>
  );
}

interface CTAGroupProps {
  children: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'center' | 'right';
  orientation?: 'horizontal' | 'vertical';
}

export function CTAGroup({ 
  children, 
  className, 
  alignment = 'center',
  orientation = 'horizontal'
}: CTAGroupProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const orientationClasses = {
    horizontal: 'flex flex-col sm:flex-row gap-4',
    vertical: 'flex flex-col gap-4',
  };

  return (
    <div className={cn(
      orientationClasses[orientation],
      alignmentClasses[alignment],
      className
    )}>
      {children}
    </div>
  );
}
