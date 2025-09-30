'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { getTextDirection, isRTLLocale } from '../../utils/rtl-utils';
import { type Locale } from '../../types';

interface RTLLayoutProps {
  children: ReactNode;
  locale: Locale;
  className?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
}

export function RTLLayout({
  children,
  locale,
  className,
  dir = 'auto'
}: RTLLayoutProps) {
  const isRTL = isRTLLocale(locale);
  const direction = dir === 'auto' ? getTextDirection(locale) : dir;

  useEffect(() => {
    // Update document direction
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;

    // Update CSS custom property for direction
    document.documentElement.style.setProperty('--direction', direction);
  }, [direction, locale]);

  return (
    <div
      dir={direction}
      lang={locale}
      className={cn(
        'rtl-layout',
        {
          'rtl': isRTL,
          'ltr': !isRTL,
        },
        className
      )}
      style={{
        direction,
        textAlign: isRTL ? 'right' : 'left',
      }}
    >
      {children}
    </div>
  );
}

// RTL-aware container component
interface RTLContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  padding?: string;
  locale: Locale;
}

export function RTLContainer({
  children,
  className,
  maxWidth = 'max-w-7xl',
  padding = 'px-4 sm:px-6 lg:px-8',
  locale,
}: RTLContainerProps) {
  const isRTL = isRTLLocale(locale);

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidth,
        padding,
        {
          'text-right': isRTL,
          'text-left': !isRTL,
        },
        className
      )}
    >
      {children}
    </div>
  );
}

// RTL-aware flexbox component
interface RTLFlexProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  gap?: string;
  locale: Locale;
}

export function RTLFlex({
  children,
  className,
  direction = 'row',
  justify = 'start',
  align = 'center',
  gap = 'gap-4',
  locale,
}: RTLFlexProps) {
  const isRTL = isRTLLocale(locale);

  // Adjust direction for RTL
  let adjustedDirection = direction;
  if (isRTL && direction === 'row') {
    adjustedDirection = 'row-reverse';
  } else if (isRTL && direction === 'row-reverse') {
    adjustedDirection = 'row';
  }

  // Adjust justify for RTL
  let adjustedJustify = justify;
  if (isRTL) {
    if (justify === 'start') adjustedJustify = 'end';
    else if (justify === 'end') adjustedJustify = 'start';
  }

  return (
    <div
      className={cn(
        'flex',
        {
          'flex-row': adjustedDirection === 'row',
          'flex-row-reverse': adjustedDirection === 'row-reverse',
          'flex-col': adjustedDirection === 'column',
          'flex-col-reverse': adjustedDirection === 'column-reverse',
        },
        {
          'justify-start': adjustedJustify === 'start',
          'justify-end': adjustedJustify === 'end',
          'justify-center': adjustedJustify === 'center',
          'justify-between': adjustedJustify === 'between',
          'justify-around': adjustedJustify === 'around',
          'justify-evenly': adjustedJustify === 'evenly',
        },
        {
          'items-start': align === 'start',
          'items-end': align === 'end',
          'items-center': align === 'center',
          'items-stretch': align === 'stretch',
          'items-baseline': align === 'baseline',
        },
        gap,
        className
      )}
    >
      {children}
    </div>
  );
}

// RTL-aware grid component
interface RTLGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: string;
  locale: Locale;
}

export function RTLGrid({
  children,
  className,
  cols = 1,
  gap = 'gap-4',
  locale,
}: RTLGridProps) {
  return (
    <div
      className={cn(
        'grid',
        {
          'grid-cols-1': cols === 1,
          'grid-cols-2': cols === 2,
          'grid-cols-3': cols === 3,
          'grid-cols-4': cols === 4,
          'grid-cols-5': cols === 5,
          'grid-cols-6': cols === 6,
          'grid-cols-12': cols === 12,
        },
        gap,
        className
      )}
    >
      {children}
    </div>
  );
}
