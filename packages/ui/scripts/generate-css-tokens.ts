#!/usr/bin/env tsx
/**
 * GHXSTSHIP Design Token CSS Generator
 * Generates CSS custom properties from TypeScript design tokens
 * Ensures single source of truth: TypeScript → CSS
 */

import { DESIGN_TOKENS, SEMANTIC_TOKENS, COMPONENT_TOKENS } from '../src/tokens/unified-design-tokens';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type ThemeName = 'light' | 'dark' | 'light-high-contrast' | 'dark-high-contrast';

/**
 * Convert camelCase to kebab-case for CSS variable names
 */
function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Generate CSS custom properties for primitive tokens
 */
function generatePrimitiveTokens(): string {
  let css = '  /* ========================================== */\n';
  css += '  /* PRIMITIVE TOKENS (Base Design Values) */\n';
  css += '  /* ========================================== */\n\n';

  // Colors - Gray Scale
  css += '  /* Gray Scale */\n';
  Object.entries(DESIGN_TOKENS.colors.gray).forEach(([key, value]) => {
    css += `  --color-gray-${key}: ${value};\n`;
  });
  css += '\n';

  // Colors - Brand
  css += '  /* Brand Colors */\n';
  Object.entries(DESIGN_TOKENS.colors.brand.primary).forEach(([key, value]) => {
    css += `  --color-brand-primary-${key}: ${value};\n`;
  });
  Object.entries(DESIGN_TOKENS.colors.brand.accent).forEach(([key, value]) => {
    css += `  --color-brand-accent-${key}: ${value};\n`;
  });
  css += '\n';

  // Colors - Semantic
  css += '  /* Semantic Colors */\n';
  Object.entries(DESIGN_TOKENS.colors.semantic).forEach(([semantic, shades]) => {
    Object.entries(shades).forEach(([key, value]) => {
      css += `  --color-semantic-${semantic}-${key}: ${value};\n`;
    });
  });
  css += '\n';

  // Typography - Font Families
  css += '  /* Typography - Font Families */\n';
  Object.entries(DESIGN_TOKENS.typography.fontFamily).forEach(([key, value]) => {
    css += `  --font-family-${key}: ${Array.isArray(value) ? value.join(', ') : value};\n`;
  });
  css += '\n';

  // Typography - Font Sizes
  css += '  /* Typography - Font Sizes (Fluid) */\n';
  Object.entries(DESIGN_TOKENS.typography.fontSize).forEach(([key, value]) => {
    css += `  --font-size-${key}: ${value};\n`;
  });
  css += '\n';

  // Typography - Line Heights
  css += '  /* Typography - Line Heights */\n';
  Object.entries(DESIGN_TOKENS.typography.lineHeight).forEach(([key, value]) => {
    css += `  --line-height-${key}: ${value};\n`;
  });
  css += '\n';

  // Typography - Letter Spacing
  css += '  /* Typography - Letter Spacing */\n';
  Object.entries(DESIGN_TOKENS.typography.letterSpacing).forEach(([key, value]) => {
    css += `  --letter-spacing-${key}: ${value};\n`;
  });
  css += '\n';

  // Typography - Font Weights
  css += '  /* Typography - Font Weights */\n';
  Object.entries(DESIGN_TOKENS.typography.fontWeight).forEach(([key, value]) => {
    css += `  --font-weight-${key}: ${value};\n`;
  });
  css += '\n';

  // Spacing (Complete Scale)
  css += '  /* Spacing Scale (8px base grid) */\n';
  Object.entries(DESIGN_TOKENS.spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`;
  });
  css += '\n';

  // Border Radius
  css += '  /* Border Radius */\n';
  Object.entries(DESIGN_TOKENS.borderRadius).forEach(([key, value]) => {
    css += `  --radius-${key}: ${value};\n`;
  });
  css += '\n';

  // Border Width
  css += '  /* Border Width */\n';
  Object.entries(DESIGN_TOKENS.borderWidth).forEach(([key, value]) => {
    css += `  --border-width-${key}: ${value};\n`;
  });
  css += '\n';

  // Shadows - Traditional
  css += '  /* Shadows - Traditional */\n';
  ['sm', 'base', 'md', 'lg', 'xl', '2xl', 'inner'].forEach(key => {
    const value = DESIGN_TOKENS.shadows[key as keyof typeof DESIGN_TOKENS.shadows];
    if (typeof value === 'string') {
      css += `  --shadow-${key}: ${value};\n`;
    }
  });
  css += '\n';

  // Shadows - Pop Art
  css += '  /* Shadows - Pop Art */\n';
  Object.entries(DESIGN_TOKENS.shadows.pop).forEach(([key, value]) => {
    css += `  --shadow-pop-${key}: ${value};\n`;
  });
  css += '\n';

  // Shadows - Glow
  css += '  /* Shadows - Glow */\n';
  Object.entries(DESIGN_TOKENS.shadows.glow).forEach(([key, value]) => {
    css += `  --shadow-glow-${key}: ${value};\n`;
  });
  css += '\n';

  // Shadows - Semantic Elevation
  css += '  /* Shadows - Semantic Elevation */\n';
  Object.entries(DESIGN_TOKENS.shadows.semantic.elevation).forEach(([level, shadow]) => {
    css += `  --shadow-elevation-${level}: ${shadow};\n`;
  });
  css += '\n';

  // Shadows - Component-Specific
  css += '  /* Shadows - Component-Specific */\n';
  Object.entries(DESIGN_TOKENS.shadows.semantic.component).forEach(([component, shadows]) => {
    if (typeof shadows === 'string') {
      css += `  --shadow-component-${component}: ${shadows};\n`;
    } else if (typeof shadows === 'object') {
      Object.entries(shadows).forEach(([state, shadow]) => {
        if (typeof shadow === 'string') {
          css += `  --shadow-component-${component}-${state}: ${shadow};\n`;
        } else if (typeof shadow === 'object') {
          Object.entries(shadow).forEach(([subState, subShadow]) => {
            css += `  --shadow-component-${component}-${state}-${subState}: ${subShadow};\n`;
          });
        }
      });
    }
  });
  css += '\n';

  // Z-Index
  css += '  /* Z-Index Scale */\n';
  Object.entries(DESIGN_TOKENS.zIndex).forEach(([key, value]) => {
    css += `  --z-index-${key}: ${value};\n`;
  });
  css += '\n';

  // Animation - Duration
  css += '  /* Animation - Duration */\n';
  Object.entries(DESIGN_TOKENS.animation.duration).forEach(([key, value]) => {
    css += `  --duration-${key}: ${value};\n`;
  });
  css += '\n';

  // Animation - Easing
  css += '  /* Animation - Easing */\n';
  Object.entries(DESIGN_TOKENS.animation.easing).forEach(([key, value]) => {
    css += `  --easing-${key}: ${value};\n`;
  });
  css += '\n';

  // Breakpoints
  css += '  /* Breakpoints (Mobile-first) */\n';
  Object.entries(DESIGN_TOKENS.breakpoints).forEach(([key, value]) => {
    css += `  --breakpoint-${key}: ${value};\n`;
  });
  css += '\n';

  // Component Sizes
  css += '  /* Component Sizes */\n';
  Object.entries(DESIGN_TOKENS.sizes).forEach(([key, value]) => {
    css += `  --size-${key}: ${value};\n`;
  });
  css += '\n';

  return css;
}

/**
 * Generate CSS custom properties for semantic tokens
 */
function generateSemanticTokens(theme: ThemeName): string {
  const semanticTokens = SEMANTIC_TOKENS[theme === 'light' || theme === 'light-high-contrast' ? 'light' : 'dark'];
  
  let css = '  /* ========================================== */\n';
  css += `  /* SEMANTIC TOKENS (${theme.toUpperCase()}) */\n`;
  css += '  /* ========================================== */\n\n';

  Object.entries(semanticTokens).forEach(([key, value]) => {
    const cssVar = toKebabCase(key);
    // Convert HSL values to space-separated format for Tailwind compatibility
    const hslValue = value.replace(/hsl\((.*?)\)/, '$1');
    css += `  --color-${cssVar}: ${hslValue};\n`;
    // Also create shorthand without "color-" prefix for Tailwind
    css += `  --${cssVar}: ${hslValue};\n`;
  });
  css += '\n';

  return css;
}

/**
 * Generate CSS custom properties for component tokens
 */
function generateComponentTokens(theme: ThemeName): string {
  const componentTokens = COMPONENT_TOKENS[theme];
  
  let css = '  /* ========================================== */\n';
  css += `  /* COMPONENT TOKENS (${theme.toUpperCase()}) */\n`;
  css += '  /* ========================================== */\n\n';

  function processTokenObject(obj: any, prefix: string = 'component') {
    Object.entries(obj).forEach(([key, value]) => {
      const cssVar = `${prefix}-${toKebabCase(key)}`;
      
      if (typeof value === 'string') {
        css += `  --${cssVar}: ${value};\n`;
      } else if (typeof value === 'object' && value !== null) {
        processTokenObject(value, cssVar);
      }
    });
  }

  processTokenObject(componentTokens);
  css += '\n';

  return css;
}

/**
 * Generate complete CSS file with all tokens
 */
function generateCSSFile(): string {
  let css = `/**
 * GHXSTSHIP Unified Design System - Generated CSS Tokens
 * 
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * 
 * This file is automatically generated from TypeScript design tokens.
 * To make changes, edit: packages/ui/src/tokens/unified-design-tokens.ts
 * Then run: pnpm generate:tokens
 * 
 * Generation Date: ${new Date().toISOString()}
 */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ==========================================
   ROOT TOKENS (Light Theme + Primitives)
   ========================================== */

:root {
${generatePrimitiveTokens()}${generateSemanticTokens('light')}${generateComponentTokens('light')}}

/* ==========================================
   DARK THEME
   ========================================== */

[data-theme="dark"],
.dark {
${generateSemanticTokens('dark')}${generateComponentTokens('dark')}}

/* ==========================================
   HIGH CONTRAST LIGHT THEME
   ========================================== */

[data-theme="light-high-contrast"],
.light-high-contrast {
${generateSemanticTokens('light-high-contrast')}${generateComponentTokens('light-high-contrast')}}

/* ==========================================
   HIGH CONTRAST DARK THEME
   ========================================== */

[data-theme="dark-high-contrast"],
.dark-high-contrast {
${generateSemanticTokens('dark-high-contrast')}${generateComponentTokens('dark-high-contrast')}}

/* ==========================================
   PROGRESSIVE ENHANCEMENT FALLBACKS
   ========================================== */

@supports (not (--color-background: 0)) {
  :root {
    /* Critical color fallbacks */
    --color-background: hsl(0, 0%, 100%);
    --color-foreground: hsl(222, 47%, 11%);
    --color-primary: hsl(158, 64%, 52%);
    --color-border: hsl(214, 32%, 91%);
    
    /* Critical spacing fallbacks */
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-4: 1rem;
    --spacing-8: 2rem;
    
    /* Critical typography fallbacks */
    --font-family-body: system-ui, sans-serif;
    --font-size-base: 1rem;
  }
}

/* ==========================================
   BASE STYLES
   ========================================== */

* {
  box-sizing: border-box;
}

html {
  font-family: var(--font-family-body);
  line-height: var(--line-height-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  background-color: hsl(var(--color-background));
  color: hsl(var(--color-foreground));
  font-feature-settings: "rlig" 1, "calt" 1;
}

/* ==========================================
   UTILITY CLASSES
   ========================================== */

/* Typography Utilities */
.text-display {
  font-family: var(--font-family-title);
  font-size: var(--font-size-5xl);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-normal);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.text-heading-1 {
  font-family: var(--font-family-title);
  font-size: var(--font-size-4xl);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-normal);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.text-heading-2 {
  font-family: var(--font-family-title);
  font-size: var(--font-size-3xl);
  line-height: var(--line-height-snug);
  font-weight: var(--font-weight-normal);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.text-heading-3 {
  font-family: var(--font-family-title);
  font-size: var(--font-size-2xl);
  line-height: var(--line-height-snug);
  font-weight: var(--font-weight-normal);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.text-body {
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-normal);
}

/* Layout Utilities */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
}

@media (min-width: 640px) {
  .container { 
    max-width: 640px; 
    padding-left: var(--spacing-6); 
    padding-right: var(--spacing-6); 
  }
}

@media (min-width: 768px) {
  .container { 
    max-width: 768px; 
    padding-left: var(--spacing-8); 
    padding-right: var(--spacing-8); 
  }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
`;

  return css;
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🎨 Generating CSS tokens from TypeScript design tokens...\n');
    
    const css = generateCSSFile();
    const outputPath = join(__dirname, '../src/styles/generated-tokens.css');
    
    writeFileSync(outputPath, css, 'utf-8');
    
    console.log('✅ CSS tokens generated successfully!');
    console.log(`📄 Output: ${outputPath}`);
    console.log(`📊 File size: ${(css.length / 1024).toFixed(2)} KB`);
    console.log('\n💡 Import this file in your application:');
    console.log('   import "@ghxstship/ui/styles/generated-tokens.css";\n');
  } catch (error) {
    console.error('❌ Error generating CSS tokens:', error);
    process.exit(1);
  }
}

main();
