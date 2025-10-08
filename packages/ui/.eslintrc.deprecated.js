/**
 * ESLint Configuration — Deprecated Import Prevention
 * Enforces canonical import patterns and prevents legacy imports
 * 
 * @package @ghxstship/ui
 * @version 2.0.0 (2030 Standard)
 */

module.exports = {
  rules: {
    /**
     * Prevent legacy import patterns
     * All components should be imported from the package root
     */
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['@ghxstship/ui/atoms/*'],
          message: '❌ DEPRECATED: Import from \'@ghxstship/ui\' instead. Legacy atoms/* imports will be removed in v3.0.0. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md'
        },
        {
          group: ['@ghxstship/ui/unified/*'],
          message: '❌ DEPRECATED: Import from \'@ghxstship/ui\' instead. Legacy unified/* imports will be removed in v3.0.0. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md'
        },
        {
          group: ['@ghxstship/ui/molecules/*'],
          message: '❌ DEPRECATED: Import from \'@ghxstship/ui\' instead. Direct molecule/* imports will be removed in v3.0.0. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md'
        },
        {
          group: ['@ghxstship/ui/organisms/*'],
          message: '❌ DEPRECATED: Import from \'@ghxstship/ui\' instead. Direct organism/* imports will be removed in v3.0.0. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md'
        },
        {
          group: ['@ghxstship/ui/components/Button'],
          message: '❌ DEPRECATED: Import from \'@ghxstship/ui\' instead. Deep path imports are not supported. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md'
        },
        {
          group: ['@ghxstship/ui/components/Input'],
          message: '❌ DEPRECATED: Import from \'@ghxstship/ui\' instead. Deep path imports are not supported. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md'
        },
        {
          group: ['@ghxstship/ui/components/atomic/*'],
          message: '❌ DEPRECATED: Import from \'@ghxstship/ui\' instead. Deep path imports are not supported. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md'
        },
        {
          group: ['@ghxstship/ui/src/*'],
          message: '❌ INVALID: Never import from src/ directly. Import from \'@ghxstship/ui\' only. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md'
        }
      ]
    }],

    /**
     * Prevent importing from old @ghxstship/ui package
     * (if we had one - keeping for future-proofing)
     */
    'no-restricted-modules': ['error', {
      patterns: [
        {
          group: ['@ghxstship/ui-legacy'],
          message: '❌ DEPRECATED: The @ghxstship/ui-legacy package is no longer maintained. Use @ghxstship/ui instead.'
        }
      ]
    }]
  },

  overrides: [
    {
      // Internal package files are exempt from these rules
      files: [
        '**/packages/ui/src/**/*.ts',
        '**/packages/ui/src/**/*.tsx',
        '**/packages/ui/scripts/**/*.ts',
        '**/packages/ui/**/*.config.ts'
      ],
      rules: {
        'no-restricted-imports': 'off'
      }
    },
    {
      // Test files can use internal imports for testing
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/__tests__/**'
      ],
      rules: {
        'no-restricted-imports': 'warn' // Warn instead of error for tests
      }
    }
  ]
};
