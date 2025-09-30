/**
 * Theme Accessibility Validator
 * Automated WCAG contrast ratio validation for theme combinations
 */

export interface ContrastValidationResult {
  passed: Array<{
    pair: string;
    ratio: number;
    level: 'AA' | 'AAA';
  }>;
  failed: Array<{
    pair: string;
    ratio: number;
    required: number;
    level: 'AA' | 'AAA';
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
}

/**
 * Calculate relative luminance of a color
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getRelativeLuminance(color: string): number {
  // Parse HSL color
  const hslMatch = color.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (!hslMatch) {
    console.warn(`Invalid color format: ${color}`);
    return 0;
  }

  const [, h, s, l] = hslMatch.map(Number);
  
  // Convert HSL to RGB
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;
  
  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = lightness < 0.5 
    ? lightness * (1 + saturation)
    : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  
  const r = hueToRgb(p, q, hue + 1/3);
  const g = hueToRgb(p, q, hue);
  const b = hueToRgb(p, q, hue - 1/3);
  
  // Convert to sRGB and calculate relative luminance
  const toLinear = (val: number) => {
    const v = val;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculate contrast ratio between two colors
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG requirements
 */
export function meetsWCAG(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Validate theme accessibility
 */
export function validateThemeAccessibility(
  theme: Record<string, string>,
  level: 'AA' | 'AAA' = 'AA'
): ContrastValidationResult {
  const results: ContrastValidationResult = {
    passed: [],
    failed: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      passRate: 0,
    },
  };

  // Define color pairs to check
  const checks = [
    // Primary text on backgrounds
    { fg: 'foreground', bg: 'background', size: 'normal' as const },
    { fg: 'cardForeground', bg: 'card', size: 'normal' as const },
    { fg: 'popoverForeground', bg: 'popover', size: 'normal' as const },
    
    // Interactive elements
    { fg: 'primaryForeground', bg: 'primary', size: 'normal' as const },
    { fg: 'secondaryForeground', bg: 'secondary', size: 'normal' as const },
    { fg: 'accentForeground', bg: 'accent', size: 'normal' as const },
    { fg: 'destructiveForeground', bg: 'destructive', size: 'normal' as const },
    
    // Status colors
    { fg: 'successForeground', bg: 'success', size: 'normal' as const },
    { fg: 'warningForeground', bg: 'warning', size: 'normal' as const },
    { fg: 'infoForeground', bg: 'info', size: 'normal' as const },
    
    // Muted elements
    { fg: 'mutedForeground', bg: 'muted', size: 'normal' as const },
    
    // Borders and inputs
    { fg: 'foreground', bg: 'border', size: 'normal' as const },
    { fg: 'foreground', bg: 'input', size: 'normal' as const },
  ];

  checks.forEach(check => {
    const fgColor = theme[check.fg];
    const bgColor = theme[check.bg];
    
    if (!fgColor || !bgColor) {
      console.warn(`Missing color: ${check.fg} or ${check.bg}`);
      return;
    }

    const ratio = calculateContrastRatio(fgColor, bgColor);
    const required = level === 'AAA' 
      ? (check.size === 'large' ? 4.5 : 7)
      : (check.size === 'large' ? 3 : 4.5);
    
    const passes = meetsWCAG(ratio, level, check.size);
    const pair = `${check.fg} on ${check.bg}`;
    
    results.summary.total++;
    
    if (passes) {
      results.passed.push({ pair, ratio, level });
      results.summary.passed++;
    } else {
      results.failed.push({ pair, ratio, required, level });
      results.summary.failed++;
    }
  });

  results.summary.passRate = 
    (results.summary.passed / results.summary.total) * 100;

  return results;
}

/**
 * Generate validation report
 */
export function generateValidationReport(
  results: ContrastValidationResult
): string {
  let report = '# Theme Accessibility Validation Report\n\n';
  
  report += `## Summary\n`;
  report += `- Total Checks: ${results.summary.total}\n`;
  report += `- Passed: ${results.summary.passed}\n`;
  report += `- Failed: ${results.summary.failed}\n`;
  report += `- Pass Rate: ${results.summary.passRate.toFixed(1)}%\n\n`;
  
  if (results.passed.length > 0) {
    report += `## ✅ Passed (${results.passed.length})\n\n`;
    results.passed.forEach(item => {
      report += `- **${item.pair}**: ${item.ratio.toFixed(2)}:1 (${item.level})\n`;
    });
    report += '\n';
  }
  
  if (results.failed.length > 0) {
    report += `## ❌ Failed (${results.failed.length})\n\n`;
    results.failed.forEach(item => {
      report += `- **${item.pair}**: ${item.ratio.toFixed(2)}:1 `;
      report += `(Required: ${item.required}:1 for ${item.level})\n`;
    });
    report += '\n';
  }
  
  return report;
}

/**
 * Validate all theme variants
 */
export function validateAllThemes(
  themes: Record<string, Record<string, string>>,
  level: 'AA' | 'AAA' = 'AA'
): Record<string, ContrastValidationResult> {
  const results: Record<string, ContrastValidationResult> = {};
  
  Object.entries(themes).forEach(([themeName, themeColors]) => {
    results[themeName] = validateThemeAccessibility(themeColors, level);
  });
  
  return results;
}
