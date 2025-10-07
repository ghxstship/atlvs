#!/usr/bin/env tsx

/**
 * TypeScript Health Validation Script
 * Analyzes TypeScript compilation errors and provides actionable remediation steps
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ErrorSummary {
  file: string;
  errorCount: number;
  errorTypes: Map<string, number>;
  sampleErrors: string[];
}

interface HealthReport {
  totalErrors: number;
  affectedFiles: number;
  errorsByType: Map<string, number>;
  criticalFiles: ErrorSummary[];
  recommendations: string[];
}

class TypeScriptHealthValidator {
  private rootPath: string;
  private errorPattern = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/;

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath;
  }

  /**
   * Run TypeScript compiler and capture errors
   */
  private runTypeScriptCheck(): string {
    try {
      execSync('pnpm tsc --noEmit', {
        cwd: this.rootPath,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return '';
    } catch (error: any) {
      return error.stdout || error.stderr || '';
    }
  }

  /**
   * Parse TypeScript errors from compiler output
   */
  private parseErrors(output: string): ErrorSummary[] {
    const errorsByFile = new Map<string, ErrorSummary>();

    const lines = output.split('\n');
    for (const line of lines) {
      const match = line.match(this.errorPattern);
      if (match) {
        const [, filePath, , , errorCode, errorMessage] = match;
        
        if (!errorsByFile.has(filePath)) {
          errorsByFile.set(filePath, {
            file: filePath,
            errorCount: 0,
            errorTypes: new Map(),
            sampleErrors: []
          });
        }

        const summary = errorsByFile.get(filePath)!;
        summary.errorCount++;
        
        const count = summary.errorTypes.get(errorCode) || 0;
        summary.errorTypes.set(errorCode, count + 1);
        
        if (summary.sampleErrors.length < 5) {
          summary.sampleErrors.push(`${errorCode}: ${errorMessage}`);
        }
      }
    }

    return Array.from(errorsByFile.values())
      .sort((a, b) => b.errorCount - a.errorCount);
  }

  /**
   * Generate health report
   */
  generateReport(): HealthReport {
    console.log('🔍 Running TypeScript health check...\n');
    
    const output = this.runTypeScriptCheck();
    const errorSummaries = this.parseErrors(output);

    const errorsByType = new Map<string, number>();
    let totalErrors = 0;

    for (const summary of errorSummaries) {
      totalErrors += summary.errorCount;
      for (const [errorType, count] of summary.errorTypes) {
        const currentCount = errorsByType.get(errorType) || 0;
        errorsByType.set(errorType, currentCount + count);
      }
    }

    const recommendations = this.generateRecommendations(errorSummaries, errorsByType);

    return {
      totalErrors,
      affectedFiles: errorSummaries.length,
      errorsByType,
      criticalFiles: errorSummaries.slice(0, 10),
      recommendations
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    errorSummaries: ErrorSummary[],
    errorsByType: Map<string, number>
  ): string[] {
    const recommendations: string[] = [];

    // Check for generic type issues
    const genericErrors = errorsByType.get('TS1005') || 0;
    if (genericErrors > 50) {
      recommendations.push(
        '🔧 High number of TS1005 errors (expected token) detected. ' +
        'Run: find apps/web/app -type f \\( -name "*.ts" -o -name "*.tsx" \\) -print0 | ' +
        'xargs -0 sed -i \'\' -E \'s/Promise<([^<>]+<[^<>]+)>/Promise<\\1>>/g\''
      );
    }

    // Check for missing exports
    const moduleErrors = Array.from(errorsByType.keys())
      .filter(code => code.includes('2305') || code.includes('2304'));
    if (moduleErrors.length > 0) {
      recommendations.push(
        '📦 Missing module exports detected. Check that all imported symbols are properly exported from their source modules.'
      );
    }

    // Check for type assertion issues
    const typeErrors = errorsByType.get('TS2352') || 0;
    if (typeErrors > 20) {
      recommendations.push(
        '⚠️ Multiple type assertion errors. Consider adding proper type guards or updating interface definitions.'
      );
    }

    // Identify files needing regeneration
    const highErrorFiles = errorSummaries.filter(s => s.errorCount > 20);
    if (highErrorFiles.length > 0) {
      recommendations.push(
        `🔄 ${highErrorFiles.length} files have >20 errors each. These may need regeneration:\n` +
        highErrorFiles.slice(0, 5).map(f => `   - ${f.file} (${f.errorCount} errors)`).join('\n')
      );
    }

    return recommendations;
  }

  /**
   * Print formatted report
   */
  printReport(report: HealthReport): void {
    console.log('═'.repeat(80));
    console.log('📊 TYPESCRIPT HEALTH REPORT');
    console.log('═'.repeat(80));
    console.log();

    // Summary
    console.log('📈 Summary:');
    console.log(`   Total Errors: ${report.totalErrors}`);
    console.log(`   Affected Files: ${report.affectedFiles}`);
    console.log(`   Unique Error Types: ${report.errorsByType.size}`);
    console.log();

    // Top error types
    console.log('🔝 Top Error Types:');
    const sortedErrors = Array.from(report.errorsByType.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [errorType, count] of sortedErrors) {
      const percentage = ((count / report.totalErrors) * 100).toFixed(1);
      console.log(`   ${errorType}: ${count} (${percentage}%)`);
    }
    console.log();

    // Critical files
    console.log('🚨 Files with Most Errors:');
    for (const fileSummary of report.criticalFiles.slice(0, 10)) {
      const relativePath = path.relative(this.rootPath, fileSummary.file);
      console.log(`\n   📄 ${relativePath} (${fileSummary.errorCount} errors)`);
      console.log('   Sample errors:');
      for (const error of fileSummary.sampleErrors.slice(0, 3)) {
        console.log(`      - ${error}`);
      }
    }
    console.log();

    // Recommendations
    console.log('💡 Recommendations:');
    for (const recommendation of report.recommendations) {
      console.log(`\n${recommendation}`);
    }
    console.log();

    // Export to JSON
    const reportPath = path.join(this.rootPath, 'typescript-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      ...report,
      errorsByType: Array.from(report.errorsByType.entries()),
    }, null, 2));

    console.log(`📝 Detailed report saved to: ${reportPath}`);
    console.log('═'.repeat(80));
  }

  /**
   * Check if codebase is healthy
   */
  isHealthy(report: HealthReport): boolean {
    return report.totalErrors === 0;
  }

  /**
   * Get health score (0-100)
   */
  getHealthScore(report: HealthReport): number {
    // Base score starts at 100
    let score = 100;

    // Deduct points for errors
    const errorPenalty = Math.min(report.totalErrors * 0.1, 80);
    score -= errorPenalty;

    // Deduct points for affected files
    const filePenalty = Math.min(report.affectedFiles * 0.5, 15);
    score -= filePenalty;

    return Math.max(0, Math.round(score));
  }
}

// CLI interface
async function main() {
  const validator = new TypeScriptHealthValidator();
  const report = validator.generateReport();
  
  validator.printReport(report);
  
  const healthScore = validator.getHealthScore(report);
  console.log(`\n🎯 TypeScript Health Score: ${healthScore}/100`);
  
  if (validator.isHealthy(report)) {
    console.log('✅ Codebase is TypeScript healthy!');
    process.exit(0);
  } else {
    console.log('⚠️  TypeScript issues detected. Review recommendations above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export { TypeScriptHealthValidator };
