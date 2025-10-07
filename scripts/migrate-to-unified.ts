#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { execSync as _execSync } from 'child_process';

interface ModuleInfo {
  name: string;
  path: string;
  hasConfig: boolean;
  hasUnified: boolean;
  hasLegacy: boolean;
}

const MODULES_DIR = 'apps/web/app/(app)/(shell)';
const CONFIG_DIR = 'apps/web/config/modules';

/**
 * ATLVS Unified Architecture Migration Script
 * 
 * This script automates the migration from legacy module implementations
 * to the new unified, configuration-driven architecture.
 * 
 * Features:
 * - Analyzes existing modules
 * - Creates backup of legacy implementations
 * - Updates routing to use unified clients
 * - Validates migration success
 * - Provides rollback capability
 */

function log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
  };
  const reset = '\x1b[0m';
  console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`);
}

function analyzeModules(): ModuleInfo[] {
  log('Analyzing existing modules...');
  
  const modulesPath = path.resolve(MODULES_DIR);
  const configPath = path.resolve(CONFIG_DIR);
  
  if (!fs.existsSync(modulesPath)) {
    throw new Error(`Modules directory not found: ${modulesPath}`);
  }
  
  const modules: ModuleInfo[] = [];
  const moduleDirectories = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const moduleName of moduleDirectories) {
    const modulePath = path.join(modulesPath, moduleName);
    
    // Check for config file
    const configFile = path.join(configPath, `${moduleName}.config.ts`);
    const hasConfig = fs.existsSync(configFile);
    
    // Check for unified implementation
    const unifiedFile = path.join(modulePath, `${capitalizeFirst(moduleName)}Client.unified.tsx`);
    const hasUnified = fs.existsSync(unifiedFile);
    
    // Check for legacy implementation
    const legacyFile = path.join(modulePath, `${capitalizeFirst(moduleName)}Client.tsx`);
    const hasLegacy = fs.existsSync(legacyFile);
    
    modules.push({
      name: moduleName,
      path: modulePath,
      hasConfig,
      hasUnified,
      hasLegacy,
    });
  }
  
  return modules;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createBackup(modules: ModuleInfo[]) {
  log('Creating backup of legacy implementations...');
  
  const backupDir = path.resolve('backups', `migration-${Date.now()}`);
  fs.mkdirSync(backupDir, { recursive: true });
  
  for (const module of modules) {
    if (module.hasLegacy) {
      const legacyFile = path.join(module.path, `${capitalizeFirst(module.name)}Client.tsx`);
      const backupFile = path.join(backupDir, `${module.name}`, `${capitalizeFirst(module.name)}Client.tsx`);
      
      fs.mkdirSync(path.dirname(backupFile), { recursive: true });
      fs.copyFileSync(legacyFile, backupFile);
      
      log(`Backed up ${module.name} legacy client`, 'success');
    }
  }
  
  log(`Backup created at: ${backupDir}`, 'success');
  return backupDir;
}

function updateRouting(modules: ModuleInfo[]) {
  log('Updating module routing...');
  
  for (const module of modules) {
    if (module.hasUnified && module.hasLegacy) {
      const pageFile = path.join(module.path, 'page.tsx');
      
      if (fs.existsSync(pageFile)) {
        const content = fs.readFileSync(pageFile, 'utf8');
        // Replace import statement
        const oldImport = `import ${capitalizeFirst(module.name)}Client from './${capitalizeFirst(module.name)}Client';`;
        const newImport = `import ${capitalizeFirst(module.name)}Client from './${capitalizeFirst(module.name)}Client.unified';`;
        
        if (content.includes(oldImport)) {
          const updatedModule = content.replace(oldImport, newImport);
          fs.writeFileSync(pageFile, updatedModule);
          log(`Updated routing for ${module.name}`, 'success');
        } else {
          log(`No routing update needed for ${module.name}`, 'info');
        }
      }
    }
  }
}

function validateMigration(modules: ModuleInfo[]): boolean {
  log('Validating migration...');
  
  let allValid = true;
  
  for (const module of modules) {
    if (!module.hasConfig) {
      log(`Missing config for ${module.name}`, 'warning');
      allValid = false;
    }
    
    if (!module.hasUnified) {
      log(`Missing unified implementation for ${module.name}`, 'warning');
      allValid = false;
    }
    
    if (module.hasConfig && module.hasUnified) {
      log(`${module.name} ready for unified architecture`, 'success');
    }
  }
  
  return allValid;
}

function generateMigrationReport(modules: ModuleInfo[], backupDir: string) {
  log('Generating migration report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    backupLocation: backupDir,
    modules: modules.map(m => ({
      name: m.name,
      status: m.hasConfig && m.hasUnified ? 'migrated' : 'pending',
      hasConfig: m.hasConfig,
      hasUnified: m.hasUnified,
      hasLegacy: m.hasLegacy,
    })),
    summary: {
      total: modules.length,
      migrated: modules.filter(m => m.hasConfig && m.hasUnified).length,
      pending: modules.filter(m => !m.hasConfig || !m.hasUnified).length,
    },
  };
  
  const reportFile = path.resolve('migration-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  log(`Migration report saved to: ${reportFile}`, 'success');
  return report;
}

function printSummary(report: any) {
  console.log('\n' + '='.repeat(60));
  console.log('ATLVS UNIFIED ARCHITECTURE MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Modules: ${report.summary.total}`);
  console.log(`Migrated: ${report.summary.migrated}`);
  console.log(`Pending: ${report.summary.pending}`);
  console.log(`Success Rate: ${Math.round((report.summary.migrated / report.summary.total) * 100)}%`);
  console.log('='.repeat(60));
  
  if (report.summary.pending > 0) {
    console.log('\nPending Modules:');
    report.modules
      .filter((m: any) => m.status === 'pending')
      .forEach((m: any) => {
        console.log(`- ${m.name} (Config: ${m.hasConfig ? '✓' : '✗'}, Unified: ${m.hasUnified ? '✓' : '✗'})`);
      });
  }
  
  console.log(`\nBackup Location: ${report.backupLocation}`);
  console.log('\nNext Steps:');
  console.log('1. Test the migrated modules');
  console.log('2. Remove legacy implementations when confident');
  console.log('3. Run bundle analysis to verify size reduction');
  console.log('4. Update documentation');
}

async function main() {
  try {
    log('Starting ATLVS Unified Architecture Migration...', 'info');
    
    // Analyze current state
    const modules = analyzeModules();
    log(`Found ${modules.length} modules`, 'info');
    
    // Create backup
    const backupDir = createBackup(modules);
    
    // Update routing
    updateRouting(modules);
    
    // Validate migration
    const isValid = validateMigration(modules);
    
    // Generate report
    const report = generateMigrationReport(modules, backupDir);
    
    // Print summary
    printSummary(report);
    
    if (isValid) {
      log('Migration completed successfully!', 'success');
      process.exit(0);
    } else {
      log('Migration completed with warnings. Check the report for details.', 'warning');
      process.exit(1);
    }
    
  } catch (error) {
    log(`Migration failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { analyzeModules, createBackup, updateRouting, validateMigration };
