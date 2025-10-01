'use client';

import * as React from 'react';
import { useTheme } from '../../providers/ThemeProvider';

export interface ThemeAwareImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Image source for light theme */
  lightSrc: string;
  /** Image source for dark theme */
  darkSrc: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Optional className */
  className?: string;
  /** Transition duration in ms */
  transitionDuration?: number;
}

/**
 * ThemeAwareImage - Image component that adapts to theme
 * 
 * Automatically switches between light and dark image variants
 * based on the current theme.
 * 
 * @example
 * ```tsx
 * <ThemeAwareImage
 *   lightSrc="/logo-light.png"
 *   darkSrc="/logo-dark.png"
 *   alt="Company Logo"
 * />
 * ```
 */
export function ThemeAwareImage({
  lightSrc,
  darkSrc,
  alt,
  className = '',
  transitionDuration = 200,
  ...props
}: ThemeAwareImageProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme.includes('dark');
  const src = isDark ? darkSrc : lightSrc;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        transition: `opacity ${transitionDuration}ms ease-in-out`,
        ...props.style,
      }}
      {...props}
    />
  );
}

export interface ThemeAwareSVGProps extends React.SVGProps<SVGSVGElement> {
  /** SVG content for light theme */
  lightContent: React.ReactNode;
  /** SVG content for dark theme */
  darkContent: React.ReactNode;
  /** Optional className */
  className?: string;
  /** Transition duration in ms */
  transitionDuration?: number;
}

/**
 * ThemeAwareSVG - SVG component that adapts to theme
 * 
 * Renders different SVG content based on the current theme.
 * Useful for inline SVGs that need theme-specific colors.
 * 
 * @example
 * ```tsx
 * <ThemeAwareSVG
 *   lightContent={<path fill="hsl(var(--color-foreground))" d="..." />}
 *   darkContent={<path fill="hsl(var(--color-background))" d="..." />}
 *   viewBox="0 0 24 24"
 * />
 * ```
 */
export function ThemeAwareSVG({
  lightContent,
  darkContent,
  className = '',
  transitionDuration = 200,
  ...props
}: ThemeAwareSVGProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme.includes('dark');
  const content = isDark ? darkContent : lightContent;

  return (
    <svg
      className={className}
      style={{
        transition: `opacity ${transitionDuration}ms ease-in-out`,
        ...props.style,
      }}
      {...props}
    >
      {content}
    </svg>
  );
}

export interface ThemeAwareIconProps {
  /** Icon component for light theme */
  LightIcon: React.ComponentType<{ className?: string }>;
  /** Icon component for dark theme */
  DarkIcon: React.ComponentType<{ className?: string }>;
  /** Optional className */
  className?: string;
  /** Transition duration in ms */
  transitionDuration?: number;
}

/**
 * ThemeAwareIcon - Icon component that adapts to theme
 * 
 * Switches between different icon components based on theme.
 * Works with any icon library (Lucide, Heroicons, etc.)
 * 
 * @example
 * ```tsx
 * import { Sun, Moon } from 'lucide-react';
 * 
 * <ThemeAwareIcon
 *   LightIcon={Sun}
 *   DarkIcon={Moon}
 *   className="w-icon-md h-icon-md"
 * />
 * ```
 */
export function ThemeAwareIcon({
  LightIcon,
  DarkIcon,
  className = '',
  transitionDuration = 200,
}: ThemeAwareIconProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme.includes('dark');
  const Icon = isDark ? DarkIcon : LightIcon;

  return (
    <div
      style={{
        transition: `opacity ${transitionDuration}ms ease-in-out`,
      }}
    >
      <Icon className={className} />
    </div>
  );
}

export interface ThemeAwareBackgroundProps {
  /** Background image for light theme */
  lightBg: string;
  /** Background image for dark theme */
  darkBg: string;
  /** Children to render over background */
  children?: React.ReactNode;
  /** Optional className */
  className?: string;
  /** Transition duration in ms */
  transitionDuration?: number;
}

/**
 * ThemeAwareBackground - Container with theme-aware background image
 * 
 * Automatically switches background images based on theme.
 * 
 * @example
 * ```tsx
 * <ThemeAwareBackground
 *   lightBg="/bg-light.jpg"
 *   darkBg="/bg-dark.jpg"
 * >
 *   <Content />
 * </ThemeAwareBackground>
 * ```
 */
export function ThemeAwareBackground({
  lightBg,
  darkBg,
  children,
  className = '',
  transitionDuration = 300,
}: ThemeAwareBackgroundProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme.includes('dark');
  const bg = isDark ? darkBg : lightBg;

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${bg})`,
        transition: `background-image ${transitionDuration}ms ease-in-out`,
      }}
    >
      {children}
    </div>
  );
}
