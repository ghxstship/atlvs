import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import zero from '../eslint-zero.mjs';

const basePreset = {
  name: 'ghxstship/design-system-base',
  files: ['**/*.{ts,tsx,js,jsx}'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      project: './tsconfig.json',
    },
  },
  plugins: {
    '@typescript-eslint': typescript,
    react,
    zero,
  },
};

export const spacingPreset = {
  ...basePreset,
  name: 'ghxstship/design-system-spacing',
  rules: {
    'zero/no-unsemantic-tailwind': ['error', { categories: ['spacing'] }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern:
          '^(p|m|gap|px|py|mx|my|mt|mb|ml|mr|pt|pb|pl|pr)-(xs|sm|md|lg|xl|2xl|3xl)$',
      },
    ],
  },
};

export const pixelPerfectPreset = {
  ...basePreset,
  name: 'ghxstship/design-system-pixel-perfect',
  rules: {
    'zero/no-unsemantic-tailwind': [
      'error',
      { categories: ['colors', 'typography', 'shadows', 'radius'] },
    ],
    'zero/no-hardcoded-colors': 'error',
  },
};

export const semanticTokensPreset = {
  ...basePreset,
  name: 'ghxstship/design-system-semantic-tokens',
  rules: {
    'zero/no-hardcoded-values': 'error',
    'zero/consistent-token-naming': 'error',
  },
};

export const designSystemPresets = [
  spacingPreset,
  pixelPerfectPreset,
  semanticTokensPreset,
];

export function withDesignSystemPresets(baseConfig = []) {
  return [...baseConfig, ...designSystemPresets];
}

export default designSystemPresets;
