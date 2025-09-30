#!/usr/bin/env node
/*
  Safe Style Migration Script (Option B)
  - Non-destructive: only modifies targeted app/components and utility files
  - Replaces hardcoded colors with semantic CSS variables where possible
  - Replaces common pixel spacing with spacing CSS variables
  - Skips design-system palette files to be migrated separately
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const TARGET_DIRS = [
  path.join(ROOT, 'apps', 'web', 'app'),
  path.join(ROOT, 'apps', 'web', 'src'),
  path.join(ROOT, 'packages', 'ui', 'src'),
];

const SKIP_PATHS = [
  path.join(ROOT, 'apps', 'web', 'lib', 'design-system'),
];

const EXTENSIONS = new Set(['.ts', '.tsx', '.css']);

// Mapping helpers
const replacements = [
  // Pure black/white
  { pattern: /rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/gi, replace: 'hsl(var(--color-foreground))' },
  { pattern: /rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/gi, replace: 'hsl(var(--color-background))' },
  { pattern: /hsl\(\s*0\s+0%\s+0%\s*\)/gi, replace: 'hsl(var(--color-foreground))' },
  { pattern: /hsl\(\s*0\s+0%\s+100%\s*\)/gi, replace: 'hsl(var(--color-background))' },

  // Alpha variants of background/foreground
  {
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([0-1]?(?:\.\d+)?)\s*\)/gi,
    replace: (_, a) => `hsl(var(--color-background) / ${a})`,
  },
  {
    pattern: /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([0-1]?(?:\.\d+)?)\s*\)/gi,
    replace: (_, a) => `hsl(var(--color-foreground) / ${a})`,
  },
  {
    pattern: /rgb\(\s*0\s+0\s+0\s*\/\s*([0-9.]+)\s*\)/gi,
    replace: (_, a) => `hsl(var(--color-foreground) / ${a})`,
  },
  {
    pattern: /rgb\(\s*255\s+255\s+255\s*\/\s*([0-9.]+)\s*\)/gi,
    replace: (_, a) => `hsl(var(--color-background) / ${a})`,
  },

  // Semantic hues (map to central semantic var without shade specificity)
  { pattern: /hsl\(\s*142\s+76%\s+\d+%\s*\)/gi, replace: 'hsl(var(--color-success))' },
  { pattern: /hsl\(\s*38\s+92%\s+\d+%\s*\)/gi, replace: 'hsl(var(--color-warning))' },
  { pattern: /hsl\(\s*0\s+84%\s+\d+%\s*\)/gi, replace: 'hsl(var(--color-destructive))' },
  { pattern: /hsl\(\s*199\s+89%\s+\d+%\s*\)/gi, replace: 'hsl(var(--color-info))' },

  // Transparent alias
  { pattern: /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/gi, replace: 'transparent' },

  // Map specific known rgba colors to semantic tokens with alpha
  { pattern: /rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*([0-1]?(?:\.\d+)?)\s*\)/gi, replace: (_, a) => `hsl(var(--color-primary) / ${a})` },
  { pattern: /rgba\(\s*34\s*,\s*197\s*,\s*94\s*,\s*([0-1]?(?:\.\d+)?)\s*\)/gi, replace: (_, a) => `hsl(var(--color-success) / ${a})` },
  { pattern: /rgba\(\s*139\s*,\s*92\s*,\s*246\s*,\s*([0-1]?(?:\.\d+)?)\s*\)/gi, replace: (_, a) => `hsl(var(--color-accent) / ${a})` },

  // Short hex common in marketing pages
  { pattern: /#fea\b/gi, replace: 'hsl(var(--color-warning))' },

  // Common spacing px -> CSS vars (keep conservative)
  { pattern: /(?<![\w-])1px(?![\w-])/g, replace: 'var(--spacing-px)' },
  { pattern: /(?<![\w-])2px(?![\w-])/g, replace: 'var(--spacing-0.5)' },
  { pattern: /(?<![\w-])4px(?![\w-])/g, replace: 'var(--spacing-1)' },
  { pattern: /(?<![\w-])6px(?![\w-])/g, replace: 'var(--spacing-1.5)' },
  { pattern: /(?<![\w-])8px(?![\w-])/g, replace: 'var(--spacing-2)' },
  { pattern: /(?<![\w-])10px(?![\w-])/g, replace: 'var(--spacing-2.5)' },
  { pattern: /(?<![\w-])12px(?![\w-])/g, replace: 'var(--spacing-3)' },
  { pattern: /(?<![\w-])14px(?![\w-])/g, replace: 'var(--spacing-3.5)' },
  { pattern: /(?<![\w-])16px(?![\w-])/g, replace: 'var(--spacing-4)' },
  { pattern: /(?<![\w-])20px(?![\w-])/g, replace: 'var(--spacing-5)' },
  { pattern: /(?<![\w-])24px(?![\w-])/g, replace: 'var(--spacing-6)' },
  { pattern: /(?<![\w-])28px(?![\w-])/g, replace: 'var(--spacing-7)' },
  { pattern: /(?<![\w-])32px(?![\w-])/g, replace: 'var(--spacing-8)' },
  { pattern: /(?<![\w-])36px(?![\w-])/g, replace: 'var(--spacing-9)' },
  { pattern: /(?<![\w-])40px(?![\w-])/g, replace: 'var(--spacing-10)' },
  { pattern: /(?<![\w-])44px(?![\w-])/g, replace: 'var(--spacing-11)' },
  { pattern: /(?<![\w-])48px(?![\w-])/g, replace: 'var(--spacing-12)' },
  { pattern: /(?<![\w-])56px(?![\w-])/g, replace: 'var(--spacing-14)' },
  { pattern: /(?<![\w-])64px(?![\w-])/g, replace: 'var(--spacing-16)' },
  { pattern: /(?<![\w-])80px(?![\w-])/g, replace: 'var(--spacing-20)' },
  { pattern: /(?<![\w-])96px(?![\w-])/g, replace: 'var(--spacing-24)' },
];

function shouldSkip(filePath) {
  return SKIP_PATHS.some((p) => filePath.startsWith(p));
}

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.has(ext)) return 0;
  if (shouldSkip(filePath)) return 0;

  const original = fs.readFileSync(filePath, 'utf8');
  let content = original;

  for (const r of replacements) {
    if (typeof r.replace === 'function') {
      content = content.replace(r.pattern, r.replace);
    } else {
      content = content.replace(r.pattern, r.replace);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${path.relative(ROOT, filePath)}`);
    return 1;
  }
  return 0;
}

function walk(dir) {
  let changed = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (shouldSkip(full)) continue;
    if (e.isDirectory()) {
      changed += walk(full);
    } else {
      changed += processFile(full);
    }
  }
  return changed;
}

(function main() {
  let total = 0;
  for (const d of TARGET_DIRS) {
    if (fs.existsSync(d)) {
      total += walk(d);
    }
  }
  console.log(`\n📊 Safe style migration completed. Files updated: ${total}`);
})();
