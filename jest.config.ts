import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/packages', '<rootDir>/apps'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // CSS and static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Workspace path aliases
    '^@/(.*)$': '<rootDir>/apps/web/$1',
    '^@/components/(.*)$': '<rootDir>/apps/web/app/_components/$1',
    '^@/lib/(.*)$': '<rootDir>/apps/web/lib/$1',

    '^@ghxstship/ui$': '<rootDir>/packages/ui/src',
    '^@ghxstship/ui/(.*)$': '<rootDir>/packages/ui/src/$1',
    '^@ghxstship/utils$': '<rootDir>/packages/utils/src',
    '^@ghxstship/auth$': '<rootDir>/packages/auth/src',
    '^@ghxstship/domain$': '<rootDir>/packages/domain/src',
    '^@ghxstship/application$': '<rootDir>/packages/application/src',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    'apps/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/__tests__/**',
    '!**/test/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
