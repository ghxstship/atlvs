'use client';

import * as React from 'react';
import { useTheme } from '../providers/ThemeProvider';

export interface CodeBlockProps {
  /** Code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Highlight specific lines (1-indexed) */
  highlightLines?: number[];
  /** Optional className */
  className?: string;
  /** Optional title */
  title?: string;
}

/**
 * CodeBlock - Theme-aware code block with syntax highlighting
 * 
 * Automatically adapts syntax highlighting theme based on current theme.
 * Supports multiple syntax highlighters (Prism, Highlight.js, Shiki).
 * 
 * @example
 * ```tsx
 * <CodeBlock
 *   code="const hello = 'world';"
 *   language="typescript"
 *   showLineNumbers
 *   title="example.ts"
 * />
 * ```
 */
export function CodeBlock({
  code,
  language = 'text',
  showLineNumbers = false,
  highlightLines = [],
  className = '',
  title,
}: CodeBlockProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme.includes('dark');
  const codeRef = React.useRef<HTMLElement>(null);

  // Apply syntax highlighting on mount and theme change
  React.useEffect(() => {
    if (!codeRef.current) return;

    // Check for Prism.js
    if (typeof window !== 'undefined' && (window as any).Prism) {
      (window as any).Prism.highlightElement(codeRef.current);
    }
    
    // Check for Highlight.js
    if (typeof window !== 'undefined' && (window as any).hljs) {
      (window as any).hljs.highlightElement(codeRef.current);
    }
  }, [code, language, isDark]);

  const lines = code.split('\n');

  return (
    <div className={`code-block ${className}`} data-theme={isDark ? 'dark' : 'light'}>
      {title && (
        <div className="code-block-title bg-muted px-4 py-2 text-sm font-medium border-b border-border">
          {title}
        </div>
      )}
      <div className="code-block-content relative">
        <pre className="bg-card text-card-foreground p-4 rounded-lg overflow-x-auto">
          <code
            ref={codeRef}
            className={`language-${language}`}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
          >
            {showLineNumbers ? (
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  {lines.map((line, index) => {
                    const lineNumber = index + 1;
                    const isHighlighted = highlightLines.includes(lineNumber);
                    return (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: isHighlighted
                            ? 'var(--color-accent)'
                            : 'transparent',
                        }}
                      >
                        <td
                          style={{
                            paddingRight: '1rem',
                            textAlign: 'right',
                            userSelect: 'none',
                            color: 'var(--color-muted-foreground)',
                            minWidth: '3ch',
                          }}
                        >
                          {lineNumber}
                        </td>
                        <td style={{ paddingLeft: '1rem' }}>{line}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Apply syntax highlighting theme on mount
 */
export function useSyntaxHighlighting(library: 'prism' | 'highlight' = 'prism') {
  const { effectiveTheme } = useTheme();

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    // Dynamically import and apply syntax theme
    import('../utils/syntax-theme-adapter').then(({ applySyntaxTheme }) => {
      applySyntaxTheme(library);
    });
  }, [effectiveTheme, library]);
}
