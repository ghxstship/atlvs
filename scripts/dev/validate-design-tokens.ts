#!/usr/bin/env tsx

/**
 * Design Token Validation Script
 * Scans codebase for design token violations and generates detailed report
 */

import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

interface Violation {
  type: 'hex-color' | 'arbitrary-class' | 'rgb-color' | 'inline-style' | 'hardcoded-font';
  severity: 'error' | 'warning' | 'info';
  line: number;
  column: number;
  code: string;
  suggestion?: string;
}

interface FileReport {
  file: string;
  violations: Violation[];
}

interface AuditReport {
  timestamp: string;
  summary: {
    totalFiles: number;
    totalViolations: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
  fileReports: FileReport[];
}

// Violation patterns and their fixes
const PATTERNS = {
  hexColor: {
    regex: /#[0-9a-fA-F]{6}\b/g,
    type: 'hex-color' as const,
    severity: 'error' as const,
    message: 'Hardcoded hex color',
    suggestion: 'Use hsl(var(--color-*)) or semantic Tailwind class',
  },
  hexColorShort: {
    regex: /#[0-9a-fA-F]{3}\b/g,
    type: 'hex-color' as const,
    severity: 'error' as const,
    message: 'Hardcoded hex color (short)',
    suggestion: 'Use hsl(var(--color-*)) or semantic Tailwind class',
  },
  rgbColor: {
    regex: /\brgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
    type: 'rgb-color' as const,
    severity: 'error' as const,
    message: 'Hardcoded rgb() color',
    suggestion: 'Use HSL format: hsl(var(--color-*))',
  },
  rgbaColor: {
    regex: /\brgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
    type: 'rgb-color' as const,
    severity: 'error' as const,
    message: 'Hardcoded rgba() color',
    suggestion: 'Use HSL with opacity: hsl(var(--color-*) / 0.5)',
  },
  arbitraryColorClass: {
    regex: /className="[^"]*\[(#|rgb|rgba|hsl)[^\]]*\]/g,
    type: 'arbitrary-class' as const,
    severity: 'error' as const,
    message: 'Arbitrary Tailwind color class',
    suggestion: 'Use semantic utilities: bg-primary, text-foreground, etc.',
  },
  verboseArbitraryClass: {
    regex: /className="[^"]*\[hsl\(var\(--[^\)]+\)\)\]/g,
    type: 'arbitrary-class' as const,
    severity: 'warning' as const,
    message: 'Verbose arbitrary class with CSS variable',
    suggestion: 'Replace with semantic utility class or create proper CSS class',
  },
  arbitraryFontSize: {
    regex: /text-\[\d+(px|rem|em)\]/g,
    type: 'arbitrary-class' as const,
    severity: 'warning' as const,
    message: 'Arbitrary font size',
    suggestion: 'Use typography scale: text-xs, text-sm, text-base, text-lg, etc.',
  },
  inlineStyle: {
    regex: /style=\{\{[^}]*color:[^}]*\}\}/g,
    type: 'inline-style' as const,
    severity: 'warning' as const,
    message: 'Inline style with color property',
    suggestion: 'Use Tailwind classes or CSS custom properties',
  },
  hardcodedFontFamily: {
    regex: /font-family:\s*['"](?!var\()[^'"]+['"]/g,
    type: 'hardcoded-font' as const,
    severity: 'error' as const,
    message: 'Hardcoded font-family',
    suggestion: 'Use var(--font-family-title), var(--font-family-body), or var(--font-family-mono)',
  },
};

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/build/**',
  '**/tokens/**/*.ts', // Allow in token definition files
  '**/design-system/colors-2026.ts', // Allow in palette files
  '**/unified-design-tokens.ts', // Allow in token files
  '**/styles/**/*.css', // Allow in CSS files (for definitions)
];

// Files to include
const INCLUDE_PATTERNS = [
  'packages/ui/src/**/*.{ts,tsx}',
  'apps/web/app/**/*.{ts,tsx}',
  'apps/web/components/**/*.{ts,tsx}',
];

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function analyzeFile(filePath: string): FileReport {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, lineIndex) => {
    // Check each pattern
    Object.entries(PATTERNS).forEach(([token, pattern]) => {
      let match;
      const regex = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');    while ((match = regex.exec(line)) !== null) {
        violations.push({
          type: pattern.type,
          severity: pattern.severity,
          line: lineIndex + 1,
          column: match.index,
          code: line.trim(),
          suggestion: pattern.suggestion,
        });
      }
    });
  });

  return {
    file: path.relative(process.cwd(), filePath),
    violations,
  };
}

async function scanCodebase(): Promise<AuditReport> {
  log('\n🔍 Scanning codebase for design token violations...', 'cyan');

  const files = await fg(INCLUDE_PATTERNS, {
    ignore: EXCLUDE_PATTERNS,
    absolute: true,
  });

  log(`\n📂 Found ${files.length} files to analyze\n`, 'blue');

  const fileReports: FileReport[] = [];
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  for (const file of files) {
    const report = analyzeFile(file);

    if (report.violations.length > 0) {
      fileReports.push(report);

      // Count by severity
      report.violations.forEach((v) => {
        if (v.severity === 'error') errorCount++;
        else if (v.severity === 'warning') warningCount++;
        else infoCount++;
      });
    }
  }

  const totalViolations = errorCount + warningCount + infoCount;

  const auditReport: AuditReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: fileReports.length,
      totalViolations,
      errorCount,
      warningCount,
      infoCount,
    },
    fileReports: fileReports.sort((a, b) => b.violations.length - a.violations.length),
  };

  return auditReport;
}

function printReport(report: AuditReport) {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('  DESIGN TOKEN VALIDATION REPORT', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  // Summary
  log('📊 SUMMARY', 'yellow');
  log(`   Total Files with Violations: ${report.summary.totalFiles}`, 'white');
  log(`   Total Violations: ${report.summary.totalViolations}`, 'white');
  log(`   🔴 Errors: ${report.summary.errorCount}`, 'red');
  log(`   🟡 Warnings: ${report.summary.warningCount}`, 'yellow');
  log(`   🔵 Info: ${report.summary.infoCount}`, 'blue');
  log('');

  if (report.summary.totalViolations === 0) {
    log('✅ NO VIOLATIONS FOUND! Design token system is fully adopted.', 'green');
    log('');
    return;
  }

  // Top 10 files
  log('🔥 TOP 10 FILES WITH MOST VIOLATIONS', 'yellow');
  const top10 = report.fileReports.slice(0, 10);
  top10.forEach((fileReport, index) => {
    const errorCount = fileReport.violations.filter((v) => v.severity === 'error').length;
    const warningCount = fileReport.violations.filter((v) => v.severity === 'warning').length;

    log(
      `   ${index + 1}. ${fileReport.file}`,
      errorCount > 0 ? 'red' : warningCount > 0 ? 'yellow' : 'blue'
    );
    log(`      Total: ${fileReport.violations.length} | Errors: ${errorCount} | Warnings: ${warningCount}`, 'white');
  });
  log('');

  // Violation breakdown by type
  log('📋 VIOLATIONS BY TYPE', 'yellow');
  const violationsByType: Record<string, number> = {};
  report.fileReports.forEach((fr) => {
    fr.violations.forEach((v) => {
      violationsByType[v.type] = (violationsByType[v.type] || 0) + 1;
    });
  });

  Object.entries(violationsByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / report.summary.totalViolations) * 100).toFixed(1);
      log(`   ${type.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)`, 'white');
    });
  log('');

  // Sample violations
  log('🔍 SAMPLE VIOLATIONS (First 5)', 'yellow');
  const sampleViolations = report.fileReports
    .slice(0, 5)
    .flatMap((fr) =>
      fr.violations.slice(0, 2).map((v) => ({
        file: fr.file,
        ...v,
      }))
    )
    .slice(0, 5);

  sampleViolations.forEach((v, index) => {
    const color = v.severity === 'error' ? 'red' : v.severity === 'warning' ? 'yellow' : 'blue';
    log(`   ${index + 1}. ${v.file}:${v.line}`, color);
    log(`      ${v.type} (${v.severity})`, 'white');
    log(`      Code: ${v.code.substring(0, 80)}...`, 'white');
    if (v.suggestion) {
      log(`      💡 ${v.suggestion}`, 'green');
    }
    log('');
  });

  log('═══════════════════════════════════════════════════════════\n', 'cyan');
}

function saveReport(report: AuditReport) {
  const outputDir = path.join(process.cwd(), 'docs');
  const outputFile = path.join(outputDir, 'design-token-violations.json');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));

  log(`💾 Full report saved to: ${outputFile}`, 'green');

  // Also create a markdown report
  const mdFile = path.join(outputDir, 'design-token-violations.md');
  const mdContent = generateMarkdownReport(report);
  fs.writeFileSync(mdFile, mdContent);

  log(`📄 Markdown report saved to: ${mdFile}`, 'green');
}

function generateMarkdownReport(report: AuditReport): string {
  let md = `# Design Token Validation Report\n\n`;
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Files with Violations | ${report.summary.totalFiles} |\n`;
  md += `| Total Violations | ${report.summary.totalViolations} |\n`;
  md += `| 🔴 Errors | ${report.summary.errorCount} |\n`;
  md += `| 🟡 Warnings | ${report.summary.warningCount} |\n`;
  md += `| 🔵 Info | ${report.summary.infoCount} |\n\n`;

  md += `## Files with Most Violations\n\n`;
  md += `| # | File | Total | Errors | Warnings |\n`;
  md += `|---|------|-------|--------|----------|\n`;

  report.fileReports.slice(0, 20).forEach((fr, index) => {
    const errors = fr.violations.filter((v) => v.severity === 'error').length;
    const warnings = fr.violations.filter((v) => v.severity === 'warning').length;
    md += `| ${index + 1} | \`${fr.file}\` | ${fr.violations.length} | ${errors} | ${warnings} |\n`;
  });

  md += `\n## Detailed Violations\n\n`;

  report.fileReports.slice(0, 10).forEach((fr) => {
    md += `### ${fr.file}\n\n`;
    md += `**Total Violations:** ${fr.violations.length}\n\n`;

    fr.violations.slice(0, 5).forEach((v) => {
      md += `- **Line ${v.line}** (${v.severity}): ${v.type}\n`;
      md += `  \`\`\`\n  ${v.code}\n  \`\`\`\n`;
      if (v.suggestion) {
        md += `  💡 *${v.suggestion}*\n`;
      }
      md += `\n`;
    });

    if (fr.violations.length > 5) {
      md += `*...and ${fr.violations.length - 5} more violations*\n\n`;
    }
  });

  return md;
}

async function main() {
  try {
    const report = await scanCodebase();
    printReport(report);
    saveReport(report);

    // Exit with error code if there are errors
    if (report.summary.errorCount > 0) {
      log('\n❌ Validation failed: errors detected', 'red');
      log('Run migration script: ./scripts/migrate-to-design-tokens.sh\n', 'yellow');
      process.exit(1);
    } else if (report.summary.warningCount > 0) {
      log('\n⚠️  Validation passed with warnings', 'yellow');
      log('Consider addressing warnings for better consistency\n', 'yellow');
      process.exit(0);
    } else {
      log('\n✅ Validation passed! No violations found.\n', 'green');
      process.exit(0);
    }
  } catch (error) {
    log(`\n❌ Error during validation: ${error}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { scanCodebase, analyzeFile, type AuditReport, type FileReport, type Violation };
