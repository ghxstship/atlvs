// Local ESLint plugin: zero-tolerance rules
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
            if (src.includes('@ghxstship/ui/legacy') || src.includes('styled-components') || /\/legacy(\b|\//).test(src)) {
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
  },
};
