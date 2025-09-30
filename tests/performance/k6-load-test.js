import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const responseTime = new Trend('response_time')

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be below 1%
    errors: ['rate<0.01'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export default function () {
  // Test homepage
  let res = http.get(`${BASE_URL}/`)
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <500ms': (r) => r.timings.duration < 500,
  })
  errorRate.add(res.status !== 200)
  responseTime.add(res.timings.duration)

  sleep(1)

  // Test API health endpoint
  res = http.get(`${BASE_URL}/api/health`)
  check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check response is valid': (r) => r.json('status') === 'ok',
  })
  errorRate.add(res.status !== 200)
  responseTime.add(res.timings.duration)

  sleep(1)

  // Test API with authentication
  const token = 'test-token' // In real scenario, get this from login
  res = http.get(`${BASE_URL}/api/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  check(res, {
    'projects API status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  })
  errorRate.add(res.status >= 500)
  responseTime.add(res.timings.duration)

  sleep(2)
}

export function handleSummary(data) {
  return {
    'test-results/load-test-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}

function textSummary(data, options) {
  const indent = options.indent || ''
  const enableColors = options.enableColors || false

  let summary = `
${indent}Test Summary:
${indent}  Duration: ${data.state.testRunDurationMs}ms
${indent}  Iterations: ${data.metrics.iterations.values.count}
${indent}  VUs: ${data.metrics.vus.values.value}
${indent}  
${indent}HTTP Metrics:
${indent}  Requests: ${data.metrics.http_reqs.values.count}
${indent}  Failed: ${data.metrics.http_req_failed.values.rate * 100}%
${indent}  Duration (avg): ${data.metrics.http_req_duration.values.avg}ms
${indent}  Duration (p95): ${data.metrics.http_req_duration.values['p(95)']}ms
${indent}  Duration (p99): ${data.metrics.http_req_duration.values['p(99)']}ms
`

  return summary
}
