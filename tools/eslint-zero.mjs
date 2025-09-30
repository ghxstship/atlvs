// Local ESLint plugin: zero-tolerance rules (ESM)
// Usage in eslint.config.mjs: import zero from './tools/eslint-zero.mjs'

function createStringLiteralVisitor(context, testers) {
  return {
    Literal(node) {
      if (typeof node.value === 'string') {
        const str = node.value;
        for (const tester of testers) {
          const res = tester(str);
          if (res) context.report({ node, message: res });
        }
      }
    },
    TemplateLiteral(node) {
      const full = node.quasis.map(q => q.value.cooked || '').join('/*expr*/');
      for (const tester of testers) {
        const res = tester(full);
        if (res) context.report({ node, message: res });
      }
    },
    JSXAttribute(node) {
      if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
        const str = node.value.value;
        for (const tester of testers) {
          const res = tester(str);
          if (res) context.report({ node, message: res });
        }
      }
    },
  };
}

const allowedColors = new Set(['#000', '#fff', '#ffffff', '#000000', 'rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)']);
const colorRe = /#[0-9a-fA-F]{3,8}|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)|hsla?\([^)]*\)/g;
const pixelsRe = /(?<![\w-])\d+px(?!\]|;?\s*\/\*.*allowed.*\*\/)/g;
const remEmRe = /(?<![\w-])\d*\.?\d+(rem|em)(?!\]|;?\s*\/\*.*allowed.*\*\/)/g;

const tailwindPatterns = {
  spacing: [
    {
      regex: /\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap(?:-x|-y)?|space-(?:x|y))-(?:[0-9]+)\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses numeric spacing. Replace with semantic spacing tokens (p-sm, m-xl, gap-2xl, etc.).`,
    },
  ],
  colors: [
    {
      regex: /\b(text|bg|border|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses palette-number colors. Replace with semantic color tokens (text-primary, bg-surface, etc.).`,
    },
  ],
  typography: [
    {
      regex: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses raw text sizing. Replace with semantic typography tokens (text-size-sm, text-size-2xl, etc.).`,
    },
    {
      regex: /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses raw font weight. Replace with semantic font weight tokens (font-weight-medium, font-weight-bold, etc.).`,
    },
    {
      regex: /\bleading-(none|tight|snug|normal|relaxed|loose)\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses raw line height. Replace with semantic line height tokens.`,
    },
    {
      regex: /\btracking-(tighter|tight|normal|wide|wider|widest)\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses raw letter spacing. Replace with semantic letter spacing tokens.`,
    },
  ],
  radius: [
    {
      regex: /\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses raw border radius. Replace with semantic radius tokens (rounded-radius-sm, rounded-radius-full, etc.).`,
    },
  ],
  shadows: [
    {
      regex: /\bshadow-(sm|md|lg|xl|2xl|inner)\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses raw shadows. Replace with semantic shadow tokens (shadow-elevation-md, etc.).`,
    },
  ],
  animation: [
    {
      regex: /\b(duration|delay)-(?:\d+|\[.*?\])\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses raw timing. Replace with semantic motion tokens (duration-fast, delay-slow, etc.).`,
    },
    {
      regex: /\bease-(linear|in|out|in-out)\b/gi,
      createMessage: (match) =>
        `Tailwind utility "${match}" uses raw easing. Replace with semantic easing tokens.`,
    },
  ],
};

const defaultDesignTokenRules = ['spacing', 'colors', 'typography', 'radius', 'shadows', 'animation'];

const hardcodedValuePatterns = {
  spacing: /\b(?:px-|py-|pt-|pb-|pl-|pr-|p-|mx-|my-|mt-|mb-|ml-|mr-|m-|gap-|space-[xy]-|w-|h-|min-w-|min-h-|max-w-|max-h-)\d+\b/g,
  colors: colorRe,
  typography:
    /\b(?:text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|leading-(?:none|tight|snug|normal|relaxed|loose)|tracking-(?:tighter|tight|normal|wide|wider|widest))\b/g,
  animation: /\b(?:duration-|delay-|ease-)(?:\d+|\w+)\b|\btransition-(?:none|all|colors|opacity|shadow|transform)\b/g,
};

const validTokenPatterns = [
  /^--spacing-[\w-]+$/,
  /^--color-[\w-]+$/,
  /^--font-(?:size|weight|family)-[\w-]+$/,
  /^--line-height-[\w-]+$/,
  /^--letter-spacing-[\w-]+$/,
  /^--animation-(?:duration|timing|delay)-[\w-]+$/,
  /^--border-radius-[\w-]+$/,
  /^--shadow-[\w-]+$/,
];

function normalizeCategoryList(value, fallback = defaultDesignTokenRules) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return fallback;
}

function createTailwindTesters(categories = defaultDesignTokenRules) {
  const normalizedCategories = normalizeCategoryList(categories);
  const activeCategories = (normalizedCategories.length > 0 ? normalizedCategories : defaultDesignTokenRules)
    .filter((category) => tailwindPatterns[category]);

  const testers = activeCategories.flatMap((category) => tailwindPatterns[category]).map((pattern) => {
    return (str) => {
      if (!str) return null;
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(str);
      if (match) {
        return pattern.createMessage(match[0]);
      }
      return null;
    };
  });

  return testers;
}

function createHardcodedValueTesters(options = {}) {
  const allowedPatterns = (options.allowedPatterns || []).map((pattern) => new RegExp(pattern));
  const categories = normalizeCategoryList(options.categories, Object.keys(hardcodedValuePatterns));

  const testers = categories
    .filter((category) => hardcodedValuePatterns[category])
    .map((category) => {
      const regex = hardcodedValuePatterns[category];
      return (value) => {
        if (typeof value !== 'string' || !value) return null;
        if (allowedPatterns.some((pattern) => pattern.test(value))) return null;
        regex.lastIndex = 0;
        const matches = value.match(regex);
        if (matches && matches.length > 0) {
          return `Avoid hardcoded ${category} value "${matches[0]}". Use semantic tokens or CSS variables.`;
        }
        return null;
      };
    });

  return testers;
}

function createTokenNamingTester() {
  return (value) => {
    if (typeof value !== 'string' || !value) return null;
    const tokenMatches = value.match(/var\(--[^)]+\)/g);
    if (!tokenMatches) return null;

    for (const token of tokenMatches) {
      const tokenName = token.match(/--([^)]+)/)?.[1];
      if (!tokenName) continue;
      const isValid = validTokenPatterns.some((pattern) => pattern.test(`--${tokenName}`));
      if (!isValid) {
        return `Token "${tokenName}" does not follow naming conventions. Use patterns like --spacing-*, --color-*, --font-*.`;
      }
    }
    return null;
  };
}

export default {
  rules: {
    'no-hardcoded-colors': {
      meta: { type: 'problem', docs: { description: 'Disallow hardcoded colors; use design tokens' } },
      create(context) {
        const tester = (str) => {
          const matches = str.match(colorRe) || [];
          const invalid = matches.filter(c => !allowedColors.has(c.toLowerCase()));
          if (invalid.length) {
            return `Hardcoded color(s) detected: ${invalid.slice(0, 3).join(', ')}. Use DESIGN_TOKENS or CSS variables.`;
          }
          return null;
        };
        return createStringLiteralVisitor(context, [tester]);
      },
    },
    'no-hardcoded-spacing': {
      meta: { type: 'problem', docs: { description: 'Disallow hardcoded spacing values; use design tokens' } },
      create(context) {
        const tester = (str) => {
          if (!str) return null;
          if ((pixelsRe.test(str) || remEmRe.test(str)) && !/DESIGN_TOKENS|clamp\(/.test(str)) {
            return 'Hardcoded spacing detected (px/rem/em). Use DESIGN_TOKENS.spacing or semantic classes.';
          }
          return null;
        };
        return createStringLiteralVisitor(context, [tester]);
      },
    },
    'no-legacy-imports': {
      meta: { type: 'problem', docs: { description: 'Disallow legacy imports like @ghxstship/ui/legacy or styled-components' } },
      create(context) {
        return {
          ImportDeclaration(node) {
            const src = node.source && node.source.value;
            if (!src || typeof src !== 'string') return;
            if (src.includes('@ghxstship/ui/legacy') || src.includes('styled-components') || /\/legacy(\b|\/)/.test(src)) {
              context.report({ node, message: `Legacy import detected: "${src}"` });
            }
          },
        };
      },
    },
    'consistent-imports': {
      meta: { type: 'problem', docs: { description: 'Enforce consistent import paths (avoid deep relative imports)' } },
      create(context) {
        return {
          ImportDeclaration(node) {
            const src = node.source && node.source.value;
            if (!src || typeof src !== 'string') return;
            // Flag overly deep relatives like ../../..
            if (/^(\.\.\/){2,}/.test(src)) {
              context.report({ node, message: `Avoid deep relative import: "${src}". Prefer package aliases (e.g., @ghxstship/*).` });
            }
          },
        };
      },
    },
    'no-hardcoded-shadows': {
      meta: { type: 'suggestion', docs: { description: 'Discourage hardcoded box-shadow values; use tokenized shadows' } },
      create(context) {
        const tester = (str) => {
          if (!str) return null;
          if (/box-shadow\s*:\s*[^;]*;/i.test(str) && !/var\(--/.test(str)) {
            return 'Hardcoded box-shadow detected. Use DESIGN_TOKENS.shadows or CSS variables.';
          }
          return null;
        };
        return createStringLiteralVisitor(context, [tester]);
      },
    },
    'no-hardcoded-motion': {
      meta: { type: 'suggestion', docs: { description: 'Discourage hardcoded motion/timing values; use tokenized durations/easings' } },
      create(context) {
        const tester = (str) => {
          if (!str) return null;
          // detect raw durations/easings
          if ((/\b\d+(ms|s)\b/.test(str) || /cubic-bezier\(/i.test(str)) && !(/DESIGN_TOKENS|var\(--/.test(str))) {
            return 'Hardcoded motion value detected (duration/easing). Use DESIGN_TOKENS.animation or CSS variables.';
          }
          return null;
        };
        return createStringLiteralVisitor(context, [tester]);
      },
    },
    'no-unsemantic-tailwind': {
      meta: {
        type: 'problem',
        docs: { description: 'Disallow raw Tailwind utility classes that bypass semantic design tokens' },
        schema: [
          {
            type: 'object',
            properties: {
              categories: {
                anyOf: [
                  { type: 'array', items: { type: 'string' } },
                  { type: 'string' },
                ],
              },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const options = context.options[0] || {};
        const testers = createTailwindTesters(options.categories);
        if (testers.length === 0) {
          return {};
        }
        return createStringLiteralVisitor(context, testers);
      },
    },
    'no-hardcoded-values': {
      meta: {
        type: 'problem',
        docs: { description: 'Disallow hardcoded spacing, color, typography, and motion values' },
        schema: [
          {
            type: 'object',
            properties: {
              categories: {
                anyOf: [
                  { type: 'array', items: { type: 'string' } },
                  { type: 'string' },
                ],
              },
              allowedPatterns: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const options = context.options[0] || {};
        const testers = createHardcodedValueTesters(options);
        if (testers.length === 0) {
          return {};
        }
        return createStringLiteralVisitor(context, testers);
      },
    },
    'consistent-token-naming': {
      meta: {
        type: 'suggestion',
        docs: { description: 'Enforce consistent semantic token naming conventions' },
        schema: [],
      },
      create(context) {
        const tester = createTokenNamingTester();
        return createStringLiteralVisitor(context, [tester]);
      },
    },
  },
};
