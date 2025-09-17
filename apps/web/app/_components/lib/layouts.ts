import { cn } from './utils';

// Layout utility classes
export const layouts = {
  // Container patterns
  container: 'container mx-auto px-4',
  containerWide: 'container mx-auto px-4 max-w-7xl',
  containerNarrow: 'container mx-auto px-4 max-w-4xl',
  
  // Section spacing
  sectionPadding: 'py-20',
  sectionPaddingLarge: 'py-24',
  sectionMargin: 'mb-16',
  
  // Grid patterns
  gridFeatures: 'grid md:grid-cols-2 lg:grid-cols-3 gap-8',
  gridCards: 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  gridStats: 'grid grid-cols-2 md:grid-cols-4 gap-6',
  gridPricing: 'grid lg:grid-cols-3 gap-8',
  
  // Flex patterns
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  flexColCenter: 'flex flex-col items-center',
  
  // CTA button groups
  ctaGroup: 'flex flex-col sm:flex-row gap-4 justify-center',
  ctaGroupLeft: 'flex flex-col sm:flex-row gap-4',
  
  // Background patterns
  gradientBg: 'bg-gradient-to-br from-background via-background to-muted/20',
  mutedBg: 'bg-muted/20',
  primaryGradient: 'bg-gradient-to-r from-primary/5 to-accent/5',
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
  sectionContent: 'space-y-8',
  
  // Common patterns
  cardHover: 'hover:shadow-lg transition-shadow',
  buttonGroup: layouts.ctaGroup,
} as const;

// Responsive breakpoint helpers
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
