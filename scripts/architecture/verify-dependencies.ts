#!/usr/bin/env tsx
/**
 * Architecture Dependency Verification Script
 * Ensures architectural layers follow dependency rules
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';

interface DependencyViolation {
  file: string;
  line: number;
  import: string;
  rule: string;
}

const DEPENDENCY_RULES = {
  // Domain layer should not import from other layers
  'packages/domain': {
    forbidden: [
      'packages/application',
      'packages/infrastructure',
      'packages/ui',
      'apps/web'
    ],
    allowed: [
      'packages/domain'
    ],
    message: 'Domain layer should not depend on other layers'
  },
  
  // Application layer can only import from domain
  'packages/application': {
    forbidden: [
      'packages/infrastructure',
      'packages/ui',
      'apps/web'
    ],
    allowed: [
      'packages/domain',
      'packages/application'
    ],
    message: 'Application layer should only depend on domain layer'
  },
  
  // Infrastructure can import domain but not application or UI
  'packages/infrastructure': {
    forbidden: [
      'packages/application',
      'packages/ui',
      'apps/web'
    ],
    allowed: [
      'packages/domain',
      'packages/infrastructure'
    ],
    message: 'Infrastructure should only depend on domain layer'
  },
  
  // UI layer should not import from infrastructure
  'packages/ui': {
    forbidden: [
      'packages/infrastructure',
      'apps/web'
    ],
    allowed: [
      'packages/ui',
      'packages/domain'
    ],
    message: 'UI layer should not depend on infrastructure or app code'
  }
};

function getAllTSFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        fileList = getAllTSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function extractImports(filePath: string): Array<{ line: number; import: string }> {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const imports: Array<{ line: number; import: string }> = [];

  lines.forEach((line, index) => {
    // Match import statements
    const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      imports.push({
        line: index + 1,
        import: importMatch[1]
      });
    }

    // Match dynamic imports
    const dynamicImportMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (dynamicImportMatch) {
      imports.push({
        line: index + 1,
        import: dynamicImportMatch[1]
      });
    }

    // Match require statements
    const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (requireMatch) {
      imports.push({
        line: index + 1,
        import: requireMatch[1]
      });
    }
  });

  return imports;
}

function resolveImportPath(importPath: string, fromFile: string): string {
  // Handle relative imports
  if (importPath.startsWith('.')) {
    const fileDir = fromFile.substring(0, fromFile.lastIndexOf('/'));
    return join(fileDir, importPath);
  }

  // Handle package imports
  if (importPath.startsWith('@ghxstship/')) {
    const packageName = importPath.split('/')[1];
    return `packages/${packageName}`;
  }

  // Handle app imports
  if (importPath.startsWith('@/') || importPath.startsWith('~/')) {
    return 'apps/web';
  }

  return importPath;
}

function checkDependencyViolations(): DependencyViolation[] {
  const violations: DependencyViolation[] = [];
  const rootDir = process.cwd();

  Object.entries(DEPENDENCY_RULES).forEach(([packagePath, rules]) => {
    const fullPackagePath = join(rootDir, packagePath);
    
    console.log(chalk.blue(`\nChecking ${packagePath}...`));
    
    const tsFiles = getAllTSFiles(fullPackagePath);
    console.log(chalk.gray(`  Found ${tsFiles.length} TypeScript files`));

    tsFiles.forEach(file => {
      const imports = extractImports(file);
      
      imports.forEach(({ line, import: importPath }) => {
        const resolvedPath = resolveImportPath(importPath, file);
        
        // Check if import is forbidden
        rules.forbidden.forEach(forbiddenPath => {
          if (resolvedPath.includes(forbiddenPath)) {
            violations.push({
              file: relative(rootDir, file),
              line,
              import: importPath,
              rule: rules.message
            });
          }
        });
      });
    });
  });

  return violations;
}

function printViolations(violations: DependencyViolation[]): void {
  console.log(chalk.bold('\n\n=== Dependency Violation Report ===\n'));

  if (violations.length === 0) {
    console.log(chalk.green('✓ No dependency violations found!\n'));
    return;
  }

  console.log(chalk.red(`✗ Found ${violations.length} dependency violation(s):\n`));

  // Group by rule
  const violationsByRule = violations.reduce((acc, v) => {
    if (!acc[v.rule]) {
      acc[v.rule] = [];
    }
    acc[v.rule].push(v);
    return acc;
  }, {} as Record<string, DependencyViolation[]>);

  Object.entries(violationsByRule).forEach(([rule, ruleViolations]) => {
    console.log(chalk.yellow(`\n${rule}:`));
    console.log(chalk.yellow('─'.repeat(80)));
    
    ruleViolations.forEach(v => {
      console.log(chalk.red(`\n  ${v.file}:${v.line}`));
      console.log(chalk.gray(`    Import: ${v.import}`));
    });
  });

  console.log(chalk.bold('\n\n=== Summary ==='));
  console.log(`Total Violations: ${chalk.red(violations.length)}`);
  console.log(`Status: ${chalk.red('FAILED')}\n`);

  process.exit(1);
}

// Main execution
async function main() {
  console.log(chalk.bold.blue('🔍 GHXSTSHIP Architecture Dependency Verification\n'));
  console.log(chalk.gray('Checking for layer dependency violations...\n'));

  const violations = checkDependencyViolations();
  printViolations(violations);
}

main().catch(error => {
  console.error(chalk.red('Verification failed:'), error);
  process.exit(1);
});
