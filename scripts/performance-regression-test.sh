#!/bin/bash
# PERFORMANCE REGRESSION TEST EXECUTOR

echo "🏃 Running Performance Regression Tests..."

# Build the application
echo "📦 Building application..."
npm run build

# Run Lighthouse audits
echo "🔍 Running Lighthouse performance audits..."
npx lhci autorun

# Check bundle size against budgets
echo "📊 Checking bundle size budgets..."
npx bundlesize --config .performance-budgets.json

# Run custom performance tests
echo "⚡ Running custom performance tests..."
npm run test:performance

echo "✅ Performance regression tests completed"
