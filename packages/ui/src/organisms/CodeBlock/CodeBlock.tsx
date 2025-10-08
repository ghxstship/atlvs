/**
 * CodeBlock Component — Syntax Highlighted Code
 * Display code with syntax highlighting
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';

export interface CodeBlockProps {
  /** Code content */
  code: string;
  
  /** Language */
  language?: string;
  
  /** Show line numbers */
  showLineNumbers?: boolean;
  
  /** Allow copy */
  allowCopy?: boolean;
  
  /** Max height */
  maxHeight?: string;
}

/**
 * CodeBlock Component
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  showLineNumbers = true,
  allowCopy = true,
  maxHeight = '500px',
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };
  
  const lines = code.split('\n');
  
  return (
    <div className="relative group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-muted)] border-b border-[var(--color-border)] rounded-t-lg">
        <div className="text-sm text-[var(--color-foreground-secondary)] font-mono">
          {language}
        </div>
        {allowCopy && (
          <button
            onClick={handleCopy}
            className="
              flex items-center gap-1 px-2 py-1 rounded
              text-sm text-[var(--color-foreground-secondary)]
              hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)]
              transition-colors
            "
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Code */}
      <div
        className="overflow-auto bg-[var(--color-surface)] border border-[var(--color-border)] border-t-0 rounded-b-lg"
        style={{ maxHeight }}
      >
        <pre className="p-4">
          <code className="text-sm font-mono">
            {showLineNumbers ? (
              <table className="w-full">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="pr-4 text-right text-[var(--color-foreground-muted)] select-none w-12">
                        {index + 1}
                      </td>
                      <td className="whitespace-pre">{line || ' '}</td>
                    </tr>
                  ))}
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
};

CodeBlock.displayName = 'CodeBlock';
