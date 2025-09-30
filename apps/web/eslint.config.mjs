import rootConfig from '../../eslint.config.mjs';

/** @type {import('eslint').Linter.FlatConfig} */
const moduleBoundaryOverrides = {
  name: 'ghxstship/web-module-boundaries',
  files: ['**/*.{ts,tsx,js,jsx}'],
  rules: {
    // Enforce module boundaries - prevent shadow UI components
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../_components/ui/*', './_components/ui/*'],
            message: 'Import UI components directly from @ghxstship/ui instead of shadow components',
          },
          {
            group: ['**/packages/ui/src/**'],
            message: 'Import from @ghxstship/ui public API, not internal files',
          },
        ],
      },
    ],
    // Prevent creating new shadow components
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'Program:has(ExportNamedDeclaration[source.value="@ghxstship/ui"]) ExportNamedDeclaration:not([source])',
        message: 'Do not create shadow components. Import and re-export from @ghxstship/ui if needed',
      },
    ],
  },
};

/** @type {import('eslint').Linter.FlatConfig} */
const legacyShadowOverrides = {
  name: 'ghxstship/web-legacy-shadow-ui',
  files: ['app/_components/ui/**/*'],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'warn',
    // Allow legacy shadow components during migration
    'no-restricted-imports': 'off',
  },
};

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [...rootConfig, moduleBoundaryOverrides, legacyShadowOverrides];

export default config;
