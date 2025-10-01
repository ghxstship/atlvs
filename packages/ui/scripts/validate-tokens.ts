#!/usr/bin/env tsx
/**
 * Design Token Validation Script
 * Validates that all token usage follows semantic token architecture
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DESIGN_TOKENS, SEMANTIC_TOKENS, COMPONENT_TOKENS } from '../src/tokens/unified-design-tokens';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ValidationResult {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

const results: ValidationResult[] = [];
let filesScanned = 0;
let violationsFound = 0;

// Patterns to detect hardcoded values
const HARDCODED_PATTERNS = {
  hexColor: /#[0-9a-fA-F]{3,8}\b/g,
  rgbColor: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
  rgbaColor: /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
  hslDirect: /hsl\(\s*\d+\s+\d+%\s+\d+%\s*\)/g,
  pixelValue: /(?<![\d.])\d+px\b/g,
  remValue: /(?<![\d.])\d+\.?\d*rem\b/g,
  hardcodedShadow: /box-shadow:\s*\d/g,
};

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.turbo',
  'generated-tokens.css',
  'unified-design-system.css',  // Generated CSS file
  'unified-design-tokens.ts',
  'enhanced-component-tokens.ts',
  'tokens.ts',  // Token definition file
  'tailwind.config',
  '.eslintrc',
  // Design system source files (these define the tokens, so hardcoded values are required)
  '/tokens/',
  '/theme/',
  '/system/',  // System validators and generators
  'theme-generator',
  'theme-validator',
  'theme-adapter',
  'style-validator',
  'syntax-theme',
  'chart-theme',
  'third-party-theme',
  'UIStateValidator',
  'LayoutSystem',
  'SystemConfigUI',
  'DesignSystem.tsx',  // Design system documentation/reference file
  'ColorPicker',  // Color picker needs hardcoded values to display colors
  'DesignTokenValidator',  // Validator that defines example violations for testing
  // Test files that need hardcoded values for testing
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  '.spec.tsx',
  // Storybook and documentation
  '.stories.',
  'storybook',
];

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Get all files recursively
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = readdirSync(dirPath);

  files.forEach(file => {
    const filePath = join(dirPath, file);
    
    if (shouldExclude(filePath)) {
      return;
    }

    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      const ext = extname(filePath);
      if (['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'].includes(ext)) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Validate a single file
 */
function validateFile(filePath: string): void {
  filesScanned++;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      const lineNumber = lineIndex + 1;

      // Check for hardcoded hex colors
      let match;
      while ((match = HARDCODED_PATTERNS.hexColor.exec(line)) !== null) {
        // Allow certain exceptions
        if (line.includes('data:image') || line.includes('currentColor')) {
          continue;
        }
        
        results.push({
          file: filePath,
          line: lineNumber,
          column: match.index + 1,
          message: `Hardcoded hex color "${match[0]}" found. Use semantic color tokens instead (e.g., hsl(var(--color-primary))).`,
          severity: 'error',
          code: 'hardcoded-color',
        });
        violationsFound++;
      }

      // Check for hardcoded RGB/RGBA colors
      HARDCODED_PATTERNS.rgbColor.lastIndex = 0;
      while ((match = HARDCODED_PATTERNS.rgbColor.exec(line)) !== null) {
        results.push({
          file: filePath,
          line: lineNumber,
          column: match.index + 1,
          message: `Hardcoded RGB color "${match[0]}" found. Use semantic color tokens instead.`,
          severity: 'error',
          code: 'hardcoded-color',
        });
        violationsFound++;
      }

      // Check for direct HSL values (not using CSS variables)
      HARDCODED_PATTERNS.hslDirect.lastIndex = 0;
      while ((match = HARDCODED_PATTERNS.hslDirect.exec(line)) !== null) {
        if (!line.includes('var(--')) {
          results.push({
            file: filePath,
            line: lineNumber,
            column: match.index + 1,
            message: `Direct HSL value "${match[0]}" found. Use semantic color tokens (e.g., hsl(var(--color-primary))).`,
            severity: 'error',
            code: 'hardcoded-color',
          });
          violationsFound++;
        }
      }

      // Check for hardcoded pixel values (with exceptions)
      HARDCODED_PATTERNS.pixelValue.lastIndex = 0;
      while ((match = HARDCODED_PATTERNS.pixelValue.exec(line)) !== null) {
        const value = match[0];
        // Allow 0px, 1px, and 100%
        if (value === '0px' || value === '1px' || line.includes('100%')) {
          continue;
        }
        // Allow in media queries
        if (line.includes('@media') || line.includes('min-width') || line.includes('max-width')) {
          continue;
        }
        
        results.push({
          file: filePath,
          line: lineNumber,
          column: match.index + 1,
          message: `Hardcoded pixel value "${value}" found. Use spacing tokens instead (e.g., var(--spacing-4)).`,
          severity: 'warning',
          code: 'hardcoded-spacing',
        });
        violationsFound++;
      }

      // Check for hardcoded rem values
      HARDCODED_PATTERNS.remValue.lastIndex = 0;
      while ((match = HARDCODED_PATTERNS.remValue.exec(line)) !== null) {
        // Allow in media queries
        if (line.includes('@media') || line.includes('clamp')) {
          continue;
        }
        
        results.push({
          file: filePath,
          line: lineNumber,
          column: match.index + 1,
          message: `Hardcoded rem value "${match[0]}" found. Use spacing or typography tokens instead.`,
          severity: 'warning',
          code: 'hardcoded-spacing',
        });
        violationsFound++;
      }
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
}

/**
 * Print validation results
 */
function printResults(): void {
  console.log('\n🔍 Design Token Validation Results\n');
  console.log(`Files scanned: ${filesScanned}`);
  console.log(`Violations found: ${violationsFound}\n`);

  if (results.length === 0) {
    console.log('✅ No violations found! All token usage follows semantic architecture.\n');
    return;
  }

  // Group results by file
  const resultsByFile = results.reduce((acc, result) => {
    if (!acc[result.file]) {
      acc[result.file] = [];
    }
    acc[result.file].push(result);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  // Print results grouped by file
  Object.entries(resultsByFile).forEach(([file, fileResults]) => {
    console.log(`\n📄 ${file}`);
    fileResults.forEach(result => {
      const icon = result.severity === 'error' ? '❌' : '⚠️ ';
      console.log(`  ${icon} Line ${result.line}:${result.column} - ${result.message}`);
    });
  });

  console.log('\n');
  
  // Summary by violation type
  const errorCount = results.filter(r => r.severity === 'error').length;
  const warningCount = results.filter(r => r.severity === 'warning').length;
  
  console.log('📊 Summary:');
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Warnings: ${warningCount}`);
  console.log('\n💡 To fix these issues:');
  console.log('  1. Replace hardcoded colors with semantic tokens: hsl(var(--color-primary))');
  console.log('  2. Replace hardcoded spacing with spacing tokens: var(--spacing-4)');
  console.log('  3. Use typography tokens for font sizes: var(--font-size-base)');
  console.log('  4. Use shadow tokens for box shadows: var(--shadow-md)');
  console.log('\n📚 See DESIGN_TOKENS.md for complete token reference.\n');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const isCI = args.includes('--ci');
  const srcPath = join(__dirname, '../src');

  console.log('🎨 Starting design token validation...\n');
  console.log(`Scanning directory: ${srcPath}\n`);

  const files = getAllFiles(srcPath);
  
  files.forEach(file => {
    validateFile(file);
  });

  printResults();

  // Exit with error code if violations found in CI mode
  if (isCI && violationsFound > 0) {
    console.error('❌ Token validation failed in CI mode. Fix all violations before merging.\n');
    process.exit(1);
  }

  // Exit with error code if errors found (not warnings)
  const errorCount = results.filter(r => r.severity === 'error').length;
  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
