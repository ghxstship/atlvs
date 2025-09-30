/**
 * ESLint Configuration for Design Token Enforcement
 * Prevents hardcoded colors, spacing, and other design values
 * 
 * Add to your main .eslintrc.js:
 * {
 *   "extends": ["./.eslintrc.tokens.js"]
 * }
 */

module.exports = {
  rules: {
    // Prevent hardcoded hex colors
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
        message: '❌ Hardcoded hex colors are not allowed. Use design tokens from @ghxstship/ui/tokens instead. Example: DESIGN_TOKENS.colors.brand.primary[500]',
      },
      {
        selector: 'Literal[value=/^rgb\\(/]',
        message: '❌ Hardcoded RGB colors are not allowed. Use design tokens instead.',
      },
      {
        selector: 'Literal[value=/^hsl\\(/]',
        message: '❌ Hardcoded HSL colors should come from design tokens. Use DESIGN_TOKENS.colors.*',
      },
    ],
    
    // Prevent hardcoded Tailwind spacing classes (use semantic classes instead)
    'no-restricted-properties': [
      'error',
      {
        object: 'className',
        property: '/^(p|m|gap|space)-(0|1|2|3|4|5|6|8|10|12|16|20|24)$/',
        message: '❌ Hardcoded Tailwind spacing classes. Use semantic spacing: p-xs, p-sm, p-md, p-lg, p-xl, p-2xl',
      },
    ],
  },
  
  overrides: [
    {
      // Apply stricter rules to component files
      files: ['**/*.tsx', '**/*.jsx'],
      rules: {
        'no-inline-styles': [
          'warn',
          {
            message: '⚠️  Inline styles detected. Consider using Tailwind classes with design tokens or styled-components.',
          },
        ],
      },
    },
    {
      // Token definition files are exempt
      files: [
        '**/tokens/**/*.ts',
        '**/tailwind.config*.ts',
        '**/*.config.ts',
        '**/generated-tokens.css',
      ],
      rules: {
        'no-restricted-syntax': 'off',
        'no-restricted-properties': 'off',
      },
    },
  ],
};

// Custom ESLint rule: no-hardcoded-colors
module.exports.rules['@ghxstship/no-hardcoded-colors'] = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent hardcoded color values',
      category: 'Design System',
      recommended: true,
    },
    messages: {
      hardcodedColor: '❌ Hardcoded color "{{value}}". Use design tokens: DESIGN_TOKENS.colors.* or CSS variables: var(--color-*)',
      hardcodedSpacing: '❌ Hardcoded spacing "{{value}}". Use design tokens: DESIGN_TOKENS.spacing.* or semantic classes: p-sm, m-md, gap-lg',
      hardcodedBorder: '❌ Hardcoded border radius "{{value}}". Use design tokens: DESIGN_TOKENS.borderRadius.* or classes: rounded-sm, rounded-md',
      hardcodedShadow: '❌ Hardcoded shadow "{{value}}". Use design tokens: DESIGN_TOKENS.shadows.* or classes: shadow-sm, shadow-md',
    },
    fixable: 'code',
  },
  
  create(context) {
    const colorPattern = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/;
    const spacingPattern = /^\d+(px|rem|em)$/;
    const borderRadiusPattern = /^\d+(px|rem)$/;
    const shadowPattern = /^\d+px\s+\d+px/;
    
    return {
      // Check JSX attributes
      JSXAttribute(node) {
        if (node.name.name === 'style' && node.value && node.value.type === 'JSXExpressionContainer') {
          const properties = node.value.expression.properties || [];
          
          for (const prop of properties) {
            if (prop.value && prop.value.type === 'Literal') {
              const value = prop.value.value;
              
              if (typeof value === 'string') {
                // Check for colors
                if (['color', 'backgroundColor', 'borderColor'].includes(prop.key.name)) {
                  if (colorPattern.test(value)) {
                    context.report({
                      node: prop.value,
                      messageId: 'hardcodedColor',
                      data: { value },
                    });
                  }
                }
                
                // Check for spacing
                if (['padding', 'margin', 'gap'].includes(prop.key.name)) {
                  if (spacingPattern.test(value)) {
                    context.report({
                      node: prop.value,
                      messageId: 'hardcodedSpacing',
                      data: { value },
                    });
                  }
                }
                
                // Check for border radius
                if (prop.key.name === 'borderRadius' && borderRadiusPattern.test(value)) {
                  context.report({
                    node: prop.value,
                    messageId: 'hardcodedBorder',
                    data: { value },
                  });
                }
                
                // Check for shadows
                if (prop.key.name === 'boxShadow' && shadowPattern.test(value)) {
                  context.report({
                    node: prop.value,
                    messageId: 'hardcodedShadow',
                    data: { value },
                  });
                }
              }
            }
          }
        }
        
        // Check className for hardcoded Tailwind values
        if (node.name.name === 'className' && node.value) {
          const classes = node.value.value || '';
          const hardcodedSpacingClasses = classes.match(/\b(p|m|gap|space)-(0|1|2|3|4|5|6|8|10|12|16|20|24)\b/g);
          
          if (hardcodedSpacingClasses) {
            context.report({
              node: node.value,
              message: `❌ Hardcoded Tailwind spacing: ${hardcodedSpacingClasses.join(', ')}. Use semantic classes: p-xs, p-sm, p-md, p-lg`,
            });
          }
        }
      },
      
      // Check template literals
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          const value = quasi.value.raw;
          
          if (colorPattern.test(value)) {
            context.report({
              node: quasi,
              messageId: 'hardcodedColor',
              data: { value: value.substring(0, 20) },
            });
          }
        }
      },
    };
  },
};
