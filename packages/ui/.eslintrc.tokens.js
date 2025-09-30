/**
 * ESLint Configuration for Design Token Validation
 * Enforces semantic token usage and prevents hardcoded values
 */

module.exports = {
  rules: {
    // Prevent hardcoded color values
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
        message: 'Hardcoded hex colors are not allowed. Use semantic color tokens instead (e.g., hsl(var(--color-primary))).',
      },
      {
        selector: 'Literal[value=/^rgb\\(/]',
        message: 'Hardcoded RGB colors are not allowed. Use semantic color tokens instead.',
      },
      {
        selector: 'Literal[value=/^rgba\\(/]',
        message: 'Hardcoded RGBA colors are not allowed. Use semantic color tokens with opacity (e.g., hsl(var(--color-primary) / 0.5)).',
      },
      {
        selector: 'Literal[value=/^hsl\\((?!var\\(--)/]',
        message: 'Direct HSL values are not allowed. Use semantic color tokens (e.g., hsl(var(--color-primary))).',
      },
      // Prevent hardcoded spacing values (with exceptions for 0, 1px, 100%)
      {
        selector: 'Literal[value=/^\\d+px$/]:not([value="0px"]):not([value="1px"])',
        message: 'Hardcoded pixel values are not allowed. Use spacing tokens instead (e.g., var(--spacing-4)).',
      },
      {
        selector: 'Literal[value=/^\\d+rem$/]',
        message: 'Hardcoded rem values are not allowed. Use spacing tokens instead (e.g., var(--spacing-4)).',
      },
      // Prevent hardcoded font sizes
      {
        selector: 'Property[key.name="fontSize"] > Literal[value=/^\\d/]',
        message: 'Hardcoded font sizes are not allowed. Use typography tokens instead (e.g., var(--font-size-base)).',
      },
      // Prevent hardcoded shadows
      {
        selector: 'Property[key.name="boxShadow"] > Literal[value=/^\\d/]',
        message: 'Hardcoded box shadows are not allowed. Use shadow tokens instead (e.g., var(--shadow-md)).',
      },
    ],
  },
  overrides: [
    {
      // Stricter rules for CSS/SCSS files
      files: ['*.css', '*.scss'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'Declaration[property=/color/][value!=/var\\(--/]',
            message: 'Use semantic color tokens in CSS (e.g., color: hsl(var(--color-foreground))).',
          },
          {
            selector: 'Declaration[property=/background/][value!=/var\\(--/][value!=/transparent/][value!=/none/]',
            message: 'Use semantic color tokens for backgrounds (e.g., background: hsl(var(--color-background))).',
          },
          {
            selector: 'Declaration[property=/padding|margin/][value!=/var\\(--spacing/][value!=/0/][value!=/auto/]',
            message: 'Use spacing tokens for padding/margin (e.g., padding: var(--spacing-4)).',
          },
        ],
      },
    },
    {
      // Allow certain patterns in config files
      files: ['*.config.{js,ts}', 'tailwind.config.{js,ts}'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    {
      // Allow hardcoded values in token definition files
      files: ['**/tokens/**/*.{js,ts}', '**/styles/generated-tokens.css'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
