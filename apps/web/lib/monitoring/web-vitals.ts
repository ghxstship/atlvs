import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

interface AnalyticsMetric extends Metric {
  page?: string;
  userAgent?: string;
}

function sendToAnalytics(metric: AnalyticsMetric) {
  // Add page context
  metric.page = window.location.pathname;
  metric.userAgent = navigator.userAgent;

  const body = JSON.stringify(metric);
  const url = '/api/analytics/vitals';

  // Use sendBeacon if available for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, {
      body,
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(console.error);
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
}

export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
