import { cn } from '../../../lib/utils';
import { layouts, LayoutClasses } from '../../lib/layouts';
import { typography } from '../../lib/typography';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'cta' | 'muted';
  container?: 'default' | 'wide' | 'narrow';
  spacing?: 'default' | 'large' | 'compact';
}

export function Section({ 
  children, 
  className,
  variant = 'default',
  container = 'default',
  spacing = 'default'
}: SectionProps) {
  const sectionClasses = {
    default: layouts.sectionPadding,
    hero: LayoutClasses.heroSection,
    cta: LayoutClasses.ctaSection,
    muted: cn(layouts.sectionPadding, layouts.mutedBg),
  };

  const containerClasses = {
    default: layouts.container,
    wide: layouts.containerWide,
    narrow: layouts.containerNarrow,
  };

  const spacingClasses = {
    default: layouts.sectionPadding,
    large: layouts.sectionPaddingLarge,
    compact: 'py-12',
  };

  return (
    <section className={cn(spacingClasses[spacing], sectionClasses[variant], className)}>
      <div className={containerClasses[container]}>
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  badge?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  badge,
  className,
  titleClassName,
  subtitleClassName 
}: SectionHeaderProps) {
  return (
    <div className={cn(LayoutClasses.sectionHeader, className)}>
      {badge && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-sm font-medium bg-muted text-muted-foreground rounded-full border">
            {badge}
          </span>
        </div>
      )}
      <h2 className={cn(typography.sectionTitle, titleClassName)}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-lg text-muted-foreground max-w-3xl mx-auto', subtitleClassName)}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
