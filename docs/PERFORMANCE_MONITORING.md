# Performance Monitoring & Regression Testing

This document outlines the comprehensive performance monitoring and regression testing setup for GHXSTSHIP.

## Overview

The performance monitoring system includes:
- Core Web Vitals tracking
- Bundle size monitoring
- Lighthouse CI integration
- Custom performance regression tests
- Database performance monitoring
- CI/CD integration

## Core Web Vitals Monitoring

All Core Web Vitals are tracked in production:

- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1

## Bundle Size Monitoring

Bundle size budgets are enforced:

- Main JavaScript bundle: < 1MB
- Total bundle size: < 2MB
- CSS bundle: < 100KB

## Lighthouse CI Integration

Automated Lighthouse audits run on every PR:

```bash
npm run lighthouse
```

## Custom Performance Tests

Run comprehensive performance tests:

```bash
npm run test:performance
```

## CI/CD Integration

Performance tests run automatically on:
- Push to main/develop branches
- Pull requests to main branch

## Performance Budgets

Budgets are defined in `.performance-budgets.json`:

```json
{
  "budgets": [
    {
      "path": "/",
      "resourceSizes": [
        {
          "resourceType": "total",
          "budget": 2048000
        }
      ]
    }
  ]
}
```

## Alerting

Performance regressions trigger alerts when:
- Core Web Vitals exceed thresholds
- Bundle size exceeds budgets
- Lighthouse scores drop below 90

## Monitoring Dashboard

Access the performance monitoring dashboard at `/admin/performance` to view:
- Real-time Core Web Vitals
- Bundle size trends
- Database performance metrics
- Error rates and response times

## Troubleshooting

### Common Issues

1. **Bundle size exceeded**: Check for large dependencies or missing code splitting
2. **Lighthouse score low**: Optimize images, reduce render-blocking resources
3. **Core Web Vitals failing**: Check for layout shifts, optimize LCP elements

### Debugging

Run performance tests locally:

```bash
# Build and test
npm run build
npm run test:performance

# Lighthouse audit
npm run lighthouse

# Bundle analysis
npm run analyze-bundle
```
