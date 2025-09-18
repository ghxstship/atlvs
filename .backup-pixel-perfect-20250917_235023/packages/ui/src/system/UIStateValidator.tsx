/**
 * UI State Validator & Normalizer
 * Ensures all components implement required UI states correctly
 * Validates pixel-perfect implementation and accessibility compliance
 */

import React, { useEffect, useRef, useState } from 'react';
import { atomicStates, type UIStateConfig } from './GlobalUIOptimization';

// =============================================================================
// UI STATE VALIDATION SYSTEM
// =============================================================================

export interface ComponentStateValidation {
  componentName: string;
  states: {
    default: boolean;
    hover: boolean;
    active: boolean;
    focused: boolean;
    disabled: boolean;
    loading: boolean;
    error: boolean;
    empty: boolean;
    success: boolean;
    interactive: boolean;
  };
  accessibility: {
    ariaLabels: boolean;
    keyboardNav: boolean;
    focusIndicators: boolean;
    colorContrast: boolean;
    screenReaderSupport: boolean;
  };
  performance: {
    renderTime: number;
    reRenderCount: number;
    memoryUsage: number;
    bundleSize: number;
  };
  pixelPerfect: {
    spacing: boolean;
    typography: boolean;
    borders: boolean;
    shadows: boolean;
    animations: boolean;
  };
}

// =============================================================================
// STATE VALIDATOR CLASS
// =============================================================================

export class UIStateValidator {
  private validationResults: Map<string, ComponentStateValidation> = new Map();
  private observers: Map<string, MutationObserver> = new Map();

  /**
   * Validate a component's UI states
   */
  validateComponent(
    element: HTMLElement,
    componentName: string,
    expectedStates: Partial<UIStateConfig> = {}
  ): ComponentStateValidation {
    const validation: ComponentStateValidation = {
      componentName,
      states: this.validateStates(element, expectedStates),
      accessibility: this.validateAccessibility(element),
      performance: this.measurePerformance(element),
      pixelPerfect: this.validatePixelPerfection(element),
    };

    this.validationResults.set(componentName, validation);
    return validation;
  }

  /**
   * Validate all UI states
   */
  private validateStates(element: HTMLElement, expectedStates: Partial<UIStateConfig>) {
    const computedStyles = window.getComputedStyle(element);
    const classList = element.classList;

    return {
      default: this.hasStateClasses(classList, 'transition-all', 'duration-'),
      hover: this.hasStateClasses(classList, 'hover:'),
      active: this.hasStateClasses(classList, 'active:'),
      focused: this.hasStateClasses(classList, 'focus:'),
      disabled: element.hasAttribute('disabled') || this.hasStateClasses(classList, 'disabled:'),
      loading: this.hasStateClasses(classList, 'animate-pulse', 'cursor-wait'),
      error: this.hasStateClasses(classList, 'border-red', 'text-red', 'bg-red'),
      empty: this.hasStateClasses(classList, 'opacity-60', 'border-dashed'),
      success: this.hasStateClasses(classList, 'border-green', 'text-green', 'bg-green'),
      interactive: computedStyles.cursor === 'pointer' || this.hasStateClasses(classList, 'cursor-pointer'),
    };
  }

  /**
   * Check if element has specific state classes
   */
  private hasStateClasses(classList: DOMTokenList, ...patterns: string[]): boolean {
    return patterns.some(pattern => 
      Array.from(classList).some(className => className.includes(pattern))
    );
  }

  /**
   * Validate accessibility compliance
   */
  private validateAccessibility(element: HTMLElement) {
    return {
      ariaLabels: this.hasAriaLabels(element),
      keyboardNav: this.isKeyboardNavigable(element),
      focusIndicators: this.hasFocusIndicators(element),
      colorContrast: this.hasSufficientContrast(element),
      screenReaderSupport: this.hasScreenReaderSupport(element),
    };
  }

  /**
   * Check for ARIA labels
   */
  private hasAriaLabels(element: HTMLElement): boolean {
    const needsLabel = ['button', 'input', 'select', 'textarea', 'a'].includes(
      element.tagName.toLowerCase()
    );

    if (!needsLabel) return true;

    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('title') ||
      element.textContent?.trim()
    );
  }

  /**
   * Check keyboard navigation support
   */
  private isKeyboardNavigable(element: HTMLElement): boolean {
    const tabIndex = element.getAttribute('tabindex');
    const isNaturallyFocusable = ['button', 'input', 'select', 'textarea', 'a'].includes(
      element.tagName.toLowerCase()
    );

    return isNaturallyFocusable || (tabIndex !== null && tabIndex !== '-1');
  }

  /**
   * Check for focus indicators
   */
  private hasFocusIndicators(element: HTMLElement): boolean {
    const classList = element.classList;
    return this.hasStateClasses(classList, 'focus:', 'focus-visible:');
  }

  /**
   * Check color contrast (simplified check)
   */
  private hasSufficientContrast(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;

    // This is a simplified check - in production, use a proper contrast ratio calculator
    if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
      return true; // Assume parent has proper contrast
    }

    // Check for explicit high-contrast classes
    return element.classList.contains('high-contrast') || 
           element.closest('[data-contrast="high"]') !== null;
  }

  /**
   * Check screen reader support
   */
  private hasScreenReaderSupport(element: HTMLElement): boolean {
    const role = element.getAttribute('role');
    const ariaHidden = element.getAttribute('aria-hidden');
    
    // Element should not be hidden from screen readers unless intentional
    if (ariaHidden === 'true') {
      // Check if it's decorative
      return element.classList.contains('decorative') || 
             element.classList.contains('icon');
    }

    // Check for appropriate ARIA attributes
    return !!(role || element.getAttribute('aria-describedby') || 
             element.getAttribute('aria-label'));
  }

  /**
   * Measure component performance
   */
  private measurePerformance(element: HTMLElement) {
    const startTime = performance.now();
    
    // Force reflow to measure render time
    void element.offsetHeight;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Get re-render count from data attribute (set by React)
    const reRenderCount = parseInt(element.dataset.renderCount || '0', 10);

    // Estimate memory usage (simplified)
    const memoryUsage = this.estimateMemoryUsage(element);

    // Get bundle size from data attribute (set during build)
    const bundleSize = parseInt(element.dataset.bundleSize || '0', 10);

    return {
      renderTime,
      reRenderCount,
      memoryUsage,
      bundleSize,
    };
  }

  /**
   * Estimate memory usage of an element
   */
  private estimateMemoryUsage(element: HTMLElement): number {
    let size = 0;

    // Count DOM nodes
    const nodeCount = element.querySelectorAll('*').length;
    size += nodeCount * 100; // Rough estimate: 100 bytes per node

    // Count event listeners (simplified)
    const eventTypes = ['click', 'change', 'input', 'focus', 'blur'];
    eventTypes.forEach(type => {
      if ((element as any)[`on${type}`]) {
        size += 1000; // Rough estimate: 1KB per listener
      }
    });

    // Count data attributes
    const dataAttributes = Array.from(element.attributes).filter(
      attr => attr.name.startsWith('data-')
    );
    size += dataAttributes.length * 50;

    return size;
  }

  /**
   * Validate pixel-perfect implementation
   */
  private validatePixelPerfection(element: HTMLElement) {
    const styles = window.getComputedStyle(element);

    return {
      spacing: this.validateSpacing(styles),
      typography: this.validateTypography(styles),
      borders: this.validateBorders(styles),
      shadows: this.validateShadows(styles),
      animations: this.validateAnimations(element),
    };
  }

  /**
   * Validate spacing matches design tokens
   */
  private validateSpacing(styles: CSSStyleDeclaration): boolean {
    const validSpacing = ['0px', '1px', '2px', '4px', '6px', '8px', '10px', '12px', 
                          '14px', '16px', '20px', '24px', '28px', '32px', '36px', 
                          '40px', '44px', '48px', '56px', '64px'];

    const spacing = [
      styles.padding,
      styles.margin,
      styles.gap,
    ];

    return spacing.every(value => {
      if (!value || value === 'auto') return true;
      const parts = value.split(' ');
      return parts.every(part => validSpacing.includes(part) || part === '0');
    });
  }

  /**
   * Validate typography matches design system
   */
  private validateTypography(styles: CSSStyleDeclaration): boolean {
    const validFontSizes = ['0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', 
                            '1.5rem', '1.875rem', '2.25rem', '3rem'];
    const validLineHeights = ['1', '1.25', '1.375', '1.5', '1.625', '2'];

    const fontSize = styles.fontSize;
    const lineHeight = styles.lineHeight;

    // Convert px to rem for comparison
    const fontSizeInRem = fontSize.includes('px') 
      ? `${parseFloat(fontSize) / 16}rem` 
      : fontSize;

    return validFontSizes.includes(fontSizeInRem) && 
           (lineHeight === 'normal' || validLineHeights.includes(lineHeight));
  }

  /**
   * Validate borders match design system
   */
  private validateBorders(styles: CSSStyleDeclaration): boolean {
    const validBorderWidths = ['0px', '1px', '2px', '4px'];
    const validBorderRadii = ['0px', '2px', '4px', '6px', '8px', '12px', '16px', '24px', '9999px'];

    const borderWidth = styles.borderWidth;
    const borderRadius = styles.borderRadius;

    return validBorderWidths.includes(borderWidth) && 
           validBorderRadii.includes(borderRadius);
  }

  /**
   * Validate shadows match design system
   */
  private validateShadows(styles: CSSStyleDeclaration): boolean {
    const boxShadow = styles.boxShadow;
    
    if (boxShadow === 'none' || !boxShadow) return true;

    // Check if shadow matches one of our predefined shadows
    const validShadowPatterns = [
      /0 1px 2px/,
      /0 1px 3px/,
      /0 4px 6px/,
      /0 10px 15px/,
      /0 20px 25px/,
      /0 25px 50px/,
      /inset 0 2px 4px/,
    ];

    return validShadowPatterns.some(pattern => pattern.test(boxShadow));
  }

  /**
   * Validate animations are smooth and performant
   */
  private validateAnimations(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element);
    const transition = styles.transition;
    const animation = styles.animation;

    // Check for GPU-accelerated properties
    const gpuAccelerated = transition.includes('transform') || 
                          transition.includes('opacity') ||
                          animation.includes('transform') ||
                          animation.includes('opacity');

    // Check for appropriate timing
    const validTimings = ['150ms', '200ms', '300ms', '500ms', '700ms', '1000ms'];
    const hasValidTiming = validTimings.some(timing => 
      transition.includes(timing) || animation.includes(timing)
    );

    return gpuAccelerated && hasValidTiming;
  }

  /**
   * Get validation report
   */
  getValidationReport(): Map<string, ComponentStateValidation> {
    return this.validationResults;
  }

  /**
   * Clear validation results
   */
  clearResults(): void {
    this.validationResults.clear();
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  /**
   * Start observing component for changes
   */
  observeComponent(element: HTMLElement, componentName: string): void {
    if (this.observers.has(componentName)) {
      this.observers.get(componentName)?.disconnect();
    }

    const observer = new MutationObserver(() => {
      this.validateComponent(element, componentName);
    });

    observer.observe(element, {
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
    });

    this.observers.set(componentName, observer);
  }

  /**
   * Stop observing component
   */
  stopObserving(componentName: string): void {
    const observer = this.observers.get(componentName);
    if (observer) {
      observer.disconnect();
      this.observers.delete(componentName);
    }
  }
}

// =============================================================================
// VALIDATION REACT HOOK
// =============================================================================

export const useUIStateValidation = (componentName: string) => {
  const elementRef = useRef<HTMLElement>(null);
  const validatorRef = useRef<UIStateValidator>(new UIStateValidator());
  const [validation, setValidation] = useState<ComponentStateValidation | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (!elementRef.current) return;

    const validator = validatorRef.current;
    const element = elementRef.current;

    // Initial validation
    const result = validator.validateComponent(element, componentName);
    setValidation(result);

    // Check if all required states are implemented
    const statesValid = Object.values(result.states).filter(Boolean).length >= 7;
    const accessibilityValid = Object.values(result.accessibility).filter(Boolean).length >= 4;
    const pixelPerfectValid = Object.values(result.pixelPerfect).filter(Boolean).length >= 4;

    setIsValid(statesValid && accessibilityValid && pixelPerfectValid);

    // Start observing for changes
    validator.observeComponent(element, componentName);

    return () => {
      validator.stopObserving(componentName);
    };
  }, [componentName]);

  return {
    ref: elementRef,
    validation,
    isValid,
    revalidate: () => {
      if (elementRef.current) {
        const result = validatorRef.current.validateComponent(
          elementRef.current,
          componentName
        );
        setValidation(result);
      }
    },
  };
};

// =============================================================================
// VALIDATION REPORTER COMPONENT
// =============================================================================

interface ValidationReporterProps {
  show?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const ValidationReporter: React.FC<ValidationReporterProps> = ({
  show = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
}) => {
  const [validator] = useState(() => new UIStateValidator());
  const [report, setReport] = useState<Map<string, ComponentStateValidation>>(new Map());
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      // Validate all components on the page
      const components = document.querySelectorAll('[data-component-name]');
      
      components.forEach(component => {
        const name = component.getAttribute('data-component-name');
        if (name && component instanceof HTMLElement) {
          validator.validateComponent(component, name);
        }
      });

      setReport(new Map(validator.getValidationReport()));
    }, 5000); // Validate every 5 seconds

    return () => clearInterval(interval);
  }, [show, validator]);

  if (!show) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const totalComponents = report.size;
  const validComponents = Array.from(report.values()).filter(v => {
    const statesValid = Object.values(v.states).filter(Boolean).length >= 7;
    const a11yValid = Object.values(v.accessibility).filter(Boolean).length >= 4;
    return statesValid && a11yValid;
  }).length;

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[9999] bg-foreground/90 text-background rounded-lg shadow-popover backdrop-blur-sm transition-all duration-300 ${
        isMinimized ? 'w-auto' : 'w-96'
      }`}
    >
      <div className="p-sm border-b border-white/20 flex justify-between items-center">
        <h3 className="text-sm font-semibold">UI State Validation</h3>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-xs px-sm py-xs rounded hover:bg-background/10"
        >
          {isMinimized ? 'Expand' : 'Minimize'}
        </button>
      </div>

      {!isMinimized && (
        <div className="p-sm max-h-96 overflow-y-auto">
          <div className="mb-sm text-sm">
            <div className="flex justify-between mb-xs">
              <span>Total Components:</span>
              <span className="font-mono">{totalComponents}</span>
            </div>
            <div className="flex justify-between mb-xs">
              <span>Valid:</span>
              <span className="font-mono text-success">{validComponents}</span>
            </div>
            <div className="flex justify-between">
              <span>Invalid:</span>
              <span className="font-mono text-destructive">{totalComponents - validComponents}</span>
            </div>
          </div>

          <div className="space-y-xs">
            {Array.from(report.entries()).map(([name, validation]) => {
              const statesCount = Object.values(validation.states).filter(Boolean).length;
              const a11yCount = Object.values(validation.accessibility).filter(Boolean).length;
              const isComponentValid = statesCount >= 7 && a11yCount >= 4;

              return (
                <div
                  key={name}
                  className={`p-sm rounded text-xs ${
                    isComponentValid ? 'bg-success/20' : 'bg-destructive/20'
                  }`}
                >
                  <div className="font-semibold mb-xs">{name}</div>
                  <div className="grid grid-cols-2 gap-xs text-[10px]">
                    <div>States: {statesCount}/10</div>
                    <div>A11y: {a11yCount}/5</div>
                    <div>Render: {validation.performance.renderTime.toFixed(2)}ms</div>
                    <div>Memory: {(validation.performance.memoryUsage / 1024).toFixed(1)}KB</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// EXPORT ALL
// =============================================================================

export default {
  UIStateValidator,
  useUIStateValidation,
  ValidationReporter,
};
