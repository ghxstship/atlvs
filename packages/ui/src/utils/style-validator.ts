import { tryCatch, Result, reportError } from '../utils/error-handling';
/**
 * ZERO-TOLERANCE STYLE CONSISTENCY VALIDATOR
 * Enterprise-Grade Runtime and Build-Time Style Validation
 */

interface StyleViolation {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly rule: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly suggestion?: string;
}

interface ValidationResult {
  readonly passed: boolean;
  readonly errors: readonly StyleViolation[];
  readonly warnings: readonly StyleViolation[];
  readonly totalViolations: number;
}

export class StyleConsistencyValidator {
  private readonly violations: StyleViolation[] = [];
  private readonly allowedHardcodedPatterns = new Set([
    // Allow these specific patterns
    'hsl(var(--color-foreground) / 0)', // Transparent black
    'hsl(var(--color-background))', // Pure white
    'hsl(var(--color-foreground))', // Pure black
    'hsl(0 0% 0%)', 'hsl(0 0% 100%)', // Basic black/white in HSL
  ]);

  public validateFile(filePath: string, content: string): ValidationResult {
    this.violations.length = 0;

    // Skip validation for certain file types
    if (this.shouldSkipFile(filePath)) {
      return this.buildResult();
    }

    // Run all validation checks
    this.checkHardcodedColors(filePath, content);
    this.checkHardcodedSpacing(filePath, content);
    this.checkHardcodedShadows(filePath, content);
    this.checkInconsistentNaming(filePath, content);
    this.checkLegacyImports(filePath, content);
    this.checkMagicNumbers(filePath, content);
    this.checkDeprecatedCSS(filePath, content);

    return this.buildResult();
  }

  private shouldSkipFile(filePath: string): boolean {
    const skipPatterns = [
      /node_modules/,
      /\.test\./,
      /\.spec\./,
      /\.stories\./,
      /\.config\./,
      /\.d\.ts$/,
      /package\.json$/,
    ];

    return skipPatterns.some(pattern => pattern.test(filePath));
  }

  private checkHardcodedColors(filePath: string, content: string): void {
    const patterns = [
      // Hex colors
      {
        regex: /#([0-9a-fA-F]{3,8})/g,
        type: 'hex-color',
        suggestion: 'Use DESIGN_TOKENS.colors.* or CSS custom properties'
      },
      // RGB/RGBA colors
      {
        regex: /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/g,
        type: 'rgb-color',
        suggestion: 'Use DESIGN_TOKENS.colors.* or CSS custom properties'
      },
      // HSL/HSLA colors (unless using design tokens)
      {
        regex: /hsla?\(\s*\d+\s*,?\s*\d+%?\s*,?\s*\d+%?\s*(?:,\s*[\d.]+)?\s*\)/g,
        type: 'hsl-color',
        suggestion: 'Use DESIGN_TOKENS.colors.* or CSS custom properties'
      },
    ];

    patterns.forEach(({ regex, type, suggestion }) => {
      const matches = Array.from(content.matchAll(regex));
      matches.forEach(match => {
        if (!this.allowedHardcodedPatterns.has(match[0])) {
          const position = this.getLineAndColumn(content, match.index!);
          this.addViolation({
            file: filePath,
            line: position.line,
            column: position.column,
            rule: `hardcoded-${type}`,
            severity: 'error',
            message: `Hardcoded ${type} detected: "${match[0]}"`,
            suggestion,
          });
        }
      });
    });
  }

  private checkHardcodedSpacing(filePath: string, content: string): void {
    const patterns = [
      // Pixel values (excluding allowed contexts)
      {
        regex: /(?<![\w-])\d+px(?!\]|;?\s*\/\*.*allowed.*\*\/)/g,
        type: 'pixel-spacing',
        suggestion: 'Use DESIGN_TOKENS.spacing.* or semantic spacing classes'
      },
      // Rem values (excluding allowed contexts)
      {
        regex: /(?<![\w-])\d*\.?\d+rem(?!\]|;?\s*\/\*.*allowed.*\*\/)/g,
        type: 'rem-spacing',
        suggestion: 'Use DESIGN_TOKENS.spacing.* or semantic spacing classes'
      },
      // Em values (excluding allowed contexts)
      {
        regex: /(?<![\w-])\d*\.?\d+em(?!\]|;?\s*\/\*.*allowed.*\*\/)/g,
        type: 'em-spacing',
        suggestion: 'Use DESIGN_TOKENS.spacing.* or semantic spacing classes'
      },
    ];

    patterns.forEach(({ regex, type, suggestion }) => {
      const matches = Array.from(content.matchAll(regex));
      matches.forEach(match => {
        const position = this.getLineAndColumn(content, match.index!);
        
        // Skip if it's in a comment or design token definition
        const lineContent = this.getLineContent(content, position.line);
        if (lineContent.includes('DESIGN_TOKENS') || 
            lineContent.includes('allowed') ||
            lineContent.includes('clamp(')) {
          return;
        }

        this.addViolation({
          file: filePath,
          line: position.line,
          column: position.column,
          rule: `hardcoded-${type}`,
          severity: 'error',
          message: `Hardcoded ${type} detected: "${match[0]}"`,
          suggestion,
        });
      });
    });
  }

  private checkHardcodedShadows(filePath: string, content: string): void {
    const shadowPattern = /box-shadow:\s*[^;]+(?<!var\(--[^)]+\))/g;
    const matches = Array.from(content.matchAll(shadowPattern));
    
    matches.forEach(match => {
      const position = this.getLineAndColumn(content, match.index!);
      this.addViolation({
        file: filePath,
        line: position.line,
        column: position.column,
        rule: 'hardcoded-shadow',
        severity: 'warning',
        message: `Hardcoded box-shadow detected: "${match[0]}"`,
        suggestion: 'Use DESIGN_TOKENS.shadows.* or CSS custom properties',
      });
    });
  }

  private checkInconsistentNaming(filePath: string, content: string): void {
    // Check component naming (must be PascalCase)
    if (filePath.includes('/components/') && filePath.endsWith('.tsx')) {
      const componentPattern = /(?:export\s+(?:default\s+)?(?:function|const|class)\s+)([a-z][a-zA-Z]*)/g;
      const matches = Array.from(content.matchAll(componentPattern));
      
      matches.forEach(match => {
        const position = this.getLineAndColumn(content, match.index!);
        this.addViolation({
          file: filePath,
          line: position.line,
          column: position.column,
          rule: 'component-naming',
          severity: 'error',
          message: `Component "${match[1]}" must use PascalCase naming`,
          suggestion: `Rename to ${this.toPascalCase(match[1])}`,
        });
      });
    }

    // Check hook naming (must start with 'use' and be camelCase)
    if (filePath.includes('/hooks/') && filePath.endsWith('.ts')) {
      const hookPattern = /(?:export\s+(?:default\s+)?(?:function|const)\s+)([A-Z][a-zA-Z]*|[a-z]+(?![a-zA-Z]*use))/g;
      const matches = Array.from(content.matchAll(hookPattern));
      
      matches.forEach(match => {
        const position = this.getLineAndColumn(content, match.index!);
        this.addViolation({
          file: filePath,
          line: position.line,
          column: position.column,
          rule: 'hook-naming',
          severity: 'error',
          message: `Hook "${match[1]}" must start with 'use' and be camelCase`,
          suggestion: `Rename to use${this.toPascalCase(match[1])}`,
        });
      });
    }
  }

  private checkLegacyImports(filePath: string, content: string): void {
    const legacyPatterns = [
      {
        regex: /from\s+['"]@ghxstship\/ui\/legacy['"/]/g,
        message: 'Legacy UI import detected',
        suggestion: 'Use @ghxstship/ui instead'
      },
      {
        regex: /from\s+['"]\.\.\/\.\.\/legacy['"/]/g,
        message: 'Relative legacy import detected',
        suggestion: 'Use proper package imports'
      },
      {
        regex: /import.*styled-components/g,
        message: 'styled-components import detected',
        suggestion: 'Use Tailwind CSS with design tokens'
      },
    ];

    legacyPatterns.forEach(({ regex, message, suggestion }) => {
      const matches = Array.from(content.matchAll(regex));
      matches.forEach(match => {
        const position = this.getLineAndColumn(content, match.index!);
        this.addViolation({
          file: filePath,
          line: position.line,
          column: position.column,
          rule: 'legacy-import',
          severity: 'error',
          message,
          suggestion,
        });
      });
    });
  }

  private checkMagicNumbers(filePath: string, content: string): void {
    // Skip magic number check for certain contexts
    const allowedNumbers = new Set(['0', '1', '-1', '100', '200', '300', '400', '500', '600', '700', '800', '900']);
    const magicNumberPattern = /(?<![\w.])\d{2,}(?![\w.]|px|rem|em|%|vh|vw|ms|s)/g;
    
    const matches = Array.from(content.matchAll(magicNumberPattern));
    matches.forEach(match => {
      if (!allowedNumbers.has(match[0])) {
        const position = this.getLineAndColumn(content, match.index!);
        const lineContent = this.getLineContent(content, position.line);
        
        // Skip if it's in a comment, design token, or specific contexts
        if (lineContent.includes('//') || 
            lineContent.includes('DESIGN_TOKENS') ||
            lineContent.includes('const') ||
            lineContent.includes('enum')) {
          return;
        }

        this.addViolation({
          file: filePath,
          line: position.line,
          column: position.column,
          rule: 'magic-number',
          severity: 'warning',
          message: `Magic number detected: "${match[0]}"`,
          suggestion: 'Define as a named constant or use design tokens',
        });
      }
    });
  }

  private checkDeprecatedCSS(filePath: string, content: string): void {
    const deprecatedPatterns = [
      {
        regex: /float:\s*(left|right)/g,
        message: 'Deprecated float property',
        suggestion: 'Use Flexbox or Grid layout'
      },
      {
        regex: /position:\s*absolute.*top:\s*50%.*left:\s*50%.*transform:\s*translate\(-50%,\s*-50%\)/gs,
        message: 'Deprecated centering technique',
        suggestion: 'Use Flexbox or Grid for centering'
      },
      {
        regex: /clearfix|\.cf/g,
        message: 'Deprecated clearfix usage',
        suggestion: 'Use modern layout methods'
      },
    ];

    deprecatedPatterns.forEach(({ regex, message, suggestion }) => {
      const matches = Array.from(content.matchAll(regex));
      matches.forEach(match => {
        const position = this.getLineAndColumn(content, match.index!);
        this.addViolation({
          file: filePath,
          line: position.line,
          column: position.column,
          rule: 'deprecated-css',
          severity: 'warning',
          message,
          suggestion,
        });
      });
    });
  }

  private getLineAndColumn(content: string, index: number): { line: number; column: number } {
    const beforeIndex = content.substring(0, index);
    const lines = beforeIndex.split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  private getLineContent(content: string, lineNumber: number): string {
    const lines = content.split('\n');
    return lines[lineNumber - 1] || '';
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private addViolation(violation: StyleViolation): void {
    this.violations.push(violation);
  }

  private buildResult(): ValidationResult {
    const errors = this.violations.filter(v => v.severity === 'error');
    const warnings = this.violations.filter(v => v.severity === 'warning');

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      totalViolations: this.violations.length,
    };
  }
}

// ==========================================
// RUNTIME VALIDATION SYSTEM
// ==========================================

export class RuntimeValidator {
  private static instance: RuntimeValidator;
  private readonly errors: string[] = [];
  private readonly warnings: string[] = [];

  public static getInstance(): RuntimeValidator {
    if (!RuntimeValidator.instance) {
      RuntimeValidator.instance = new RuntimeValidator();
    }
    return RuntimeValidator.instance;
  }

  public validateApplication(): ValidationResult {
    this.errors.length = 0;
    this.warnings.length = 0;

    // MANDATORY: Check all design tokens are loaded
    this.validateDesignTokens();
    
    // MANDATORY: Check component consistency
    this.validateComponentRegistry();
    
    // MANDATORY: Check for memory leaks
    this.validateMemoryUsage();
    
    // MANDATORY: Check performance metrics
    this.validatePerformanceMetrics();

    const passed = this.errors.length === 0;
    
    if (!passed && typeof window !== 'undefined') {
      console.error('🚨 RUNTIME VALIDATION FAILED:', this.errors);
    }

    return {
      passed,
      errors: this.errors.map((error, index) => ({
        file: 'runtime',
        line: 0,
        column: 0,
        rule: 'runtime-validation',
        severity: 'error' as const,
        message: error,
      })),
      warnings: this.warnings.map((warning, index) => ({
        file: 'runtime',
        line: 0,
        column: 0,
        rule: 'runtime-validation',
        severity: 'warning' as const,
        message: warning,
      })),
      totalViolations: this.errors.length + this.warnings.length,
    };
  }

  private validateDesignTokens(): void {
    try {
      // Check if design tokens are available
      if (typeof window !== 'undefined') {
        const rootStyles = getComputedStyle(document.documentElement);
        
        // Check for essential CSS custom properties
        const essentialTokens = [
          '--color-primary',
          '--color-background',
          '--color-foreground',
          '--spacing-4',
          '--font-size-base',
        ];

        essentialTokens.forEach(token => {
          const value = rootStyles.getPropertyValue(token);
          if (!value) {
            this.errors.push(`Essential design token missing: ${token}`);
          }
        });
      }
    } catch (error) {
      this.errors.push(`Design tokens validation failed: ${error}`);
    }
  }

  private validateComponentRegistry(): void {
    // Check if component registry exists (if implemented)
    if (typeof window !== 'undefined' && (window as any).__COMPONENT_REGISTRY__) {
      const registry = (window as any).__COMPONENT_REGISTRY__;
      
      // Validate each registered component
      for (const [name, component] of Object.entries(registry)) {
        if (!component || typeof component !== 'function') {
          this.errors.push(`Invalid component in registry: ${name}`);
        }
      }
    }
  }

  private validateMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1048576;
      const limitMB = memory.jsHeapSizeLimit / 1048576;
      
      // Warning if using more than 75% of available memory
      if (usedMB > (limitMB * 0.75)) {
        this.warnings.push(`High memory usage: ${usedMB.toFixed(2)}MB of ${limitMB.toFixed(2)}MB`);
      }
      
      // Error if using more than 90% of available memory
      if (usedMB > (limitMB * 0.90)) {
        this.errors.push(`Critical memory usage: ${usedMB.toFixed(2)}MB of ${limitMB.toFixed(2)}MB`);
      }
    }
  }

  private validatePerformanceMetrics(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'getEntriesByType' in performance) {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // First Contentful Paint should be < 1.8s
          const fcp = navigation.responseEnd - navigation.fetchStart;
          if (fcp > 1800) {
            this.warnings.push(`FCP too slow: ${fcp}ms > 1800ms`);
          }
        }
      } catch (error) {
        // Performance API might not be fully supported
        this.warnings.push('Performance metrics validation skipped');
      }
    }
  }
}

// Export singleton instance
export const styleValidator = new StyleConsistencyValidator();
export const runtimeValidator = RuntimeValidator.getInstance();

// Auto-initialize runtime validation in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  document.addEventListener('DOMContentLoaded', () => {
    const result = runtimeValidator.validateApplication();
    
    if (!result.passed) {
      // Report to monitoring service (implement as needed)
      console.error('🚨 PRODUCTION VALIDATION FAILURES:', result.errors);
    }
  });
}
