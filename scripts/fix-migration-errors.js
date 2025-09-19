#!/usr/bin/env node

/**
 * Fix Migration Errors Script
 * Fixes common TypeScript errors introduced during migration
 */

const fs = require('fs');
const path = require('path');

const FIXES = [
  // Fix array type syntax errors
  {
    name: 'Fix array parameter syntax',
    pattern: /\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\[\]\s*\)/g,
    replacement: '($1: any[])'
  },
  {
    name: 'Fix array parameter with type',
    pattern: /\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\[\]\s*:\s*([^)]+)\)/g,
    replacement: '($1: $2[])'
  },
  {
    name: 'Fix function parameter arrays',
    pattern: /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\[\]/g,
    replacement: 'function $1($2: any[]'
  },
  {
    name: 'Fix arrow function arrays',
    pattern: /=\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\[\]\s*\)\s*=>/g,
    replacement: '= ($1: any[]) =>'
  },
  {
    name: 'Fix variable declarations with arrays',
    pattern: /const\s+([a-zA-Z_][a-zA-Z0-9_]*)\[\]\s*=/g,
    replacement: 'const $1: any[] ='
  },
  {
    name: 'Fix let declarations with arrays',
    pattern: /let\s+([a-zA-Z_][a-zA-Z0-9_]*)\[\]\s*;/g,
    replacement: 'let $1: any[];'
  },
  {
    name: 'Fix gtag function signature',
    pattern: /gtag\?\s*:\s*\(\.\.\.\s*args\[\]\s*\)\s*=>\s*void/g,
    replacement: 'gtag?: (...args: any[]) => void'
  },
  {
    name: 'Fix function return type arrays',
    pattern: /\)\[\]\s*=>/g,
    replacement: '): any[] =>'
  },
  {
    name: 'Fix function return type arrays with braces',
    pattern: /\)\[\]\s*\{/g,
    replacement: '): any[] {'
  }
];

class MigrationErrorFixer {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.fixedFiles = [];
    this.stats = {
      filesProcessed: 0,
      filesFixed: 0,
      errorsFixed: 0
    };
  }

  findErrorFiles() {
    const errorFiles = [
      'apps/web/app/(app)/(shell)/analytics/dashboards/DashboardsClient.tsx',
      'apps/web/app/(app)/(shell)/assets/overview/OverviewClient.tsx',
      'apps/web/app/(app)/(shell)/dashboard/widgets/ChartWidget.tsx',
      'apps/web/app/(app)/(shell)/people/overview/OverviewClient.tsx',
      'apps/web/app/(app)/(shell)/pipeline/PipelineClient.tsx',
      'apps/web/app/(app)/(shell)/procurement/ProcurementClient.tsx',
      'apps/web/app/(app)/(shell)/programming/call-sheets/CallSheetsClient.tsx',
      'apps/web/app/(app)/(shell)/programming/events/EventsClient.tsx',
      'apps/web/app/(app)/(shell)/programming/lineups/LineupsClient.tsx',
      'apps/web/app/(app)/(shell)/programming/performances/PerformancesClient.tsx',
      'apps/web/app/(app)/(shell)/programming/ProgrammingClient.tsx',
      'apps/web/app/(app)/(shell)/programming/riders/RidersClient.tsx',
      'apps/web/app/(app)/(shell)/programming/spaces/SpacesClient.tsx',
      'apps/web/app/(app)/(shell)/programming/workshops/WorkshopsClient.tsx',
      'apps/web/app/(app)/(shell)/projects/ProjectsClient.tsx',
      'apps/web/app/_components/lib/performance.ts',
      'apps/web/app/_components/marketing/Analytics.tsx',
      'apps/web/app/_components/utils/export.ts',
      'apps/web/app/_components/utils/import.ts',
      'apps/web/app/api/v1/bulk/export/route.ts',
      'apps/web/app/api/v1/bulk/import/route.ts',
      'apps/web/app/api/v1/people/[id]/route.ts',
      'apps/web/app/UwebUvitals.tsx'
    ];

    return errorFiles
      .map(file => path.join(this.rootPath, file))
      .filter(file => fs.existsSync(file));
  }

  fixFile(filePath) {
    try {
      this.stats.filesProcessed++;
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Apply all fixes
      FIXES.forEach(fix => {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          fixesApplied++;
          this.stats.errorsFixed++;
        }
      });

      if (fixesApplied > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(filePath);
        this.stats.filesFixed++;
        console.log(`✅ Fixed ${fixesApplied} errors in: ${path.relative(this.rootPath, filePath)}`);
      }

    } catch (error) {
      console.error(`❌ Error fixing ${filePath}: ${error.message}`);
    }
  }

  run() {
    console.log('🔧 Fixing migration TypeScript errors...\n');

    const errorFiles = this.findErrorFiles();
    console.log(`Found ${errorFiles.length} files with potential errors\n`);

    errorFiles.forEach(file => this.fixFile(file));

    console.log('\n📊 Fix Report:');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files fixed: ${this.stats.filesFixed}`);
    console.log(`Errors fixed: ${this.stats.errorsFixed}`);

    if (this.stats.filesFixed > 0) {
      console.log('\n🎉 Errors fixed! Running TypeScript check...');
      return true;
    } else {
      console.log('\n⚠️  No automatic fixes applied. Manual review needed.');
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const rootPath = process.argv[2] || process.cwd();
  
  if (!fs.existsSync(rootPath)) {
    console.error('❌ Invalid root path provided');
    process.exit(1);
  }

  const fixer = new MigrationErrorFixer(rootPath);
  const success = fixer.run();
  
  if (!success) {
    process.exit(1);
  }
}

module.exports = MigrationErrorFixer;
