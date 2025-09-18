export interface DesignSystemConfig {
  spacing: Record<string, string>;
  colors: Record<string, string>;
  typography: Record<string, string>;
}

export const DESIGN_TOKENS = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
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
