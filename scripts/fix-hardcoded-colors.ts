#!/usr/bin/env tsx
/**
 * Automated Fix for Hardcoded Color Values
 * Replaces hardcoded hex/rgb colors with semantic tokens
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface ColorMapping {
  pattern: RegExp;
  replacement: string;
  description: string;
}

// Common color mappings to semantic tokens
const COLOR_MAPPINGS: ColorMapping[] = [
  // Primary/Blue colors
  { pattern: /#3b82f6|#2563eb|#1d4ed8/gi, replacement: 'hsl(var(--color-primary))', description: 'Primary blue' },
  { pattern: /rgb\(59,\s*130,\s*246\)|rgba\(59,\s*130,\s*246,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-primary))', description: 'Primary blue RGB' },
  
  // Success/Green colors
  { pattern: /#10b981|#059669|#047857|#22c55e/gi, replacement: 'hsl(var(--color-success))', description: 'Success green' },
  { pattern: /rgb\(16,\s*185,\s*129\)|rgba\(16,\s*185,\s*129,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-success))', description: 'Success green RGB' },
  
  // Warning/Yellow colors
  { pattern: /#f59e0b|#d97706|#b45309|#fbbf24/gi, replacement: 'hsl(var(--color-warning))', description: 'Warning yellow' },
  { pattern: /rgb\(245,\s*158,\s*11\)|rgba\(245,\s*158,\s*11,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-warning))', description: 'Warning yellow RGB' },
  
  // Error/Red colors
  { pattern: /#ef4444|#dc2626|#b91c1c|#f87171/gi, replacement: 'hsl(var(--color-destructive))', description: 'Error red' },
  { pattern: /rgb\(239,\s*68,\s*68\)|rgba\(239,\s*68,\s*68,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-destructive))', description: 'Error red RGB' },
  
  // Info/Cyan colors
  { pattern: /#06b6d4|#0891b2|#0e7490|#22d3ee/gi, replacement: 'hsl(var(--color-info))', description: 'Info cyan' },
  { pattern: /rgb\(6,\s*182,\s*212\)|rgba\(6,\s*182,\s*212,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-info))', description: 'Info cyan RGB' },
  
  // Purple/Violet colors
  { pattern: /#8b5cf6|#7c3aed|#6d28d9|#a78bfa/gi, replacement: 'hsl(var(--color-accent))', description: 'Accent purple' },
  { pattern: /rgb\(139,\s*92,\s*246\)|rgba\(139,\s*92,\s*246,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-accent))', description: 'Accent purple RGB' },
  
  // Pink colors
  { pattern: /#ec4899|#db2777|#be185d|#f472b6/gi, replacement: 'hsl(var(--color-accent))', description: 'Accent pink' },
  { pattern: /rgb\(236,\s*72,\s*153\)|rgba\(236,\s*72,\s*153,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-accent))', description: 'Accent pink RGB' },
  
  // Orange colors
  { pattern: /#f97316|#ea580c|#c2410c|#fb923c/gi, replacement: 'hsl(var(--color-warning))', description: 'Warning orange' },
  { pattern: /rgb\(249,\s*115,\s*22\)|rgba\(249,\s*115,\s*22,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-warning))', description: 'Warning orange RGB' },
  
  // Indigo colors
  { pattern: /#6366f1|#4f46e5|#4338ca|#818cf8/gi, replacement: 'hsl(var(--color-primary))', description: 'Primary indigo' },
  { pattern: /rgb\(99,\s*102,\s*241\)|rgba\(99,\s*102,\s*241,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-primary))', description: 'Primary indigo RGB' },
  
  // Teal colors
  { pattern: /#14b8a6|#0d9488|#0f766e|#2dd4bf/gi, replacement: 'hsl(var(--color-success))', description: 'Success teal' },
  { pattern: /rgb\(20,\s*184,\s*166\)|rgba\(20,\s*184,\s*166,\s*[\d.]+\)/gi, replacement: 'hsl(var(--color-success))', description: 'Success teal RGB' },
  
  // Gray colors (light to dark)
  { pattern: /#f9fafb|#f3f4f6/gi, replacement: 'hsl(var(--color-muted))', description: 'Muted gray' },
  { pattern: /#e5e7eb|#d1d5db/gi, replacement: 'hsl(var(--color-border))', description: 'Border gray' },
  { pattern: /#9ca3af|#6b7280/gi, replacement: 'hsl(var(--color-muted-foreground))', description: 'Muted foreground' },
  { pattern: /#4b5563|#374151/gi, replacement: 'hsl(var(--color-foreground))', description: 'Foreground gray' },
  { pattern: /#1f2937|#111827/gi, replacement: 'hsl(var(--color-background))', description: 'Background dark' },
  
  // Black and white
  { pattern: /#000000|#000/gi, replacement: 'hsl(0 0% 0%)', description: 'Pure black' },
  { pattern: /#ffffff|#fff(?![0-9a-f])/gi, replacement: 'hsl(0 0% 100%)', description: 'Pure white' },
  
  // RGBA with opacity patterns
  { pattern: /rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/gi, replacement: 'hsl(0 0% 0% / $1)', description: 'Black with opacity' },
  { pattern: /rgba\(255,\s*255,\s*255,\s*([\d.]+)\)/gi, replacement: 'hsl(0 0% 100% / $1)', description: 'White with opacity' },
];

let filesFixed = 0;
let totalReplacements = 0;

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.turbo',
  'generated-tokens.css',
  'unified-design-tokens.ts',
  'enhanced-component-tokens.ts',
  'tailwind.config',
  'fix-hardcoded-colors.ts',
];

function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

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
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

function fixFile(filePath: string): void {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let fileModified = false;
    let fileReplacements = 0;

    COLOR_MAPPINGS.forEach(mapping => {
      const matches = content.match(mapping.pattern);
      if (matches) {
        content = content.replace(mapping.pattern, mapping.replacement);
        fileReplacements += matches.length;
        fileModified = true;
      }
    });

    if (fileModified) {
      writeFileSync(filePath, content, 'utf-8');
      filesFixed++;
      totalReplacements += fileReplacements;
      console.log(`✅ Fixed ${filePath} (${fileReplacements} replacements)`);
    }
  } catch (error) {
    console.error(`❌ Error fixing file ${filePath}:`, error);
  }
}

function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || process.cwd();

  console.log('🎨 Starting automated color fix...\n');
  console.log(`Target directory: ${targetPath}\n`);

  const files = getAllFiles(targetPath);
  
  console.log(`Found ${files.length} files to scan\n`);

  files.forEach(file => {
    fixFile(file);
  });

  console.log('\n📊 Fix Summary:');
  console.log(`  Files fixed: ${filesFixed}`);
  console.log(`  Total replacements: ${totalReplacements}`);
  
  if (filesFixed > 0) {
    console.log('\n✅ Automated fix complete!');
    console.log('💡 Next steps:');
    console.log('  1. Review changes with git diff');
    console.log('  2. Test affected components');
    console.log('  3. Run validation: pnpm validate:tokens');
    console.log('  4. Commit changes\n');
  } else {
    console.log('\n✨ No hardcoded colors found!\n');
  }
}

main();
