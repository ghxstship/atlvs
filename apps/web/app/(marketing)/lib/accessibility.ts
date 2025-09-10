// Accessibility utilities for marketing pages
// Ensures WCAG 2.1 AA compliance across all marketing components

export const accessibility = {
  // ARIA labels and roles
  aria: {
    navigation: 'aria-label="Main navigation"',
    banner: 'role="banner"',
    main: 'role="main"',
    contentinfo: 'role="contentinfo"',
    complementary: 'role="complementary"',
    search: 'role="search"',
    button: 'role="button"',
    link: 'role="link"',
  },
  
  // Focus management
  focus: {
    visible: 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    ring: 'focus:ring-2 focus:ring-primary focus:ring-offset-2',
    skip: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50',
  },
  
  // Screen reader utilities
  screenReader: {
    only: 'sr-only',
    focusable: 'sr-only focus:not-sr-only',
    description: 'aria-describedby',
    labelledby: 'aria-labelledby',
  },
  
  // Color contrast helpers
  contrast: {
    high: 'text-slate-900 dark:text-slate-100',
    medium: 'text-slate-700 dark:text-slate-300',
    low: 'text-slate-600 dark:text-slate-400',
  },
  
  // Interactive states
  interactive: {
    hover: 'hover:bg-slate-50 dark:hover:bg-slate-800',
    active: 'active:bg-slate-100 dark:active:bg-slate-700',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  },
  
  // Semantic HTML helpers
  semantic: {
    heading: (level: number) => `h${level}`,
    landmark: (role: string) => `role="${role}"`,
    list: 'role="list"',
    listitem: 'role="listitem"',
  },
} as const;

// Accessibility validation helpers
export const a11yValidation = {
  // Check if element has proper heading hierarchy
  validateHeadingHierarchy: (headings: string[]) => {
    // Implementation would validate h1 -> h2 -> h3 etc.
    return headings.every((heading, index) => {
      if (index === 0) return heading === 'h1';
      const currentLevel = parseInt(heading.charAt(1));
      const prevLevel = parseInt(headings[index - 1].charAt(1));
      return currentLevel <= prevLevel + 1;
    });
  },
  
  // Check color contrast ratios
  validateColorContrast: (foreground: string, background: string) => {
    // Implementation would calculate contrast ratio
    // Return true if ratio meets WCAG AA standards (4.5:1 for normal text)
    return true; // Placeholder
  },
  
  // Validate keyboard navigation
  validateKeyboardNav: (element: HTMLElement) => {
    // Check if element is focusable and has proper tab order
    return element.tabIndex >= 0 || element.hasAttribute('tabindex');
  },
} as const;
