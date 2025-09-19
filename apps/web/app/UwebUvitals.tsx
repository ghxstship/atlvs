'use client';


import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric: any) => {
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        custom_map: { metric_id: 'web_vitals' },
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vital:', metric)
    }

    // Send to PostHog if available
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('web_vital', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
        metric_rating: metric.rating,
      })
    }
  })

  return null
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void
    }
  }
}
