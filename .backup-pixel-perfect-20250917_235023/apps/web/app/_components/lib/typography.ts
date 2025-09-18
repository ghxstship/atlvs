import { Anton } from 'next/font/google';

// Centralized font configuration
export const anton = Anton({ 
  weight: '400', 
  subsets: ['latin'], 
  variable: '--font-title',
  display: 'swap'
});

// Typography utility classes
export const typography = {
  // Hero titles
  heroTitle: `${anton.className} text-4xl lg:text-6xl font-bold tracking-tight uppercase`,
  heroSubtitle: 'text-xl text-muted-foreground max-w-3xl mx-auto',
  
  // Section titles
  sectionTitle: `${anton.className} text-3xl lg:text-4xl font-bold mb-lg uppercase`,
  sectionSubtitle: 'text-lg text-muted-foreground max-w-3xl mx-auto',
  
  // Card titles
  cardTitle: `${anton.className} text-xl font-bold mb-sm uppercase`,
  cardSubtitle: 'text-sm font-semibold text-primary mb-sm',
  
  // Stats and metrics
  statValue: `${anton.className} text-3xl lg:text-4xl font-bold text-primary uppercase`,
  statLabel: 'text-muted-foreground',
  
  // Body text
  bodyLarge: 'text-lg text-muted-foreground',
  bodyMedium: 'text-base text-muted-foreground',
  bodySmall: 'text-sm text-muted-foreground',
  
  // Special text
  gradient: 'bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent',
} as const;

// Typography component helpers
export const TypographyClasses = {
  h1: typography.heroTitle,
  h2: typography.sectionTitle,
  h3: typography.cardTitle,
  subtitle: typography.heroSubtitle,
  body: typography.bodyMedium,
  caption: typography.bodySmall,
} as const;
