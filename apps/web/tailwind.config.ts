import type { Config } from 'tailwindcss';
// Use JS runtime version to satisfy Node when loading Tailwind config
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import preset from '@ghxstship/config/tailwind-preset.js';

export default {
  presets: [preset as Config],
  darkMode: ['class'],
  content: [
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      // Semantic Size Tokens - Zero Tolerance Layout Normalization
      width: {
        // Icon sizes
        'icon-xs': '16px',
        'icon-sm': '20px',
        'icon-md': '24px',
        'icon-lg': '32px',
        'icon-xl': '40px',
        'icon-2xl': '48px',
        // Component sizes
        'component-xs': '32px',
        'component-sm': '48px',
        'component-md': '64px',
        'component-lg': '96px',
        'component-xl': '128px',
        'component-2xl': '192px',
        'component-3xl': '256px',
        // Container sizes
        'container-xs': '192px',
        'container-sm': '256px',
        'container-md': '320px',
        'container-lg': '384px',
        'container-xl': '512px',
        'container-2xl': '640px',
      },
      height: {
        // Icon sizes
        'icon-xs': '16px',
        'icon-sm': '20px',
        'icon-md': '24px',
        'icon-lg': '32px',
        'icon-xl': '40px',
        'icon-2xl': '48px',
        // Component sizes
        'component-xs': '32px',
        'component-sm': '48px',
        'component-md': '64px',
        'component-lg': '96px',
        'component-xl': '128px',
        'component-2xl': '192px',
        'component-3xl': '256px',
        // Container sizes
        'container-xs': '192px',
        'container-sm': '256px',
        'container-md': '320px',
        'container-lg': '384px',
        'container-xl': '512px',
        'container-2xl': '640px',
        // Common arbitrary values converted to semantic tokens
        'sidebar-wide': '400px',
        'content-narrow': '200px',
        'content-medium': '300px',
        'content-large': '600px',
        'content-xlarge': '800px',
        // Common arbitrary values converted
        'toolbar': '60px',
        'header-sm': '80px',
        'header-md': '100px',
        'header-lg': '120px',
        'content-sm': '200px',
        'content-md': '300px',
        'content-lg': '400px',
        'content-xl': '600px',
        // Screen calculations
        'screen-minus-header': 'calc(100vh - 64px)',
        'screen-minus-nav': 'calc(100vh - 120px)',
        'screen-minus-toolbar': 'calc(100vh - 200px)',
        'screen-minus-xl': 'calc(100vh - 300px)',
      },
      // CSS selector positioning tokens
      spacing: {
        '4': '1rem', // 16px - keeping for CSS selectors
        'micro': '1px', // Borders, hairlines
        'mini': '3px', // Micro spacing
        'tiny': '8px', // Tiny elements
        'small': '10px', // Small spacing
        'compact': '11px', // Compact spacing
      },
      inset: {
        '4': '1rem', // 16px - for positioning (top-4, left-4, etc.)
      },
      // Min/max widths for common patterns
      minWidth: {
        'dropdown': '180px',
        'modal-sm': '320px',
        'modal-md': '420px',
        'modal-lg': '500px',
      },
      maxWidth: {
        'compact': '140px',
        'narrow': '150px',
      },
    },
  },
  plugins: [],
} satisfies Config;
