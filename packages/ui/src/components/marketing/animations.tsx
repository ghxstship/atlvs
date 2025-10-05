// Marketing-specific animation and interaction classes
export const MARKETING_CLASSES = {
  // Card interaction classes
  card: {
    interactive: 'transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg cursor-pointer',
  },

  // Section animation classes
  section: {
    fadeIn: 'animate-in fade-in duration-700',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-700',
  },

  // Button animation classes
  button: {
    cta: 'transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl',
    subtle: 'transition-all duration-200 ease-out hover:scale-[1.01]',
  },

  // Text animation classes
  text: {
    gradient: 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent',
    highlight: 'transition-colors duration-300 hover:text-primary',
  },
} as const;

// Export individual classes for convenience
export const {
  card: marketingCardClasses,
  section: marketingSectionClasses,
  button: marketingButtonClasses,
  text: marketingTextClasses,
} = MARKETING_CLASSES;

// Type definitions
export type MarketingClasses = typeof MARKETING_CLASSES;
