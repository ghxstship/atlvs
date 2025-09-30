import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'packages/**/src/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'apps/**/src/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'tests/unit/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      all: true,
      include: [
        'packages/**/src/**/*.{ts,tsx,js,jsx}',
        'apps/**/src/**/*.{ts,tsx,js,jsx}',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/index.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/types/**',
        '**/constants/**',
        'tests/**',
        'scripts/**',
        'docs/**',
      ],
      reporter: ['text', 'json', 'html', 'lcov', 'cobertura'],
      thresholds: {
        global: {
          lines: 95,
          functions: 95,
          branches: 90,
          statements: 95,
        },
        'packages/ui/src/': {
          lines: 98,
          functions: 98,
          branches: 95,
          statements: 98,
        },
      },
      reportsDirectory: './coverage/unit',
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    bail: 1,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@ghxstship/ui': path.resolve(__dirname, './packages/ui/src'),
      '@ghxstship/domain': path.resolve(__dirname, './packages/domain/src'),
      '@ghxstship/application': path.resolve(__dirname, './packages/application/src'),
    },
  },
});
