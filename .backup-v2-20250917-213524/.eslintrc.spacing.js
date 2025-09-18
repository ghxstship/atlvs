// ESLint Spacing Enforcement Rules for GHXSTSHIP
// Prevents hardcoded Tailwind spacing classes in favor of design tokens

module.exports = {
  plugins: ['@typescript-eslint'],
  rules: {
    // Disallow hardcoded Tailwind spacing classes
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/\\bp-(1|2|3|4|5|6|8|10|12|16)\\b/]',
        message: 'Use semantic spacing tokens (p-xs, p-sm, p-md, p-lg, p-xl, p-2xl, p-3xl) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\bm-(1|2|3|4|5|6|8|10|12|16)\\b/]',
        message: 'Use semantic spacing tokens (m-xs, m-sm, m-md, m-lg, m-xl, m-2xl, m-3xl) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\bgap-(1|2|3|4|5|6|8|10|12|16)\\b/]',
        message: 'Use semantic spacing tokens (gap-xs, gap-sm, gap-md, gap-lg, gap-xl) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\bpx-(1|2|3|4|5|6|8|10|12|16)\\b/]',
        message: 'Use semantic spacing tokens (px-xs, px-sm, px-md, px-lg, px-xl) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\bpy-(1|2|3|4|5|6|8|10|12|16)\\b/]',
        message: 'Use semantic spacing tokens (py-xs, py-sm, py-md, py-lg, py-xl) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\bmx-(1|2|3|4|5|6|8|10|12|16)\\b/]',
        message: 'Use semantic spacing tokens (mx-xs, mx-sm, mx-md, mx-lg, mx-xl) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\bmy-(1|2|3|4|5|6|8|10|12|16)\\b/]',
        message: 'Use semantic spacing tokens (my-xs, my-sm, my-md, my-lg, my-xl) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\bspace-x-(1|2|3|4|5|6|8)\\b/]',
        message: 'Use semantic spacing tokens (space-x-xs, space-x-sm, space-x-md) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\bspace-y-(1|2|3|4|5|6|8)\\b/]',
        message: 'Use semantic spacing tokens (space-y-xs, space-y-sm, space-y-md) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\b(pt|pb|pl|pr)-(1|2|3|4|5|6|8|10|12|16)\\b/]',
        message: 'Use semantic spacing tokens (pt-xs, pb-sm, pl-md, pr-lg, etc.) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\b(mt|mb|ml|mr)-(1|2|3|4|5|6|8|10|12|16)\\b/]',
        message: 'Use semantic spacing tokens (mt-xs, mb-sm, ml-md, mr-lg, etc.) instead of hardcoded values'
      },
      {
        selector: 'Literal[value=/\\bgap-(x|y)-(1|2|3|4|5|6|8)\\b/]',
        message: 'Use semantic spacing tokens (gap-x-xs, gap-y-sm, etc.) instead of hardcoded values'
      }
    ]
  },
  overrides: [
    {
      files: ['*.tsx', '*.ts'],
      rules: {
        // Additional TypeScript-specific spacing rules
        '@typescript-eslint/no-unused-vars': ['error', { 
          varsIgnorePattern: '^(p|m|gap|px|py|mx|my|mt|mb|ml|mr|pt|pb|pl|pr)-(xs|sm|md|lg|xl|2xl|3xl)$' 
        }]
      }
    }
  ]
};
