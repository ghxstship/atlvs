#!/usr/bin/env tsx
/**
 * Design Token Validation Script
 * Ensures all components use semantic tokens instead of hardcoded values
 * 
 * @package @ghxstship/ui
 * @version 2.0.0 (2030 Standard)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface TokenViolation {
  file: string;
  line: number;
  code: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border';
  severity: 'error' | 'warning';
  suggestion: string;
}

// Patterns to detect hardcoded values
const HARDCODED_PATTERNS = [
  {
    pattern: /:\s*#[0-9a-fA-F]{3,8}(?![}])/g,
    type: 'color' as const,
    severity: 'error' as const,
    message: 'Hardcoded hex color detected',
    suggestion: 'Use hsl(var(--color-*)) or Tailwind color classes'
  },
  {
    pattern: /:\s*rgb\([^)]+\)/g,
    type: 'color' as const,
    severity: 'error' as const,
    message: 'Hardcoded RGB color detected',
    suggestion: 'Use hsl(var(--color-*)) or Tailwind color classes'
  },
  {
    pattern: /:\s*rgba\([^)]+\)/g,
    type: 'color' as const,
    severity: 'warning' as const,
    message: 'Hardcoded RGBA color detected',
    suggestion: 'Use hsl(var(--color-*) / opacity) or Tailwind color classes'
  },
  {
    pattern: /:\s*\d+px(?!\s*\/)/g,
    type: 'spacing' as const,
    severity: 'error' as const,
    message: 'Hardcoded pixel value detected',
    suggestion: 'Use var(--spacing-*) or Tailwind spacing classes'
  },
  {
    pattern: /font-size:\s*\d+px/g,
    type: 'typography' as const,
    severity: 'error' as const,
    message: 'Hardcoded font size detected',
    suggestion: 'Use var(--font-size-*) or Tailwind text-* classes'
  },
  {
    pattern: /box-shadow:\s*[^;]+(?!var\()/g,
    type: 'shadow' as const,
    severity: 'warning' as const,
    message: 'Hardcoded shadow detected',
    suggestion: 'Use var(--shadow-*) or Tailwind shadow-* classes'
  }
];

// Allowed exceptions (for valid use cases)
const ALLOWED_EXCEPTIONS = [
  /data:image/, // Base64 images
  /url\(/, // URL references
  /\.sr-only/, // Accessibility classes
  /@media/, // Media queries
  /keyframes/, // Animations
  /transform/, // Transforms are OK with px
  /translate/, // Translations are OK with px
  /@tailwind/, // Tailwind directives
  /--[\w-]+:/, // CSS variable definitions
  /opacity:\s*[0-9.]+/, // Opacity values are OK
  /z-index:\s*\d+/, // Z-index numbers are OK
  /line-height:\s*[0-9.]+/, // Unitless line-height is OK
];

function isAllowedException(line: string): boolean {
  return ALLOWED_EXCEPTIONS.some(pattern => pattern.test(line));
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build', '.turbo'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.match(/\.(css|scss|tsx|ts)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function validateFile(filePath: string): TokenViolation[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: TokenViolation[] = [];

  lines.forEach((line, index) => {
    // Skip if line is an allowed exception
    if (isAllowedException(line)) {
      return;
    }

    HARDCODED_PATTERNS.forEach(({ pattern, type, severity, message, suggestion }) => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        violations.push({
          file: filePath,
          line: index + 1,
          code: line.trim(),
          type,
          severity,
          suggestion
        });
      }
    });
  });

  return violations;
}

function main() {
  const rootDir = process.cwd();
  const srcDir = join(rootDir, 'src');

  console.log('🔍 Validating design tokens...\n');
  console.log(`📂 Scanning: ${relative(rootDir, srcDir)}\n`);

  const files = getAllFiles(srcDir);
  let totalErrors = 0;
  let totalWarnings = 0;

  const violationsByFile = new Map<string, TokenViolation[]>();

  files.forEach(file => {
    const violations = validateFile(file);
    if (violations.length > 0) {
      violationsByFile.set(file, violations);

      violations.forEach(v => {
        if (v.severity === 'error') totalErrors++;
        else totalWarnings++;
      });
    }
  });

  // Print violations grouped by file
  if (violationsByFile.size > 0) {
    console.log('⚠️  Design Token Violations Found:\n');

    violationsByFile.forEach((violations, file) => {
      const relativePath = relative(rootDir, file);
      console.log(`  📄 ${relativePath}`);

      violations.forEach(v => {
        const icon = v.severity === 'error' ? '❌' : '⚠️ ';
        console.log(`    ${icon} Line ${v.line} [${v.type}]`);
        console.log(`       ${v.code}`);
        console.log(`       💡 ${v.suggestion}\n`);
      });
    });
  }

  console.log('='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files with violations: ${violationsByFile.size}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n❌ FAILED: Design token violations detected');
    console.log('📖 See DESIGN_TOKENS.md for token usage guidelines');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  WARNING: Some hardcoded values should be replaced with tokens');
    console.log('📖 See DESIGN_TOKENS.md for best practices');
    process.exit(0);
  } else {
    console.log('\n✅ SUCCESS: All values use semantic design tokens');
    process.exit(0);
  }
}

main();
