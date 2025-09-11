'use client';

import { cn } from '@ghxstship/ui/system';
import { Badge } from '@ghxstship/ui';

interface ColoredBadgeProps {
  color?: string;
  variant?: 'default' | 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function ColoredBadge({
  color,
  variant = 'subtle',
  size = 'md',
  children,
  className
}: ColoredBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5', 
    lg: 'text-base px-3 py-1'
  };

  // If no color provided, use default Badge
  if (!color) {
    return (
      <Badge className={cn(sizeClasses[size], className)}>
        {children}
      </Badge>
    );
  }

  const getVariantStyles = (color: string, variant: string) => {
    const baseColor = color.startsWith('#') ? color : `var(--${color})`;
    
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: baseColor,
          color: 'white',
          border: `1px solid ${baseColor}`
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: baseColor,
          border: `1px solid ${baseColor}`
        };
      case 'subtle':
      default:
        return {
          backgroundColor: `${baseColor}20`,
          color: baseColor,
          border: `1px solid ${baseColor}30`
        };
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        className
      )}
      style={getVariantStyles(color, variant)}
    >
      {children}
    </span>
  );
}

// Specialized category badge component
interface CategoryBadgeProps {
  category: {
    name: string;
    color?: string;
  };
  variant?: 'default' | 'subtle' | 'solid' | 'outline';
  className?: string;
}

export function CategoryBadge({ category, variant = 'subtle', className }: CategoryBadgeProps) {
  return (
    <ColoredBadge
      color={category.color}
      variant={variant}
      className={className}
    >
      {category.name}
    </ColoredBadge>
  );
}

// Event type badge with predefined colors
interface EventTypeBadgeProps {
  eventType: string;
  className?: string;
}

const eventTypeColors: Record<string, string> = {
  meeting: '#3b82f6',
  deadline: '#ef4444', 
  milestone: '#10b981',
  review: '#f59e0b',
  training: '#8b5cf6',
  default: '#6b7280'
};

export function EventTypeBadge({ eventType, className }: EventTypeBadgeProps) {
  const color = eventTypeColors[eventType.toLowerCase()] || eventTypeColors.default;
  
  return (
    <ColoredBadge
      color={color}
      variant="subtle"
      size="sm"
      className={className}
    >
      {eventType}
    </ColoredBadge>
  );
}
