#!/usr/bin/env tsx
/**
 * Import Validation Script
 * Validates that no legacy import patterns exist in the codebase
 * 
 * @package @ghxstship/ui
 * @version 2.0.0 (2030 Standard)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface ValidationResult {
  file: string;
  line: number;
  import: string;
  type: 'error' | 'warning';
  message: string;
}

const LEGACY_PATTERNS = [
  {
    pattern: /@ghxstship\/ui\/atoms\//,
    message: 'Legacy atoms/ import detected',
    type: 'error' as const
  },
  {
    pattern: /@ghxstship\/ui\/unified\//,
    message: 'Legacy unified/ import detected',
    type: 'error' as const
  },
  {
    pattern: /@ghxstship\/ui\/molecules\//,
    message: 'Direct molecules/ import detected',
    type: 'warning' as const
  },
  {
    pattern: /@ghxstship\/ui\/organisms\//,
    message: 'Direct organisms/ import detected',
    type: 'warning' as const
  },
  {
    pattern: /@ghxstship\/ui\/components\/atomic\//,
    message: 'Deep path import detected',
    type: 'error' as const
  },
  {
    pattern: /@ghxstship\/ui\/src\//,
    message: 'Invalid src/ import detected',
    type: 'error' as const
  }
];

const EXCLUDED_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.turbo',
  'coverage'
];

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function validateFile(filePath: string): ValidationResult[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const results: ValidationResult[] = [];

  // Skip validation for internal package files
  if (filePath.includes('/packages/ui/src/')) {
    return results;
  }

  lines.forEach((line, index) => {
    // Check for import statements
    if (line.match(/^\s*import\s+/)) {
      LEGACY_PATTERNS.forEach(({ pattern, message, type }) => {
        if (pattern.test(line)) {
          results.push({
            file: filePath,
            line: index + 1,
            import: line.trim(),
            type,
            message
          });
        }
      });
    }
  });

  return results;
}

function main() {
  const rootDir = process.cwd();
  const targetDirs = process.argv.slice(2);

  if (targetDirs.length === 0) {
    console.log('Usage: tsx validate-imports.ts <directory> [<directory2> ...]');
    console.log('Example: tsx validate-imports.ts apps/web apps/docs');
    process.exit(1);
  }

  console.log('🔍 Validating imports for legacy patterns...\n');

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFiles = 0;

  targetDirs.forEach(dir => {
    const fullPath = join(rootDir, dir);
    console.log(`📂 Scanning: ${dir}`);

    const files = getAllFiles(fullPath);
    totalFiles += files.length;

    files.forEach(file => {
      const results = validateFile(file);

      if (results.length > 0) {
        const relativePath = relative(rootDir, file);
        console.log(`\n  ⚠️  ${relativePath}`);

        results.forEach(result => {
          const icon = result.type === 'error' ? '❌' : '⚠️ ';
          console.log(`    ${icon} Line ${result.line}: ${result.message}`);
          console.log(`       ${result.import}`);

          if (result.type === 'error') {
            totalErrors++;
          } else {
            totalWarnings++;
          }
        });
      }
    });
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));
  console.log(`Files scanned: ${totalFiles}`);
  console.log(`Errors found:  ${totalErrors}`);
  console.log(`Warnings found: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n❌ FAILED: Legacy imports detected');
    console.log('📖 See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md for migration instructions');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  WARNING: Some imports should be updated');
    console.log('📖 See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md for best practices');
    process.exit(0);
  } else {
    console.log('\n✅ SUCCESS: All imports are using canonical patterns');
    process.exit(0);
  }
}

main();
