import { ReactNode } from 'react';

import { anton } from '../../lib/typography';
import { cn } from '../../lib/utils';

const variantBase = {
  light: 'bg-background text-foreground',
  dark: 'bg-foreground text-background',
  muted: 'bg-muted/30 text-foreground',
  gradient: 'bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-foreground',
};

type SectionVariant = keyof typeof variantBase;

interface MarketingSectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  variant?: SectionVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bleed?: boolean;
}

const paddingMap: Record<NonNullable<MarketingSectionProps['padding']>, string> = {
  none: 'py-0',
  sm: 'py-xl',
  md: 'py-3xl',
  lg: 'py-4xl',
};

export function MarketingSection({
  id,
  children,
  className,
  containerClassName,
  variant = 'light',
  padding = 'md',
  bleed = false,
}: MarketingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden',
        variantBase[variant],
        paddingMap[padding],
        className,
      )}
      data-marketing-section
    >
      <div
        className={cn(
          'container mx-auto px-lg md:px-xl',
          bleed && 'max-w-none px-0',
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  actions?: ReactNode;
  theme?: SectionVariant;
  highlight?: string;
}

export function MarketingSectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  actions,
  highlight,
}: SectionHeaderProps) {
  const heading = highlight
    ? title.replace(
        highlight,
        `<span class="text-gradient-accent">${highlight}</span>`,
      )
    : title;

  return (
    <div
      className={cn(
        'mx-auto flex flex-col gap-md',
        align === 'center' ? 'text-center items-center max-w-3xl' : 'text-left items-start max-w-4xl',
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-md py-xs text-body-sm uppercase tracking-widest">
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          anton.className,
          'text-heading-2 md:text-display text-balance uppercase leading-[1.05] tracking-tight',
          align === 'center' ? 'mx-auto' : '',
        )}
        dangerouslySetInnerHTML={{ __html: heading }}
      />
      {description ? (
        <p className={cn('text-body-lg color-muted', align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-2xl')}>
          {description}
        </p>
      ) : null}
      {actions ? <div className={cn('mt-md flex flex-wrap gap-md', align === 'center' ? 'justify-center' : '')}>{actions}</div> : null}
    </div>
  );
}

interface MarketingCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  eyebrow?: string;
  footer?: ReactNode;
  className?: string;
  highlight?: string;
}

export function MarketingCard({
  title,
  description,
  icon,
  eyebrow,
  footer,
  className,
  highlight,
}: MarketingCardProps) {
  const heading = highlight
    ? title.replace(
        highlight,
        `<span class="text-gradient-accent">${highlight}</span>`,
      )
    : title;

  return (
    <div
      className={cn(
        'flex h-full flex-col gap-md rounded-2xl border border-border/40 bg-background/80 p-xl shadow-sm transition-shadow hover:shadow-lg backdrop-blur',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-lg">
        <div className="flex items-center gap-md">
          {icon ? (
            <div className="inline-flex h-icon-xl w-icon-xl items-center justify-center rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
          ) : null}
          {eyebrow ? <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</span> : null}
        </div>
      </div>
      <h3
        className={cn(
          anton.className,
          'text-heading-3 font-medium uppercase leading-tight text-balance',
        )}
        dangerouslySetInnerHTML={{ __html: heading }}
      />
      <p className="text-body color-muted leading-relaxed">{description}</p>
      {footer ? <div className="mt-auto pt-md text-body-sm color-muted">{footer}</div> : null}
    </div>
  );
}

interface StatItem {
  label: string;
  value: string;
  caption?: string;
}

interface MarketingStatGridProps {
  items: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MarketingStatGrid({ items, columns = 4, className }: MarketingStatGridProps) {
  return (
    <div
      className={cn(
        'grid gap-lg sm:grid-cols-2',
        columns === 3 ? 'lg:grid-cols-3' : '',
        columns === 4 ? 'lg:grid-cols-4' : '',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-border/50 bg-background/70 p-lg text-center shadow-sm">
          <div className={cn(anton.className, 'text-4xl font-semibold uppercase text-gradient-accent mb-sm')}>{item.value}</div>
          <div className="text-body font-medium text-foreground">{item.label}</div>
          {item.caption ? <div className="mt-xs text-body-sm color-muted">{item.caption}</div> : null}
        </div>
      ))}
    </div>
  );
}
