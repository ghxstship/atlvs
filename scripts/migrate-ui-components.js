#!/usr/bin/env node

/**
 * GHXSTSHIP UI Migration Script
 * Automated migration tool for updating components to use the unified design system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Migration patterns
const MIGRATION_PATTERNS = {
  // Import updates
  imports: [
    {
      pattern: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]@ghxstship\/ui['"]/g,
      replacement: (match, imports) => {
        const importList = imports.split(',').map(imp => imp.trim());
        const updatedImports = importList.map(imp => {
          if (imp === 'Input') return 'UnifiedInput';
          if (imp === 'Button') return 'Button';
          return imp;
        });
        return `import { ${updatedImports.join(', ')} } from '@ghxstship/ui'`;
      }
    }
  ],

  // Component usage updates
  components: [
    {
      name: 'Input to UnifiedInput',
      pattern: /<Input\s/g,
      replacement: '<UnifiedInput '
    },
    {
      name: 'Button variant updates',
      pattern: /variant="primary"/g,
      replacement: 'variant="default"'
    },
    {
      name: 'CSS class updates - spacing',
      pattern: /className="([^"]*)\s*px-sm\s*([^"]*)"/g,
      replacement: 'className="$1 px-md $2"'
    },
    {
      name: 'CSS class updates - text colors',
      pattern: /className="([^"]*)\s*text-foreground\/70\s*([^"]*)"/g,
      replacement: 'className="$1 color-muted $2"'
    }
  ],

  // TypeScript fixes
  typescript: [
    {
      name: 'Event handler typing',
      pattern: /onChange=\{(\([^)]*\))\s*=>\s*/g,
      replacement: 'onChange={(e: React.ChangeEvent<HTMLInputElement>) => '
    },
    {
      name: 'Remove any types',
      pattern: /:\s*any/g,
      replacement: ''
    }
  ]
};

// Component mapping for migration
const COMPONENT_MAPPING = {
  'Input': 'UnifiedInput',
  'Button': 'Button', // Keep same but update variants
  'Card': 'Card',
  'Badge': 'Badge'
};

// Variant mapping
const VARIANT_MAPPING = {
  'primary': 'default',
  'secondary': 'secondary',
  'outline': 'outline',
  'ghost': 'ghost',
  'destructive': 'destructive'
};

class UIComponentMigrator {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.migratedFiles = [];
    this.errors = [];
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      componentsUpdated: 0,
      errorsFound: 0
    };
  }

  /**
   * Find all TypeScript/TSX files to migrate
   */
  findTargetFiles() {
    const files = [];
    
    const searchDirs = [
      path.join(this.rootPath, 'apps/web/app'),
      path.join(this.rootPath, 'apps/web/components'),
    ];

    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
          files.push(fullPath);
        }
      }
    };

    searchDirs.forEach(walkDir);
    return files;
  }

  /**
   * Migrate a single file
   */
  migrateFile(filePath) {
    try {
      this.stats.filesProcessed++;
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modified = false;

      // Apply import migrations
      MIGRATION_PATTERNS.imports.forEach(pattern => {
        const newContent = content.replace(pattern.pattern, pattern.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          this.stats.componentsUpdated++;
        }
      });

      // Apply component migrations
      MIGRATION_PATTERNS.components.forEach(pattern => {
        const newContent = content.replace(pattern.pattern, pattern.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          this.stats.componentsUpdated++;
        }
      });

      // Apply TypeScript fixes
      MIGRATION_PATTERNS.typescript.forEach(pattern => {
        const newContent = content.replace(pattern.pattern, pattern.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });

      // Update specific component props
      content = this.updateComponentProps(content);

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.migratedFiles.push(filePath);
        this.stats.filesModified++;
        console.log(`✅ Migrated: ${path.relative(this.rootPath, filePath)}`);
      }

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      this.stats.errorsFound++;
      console.error(`❌ Error migrating ${filePath}: ${error.message}`);
    }
  }

  /**
   * Update component props to match new interfaces
   */
  updateComponentProps(content) {
    // Update Input component props
    content = content.replace(
      /<UnifiedInput([^>]*?)className="([^"]*)"([^>]*?)>/g,
      (match, before, className, after) => {
        // Remove old styling classes and let component handle them
        const cleanClassName = className
          .replace(/\s*h-10\s*/, ' ')
          .replace(/\s*rounded-md\s*/, ' ')
          .replace(/\s*border\s*/, ' ')
          .replace(/\s*bg-background\s*/, ' ')
          .replace(/\s*px-sm\s*/, ' ')
          .replace(/\s*text-body-sm\s*/, ' ')
          .trim();
        
        return `<UnifiedInput${before}${cleanClassName ? ` className="${cleanClassName}"` : ''}${after}>`;
      }
    );

    // Update Button variants
    Object.entries(VARIANT_MAPPING).forEach(([oldVariant, newVariant]) => {
      const regex = new RegExp(`variant="${oldVariant}"`, 'g');
      content = content.replace(regex, `variant="${newVariant}"`);
    });

    return content;
  }

  /**
   * Validate migrated files
   */
  validateMigration() {
    console.log('\n🔍 Validating migration...');
    
    try {
      // Run TypeScript check
      execSync('npx tsc --noEmit', { 
        cwd: path.join(this.rootPath, 'apps/web'),
        stdio: 'pipe'
      });
      console.log('✅ TypeScript validation passed');
    } catch (error) {
      console.warn('⚠️  TypeScript validation found issues (may need manual fixes)');
    }

    // Check for common migration issues
    this.migratedFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for remaining old patterns
      if (content.includes('variant="primary"')) {
        console.warn(`⚠️  ${filePath}: Still contains old variant="primary"`);
      }
      
      if (content.match(/<Input\s/)) {
        console.warn(`⚠️  ${filePath}: Still contains old <Input> component`);
      }
    });
  }

  /**
   * Generate migration report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      migratedFiles: this.migratedFiles.map(f => path.relative(this.rootPath, f)),
      errors: this.errors
    };

    const reportPath = path.join(this.rootPath, 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 Migration Report:');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files modified: ${this.stats.filesModified}`);
    console.log(`Components updated: ${this.stats.componentsUpdated}`);
    console.log(`Errors found: ${this.stats.errorsFound}`);
    console.log(`Report saved to: ${reportPath}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  ${path.relative(this.rootPath, file)}: ${error}`);
      });
    }
  }

  /**
   * Run the complete migration
   */
  async run() {
    console.log('🚀 Starting GHXSTSHIP UI Component Migration...\n');

    const files = this.findTargetFiles();
    console.log(`Found ${files.length} files to process\n`);

    // Migrate files
    files.forEach(file => this.migrateFile(file));

    // Validate migration
    this.validateMigration();

    // Generate report
    this.generateReport();

    console.log('\n🎉 Migration completed!');
    
    if (this.stats.filesModified > 0) {
      console.log('\n📝 Next steps:');
      console.log('1. Review migrated files for any manual adjustments needed');
      console.log('2. Run tests to ensure functionality is preserved');
      console.log('3. Update any remaining components manually');
      console.log('4. Commit changes with descriptive message');
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

  const migrator = new UIComponentMigrator(rootPath);
  migrator.run().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

module.exports = UIComponentMigrator;
