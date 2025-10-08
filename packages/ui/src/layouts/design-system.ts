export interface DesignSystemConfig {
  spacing: Record<string, string>;
  colors: Record<string, string>;
  typography: Record<string, string>;
}

export const DESIGN_TOKENS = {
  colors: {
    primary: 'var(--primary)',
    secondary: 'var(--primary)',
    accent: 'var(--primary)',
    success: 'var(--primary)',
    warning: 'var(--primary)',
    error: 'var(--primary)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    base: '1rem',
    sm: '0.875rem',
    lg: '1.125rem',
  },
};

export const designSystem: DesignSystemConfig = {
  spacing: DESIGN_TOKENS.spacing,
  colors: DESIGN_TOKENS.colors,
  typography: DESIGN_TOKENS.typography,
};
