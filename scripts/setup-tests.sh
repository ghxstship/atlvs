#!/bin/bash

# GHXSTSHIP Test Suite Setup Script
# 2026 Enterprise Standards
# Version: 1.0.0

set -e

echo "🧪 Setting up GHXSTSHIP Test Suite..."
echo "====================================="

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Install testing dependencies
echo ""
echo "📦 Installing test dependencies..."
echo "---------------------------------"

pnpm add -D \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @playwright/test \
  vitest \
  @vitest/ui \
  @vitest/coverage-v8 \
  msw \
  @faker-js/faker \
  cypress \
  @cypress/code-coverage

print_status "Test dependencies installed"

# 2. Create test configuration files
echo ""
echo "⚙️ Creating test configurations..."
echo "---------------------------------"

# Vitest config
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '*.config.js',
        '.next/',
        'coverage/',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@ui': path.resolve(__dirname, './packages/ui/src'),
      '@domain': path.resolve(__dirname, './packages/domain/src'),
      '@application': path.resolve(__dirname, './packages/application/src'),
    },
  },
});
EOF

# Playwright config
cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
EOF

print_status "Test configurations created"

# 3. Create test directory structure
echo ""
echo "📁 Creating test directory structure..."
echo "--------------------------------------"

mkdir -p tests/{unit,integration,e2e,fixtures,mocks,utils}
mkdir -p cypress/{e2e,fixtures,support,downloads,screenshots,videos}

print_status "Test directories created"

# 4. Create test setup files
echo ""
echo "🔧 Creating test setup files..."
echo "------------------------------"

# Vitest setup
cat > tests/setup.ts << 'EOF'
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
EOF

print_status "Test setup files created"

# 5. Create GitHub Actions workflow
echo ""
echo "🔄 Creating CI/CD test workflow..."
echo "---------------------------------"

mkdir -p .github/workflows

cat > .github/workflows/test.yml << 'EOF'
name: Test Suite
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: coverage-report
          path: coverage/

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
EOF

print_status "CI/CD workflow created"

# 6. Update package.json with test scripts
echo ""
echo "📝 Updating package.json scripts..."
echo "----------------------------------"

# Use node to update package.json
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  'test': 'vitest',
  'test:ui': 'vitest --ui',
  'test:unit': 'vitest run --dir tests/unit',
  'test:integration': 'vitest run --dir tests/integration',
  'test:coverage': 'vitest run --coverage',
  'test:watch': 'vitest watch',
  'test:e2e': 'playwright test',
  'test:e2e:ui': 'playwright test --ui',
  'test:e2e:debug': 'playwright test --debug',
  'test:all': 'pnpm test:unit && pnpm test:integration && pnpm test:e2e'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

print_status "Package.json updated with test scripts"

# 7. Generate test report
echo ""
echo "📊 Generating test setup report..."
echo "---------------------------------"

cat > TEST_SETUP_REPORT.md << 'EOF'
# Test Suite Setup Report
Generated: $(date)

## Test Framework Configuration
- ✅ Vitest for unit and integration tests
- ✅ Playwright for E2E tests
- ✅ Cypress as alternative E2E option
- ✅ MSW for API mocking
- ✅ Testing Library for component testing

## Coverage Requirements
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Test Structure
```
tests/
├── unit/          # Component and utility tests
├── integration/   # Service and API tests
├── e2e/          # End-to-end user flows
├── fixtures/     # Test data
├── mocks/        # MSW handlers
└── utils/        # Test utilities
```

## CI/CD Integration
- GitHub Actions workflow configured
- Parallel test execution
- Coverage reporting
- Artifact uploads

## Available Commands
- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests
- `pnpm test:integration` - Run integration tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm test:coverage` - Generate coverage report
- `pnpm test:watch` - Watch mode for development

## Next Steps
1. Write tests for critical paths
2. Set up test data factories
3. Configure test environments
4. Add visual regression tests
5. Implement performance tests
EOF

print_status "Test setup report generated"

echo ""
echo "====================================="
echo -e "${GREEN}✅ Test suite setup completed!${NC}"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Review TEST_SETUP_REPORT.md"
echo "2. Run: pnpm test"
echo "3. Write tests for critical features"
echo "4. Set up continuous testing in CI/CD"
