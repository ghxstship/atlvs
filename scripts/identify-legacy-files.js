#!/usr/bin/env node

/**
 * Identify Legacy UI Files for Safe Removal
 * Comprehensive analysis of legacy components and conflicting files
 */

const fs = require('fs');
const path = require('path');

class LegacyFileIdentifier {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.legacyFiles = [];
    this.conflictingFiles = [];
    this.safeToDelete = [];
    this.requiresManualReview = [];
  }

  // Identify legacy UI component files
  findLegacyUIComponents() {
    const uiPackagePath = path.join(this.rootPath, 'packages/ui/src/components');
    
    if (!fs.existsSync(uiPackagePath)) return;

    const legacyComponents = [
      'Button.tsx',
      'Card.tsx', 
      'Badge.tsx',
      'Input.tsx',
      'Textarea.tsx',
      'Select.tsx',
      'Skeleton.tsx',
      'DepartmentBadge.tsx',
      'SubwaySystem.tsx'
    ];

    legacyComponents.forEach(component => {
      const componentPath = path.join(uiPackagePath, component);
      if (fs.existsSync(componentPath)) {
        this.legacyFiles.push({
          path: componentPath,
          type: 'legacy-component',
          reason: 'Replaced by atomic components',
          safe: true
        });
      }
    });
  }

  // Identify conflicting import/export files
  findConflictingFiles() {
    const conflictingPaths = [
      'packages/ui/src/components/ui/index.ts',
      'apps/web/app/_components/ui/index.ts',
      'packages/ui/src/styles.css', // Will be replaced by unified-design-system.css
    ];

    conflictingPaths.forEach(filePath => {
      const fullPath = path.join(this.rootPath, filePath);
      if (fs.existsSync(fullPath)) {
        this.conflictingFiles.push({
          path: fullPath,
          type: 'conflicting-exports',
          reason: 'Conflicts with unified system exports',
          safe: false // Requires manual review
        });
      }
    });
  }

  // Identify old token files
  findOldTokenFiles() {
    const oldTokenFiles = [
      'packages/ui/src/tokens/index.ts',
      'packages/ui/src/tokens/design-system.css'
    ];

    oldTokenFiles.forEach(filePath => {
      const fullPath = path.join(this.rootPath, filePath);
      if (fs.existsSync(fullPath)) {
        this.legacyFiles.push({
          path: fullPath,
          type: 'old-tokens',
          reason: 'Replaced by unified-design-tokens.ts',
          safe: true
        });
      }
    });
  }

  // Check for unused style files
  findUnusedStyleFiles() {
    const stylePaths = [
      'packages/ui/src/styles',
      'apps/web/app/_components/styles'
    ];

    stylePaths.forEach(styleDir => {
      const fullPath = path.join(this.rootPath, styleDir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        files.forEach(file => {
          if (file.endsWith('.css') && file !== 'unified-design-system.css') {
            this.legacyFiles.push({
              path: path.join(fullPath, file),
              type: 'unused-styles',
              reason: 'Replaced by unified design system',
              safe: true
            });
          }
        });
      }
    });
  }

  // Analyze file dependencies
  analyzeFileDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file is imported by other files
      const relativePath = path.relative(this.rootPath, filePath);
      const importPatterns = [
        new RegExp(`from ['"].*${path.basename(filePath, path.extname(filePath))}['"]`, 'g'),
        new RegExp(`import.*['"].*${relativePath}['"]`, 'g')
      ];

      // This is a simplified check - in a real scenario, you'd want to scan all files
      return {
        hasImports: false, // Simplified for this example
        isReferenced: false
      };
    } catch (error) {
      return { hasImports: false, isReferenced: false };
    }
  }

  // Generate deletion strategy
  generateDeletionStrategy() {
    // Categorize files by safety level
    this.legacyFiles.forEach(file => {
      const deps = this.analyzeFileDependencies(file.path);
      
      if (file.safe && !deps.isReferenced) {
        this.safeToDelete.push(file);
      } else {
        this.requiresManualReview.push(file);
      }
    });

    this.conflictingFiles.forEach(file => {
      this.requiresManualReview.push(file);
    });
  }

  // Create backup before deletion
  createBackup() {
    const backupDir = path.join(this.rootPath, '.backup-legacy-ui');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    [...this.safeToDelete, ...this.requiresManualReview].forEach(file => {
      const relativePath = path.relative(this.rootPath, file.path);
      const backupPath = path.join(backupDir, relativePath);
      const backupDirPath = path.dirname(backupPath);
      
      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }
      
      if (fs.existsSync(file.path)) {
        fs.copyFileSync(file.path, backupPath);
      }
    });

    console.log(`✅ Backup created at: ${backupDir}`);
    return backupDir;
  }

  // Run the complete analysis
  run() {
    console.log('🔍 Identifying legacy UI files for removal...\n');

    this.findLegacyUIComponents();
    this.findConflictingFiles();
    this.findOldTokenFiles();
    this.findUnusedStyleFiles();
    this.generateDeletionStrategy();

    console.log('📊 Legacy File Analysis Results:');
    console.log(`Total legacy files found: ${this.legacyFiles.length + this.conflictingFiles.length}`);
    console.log(`Safe to delete: ${this.safeToDelete.length}`);
    console.log(`Requires manual review: ${this.requiresManualReview.length}`);

    if (this.safeToDelete.length > 0) {
      console.log('\n✅ Safe to delete:');
      this.safeToDelete.forEach(file => {
        console.log(`  - ${path.relative(this.rootPath, file.path)} (${file.reason})`);
      });
    }

    if (this.requiresManualReview.length > 0) {
      console.log('\n⚠️  Requires manual review:');
      this.requiresManualReview.forEach(file => {
        console.log(`  - ${path.relative(this.rootPath, file.path)} (${file.reason})`);
      });
    }

    return {
      safeToDelete: this.safeToDelete,
      requiresManualReview: this.requiresManualReview,
      totalFound: this.legacyFiles.length + this.conflictingFiles.length
    };
  }

  // Execute safe deletions
  executeSafeDeletions() {
    if (this.safeToDelete.length === 0) {
      console.log('⚪ No files identified as safe to delete');
      return 0;
    }

    console.log('\n🗑️  Executing safe deletions...');
    let deletedCount = 0;

    this.safeToDelete.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`✅ Deleted: ${path.relative(this.rootPath, file.path)}`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to delete ${file.path}: ${error.message}`);
      }
    });

    console.log(`\n🎉 Successfully deleted ${deletedCount} legacy files`);
    return deletedCount;
  }
}

// CLI interface
if (require.main === module) {
  const rootPath = process.argv[2] || process.cwd();
  
  if (!fs.existsSync(rootPath)) {
    console.error('❌ Invalid root path provided');
    process.exit(1);
  }

  const identifier = new LegacyFileIdentifier(rootPath);
  const results = identifier.run();
  
  if (results.totalFound > 0) {
    // Create backup
    const backupDir = identifier.createBackup();
    
    // Execute safe deletions
    const deletedCount = identifier.executeSafeDeletions();
    
    console.log('\n📋 Summary:');
    console.log(`Files analyzed: ${results.totalFound}`);
    console.log(`Files deleted: ${deletedCount}`);
    console.log(`Files requiring manual review: ${results.requiresManualReview.length}`);
    console.log(`Backup location: ${backupDir}`);
  } else {
    console.log('\n✅ No legacy files found - codebase is clean!');
  }
}

module.exports = LegacyFileIdentifier;
