'use client';
import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useTheme, ThemeMode, ContrastMode, MotionMode } from '../providers/ThemeProvider';

export interface ThemeScopeProps {
  children: React.ReactNode;
  theme?: ThemeMode;
  contrast?: ContrastMode;
  motion?: MotionMode;
  className?: string;
}

/**
 * ThemeScope - Component-level theme override
 * 
 * Allows creating theme-scoped sections within the application.
 * Useful for components that need a different theme than the parent.
 * 
 * @example
 * ```tsx
 * <ThemeScope theme="dark">
 *   <ComponentThatNeedsDarkTheme />
 * </ThemeScope>
 * ```
 */
export function ThemeScope({ 
  children, 
  theme, 
  contrast, 
  motion,
  className = '' 
}: ThemeScopeProps) {
  const parentTheme = useTheme();
  const scopeRef = React.useRef<HTMLDivElement>(null);

  // Determine effective values (use override or parent)
  const effectiveTheme = theme || parentTheme.theme;
  const effectiveContrast = contrast || parentTheme.contrast;
  const effectiveMotion = motion || parentTheme.motion;

  // Apply scoped theme attributes
  React.useEffect(() => {
    if (!scopeRef.current) return;

    const element = scopeRef.current;

    // Set data attributes for CSS targeting
    if (theme) {
      element.setAttribute('data-theme-scope', effectiveTheme);
    }
    if (contrast) {
      element.setAttribute('data-contrast-scope', effectiveContrast);
    }
    if (motion) {
      element.setAttribute('data-motion-scope', effectiveMotion);
    }

    // Apply scoped CSS class for theme
    if (theme) {
      const themeClass = effectiveTheme === 'dark' ? 'dark' : 'light';
      element.classList.add(themeClass);
      
      return () => {
        element.classList.remove(themeClass);
      };
    }
  }, [effectiveTheme, effectiveContrast, effectiveMotion, theme, contrast, motion]);

  return (
    <div 
      ref={scopeRef}
      className={`theme-scope ${className}`}
      style={{
        // Ensure scoped theme creates a new stacking context
        isolation: 'isolate',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Legacy ThemeScope for next-themes compatibility
 */
export function NextThemesScope({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
