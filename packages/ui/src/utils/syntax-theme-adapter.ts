/**
 * Syntax Highlighting Theme Adapter
 * Provides theme integration for code syntax highlighting libraries
 */

import { useTheme } from '../providers/ThemeProvider';
import { SEMANTIC_TOKENS } from '../tokens/unified-design-tokens';

export interface SyntaxTheme {
  background: string;
  foreground: string;
  comment: string;
  keyword: string;
  string: string;
  number: string;
  function: string;
  variable: string;
  operator: string;
  punctuation: string;
  className: string;
  tag: string;
  attribute: string;
  property: string;
  constant: string;
  regex: string;
  error: string;
  warning: string;
}

/**
 * Get syntax highlighting colors for current theme
 */
export function useSyntaxTheme(): SyntaxTheme {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme.includes('dark');
  const semantic = isDark ? SEMANTIC_TOKENS.dark : SEMANTIC_TOKENS.light;

  return {
    background: semantic.card,
    foreground: semantic.cardForeground,
    comment: semantic.mutedForeground,
    keyword: semantic.primary,
    string: semantic.success,
    number: semantic.info,
    function: semantic.accent,
    variable: semantic.foreground,
    operator: semantic.foreground,
    punctuation: semantic.mutedForeground,
    className: semantic.accent,
    tag: semantic.primary,
    attribute: semantic.info,
    property: semantic.accent,
    constant: semantic.warning,
    regex: semantic.success,
    error: semantic.destructive,
    warning: semantic.warning,
  };
}

/**
 * Prism.js theme configuration
 */
export function usePrismTheme() {
  const colors = useSyntaxTheme();

  return {
    'code[class*="language-"]': {
      color: colors.foreground,
      background: colors.background,
      textShadow: 'none',
      fontFamily: 'var(--font-mono, "Share Tech Mono", monospace)',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      tabSize: 2,
      hyphens: 'none',
    },
    'pre[class*="language-"]': {
      color: colors.foreground,
      background: colors.background,
      textShadow: 'none',
      fontFamily: 'var(--font-mono, "Share Tech Mono", monospace)',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      tabSize: 2,
      hyphens: 'none',
      padding: '1rem',
      margin: '0.5rem 0',
      overflow: 'auto',
      borderRadius: '0.5rem',
      border: `1px solid ${colors.punctuation}`,
    },
    '.token.comment': { color: colors.comment, fontStyle: 'italic' },
    '.token.prolog': { color: colors.comment },
    '.token.doctype': { color: colors.comment },
    '.token.cdata': { color: colors.comment },
    '.token.punctuation': { color: colors.punctuation },
    '.token.namespace': { opacity: 0.7 },
    '.token.property': { color: colors.property },
    '.token.tag': { color: colors.tag },
    '.token.boolean': { color: colors.constant },
    '.token.number': { color: colors.number },
    '.token.constant': { color: colors.constant },
    '.token.symbol': { color: colors.constant },
    '.token.deleted': { color: colors.error },
    '.token.selector': { color: colors.string },
    '.token.attr-name': { color: colors.attribute },
    '.token.string': { color: colors.string },
    '.token.char': { color: colors.string },
    '.token.builtin': { color: colors.function },
    '.token.inserted': { color: colors.string },
    '.token.operator': { color: colors.operator },
    '.token.entity': { color: colors.foreground, cursor: 'help' },
    '.token.url': { color: colors.string },
    '.language-css .token.string': { color: colors.string },
    '.style .token.string': { color: colors.string },
    '.token.atrule': { color: colors.keyword },
    '.token.attr-value': { color: colors.string },
    '.token.keyword': { color: colors.keyword, fontWeight: 'bold' },
    '.token.function': { color: colors.function },
    '.token.class-name': { color: colors.className },
    '.token.regex': { color: colors.regex },
    '.token.important': { color: colors.warning, fontWeight: 'bold' },
    '.token.variable': { color: colors.variable },
    '.token.bold': { fontWeight: 'bold' },
    '.token.italic': { fontStyle: 'italic' },
  };
}

/**
 * Highlight.js theme configuration
 */
export function useHighlightJsTheme() {
  const colors = useSyntaxTheme();

  return {
    '.hljs': {
      display: 'block',
      overflowX: 'auto',
      padding: '1rem',
      color: colors.foreground,
      background: colors.background,
      borderRadius: '0.5rem',
      border: `1px solid ${colors.punctuation}`,
    },
    '.hljs-comment': { color: colors.comment, fontStyle: 'italic' },
    '.hljs-quote': { color: colors.comment, fontStyle: 'italic' },
    '.hljs-keyword': { color: colors.keyword, fontWeight: 'bold' },
    '.hljs-selector-tag': { color: colors.tag, fontWeight: 'bold' },
    '.hljs-literal': { color: colors.constant },
    '.hljs-number': { color: colors.number },
    '.hljs-string': { color: colors.string },
    '.hljs-regexp': { color: colors.regex },
    '.hljs-subst': { color: colors.foreground },
    '.hljs-symbol': { color: colors.constant },
    '.hljs-class': { color: colors.className },
    '.hljs-function': { color: colors.function },
    '.hljs-title': { color: colors.function },
    '.hljs-params': { color: colors.foreground },
    '.hljs-built_in': { color: colors.function },
    '.hljs-builtin-name': { color: colors.function },
    '.hljs-attribute': { color: colors.attribute },
    '.hljs-variable': { color: colors.variable },
    '.hljs-property': { color: colors.property },
    '.hljs-tag': { color: colors.tag },
    '.hljs-name': { color: colors.tag },
    '.hljs-attr': { color: colors.attribute },
    '.hljs-selector-id': { color: colors.className },
    '.hljs-selector-class': { color: colors.className },
    '.hljs-selector-attr': { color: colors.attribute },
    '.hljs-selector-pseudo': { color: colors.keyword },
    '.hljs-addition': { color: colors.string, backgroundColor: `${colors.string}20` },
    '.hljs-deletion': { color: colors.error, backgroundColor: `${colors.error}20` },
    '.hljs-link': { color: colors.string, textDecoration: 'underline' },
    '.hljs-meta': { color: colors.comment },
    '.hljs-meta-keyword': { color: colors.keyword },
    '.hljs-meta-string': { color: colors.string },
    '.hljs-emphasis': { fontStyle: 'italic' },
    '.hljs-strong': { fontWeight: 'bold' },
  };
}

/**
 * Monaco Editor theme configuration
 */
export function useMonacoTheme() {
  const colors = useSyntaxTheme();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme.includes('dark');

  return {
    base: (isDark ? 'vs-dark' : 'vs') as 'vs' | 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: colors.comment, fontStyle: 'italic' },
      { token: 'keyword', foreground: colors.keyword, fontStyle: 'bold' },
      { token: 'string', foreground: colors.string },
      { token: 'number', foreground: colors.number },
      { token: 'regexp', foreground: colors.regex },
      { token: 'operator', foreground: colors.operator },
      { token: 'namespace', foreground: colors.className },
      { token: 'type', foreground: colors.className },
      { token: 'struct', foreground: colors.className },
      { token: 'class', foreground: colors.className },
      { token: 'interface', foreground: colors.className },
      { token: 'function', foreground: colors.function },
      { token: 'variable', foreground: colors.variable },
      { token: 'constant', foreground: colors.constant },
      { token: 'property', foreground: colors.property },
      { token: 'attribute', foreground: colors.attribute },
      { token: 'tag', foreground: colors.tag },
      { token: 'delimiter', foreground: colors.punctuation },
      { token: 'error-token', foreground: colors.error },
      { token: 'warn-token', foreground: colors.warning },
    ],
    colors: {
      'editor.background': colors.background,
      'editor.foreground': colors.foreground,
      'editor.lineHighlightBackground': `${colors.foreground}10`,
      'editor.selectionBackground': `${colors.foreground}30`,
      'editor.inactiveSelectionBackground': `${colors.foreground}20`,
      'editorLineNumber.foreground': colors.comment,
      'editorLineNumber.activeForeground': colors.foreground,
      'editorCursor.foreground': colors.foreground,
      'editorWhitespace.foreground': `${colors.comment}40`,
      'editorIndentGuide.background': `${colors.comment}20`,
      'editorIndentGuide.activeBackground': `${colors.comment}40`,
    },
  };
}

/**
 * Shiki theme configuration
 */
export function useShikiTheme() {
  const colors = useSyntaxTheme();
  const { effectiveTheme } = useTheme();

  return {
    name: `ghxstship-${effectiveTheme}`,
    type: (effectiveTheme.includes('dark') ? 'dark' : 'light') as 'dark' | 'light',
    colors: {
      'editor.background': colors.background,
      'editor.foreground': colors.foreground,
    },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: colors.comment, fontStyle: 'italic' } },
      { scope: ['keyword', 'storage.type', 'storage.modifier'], settings: { foreground: colors.keyword, fontStyle: 'bold' } },
      { scope: ['string', 'string.quoted'], settings: { foreground: colors.string } },
      { scope: ['constant.numeric', 'constant.language'], settings: { foreground: colors.number } },
      { scope: ['constant.regexp'], settings: { foreground: colors.regex } },
      { scope: ['entity.name.function', 'support.function'], settings: { foreground: colors.function } },
      { scope: ['entity.name.class', 'entity.name.type', 'support.class'], settings: { foreground: colors.className } },
      { scope: ['variable', 'variable.other'], settings: { foreground: colors.variable } },
      { scope: ['variable.parameter'], settings: { foreground: colors.foreground } },
      { scope: ['constant.other'], settings: { foreground: colors.constant } },
      { scope: ['entity.other.attribute-name'], settings: { foreground: colors.attribute } },
      { scope: ['entity.name.tag'], settings: { foreground: colors.tag } },
      { scope: ['punctuation'], settings: { foreground: colors.punctuation } },
      { scope: ['meta.property-name', 'support.type.property-name'], settings: { foreground: colors.property } },
      { scope: ['invalid'], settings: { foreground: colors.error } },
      { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
      { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
    ],
  };
}

/**
 * CodeMirror 6 theme configuration
 */
export function useCodeMirrorTheme() {
  const colors = useSyntaxTheme();

  return {
    '&': {
      color: colors.foreground,
      backgroundColor: colors.background,
      fontSize: '0.875rem',
      fontFamily: 'var(--font-mono, "Share Tech Mono", monospace)',
    },
    '.cm-content': {
      caretColor: colors.foreground,
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: colors.foreground,
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: `${colors.foreground}30`,
    },
    '.cm-activeLine': {
      backgroundColor: `${colors.foreground}10`,
    },
    '.cm-gutters': {
      backgroundColor: colors.background,
      color: colors.comment,
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: `${colors.foreground}10`,
      color: colors.foreground,
    },
    '.cm-lineNumbers .cm-gutterElement': {
      color: colors.comment,
    },
    '.cm-foldPlaceholder': {
      backgroundColor: `${colors.foreground}20`,
      border: 'none',
      color: colors.comment,
    },
    '.cm-tooltip': {
      backgroundColor: colors.background,
      border: `1px solid ${colors.punctuation}`,
      color: colors.foreground,
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: `${colors.foreground}20`,
      color: colors.foreground,
    },
  };
}

/**
 * Generic syntax highlighting CSS generator
 */
export function generateSyntaxHighlightingCSS(library: 'prism' | 'highlight' | 'monaco' | 'shiki' | 'codemirror' = 'prism'): string {
  const hooks = {
    prism: usePrismTheme,
    highlight: useHighlightJsTheme,
    monaco: useMonacoTheme,
    shiki: useShikiTheme,
    codemirror: useCodeMirrorTheme,
  };

  const themeConfig = hooks[library]();
  
  // Convert theme config to CSS string
  let css = '';
  if (themeConfig && typeof themeConfig === 'object') {
    Object.entries(themeConfig).forEach(([selector, styles]) => {
      if (typeof styles === 'object' && styles !== null) {
        css += `${selector} {\n`;
        Object.entries(styles as Record<string, unknown>).forEach(([property, value]) => {
          const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
          css += `  ${cssProperty}: ${value};\n`;
        });
        css += '}\n\n';
      }
    });
  }

  return css;
}

/**
 * Apply syntax highlighting theme to document
 */
export function applySyntaxTheme(library: 'prism' | 'highlight' | 'monaco' | 'shiki' | 'codemirror' = 'prism'): void {
  if (typeof document === 'undefined') return;

  const css = generateSyntaxHighlightingCSS(library);
  let styleElement = document.getElementById(`ghxstship-syntax-${library}`);

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = `ghxstship-syntax-${library}`;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = css;
}
