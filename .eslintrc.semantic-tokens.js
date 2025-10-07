module.exports = {
  rules: {},
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      rules: {
        // Placeholder for custom semantic token rules
        // These would be implemented as ESLint plugins
      },
    },
  ],
};

// Custom rule definitions (for reference, not active)
const customRules = {
  'no-hardcoded-values': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Enforce semantic token usage instead of hardcoded values',
        category: 'Design System',
        recommended: true,
      },
      fixable: 'code',
      schema: [
        {
          type: 'object',
          properties: {
            allowedPatterns: {
              type: 'array',
              items: { type: 'string' },
            },
            tokenPatterns: {
              type: 'object',
              properties: {
                spacing: { type: 'string' },
                colors: { type: 'string' },
                typography: { type: 'string' },
                animation: { type: 'string' },
              },
            },
          },
          additionalProperties: false,
        },
      ],
    },
    create(context) {
        const options = context.options[0] || {};
        const allowedPatterns = options.allowedPatterns || [];
        const tokenPatterns = options.tokenPatterns || {
          spacing: 'var\\(--spacing-[\\w-]+\\)',
          colors: 'var\\(--color-[\\w-]+\\)',
          typography: 'var\\(--font-[\\w-]+\\)',
          animation: 'var\\(--animation-[\\w-]+\\)',
        };

        // Hardcoded value patterns to detect
        const hardcodedPatterns = {
          spacing: /\b(?:px-|py-|pt-|pb-|pl-|pr-|m-|mx-|my-|mt-|mb-|ml-|mr-|p-|gap-|space-[xy]-|w-|h-|min-w-|min-h-|max-w-|max-h-)\d+\b/g,
          colors: /#[0-9a-fA-F]{3,8}\b|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g,
          typography: /\b(?:text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|leading-(?:none|tight|snug|normal|relaxed|loose)|tracking-(?:tighter|tight|normal|wide|wider|widest))\b/g,
          animation: /\b(?:duration-|delay-|ease-)\d+\b|transition-(?:none|all|colors|opacity|shadow|transform)\b/g,
        };

        function checkStringLiteral(node) {
          const value = node.value;
          if (typeof value !== 'string') return;

          // Skip if matches allowed patterns
          if (allowedPatterns.some(pattern => new RegExp(pattern).test(value))) {
            return;
          }

          // Check for hardcoded values
          Object.entries(hardcodedPatterns).forEach(([category, pattern]) => {
            const matches = value.match(pattern);
            if (matches) {
              matches.forEach(match => {
                context.report({
                  node,
                  message: `Avoid hardcoded ${category} value "${match}". Use semantic tokens instead (e.g., ${tokenPatterns[category]}).`,
                  fix(fixer) {
                    // Provide basic auto-fix suggestions
                    const suggestions = getSuggestions(match, category);
                    if (suggestions.length > 0) {
                      return fixer.replaceText(node, `"${value.replace(match, suggestions[0])}"`);
                    }
                    return null;
                  },
                });
              });
            }
          });
        }

        function getSuggestions(hardcodedValue, category) {
          const suggestions = [];
          
          switch (category) {
            case 'spacing':
              // Extract numeric value and suggest semantic token
              const numMatch = hardcodedValue.match(/\d+/);
              if (numMatch) {
                const num = numMatch[0];
                suggestions.push(`var(--spacing-${num})`);
              }
              break;
            case 'typography':
              // Map common typography classes to semantic tokens
              const typoMap = {
                'text-xs': 'var(--font-size-xs)',
                'text-sm': 'var(--font-size-sm)',
                'text-base': 'var(--font-size-base)',
                'text-lg': 'var(--font-size-lg)',
                'text-xl': 'var(--font-size-xl)',
                'font-medium': 'var(--font-weight-medium)',
                'font-semibold': 'var(--font-weight-semibold)',
                'font-bold': 'var(--font-weight-bold)',
                'leading-none': 'var(--line-height-none)',
                'leading-tight': 'var(--line-height-tight)',
                'tracking-tight': 'var(--letter-spacing-tight)',
              };
              if (typoMap[hardcodedValue]) {
                suggestions.push(typoMap[hardcodedValue]);
              }
              break;
            case 'colors':
              // Suggest using semantic color tokens
              suggestions.push('var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)');
              break;
            case 'animation':
              // Suggest semantic animation tokens
              suggestions.push('var(--animation-duration-fast)', 'var(--animation-duration-normal)');
              break;
          }
          
          return suggestions;
        }

        return {
          Literal: checkStringLiteral,
          TemplateLiteral(node) {
            node.quasis.forEach(quasi => {
              if (quasi.value && quasi.value.raw) {
                checkStringLiteral({ value: quasi.value.raw, ...quasi });
              }
            });
          },
        };
      },
    },

    // Rule to enforce consistent token naming
    'consistent-token-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent semantic token naming conventions',
          category: 'Design System',
          recommended: true,
        },
        schema: [],
      },
      create(context) {
        const validTokenPatterns = [
          /^--spacing-\d+(\.\d+)?$/,
          /^--color-[a-z]+(-[a-z]+)*$/,
          /^--font-(size|weight|family)-[a-z]+(-[a-z]+)*$/,
          /^--line-height-[a-z]+(-[a-z]+)*$/,
          /^--letter-spacing-[a-z]+(-[a-z]+)*$/,
          /^--animation-(duration|timing|delay)-[a-z]+(-[a-z]+)*$/,
          /^--border-radius-[a-z]+(-[a-z]+)*$/,
          /^--shadow-[a-z]+(-[a-z]+)*$/,
        ];

        function checkTokenNaming(node) {
          const value = node.value;
          if (typeof value !== 'string') return;

          // Find CSS custom properties
          const tokenMatches = value.match(/var\(--[^)]+\)/g);
          if (tokenMatches) {
            tokenMatches.forEach(token => {
              const tokenName = token.match(/--([^)]+)/)?.[1];
              if (tokenName && !validTokenPatterns.some(pattern => pattern.test(`--${tokenName}`))) {
                context.report({
                  node,
                  message: `Token "${tokenName}" doesn't follow naming conventions. Use patterns like --spacing-*, --color-*, --font-*, etc.`,
                });
              }
            });
          }
        }

        return {
          Literal: checkTokenNaming,
          TemplateLiteral(node) {
            node.quasis.forEach(quasi => {
              if (quasi.value && quasi.value.raw) {
                checkTokenNaming({ value: quasi.value.raw, ...quasi });
              }
            });
          },
        };
      },
    },
  },
};
