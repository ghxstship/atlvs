#!/usr/bin/env node

/**
 * Fix Final TypeScript Errors
 * Targeted fixes for remaining syntax issues
 */

const fs = require('fs');
const path = require('path');

const CRITICAL_FIXES = [
  // Fix interface property array syntax
  {
    name: 'Fix interface array properties',
    pattern: /(\w+)\[\]\s*;/g,
    replacement: '$1: any[];'
  },
  // Fix function parameter array syntax in object methods
  {
    name: 'Fix object method array parameters',
    pattern: /(\w+):\s*\(\s*(\w+)\[\]\s*,/g,
    replacement: '$1: ($2: any[],'
  },
  {
    name: 'Fix object method array parameters (end)',
    pattern: /(\w+):\s*\(\s*(\w+)\[\]\s*\)\s*=>/g,
    replacement: '$1: ($2: any[]) =>'
  },
  // Fix function parameter array syntax
  {
    name: 'Fix function array parameters',
    pattern: /\(\s*(\w+)\[\]\s*,\s*(\w+):/g,
    replacement: '($1: any[], $2:'
  },
  // Fix variable array declarations
  {
    name: 'Fix array variable declarations',
    pattern: /(\w+)\[\]\s*=/g,
    replacement: '$1: any[] ='
  }
];

const ERROR_FILES = [
  'apps/web/app/(app)/(shell)/analytics/dashboards/DashboardsClient.tsx',
  'apps/web/app/(app)/(shell)/people/overview/OverviewClient.tsx',
  'apps/web/app/(app)/(shell)/programming/ProgrammingClient.tsx'
];

class FinalErrorFixer {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.fixedFiles = [];
    this.stats = {
      filesProcessed: 0,
      filesFixed: 0,
      errorsFixed: 0
    };
  }

  fixFile(filePath) {
    try {
      this.stats.filesProcessed++;
      
      let content = fs.readFileSync(filePath, 'utf8');
      const _originalContent = content;
      let fixesApplied = 0;

      // Apply all critical fixes
      CRITICAL_FIXES.forEach(fix => {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          fixesApplied++;
          this.stats.errorsFixed++;
          console.log(`  ✅ Applied: ${fix.name}`);
        }
      });

      if (fixesApplied > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(filePath);
        this.stats.filesFixed++;
        console.log(`✅ Fixed ${fixesApplied} errors in: ${path.relative(this.rootPath, filePath)}`);
      } else {
        console.log(`⚪ No fixes needed: ${path.relative(this.rootPath, filePath)}`);
      }

    } catch (error) {
      console.error(`❌ Error fixing ${filePath}: ${error.message}`);
    }
  }

  run() {
    console.log('🔧 Fixing final TypeScript syntax errors...\n');

    const errorFiles = ERROR_FILES
      .map(file => path.join(this.rootPath, file))
      .filter(file => fs.existsSync(file));

    console.log(`Found ${errorFiles.length} files with critical errors\n`);

    errorFiles.forEach(file => this.fixFile(file));

    console.log('\n📊 Final Fix Report:');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files fixed: ${this.stats.filesFixed}`);
    console.log(`Errors fixed: ${this.stats.errorsFixed}`);

    return this.stats.filesFixed > 0;
  }
}

// CLI interface
if (require.main === module) {
  const rootPath = process.argv[2] || process.cwd();
  
  if (!fs.existsSync(rootPath)) {
    console.error('❌ Invalid root path provided');
    process.exit(1);
  }

  const fixer = new FinalErrorFixer(rootPath);
  const success = fixer.run();
  
  if (success) {
    console.log('\n🎉 Critical errors fixed! Ready for build validation.');
  } else {
    console.log('\n⚠️  No automatic fixes applied.');
  }
}

module.exports = FinalErrorFixer;
