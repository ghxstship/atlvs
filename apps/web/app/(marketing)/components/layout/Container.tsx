import { cn } from '@ghxstship/ui/system';
import { layouts } from '../../lib/layouts';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow' | 'full';
}

export function Container({ children, className, size = 'default' }: ContainerProps) {
  const sizeClasses = {
    default: layouts.container,
    wide: layouts.containerWide,
    narrow: layouts.containerNarrow,
    full: 'w-full px-4',
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      {children}
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'features' | 'cards' | 'stats' | 'pricing' | 'custom';
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function Grid({ 
  children, 
  className, 
  variant = 'custom',
  cols,
  gap = 'md'
}: GridProps) {
  const variantClasses = {
    features: layouts.gridFeatures,
    cards: layouts.gridCards,
    stats: layouts.gridStats,
    pricing: layouts.gridPricing,
    custom: '',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  // Build custom grid classes if cols is provided
  let customGridClass = '';
  if (variant === 'custom' && cols) {
    const gridCols = [];
    if (cols.default) gridCols.push(`grid-cols-${cols.default}`);
    if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`);
    customGridClass = `grid ${gridCols.join(' ')}`;
  }

  return (
    <div className={cn(
      variant === 'custom' ? customGridClass : variantClasses[variant],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}
