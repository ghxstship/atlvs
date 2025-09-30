# GHXSTSHIP Load Testing Suite

This directory contains comprehensive load testing configurations for the GHXSTSHIP platform.

## Prerequisites

```bash
npm install -g artillery
cd load-testing
npm install
```

## Test Scenarios

### Basic Load Test
- Warm up: 10 req/sec for 60s
- Load: 50 req/sec for 120s
- Peak: 100 req/sec for 60s
- Cool down: 10 req/sec for 60s

```bash
npm run test:basic
```

### Advanced Load Test (with Authentication)
- Authentication phase: 5 req/sec for 30s
- Light load: 20 req/sec for 60s
- Heavy load: 100 req/sec for 120s
- Stress test: 200 req/sec for 60s
- Recovery: 10 req/sec for 30s

```bash
npm run test:advanced
```

### Stress Test (10K+ concurrent users simulation)
```bash
npm run test:stress
```

## Performance Monitoring

Run system resource monitoring during tests:

```bash
npm run monitor
```

## Test Results

Results are saved in the `reports/` directory. Key metrics to monitor:

- Response time (p50, p95, p99)
- Error rate (< 1%)
- Throughput (requests/second)
- System resources (CPU, Memory)

## Production Testing

For production testing, update the target URL in the YAML files:

```yaml
config:
  target: 'https://your-production-domain.com'
```

## Scaling Targets

- **10K concurrent users**: Target throughput of 1000+ req/sec
- **Error rate**: < 1%
- **Response time**: < 500ms (p95)
- **System resources**: < 80% CPU, < 85% Memory

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
- name: Load Testing
  run: |
    cd load-testing
    npm run test:basic
    npm run test:advanced
```
