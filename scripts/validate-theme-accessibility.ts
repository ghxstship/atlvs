#!/usr/bin/env tsx
/**
 * Theme Accessibility Validation CLI
 * Validates all theme variants for WCAG compliance
 */

import { SEMANTIC_TOKENS } from '../packages/ui/src/tokens/unified-design-tokens';
import {
  validateAllThemes,
  generateValidationReport,
  type ContrastValidationResult,
} from '../packages/ui/src/utils/theme-validator';
import * as fs from 'fs';
import * as path from 'path';

const VALIDATION_LEVEL: 'AA' | 'AAA' = 'AA';
const OUTPUT_DIR = path.join(__dirname, '../docs/validation');

function main() {
  console.log('🎨 GHXSTSHIP Theme Accessibility Validation\n');
  console.log(`Validation Level: WCAG ${VALIDATION_LEVEL}\n`);

  // Validate all themes
  const results = validateAllThemes(
    {
      light: SEMANTIC_TOKENS.light,
      dark: SEMANTIC_TOKENS.dark,
    },
    VALIDATION_LEVEL
  );

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let allPassed = true;
  let totalChecks = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  // Process each theme
  Object.entries(results).forEach(([themeName, result]) => {
    console.log(`\n📋 ${themeName.toUpperCase()} THEME`);
    console.log('─'.repeat(50));
    console.log(`Total Checks: ${result.summary.total}`);
    console.log(`✅ Passed: ${result.summary.passed}`);
    console.log(`❌ Failed: ${result.summary.failed}`);
    console.log(`📊 Pass Rate: ${result.summary.passRate.toFixed(1)}%`);

    totalChecks += result.summary.total;
    totalPassed += result.summary.passed;
    totalFailed += result.summary.failed;

    if (result.failed.length > 0) {
      allPassed = false;
      console.log('\n⚠️  Failed Checks:');
      result.failed.forEach(item => {
        console.log(
          `   - ${item.pair}: ${item.ratio.toFixed(2)}:1 ` +
          `(Required: ${item.required}:1)`
        );
      });
    }

    // Generate and save report
    const report = generateValidationReport(result);
    const reportPath = path.join(OUTPUT_DIR, `theme-${themeName}-validation.md`);
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved: ${reportPath}`);
  });

  // Overall summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 OVERALL SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📊 Overall Pass Rate: ${((totalPassed / totalChecks) * 100).toFixed(1)}%`);

  // Generate combined report
  const combinedReport = generateCombinedReport(results);
  const combinedPath = path.join(OUTPUT_DIR, 'theme-validation-summary.md');
  fs.writeFileSync(combinedPath, combinedReport);
  console.log(`\n📄 Combined report saved: ${combinedPath}`);

  // Exit with appropriate code
  if (allPassed) {
    console.log('\n✅ All themes passed WCAG ' + VALIDATION_LEVEL + ' validation!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some themes failed WCAG ' + VALIDATION_LEVEL + ' validation.\n');
    console.log('Please review the reports and fix the failing color combinations.\n');
    process.exit(1);
  }
}

function generateCombinedReport(
  results: Record<string, ContrastValidationResult>
): string {
  let report = '# GHXSTSHIP Theme Accessibility Validation Summary\n\n';
  report += `**Validation Date:** ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Validation Level:** WCAG ${VALIDATION_LEVEL}\n\n`;

  report += '## Overview\n\n';
  report += '| Theme | Total | Passed | Failed | Pass Rate |\n';
  report += '|-------|-------|--------|--------|----------|\n';

  Object.entries(results).forEach(([themeName, result]) => {
    report += `| ${themeName} | ${result.summary.total} | `;
    report += `${result.summary.passed} | ${result.summary.failed} | `;
    report += `${result.summary.passRate.toFixed(1)}% |\n`;
  });

  report += '\n## Detailed Results\n\n';

  Object.entries(results).forEach(([themeName, result]) => {
    report += `### ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} Theme\n\n`;

    if (result.passed.length > 0) {
      report += `#### ✅ Passed (${result.passed.length})\n\n`;
      result.passed.forEach(item => {
        report += `- **${item.pair}**: ${item.ratio.toFixed(2)}:1\n`;
      });
      report += '\n';
    }

    if (result.failed.length > 0) {
      report += `#### ❌ Failed (${result.failed.length})\n\n`;
      result.failed.forEach(item => {
        report += `- **${item.pair}**: ${item.ratio.toFixed(2)}:1 `;
        report += `(Required: ${item.required}:1)\n`;
      });
      report += '\n';
    }
  });

  report += '## Recommendations\n\n';
  
  const hasFailures = Object.values(results).some(r => r.failed.length > 0);
  
  if (hasFailures) {
    report += '### Action Required\n\n';
    report += 'The following color combinations need adjustment:\n\n';
    
    Object.entries(results).forEach(([themeName, result]) => {
      if (result.failed.length > 0) {
        report += `**${themeName} theme:**\n`;
        result.failed.forEach(item => {
          const increase = ((item.required / item.ratio - 1) * 100).toFixed(0);
          report += `- Increase contrast for "${item.pair}" by approximately ${increase}%\n`;
        });
        report += '\n';
      }
    });
  } else {
    report += '✅ All themes meet WCAG ' + VALIDATION_LEVEL + ' requirements!\n\n';
  }

  return report;
}

// Run validation
main();
