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
  heroTitle: `${anton.className} text-4xl md:text-5xl lg:text-6xl uppercase tracking-[-0.02em] leading-[1.05]`,
  heroSubtitle: 'text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto',
  
  // Section titles
  sectionTitle: `${anton.className} text-3xl md:text-4xl uppercase tracking-[-0.01em] leading-tight`,
  sectionSubtitle: 'text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto',
  
  // Card titles
  cardTitle: `${anton.className} text-2xl uppercase leading-tight`,
  cardSubtitle: 'text-sm font-semibold text-primary uppercase tracking-[0.18em]',
  
  // Stats and metrics
  statValue: `${anton.className} text-3xl md:text-4xl uppercase text-gradient-accent`,
  statLabel: 'text-body-md color-muted uppercase tracking-[0.18em]',
  
  // Body text
  bodyLarge: 'text-lg md:text-xl text-muted-foreground',
  bodyMedium: 'text-base text-muted-foreground',
  bodySmall: 'text-sm text-muted-foreground',
  
  // Special text
  gradient: 'text-gradient-accent',
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
