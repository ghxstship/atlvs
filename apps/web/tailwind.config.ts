import type { Config } from 'tailwindcss';
// Use JS runtime version to satisfy Node when loading Tailwind config
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import preset from '@ghxstship/config/tailwind-preset.js';

export default {
  presets: [preset as any],
  darkMode: ['class'],
  content: [
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
