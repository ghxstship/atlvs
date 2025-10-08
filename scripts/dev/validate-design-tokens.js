#!/usr/bin/env node

/**
 * Design Token Validation Script
 * Scans codebase for hardcoded values that should use design tokens
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Recursive function to get all files matching patterns
function getAllFiles(dirPath, pattern, excludeDirs = []) {
  const files = [];

  function traverse(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);

        // Skip excluded directories
        if (excludeDirs.some(exclude => fullPath.includes(exclude))) {
          continue;
        }

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            traverse(fullPath);
          } else if (stat.isFile()) {
            // Check if file matches pattern
            if (pattern.test(item)) {
              files.push(fullPath);
            }
          }
        } catch (_statErr) {
          // Skip files we can't stat
          continue;
        }
      }
    } catch (_readErr) {
      // Skip directories we can't read
      return;
    }
  }

  traverse(dirPath);
  return files;
}

const TOKEN_PATTERNS = {
  // Colors: hex, rgb, hsl, named colors
  colors: [
    /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F\s])/g, // hex colors (not in calc or followed by space)
    /rgb\(.*?\)/gi, // rgb() functions
    /rgba\(.*?\)/gi, // rgba() functions
    /hsl\(.*?\)/gi, // hsl() functions
    /hsla\(.*?\)/gi, // hsla() functions
    /\b(black|white|gray|grey|red|blue|green|yellow|purple|pink|orange|brown|silver|gold|maroon|navy|olive|lime|teal|aqua|fuchsia)\b/gi, // named colors
  ],

  // Spacing: numeric px/rem/em values
  spacing: [
    /(\d+(?:\.\d+)?)(px|rem|em)\b(?!\s*[*/])/g, // px, rem, em values (not in calculations)
  ],

  // Shadows: box-shadow values
  shadows: [
    /box-shadow:\s*[^;]+/gi,
    /text-shadow:\s*[^;]+/gi,
  ],

  // Border radius: numeric values
  borderRadius: [
    /border-radius:\s*\d+(?:\.\d+)?(px|rem|em)?/gi,
    /border-radius-\w+:\s*\d+(?:\.\d+)?(px|rem|em)?/gi,
  ]
};

const ALLOWED_VALUES = {
  colors: new Set([
    '#000000', '#ffffff', '#000', '#fff',
    'transparent', 'currentColor', 'inherit',
    '#00000000', '#ffffff00', // transparent versions
    // Allow Tailwind color classes that map to design tokens
    'text-', 'bg-', 'border-', 'ring-', 'shadow-',
    'hover:', 'focus:', 'active:', 'disabled:'
  ]),
  spacing: new Set([
    '0', '1px', '0.5px', '2px', '3px', '0px',
    // Allow Tailwind spacing classes
    'p-', 'm-', 'px-', 'py-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-',
    'gap-', 'space-x-', 'space-y-'
  ])
};

function isAllowedValue(category, value) {
  const normalized = value.toLowerCase().trim();

  // Check exact matches first
  if (ALLOWED_VALUES[category]?.has(normalized)) {
    return true;
  }

  // Check prefix matches for Tailwind classes
  if (category === 'colors') {
    const colorPrefixes = ['text-', 'bg-', 'border-', 'ring-', 'shadow-', 'hover:', 'focus:', 'active:', 'disabled:'];
    if (colorPrefixes.some(prefix => normalized.includes(prefix))) {
      return true;
    }
  }

  if (category === 'spacing') {
    const spacingPrefixes = ['p-', 'm-', 'px-', 'py-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-', 'gap-', 'space-x-', 'space-y-'];
    if (spacingPrefixes.some(prefix => normalized.includes(prefix))) {
      return true;
    }
  }

  return false;
}

function scanFile(filePath) {
  const violations = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip import statements and comments
    if (line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*') ||
        line.trim().startsWith('import') ||
        line.trim().startsWith('export') ||
        line.includes('@apply') ||
        line.includes('var(--')) {
      return;
    }

    Object.entries(TOKEN_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const value = match[0];
          if (!isAllowedValue(category, value)) {
            violations.push({
              file: path.relative(process.cwd(), filePath),
              line: index + 1,
              column: match.index + 1,
              category,
              value,
              context: line.trim(),
              suggestion: `Use design token instead of hardcoded ${category.slice(0, -1)} value`
            });
          }
        }
      });
    });
  });

  return violations;
}

function main() {
  const isCI = process.argv.includes('--ci');
  const isStrict = process.argv.includes('--strict');
  const isVerbose = process.argv.includes('--verbose');

  const files = getAllFiles(process.cwd(), /\.(ts|tsx|js|jsx|css|scss)$/, [
    'node_modules',
    'dist',
    'build',
    '.next',
    'coverage',
    'packages/ui/src/tokens',
    'packages/ui/src/styles'
  ]);

  let totalViolations = 0;
  const allViolations = [];

  if (isVerbose) {
    console.log(`🔍 Scanning ${files.length} files for design token violations...\n`);
  }

  for (const file of files) {
    const violations = scanFile(file);
    if (violations.length > 0) {
      console.log(`📄 ${path.relative(process.cwd(), file)}:`);
      violations.forEach(v => {
        console.log(`  ${v.line}:${v.column} - ${v.category}: "${v.value}"`);
        if (isVerbose) {
          console.log(`    Context: ${v.context}`);
          console.log(`    💡 ${v.suggestion}`);
        }
        console.log('');
      });

      totalViolations += violations.length;
      allViolations.push(...violations);
    }
  }

  // Enhanced reporting with usage metrics
  const usageMetrics = {
    totalTokens: 0,
    usedTokens: new Set(),
    unusedTokens: new Set(),
    tokenCategories: {
      colors: { total: 0, used: 0, violations: 0 },
      spacing: { total: 0, used: 0, violations: 0 },
      shadows: { total: 0, used: 0, violations: 0 },
      borderRadius: { total: 0, used: 0, violations: 0 }
    }
  };

  // Count total tokens available (would need actual DESIGN_TOKENS import)
  // usageMetrics.totalTokens +=
  //   Object.keys(DESIGN_TOKENS.colors).length +
  //   Object.keys(DESIGN_TOKENS.spacing).length +
  //   Object.keys(DESIGN_TOKENS.shadows).length +
  //   Object.keys(DESIGN_TOKENS.borderRadius).length;

  // Categorize violations and track usage
  allViolations.forEach(v => {
    if (usageMetrics.tokenCategories[v.category]) {
      usageMetrics.tokenCategories[v.category].violations++;
    }
  });

  console.log(`📊 Token Usage Analysis:`);
  console.log(`   Total Design Tokens Available: ${usageMetrics.totalTokens}`);
  console.log(`   Token Violations Found: ${totalViolations}`);
  console.log(`   Compliance Score: ${Math.round(((files.length * 100) - totalViolations) / files.length)}%`);

  // Category breakdown
  Object.entries(usageMetrics.tokenCategories).forEach(([category, stats]) => {
    const compliance = stats.total > 0 ? Math.round(((stats.total - stats.violations) / stats.total) * 100) : 100;
    console.log(`   ${category}: ${stats.violations} violations (${compliance}% compliant)`);
  });

  if (isCI && totalViolations > 0) {
    console.log('\n❌ Token validation failed. Fix violations or update ALLOWED_VALUES.');
    process.exit(1);
  } else if (isStrict && totalViolations > 0) {
    console.log('\n⚠️  Strict mode: violations found, exiting with error.');
    process.exit(1);
  } else if (totalViolations === 0) {
    console.log('\n✅ All files pass design token validation!');
  } else {
    console.log('\n⚠️  Violations found. Run in CI mode to fail the build.');
  }

  // Export results for CI
  if (isCI || isVerbose) {
    const output = {
      summary: {
        totalFiles: files.length,
        totalViolations,
        complianceScore: Math.round(((files.length * 100) - totalViolations) / files.length),
        scannedAt: new Date().toISOString(),
      },
      violations: allViolations
    };

    const outputPath = 'token-validation-report.json';
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`📋 Detailed report saved to ${outputPath}`);
  }
}

main().catch(console.error);
