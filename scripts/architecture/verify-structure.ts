#!/usr/bin/env tsx
/**
 * Architecture Structure Verification Script
 * Verifies that the codebase follows the defined architectural structure
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface VerificationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

const EXPECTED_UI_STRUCTURE = {
  'design-system': ['tokens', 'theme'],
  'primitives': [],
  'atoms': [],
  'molecules': [],
  'organisms': [],
  'templates': [],
  'patterns': [],
  'hooks': [],
  'utils': [],
  'types': []
};

const EXPECTED_DOMAIN_STRUCTURE = {
  'shared': ['kernel', 'value-objects'],
  'contexts': ['projects', 'finance', 'people', 'procurement', 'jobs', 'companies', 'programming', 'analytics', 'assets', 'marketplace']
};

const EXPECTED_APPLICATION_STRUCTURE = {
  'commands': [],
  'queries': [],
  'dtos': [],
  'mappers': [],
  'services': [],
  'validators': [],
  'events': [],
  'pipelines': [],
  'types': []
};

function verifyDirectory(
  path: string,
  expectedStructure: Record<string, string[]>,
  level: string = ''
): VerificationResult {
  const result: VerificationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  if (!existsSync(path)) {
    result.passed = false;
    result.errors.push(`${level}Directory does not exist: ${path}`);
    return result;
  }

  const actualDirs = readdirSync(path).filter(item => {
    const itemPath = join(path, item);
    return statSync(itemPath).isDirectory() && !item.startsWith('.');
  });

  // Check for expected directories
  Object.keys(expectedStructure).forEach(expectedDir => {
    if (!actualDirs.includes(expectedDir)) {
      result.passed = false;
      result.errors.push(`${level}Missing expected directory: ${expectedDir}`);
    }
  });

  // Check for unexpected directories
  actualDirs.forEach(actualDir => {
    if (!Object.keys(expectedStructure).includes(actualDir)) {
      result.warnings.push(`${level}Unexpected directory: ${actualDir}`);
    }
  });

  return result;
}

function verifyUIPackage(): VerificationResult {
  console.log(chalk.blue('\n📦 Verifying UI Package Structure...'));
  
  const uiPath = join(process.cwd(), 'packages', 'ui', 'src');
  const result = verifyDirectory(uiPath, EXPECTED_UI_STRUCTURE, 'UI: ');

  // Additional checks
  const atomsPath = join(uiPath, 'atoms');
  if (existsSync(atomsPath)) {
    const atomDirs = readdirSync(atomsPath).filter(item => {
      return statSync(join(atomsPath, item)).isDirectory();
    });
    
    if (atomDirs.length === 0) {
      result.warnings.push('UI: No atoms found in atoms/ directory');
    }

    // Check each atom has proper structure
    atomDirs.forEach(atom => {
      const atomPath = join(atomsPath, atom);
      const files = readdirSync(atomPath);
      
      if (!files.includes(`${atom}.tsx`)) {
        result.errors.push(`UI: Atom ${atom} missing main file ${atom}.tsx`);
        result.passed = false;
      }
      if (!files.includes('index.ts')) {
        result.warnings.push(`UI: Atom ${atom} missing index.ts`);
      }
    });
  }

  return result;
}

function verifyDomainPackage(): VerificationResult {
  console.log(chalk.blue('\n📦 Verifying Domain Package Structure...'));
  
  const domainPath = join(process.cwd(), 'packages', 'domain', 'src');
  const result = verifyDirectory(domainPath, EXPECTED_DOMAIN_STRUCTURE, 'Domain: ');

  // Check each bounded context
  const contextsPath = join(domainPath, 'contexts');
  if (existsSync(contextsPath)) {
    EXPECTED_DOMAIN_STRUCTURE.contexts.forEach(context => {
      const contextPath = join(contextsPath, context);
      if (existsSync(contextPath)) {
        const expectedContextDirs = ['domain', 'events', 'repositories'];
        const actualContextDirs = readdirSync(contextPath).filter(item => {
          return statSync(join(contextPath, item)).isDirectory();
        });

        expectedContextDirs.forEach(dir => {
          if (!actualContextDirs.includes(dir)) {
            result.warnings.push(`Domain: Context ${context} missing ${dir} directory`);
          }
        });
      }
    });
  }

  return result;
}

function verifyApplicationPackage(): VerificationResult {
  console.log(chalk.blue('\n📦 Verifying Application Package Structure...'));
  
  const appPath = join(process.cwd(), 'packages', 'application', 'src');
  const result = verifyDirectory(appPath, EXPECTED_APPLICATION_STRUCTURE, 'Application: ');

  // Check CQRS structure
  ['commands', 'queries'].forEach(cqrsType => {
    const cqrsPath = join(appPath, cqrsType);
    if (existsSync(cqrsPath)) {
      const contexts = readdirSync(cqrsPath).filter(item => {
        return statSync(join(cqrsPath, item)).isDirectory();
      });

      if (contexts.length === 0) {
        result.warnings.push(`Application: No ${cqrsType} found`);
      }
    }
  });

  return result;
}

function printResults(results: Record<string, VerificationResult>): void {
  console.log(chalk.bold('\n\n=== Verification Results ===\n'));

  let allPassed = true;
  let totalErrors = 0;
  let totalWarnings = 0;

  Object.entries(results).forEach(([name, result]) => {
    if (result.passed) {
      console.log(chalk.green(`✓ ${name}: PASSED`));
    } else {
      console.log(chalk.red(`✗ ${name}: FAILED`));
      allPassed = false;
    }

    if (result.errors.length > 0) {
      console.log(chalk.red('\n  Errors:'));
      result.errors.forEach(error => {
        console.log(chalk.red(`    • ${error}`));
      });
      totalErrors += result.errors.length;
    }

    if (result.warnings.length > 0) {
      console.log(chalk.yellow('\n  Warnings:'));
      result.warnings.forEach(warning => {
        console.log(chalk.yellow(`    • ${warning}`));
      });
      totalWarnings += result.warnings.length;
    }

    console.log('');
  });

  console.log(chalk.bold('\n=== Summary ==='));
  console.log(`Total Errors: ${chalk.red(totalErrors)}`);
  console.log(`Total Warnings: ${chalk.yellow(totalWarnings)}`);
  console.log(`Overall Status: ${allPassed ? chalk.green('PASSED') : chalk.red('FAILED')}\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log(chalk.bold.blue('🏗️  GHXSTSHIP Architecture Structure Verification\n'));
  console.log(chalk.gray('Verifying adherence to architectural standards...\n'));

  const results: Record<string, VerificationResult> = {
    'UI Package': verifyUIPackage(),
    'Domain Package': verifyDomainPackage(),
    'Application Package': verifyApplicationPackage()
  };

  printResults(results);
}

main().catch(error => {
  console.error(chalk.red('Verification failed:'), error);
  process.exit(1);
});
