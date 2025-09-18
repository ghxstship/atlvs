module.exports = {
  rules: {
    // Prevent hardcoded spacing values
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/\\b(p|m|gap|space)-(x|y)?-?[0-9]+\\b/]',
        message: 'Use semantic spacing tokens (xs, sm, md, lg, xl, 2xl, 3xl) instead of numeric values'
      },
      {
        selector: 'Literal[value=/\\b(text|bg|border)-(gray|red|blue|green|yellow|purple|pink|indigo)-[0-9]+\\b/]',
        message: 'Use semantic color tokens (primary, secondary, muted, destructive, success, warning) instead of color-number combinations'
      },
      {
        selector: 'Literal[value=/\\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\\b/]',
        message: 'Use semantic typography tokens (text-size-xs, text-size-sm, etc.) instead of Tailwind defaults'
      },
      {
        selector: 'Literal[value=/\\bfont-(thin|light|normal|medium|semibold|bold|extrabold)\\b/]',
        message: 'Use semantic font weight tokens (font-weight-medium, font-weight-bold, etc.) instead of Tailwind defaults'
      },
      {
        selector: 'Literal[value=/\\bshadow-(sm|md|lg|xl|2xl)\\b/]',
        message: 'Use semantic shadow tokens (shadow-elevation-sm, shadow-elevation-md, etc.) instead of Tailwind defaults'
      },
      {
        selector: 'Literal[value=/\\brounded-(sm|md|lg|xl|2xl|3xl)\\b/]',
        message: 'Use semantic radius tokens (rounded-radius-sm, rounded-radius-md, etc.) instead of Tailwind defaults'
      },
      {
        selector: 'Literal[value=/\\bduration-[0-9]+\\b/]',
        message: 'Use semantic duration tokens (duration-fast, duration-normal, duration-slow) instead of numeric values'
      },
      {
        selector: 'Literal[value=/#[0-9a-fA-F]{3,8}/]',
        message: 'Use CSS variables for colors instead of hex values'
      },
      {
        selector: 'Literal[value=/rgb\\(|rgba\\(/]',
        message: 'Use CSS variables for colors instead of RGB/RGBA values'
      }
    ],
    
    // Enforce consistent import patterns
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ]
  },
  
  overrides: [
    {
      files: ['*.css', '*.scss'],
      rules: {
        // CSS-specific rules
        'value-no-vendor-prefix': true,
        'property-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'media-feature-name-no-vendor-prefix': true,
        'at-rule-no-vendor-prefix': true
      }
    }
  ]
}
