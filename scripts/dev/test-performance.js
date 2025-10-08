#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');

async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    // Test 1: Core Web Vitals - LCP
    console.log('📏 Testing Largest Contentful Paint...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        let maxSize = 0;
        let lcpEntry = null;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.size > maxSize) {
              maxSize = entry.size;
              lcpEntry = entry;
            }
          }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // Resolve after 3 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpEntry ? lcpEntry.startTime : null);
        }, 3000);
      });
    });

    results.tests.push({
      name: 'Largest Contentful Paint',
      value: lcp,
      unit: 'ms',
      threshold: 2500,
      passed: lcp < 2500
    });

    // Test 2: First Input Delay
    console.log('👆 Testing First Input Delay...');
    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fid = null;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.processingStart > entry.startTime) {
              fid = entry.processingStart - entry.startTime;
              break;
            }
          }
        });

        observer.observe({ entryTypes: ['first-input'] });

        // Click something to trigger FID measurement
        setTimeout(() => {
          document.querySelector('button')?.click();
        }, 1000);

        setTimeout(() => {
          observer.disconnect();
          resolve(fid);
        }, 3000);
      });
    });

    results.tests.push({
      name: 'First Input Delay',
      value: fid,
      unit: 'ms',
      threshold: 100,
      passed: fid < 100
    });

    // Test 3: Cumulative Layout Shift
    console.log('📐 Testing Cumulative Layout Shift...');
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    results.tests.push({
      name: 'Cumulative Layout Shift',
      value: cls,
      unit: 'score',
      threshold: 0.1,
      passed: cls < 0.1
    });

    // Test 4: Bundle size check
    console.log('📦 Checking bundle size...');
    const bundleStats = fs.statSync('apps/web/.next/static/chunks/main.js');
    const bundleSize = bundleStats.size;

    results.tests.push({
      name: 'Main Bundle Size',
      value: bundleSize,
      unit: 'bytes',
      threshold: 1048576, // 1MB
      passed: bundleSize < 1048576
    });

  } catch (error) {
    console.error('❌ Performance test failed:', error);
    results.error = error.message;
  } finally {
    await browser.close();
  }

  // Save results
  fs.writeFileSync('performance-test-results.json', JSON.stringify(results, null, 2));

  // Print results
  console.log('\n📊 Performance Test Results:');
  console.log('=============================');

  let allPassed = true;
  results.tests.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.name}: ${test.value}${test.unit} (threshold: ${test.threshold}${test.unit})`);
    if (!test.passed) allPassed = false;
  });

  if (allPassed) {
    console.log('\n🎉 All performance tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some performance tests failed!');
    process.exit(1);
  }
}

runPerformanceTests().catch(console.error);
