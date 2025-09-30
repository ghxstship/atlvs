#!/usr/bin/env node

/**
 * Design Token Validation Script
 * Zero Tolerance validation for hardcoded colors and spacing
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns for hardcoded values (case insensitive)
const HARDCODED_COLOR_PATTERNS = [
  // Hex colors
  /#[0-9a-fA-F]{3,8}\b/g,
  // RGB/RGBA
  /\brgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[0-9.]+)?\s*\)/g,
  // HSL/HSLA
  /\bhsl\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?%\s*,\s*\d+(?:\.\d+)?%(?:\s*,\s*[0-9.]+)?\s*\)/g,
  // Named colors (excluding CSS keywords that might be semantic)
  /\b(black|white|red|green|blue|yellow|purple|orange|pink|gray|grey|brown|cyan|magenta|lime|maroon|navy|olive|silver|teal)\b/gi,
];

const HARDCODED_SPACING_PATTERNS = [
  // Pixel values in styles
  /\b\d+px\b/g,
  // REM values (allow 0rem but flag others)
  /\b(?!0rem\b)\d*\.?\d+rem\b/g,
  // EM values
  /\b\d*\.?\d+em\b/g,
  // VH/VW units
  /\b\d*\.?\d+(vh|vw|vmin|vmax)\b/g,
];

// Files to exclude from validation
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  'packages/ui/src/styles/unified-design-system.css', // This is our token source
  'packages/ui/src/styles.css', // Contains token definitions
  'packages/config/tailwind-preset.ts', // Contains token mappings
];

// Allowed hardcoded values (semantic or necessary)
const ALLOWED_HARDCODED = [
  // CSS reset/normalize values
  '0px', '0rem', '0em', '1px', '2px', '3px', '9999px',
  // Common border values
  '1px solid', '2px solid',
  // Transform values
  'translate(', 'scale(', 'rotate(',
  // Box shadow values
  '0 0 0', 'inset',
  // Z-index values (we have semantic ones)
  '0', '1', '2', '3', '4', '5',
  // Opacity values
  '0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1',
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern =>
    filePath.includes(pattern) ||
    path.basename(filePath).startsWith('.')
  );
}

function isAllowedHardcoded(value) {
  return ALLOWED_HARDCODED.some(allowed =>
    value.includes(allowed) || allowed.includes(value)
  );
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];

    // Check for hardcoded colors
    HARDCODED_COLOR_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const value = match[0];
        if (!isAllowedHardcoded(value)) {
          violations.push({
            type: 'color',
            value,
            line: content.substring(0, match.index).split('\n').length,
            file: filePath,
          });
        }
      }
    });

    // Check for hardcoded spacing
    HARDCODED_SPACING_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const value = match[0];
        if (!isAllowedHardcoded(value)) {
          violations.push({
            type: 'spacing',
            value,
            line: content.substring(0, match.index).split('\n').length,
            file: filePath,
          });
        }
      }
    });

    return violations;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath) {
  const violations = [];

  function scan(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (shouldExcludeFile(fullPath)) {
        continue;
      }

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (stat.isFile() && /\.(tsx?|jsx?|css|scss|sass)$/.test(item)) {
        violations.push(...scanFile(fullPath));
      }
    }
  }

  scan(dirPath);
  return violations;
}

function main() {
  console.log('🔍 Scanning for hardcoded design token violations...\n');

  const targetDir = process.argv[2] || '.';
  const violations = scanDirectory(targetDir);

  if (violations.length === 0) {
    console.log('✅ Zero Tolerance: No hardcoded design token violations found!');
    process.exit(0);
  }

  console.log(`❌ Found ${violations.length} design token violations:\n`);

  const groupedViolations = violations.reduce((acc, violation) => {
    const key = violation.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(violation);
    return acc;
  }, {});

  Object.entries(groupedViolations).forEach(([type, typeViolations]) => {
    console.log(`🚫 ${type.toUpperCase()} violations (${typeViolations.length}):`);
    typeViolations.forEach(violation => {
      console.log(`  ${violation.file}:${violation.line} - "${violation.value}"`);
    });
    console.log('');
  });

  console.log('💡 Fix these violations by using semantic design tokens:');
  console.log('  - Colors: Use --color-* CSS variables or Tailwind semantic classes');
  console.log('  - Spacing: Use --spacing-* variables or Tailwind spacing scale');
  console.log('  - See packages/ui/src/tokens.ts for available tokens\n');

  console.log('🛑 Zero Tolerance: Build failed due to hardcoded design tokens!');
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanFile, scanDirectory, shouldExcludeFile, isAllowedHardcoded };
