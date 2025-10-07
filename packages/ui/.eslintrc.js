// eslint-disable-next-line @typescript-eslint/no-require-imports
const semanticTokenRules = require('../../.eslintrc.semantic-tokens.js');

module.exports = {
  extends: [
    '@repo/eslint-config/react-internal.js',
  ],
  plugins: ['semantic-tokens'],
  rules: {
    // Semantic token enforcement rules
    'semantic-tokens/no-hardcoded-values': ['error', {
      allowedPatterns: [
        // Allow certain system values
        'sr-only',
        'not-sr-only',
        'focus:not-sr-only',
        // Allow semantic color references
        'bg-primary',
        'text-primary',
        'border-primary',
        // Allow component state classes
        'hover:',
        'focus:',
        'active:',
        'disabled:',
        'data-\\[state=',
        // Allow layout utilities that don't have spacing equivalents
        'flex',
        'grid',
        'block',
        'inline',
        'hidden',
        'absolute',
        'relative',
        'fixed',
        'sticky',
      ],
      tokenPatterns: {
        spacing: 'var(--spacing-[\\w-]+)',
        colors: 'var(--color-[\\w-]+)',
        typography: 'var(--font-[\\w-]+)',
        animation: 'var(--animation-[\\w-]+)',
      },
    }],
    'semantic-tokens/consistent-token-naming': 'error',
    
    // Additional design system rules
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^\\d+px$/]',
        message: 'Avoid hardcoded pixel values. Use semantic spacing tokens instead.',
      },
      {
        selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
        message: 'Avoid hardcoded hex colors. Use semantic color tokens instead.',
      },
      {
        selector: 'Literal[value=/^rgb\\(/]',
        message: 'Avoid hardcoded RGB colors. Use semantic color tokens instead.',
      },
    ],
    
    // Tailwind-specific rules for design system compliance
    'no-restricted-patterns': [
      'error',
      {
        pattern: '\\b(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|space-[xy])-\\d+\\b',
        message: 'Use semantic spacing tokens instead of hardcoded Tailwind spacing classes.',
      },
      {
        pattern: '\\b(w|h|min-w|min-h|max-w|max-h)-\\d+\\b',
        message: 'Use semantic spacing tokens for dimensions.',
      },
      {
        pattern: '\\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\\b',
        message: 'Use semantic typography tokens instead of hardcoded text size classes.',
      },
      {
        pattern: '\\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\\b',
        message: 'Use semantic typography tokens instead of hardcoded font weight classes.',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.stories.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
      rules: {
        // Relax rules for stories and tests
        'semantic-tokens/no-hardcoded-values': 'warn',
      },
    },
    {
      files: ['**/styles.css', '**/*.css'],
      rules: {
        // CSS files can have more flexibility for base definitions
        'semantic-tokens/no-hardcoded-values': 'off',
      },
    },
  ],
  settings: {
    'semantic-tokens': {
      // Define the semantic token categories and their patterns
      categories: {
        spacing: {
          pattern: '--spacing-*',
          description: 'Use for margins, padding, gaps, and dimensions',
        },
        colors: {
          pattern: '--color-*',
          description: 'Use for all color values',
        },
        typography: {
          pattern: '--font-*',
          description: 'Use for font sizes, weights, and families',
        },
        animation: {
          pattern: '--animation-*',
          description: 'Use for transitions and animations',
        },
      },
    },
  },
};

// Register custom rules
Object.assign(module.exports.rules, semanticTokenRules.rules);
