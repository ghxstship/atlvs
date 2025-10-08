import { cn } from './utils';

// Layout utility classes
export const layouts = {
  // Container patterns
  container: 'container mx-auto px-lg sm:px-xl',
  containerWide: 'container mx-auto px-lg sm:px-xl max-w-7xl',
  containerNarrow: 'container mx-auto px-lg sm:px-xl max-w-4xl',

  // Section spacing
  sectionPadding: 'py-3xl md:py-4xl',
  sectionPaddingLarge: 'py-4xl md:py-5xl',
  sectionMargin: 'mb-2xl md:mb-3xl',

  // Grid patterns
  gridFeatures: 'grid gap-lg sm:grid-cols-2 lg:grid-cols-3',
  gridCards: 'grid gap-lg sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gridStats: 'grid gap-lg sm:grid-cols-2 md:grid-cols-4',
  gridPricing: 'grid gap-lg md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',

  // Flex patterns
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col gap-md',
  flexColCenter: 'flex flex-col items-center gap-md',

  // CTA button groups
  ctaGroup: 'flex flex-col sm:flex-row gap-md justify-center',
  ctaGroupLeft: 'flex flex-col sm:flex-row gap-md',

  // Background patterns
  gradientBg: 'bg-gradient-to-br from-primary/15 via-background to-accent/5',
  mutedBg: 'bg-muted/20',
  primaryGradient: 'bg-gradient-to-r from-primary/10 via-background to-secondary/10'
} as const;

// Layout component classes
export const LayoutClasses = {
  // Page sections
  heroSection: cn(layouts.sectionPadding, layouts.gradientBg),
  contentSection: layouts.sectionPadding,
  ctaSection: cn(layouts.sectionPadding, layouts.primaryGradient),
  
  // Content containers
  sectionContainer: cn(layouts.container),
  sectionHeader: cn('text-center', layouts.sectionMargin),
  sectionContent: 'stack-xl',
  
  // Common patterns
  cardHover: 'hover:shadow-floating transition-shadow',
  buttonGroup: layouts.ctaGroup
} as const;

// Responsive breakpoint helpers
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;
