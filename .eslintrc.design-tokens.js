/**
 * ESLint Rules for Design Token Enforcement
 * Prevents hardcoded colors, fonts, and arbitrary Tailwind classes
 */

module.exports = {
  plugins: ['no-restricted-syntax'],
  rules: {
    // Prevent hardcoded hex colors in code
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/#[0-9a-fA-F]{3,8}$/]',
        message:
          'Hardcoded hex colors are not allowed. Use design tokens from unified-design-tokens.ts instead. Example: hsl(var(--color-primary))',
      },
      {
        selector:
          'TemplateLiteral > TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}/]',
        message:
          'Hardcoded hex colors in template literals are not allowed. Use design tokens instead.',
      },
      {
        selector: 'Literal[value=/^rgb\\(/]',
        message:
          'Hardcoded rgb() colors are not allowed. Use HSL design tokens instead.',
      },
      {
        selector: 'Literal[value=/^hsl\\(\\d/]',
        message:
          'Hardcoded hsl() colors are not allowed. Use CSS custom properties: hsl(var(--color-*))',
      },
    ],

    // Warn about inline styles (should use classes)
    'react/forbid-dom-props': [
      'warn',
      {
        forbid: [
          {
            propName: 'style',
            message:
              'Inline styles should be avoided. Use Tailwind classes or CSS custom properties instead.',
          },
        ],
      },
    ],

    // Prevent arbitrary font families
    'no-restricted-properties': [
      'error',
      {
        object: 'style',
        property: 'fontFamily',
        message:
          'Use font-family CSS variables: var(--font-family-title), var(--font-family-body), or var(--font-family-mono)',
      },
    ],
  },

  overrides: [
    {
      // Allow hex colors in specific design system files
      files: [
        '**/tokens/**/*.ts',
        '**/tokens/**/*.tsx',
        '**/design-system/**/*.ts',
        '**/colors-2026.ts',
        '**/unified-design-tokens.ts',
      ],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    {
      // Strict rules for component files
      files: ['**/components/**/*.tsx', '**/app/**/*.tsx'],
      rules: {
        'no-restricted-syntax': [
          'error',
          // Prevent arbitrary Tailwind classes with colors
          {
            selector:
              'JSXAttribute[name.name="className"] Literal[value=/\\[(#|rgb|hsl)/]',
            message:
              'Arbitrary Tailwind color classes are not allowed. Use semantic color utilities: bg-primary, text-foreground, etc.',
          },
          // Prevent arbitrary Tailwind classes with custom properties (verbose)
          {
            selector:
              'JSXAttribute[name.name="className"] Literal[value=/\\[hsl\\(var\\(--/]',
            message:
              'Verbose arbitrary classes like bg-[hsl(var(--color-*))] should be replaced with bg-* utilities or proper CSS classes.',
          },
          // Prevent arbitrary font sizes (use scale)
          {
            selector:
              'JSXAttribute[name.name="className"] Literal[value=/text-\\[\\d+(px|rem|em)/]',
            message:
              'Arbitrary font sizes are not allowed. Use the typography scale: text-xs, text-sm, text-base, text-lg, etc.',
          },
        ],
      },
    },
  ],
};
